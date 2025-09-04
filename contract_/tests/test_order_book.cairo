use contract_::OrderBook::{IOrderBookDispatcher, IOrderBookDispatcherTrait};
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_caller_address,
    stop_cheat_caller_address,
};
use starknet::{ContractAddress, contract_address_const};

fn deploy_mock_token(initial_supply: u256, recipient: ContractAddress) -> ContractAddress {
    let contract = declare("MockERC20").unwrap().contract_class();
    let constructor_calldata = array![
        initial_supply.low.into(), initial_supply.high.into(), recipient.into(),
    ];
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}

fn deploy_order_book() -> ContractAddress {
    let contract = declare("OrderBook").unwrap().contract_class();
    let constructor_calldata = array![];
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}

#[test]
fn test_place_buy_order() {
    let alice: ContractAddress = contract_address_const::<'alice'>();
    let order_book_address = deploy_order_book();
    let token_address = deploy_mock_token(1000000, alice);

    let order_book = IOrderBookDispatcher { contract_address: order_book_address };

    start_cheat_caller_address(order_book_address, alice);

    let order_id = order_book.place_buy_order(token_address, 100, 50);

    let order = order_book.get_order(order_id);
    assert!(order.id == order_id, "Order ID mismatch");
    assert!(order.user == alice, "Order user mismatch");
    assert!(order.amount == 100, "Order amount mismatch");
    assert!(order.price == 50, "Order price mismatch");
    assert!(order.is_active, "Order should be active");

    let (buy_count, _) = order_book.get_order_book_depth(token_address);
    assert!(buy_count == 1, "Should have one buy order");

    stop_cheat_caller_address(order_book_address);
}

#[test]
fn test_place_sell_order() {
    let alice: ContractAddress = contract_address_const::<'alice'>();
    let order_book_address = deploy_order_book();
    let token_address = deploy_mock_token(1000000, alice);

    let order_book = IOrderBookDispatcher { contract_address: order_book_address };
    let token = IERC20Dispatcher { contract_address: token_address };

    start_cheat_caller_address(order_book_address, alice);
    start_cheat_caller_address(token_address, alice);

    // Approve order book to spend tokens
    token.approve(order_book_address, 1000000);

    let order_id = order_book.place_sell_order(token_address, 100, 60);

    let order = order_book.get_order(order_id);
    assert!(order.id == order_id, "Order ID mismatch");
    assert!(order.user == alice, "Order user mismatch");
    assert!(order.amount == 100, "Order amount mismatch");
    assert!(order.price == 60, "Order price mismatch");
    assert!(order.is_active, "Order should be active");

    let (_, sell_count) = order_book.get_order_book_depth(token_address);
    assert!(sell_count == 1, "Should have one sell order");

    stop_cheat_caller_address(token_address);
    stop_cheat_caller_address(order_book_address);
}

#[test]
fn test_cancel_order() {
    let alice: ContractAddress = contract_address_const::<'alice'>();
    let order_book_address = deploy_order_book();
    let token_address = deploy_mock_token(1000000, alice);

    let order_book = IOrderBookDispatcher { contract_address: order_book_address };

    start_cheat_caller_address(order_book_address, alice);

    let order_id = order_book.place_buy_order(token_address, 100, 50);

    // Verify order is active
    let order = order_book.get_order(order_id);
    assert!(order.is_active, "Order should be active");

    // Cancel the order
    order_book.cancel_order(order_id);

    // Verify order is cancelled
    let cancelled_order = order_book.get_order(order_id);
    assert!(!cancelled_order.is_active, "Order should be cancelled");

    stop_cheat_caller_address(order_book_address);
}

#[test]
fn test_order_matching() {
    let alice: ContractAddress = contract_address_const::<'alice'>();
    let bob: ContractAddress = contract_address_const::<'bob'>();
    let order_book_address = deploy_order_book();
    let token_address = deploy_mock_token(1000000, alice);

    let order_book = IOrderBookDispatcher { contract_address: order_book_address };
    let token = IERC20Dispatcher { contract_address: token_address };

    // Alice places a sell order
    start_cheat_caller_address(token_address, alice);
    start_cheat_caller_address(order_book_address, alice);
    token.approve(order_book_address, 1000000);
    let sell_order_id = order_book.place_sell_order(token_address, 100, 50);
    stop_cheat_caller_address(order_book_address);
    stop_cheat_caller_address(token_address);

    // Bob places a buy order with higher price
    start_cheat_caller_address(order_book_address, bob);
    let buy_order_id = order_book.place_buy_order(token_address, 100, 60);
    stop_cheat_caller_address(order_book_address);

    // Check initial balances
    let bob_balance_before = token.balance_of(bob);

    // Match orders
    order_book.match_orders_batch(token_address, 10);

    // Verify orders are filled
    let sell_order = order_book.get_order(sell_order_id);
    let buy_order = order_book.get_order(buy_order_id);

    assert!(sell_order.filled_amount == 100, "Sell order should be fully filled");
    assert!(buy_order.filled_amount == 100, "Buy order should be fully filled");
    assert!(!sell_order.is_active, "Sell order should be inactive");
    assert!(!buy_order.is_active, "Buy order should be inactive");

    // Verify token transfer (Bob should have received tokens)
    let bob_balance_after = token.balance_of(bob);
    assert!(bob_balance_after == bob_balance_before + 100, "Bob should receive tokens");
}

#[test]
#[should_panic(expected: 'Insufficient token balance')]
fn test_sell_order_insufficient_balance() {
    let alice: ContractAddress = contract_address_const::<'alice'>();
    let order_book_address = deploy_order_book();
    let token_address = deploy_mock_token(50, alice); // Only 50 tokens

    let order_book = IOrderBookDispatcher { contract_address: order_book_address };

    start_cheat_caller_address(order_book_address, alice);

    // Try to sell 100 tokens when only having 50
    order_book.place_sell_order(token_address, 100, 60);

    stop_cheat_caller_address(order_book_address);
}

#[test]
#[should_panic(expected: 'Not order owner')]
fn test_cancel_order_not_owner() {
    let alice: ContractAddress = contract_address_const::<'alice'>();
    let bob: ContractAddress = contract_address_const::<'bob'>();
    let order_book_address = deploy_order_book();
    let token_address = deploy_mock_token(1000000, alice);

    let order_book = IOrderBookDispatcher { contract_address: order_book_address };

    // Alice places an order
    start_cheat_caller_address(order_book_address, alice);
    let order_id = order_book.place_buy_order(token_address, 100, 50);
    stop_cheat_caller_address(order_book_address);

    // Bob tries to cancel Alice's order
    start_cheat_caller_address(order_book_address, bob);
    order_book.cancel_order(order_id);
    stop_cheat_caller_address(order_book_address);
}
