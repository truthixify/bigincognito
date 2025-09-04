use starknet::ContractAddress;

#[starknet::interface]
pub trait IOrderBook<TContractState> {
    fn place_buy_order(
        ref self: TContractState, token_address: ContractAddress, amount: u256, price: u256,
    ) -> u64;
    fn place_sell_order(
        ref self: TContractState, token_address: ContractAddress, amount: u256, price: u256,
    ) -> u64;
    fn cancel_order(ref self: TContractState, order_id: u64);
    fn match_orders_batch(
        ref self: TContractState, token_address: ContractAddress, max_matches: u32,
    );
    fn get_order(self: @TContractState, order_id: u64) -> Order;
    fn get_best_buy_price(self: @TContractState, token_address: ContractAddress) -> u256;
    fn get_best_sell_price(self: @TContractState, token_address: ContractAddress) -> u256;
    fn get_order_book_depth(self: @TContractState, token_address: ContractAddress) -> (u32, u32);
}

#[derive(Drop, Copy, Serde, starknet::Store)]
pub struct Order {
    pub id: u64,
    pub user: ContractAddress,
    pub token_address: ContractAddress,
    pub amount: u256,
    pub price: u256,
    pub filled_amount: u256,
    pub is_buy: bool,
    pub is_active: bool,
}

#[starknet::contract]
pub mod OrderBook {
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::storage::*;
    use starknet::{ContractAddress, get_caller_address};
    use super::{IOrderBook, Order};

    #[storage]
    pub struct Storage {
        orders: Map<u64, Order>,
        next_order_id: u64,
        // Price-sorted order queues for gas optimization
        buy_price_levels: Map<(ContractAddress, u256), Vec<u64>>,
        sell_price_levels: Map<(ContractAddress, u256), Vec<u64>>,
        // Track best prices for quick access
        best_buy_prices: Map<ContractAddress, u256>,
        best_sell_prices: Map<ContractAddress, u256>,
        // Order count per token for depth calculation
        active_buy_orders: Map<ContractAddress, u32>,
        active_sell_orders: Map<ContractAddress, u32>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        OrderPlaced: OrderPlaced,
        OrderCancelled: OrderCancelled,
        OrderMatched: OrderMatched,
        BatchMatchingCompleted: BatchMatchingCompleted,
    }

    #[derive(Drop, starknet::Event)]
    pub struct OrderPlaced {
        pub order_id: u64,
        pub user: ContractAddress,
        pub token_address: ContractAddress,
        pub is_buy: bool,
        pub amount: u256,
        pub price: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct OrderCancelled {
        pub order_id: u64,
        pub user: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct OrderMatched {
        pub buy_order_id: u64,
        pub sell_order_id: u64,
        pub buyer: ContractAddress,
        pub seller: ContractAddress,
        pub token_address: ContractAddress,
        pub amount: u256,
        pub price: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct BatchMatchingCompleted {
        pub token_address: ContractAddress,
        pub matches_processed: u32,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.next_order_id.write(1);
    }

    #[abi(embed_v0)]
    pub impl OrderBookImpl of IOrderBook<ContractState> {
        fn place_buy_order(
            ref self: ContractState, token_address: ContractAddress, amount: u256, price: u256,
        ) -> u64 {
            let caller = get_caller_address();
            let order_id = self.next_order_id.read();

            let order = Order {
                id: order_id,
                user: caller,
                token_address,
                amount,
                price,
                filled_amount: 0,
                is_buy: true,
                is_active: true,
            };

            self.orders.entry(order_id).write(order);
            self.buy_price_levels.entry((token_address, price)).push(order_id);

            // Update best buy price
            let current_best = self.best_buy_prices.entry(token_address).read();
            if price > current_best {
                self.best_buy_prices.entry(token_address).write(price);
            }

            // Update order count
            let current_count = self.active_buy_orders.entry(token_address).read();
            self.active_buy_orders.entry(token_address).write(current_count + 1);

            self.next_order_id.write(order_id + 1);

            self
                .emit(
                    Event::OrderPlaced(
                        OrderPlaced {
                            order_id, user: caller, token_address, is_buy: true, amount, price,
                        },
                    ),
                );

            order_id
        }

        fn place_sell_order(
            ref self: ContractState, token_address: ContractAddress, amount: u256, price: u256,
        ) -> u64 {
            let caller = get_caller_address();
            let order_id = self.next_order_id.read();

            // Verify user has enough tokens
            let token = IERC20Dispatcher { contract_address: token_address };
            let balance = token.balance_of(caller);
            assert(balance >= amount, 'Insufficient token balance');

            let order = Order {
                id: order_id,
                user: caller,
                token_address,
                amount,
                price,
                filled_amount: 0,
                is_buy: false,
                is_active: true,
            };

            self.orders.entry(order_id).write(order);
            self.sell_price_levels.entry((token_address, price)).push(order_id);

            // Update best sell price
            let current_best = self.best_sell_prices.entry(token_address).read();
            if current_best == 0 || price < current_best {
                self.best_sell_prices.entry(token_address).write(price);
            }

            // Update order count
            let current_count = self.active_sell_orders.entry(token_address).read();
            self.active_sell_orders.entry(token_address).write(current_count + 1);

            self.next_order_id.write(order_id + 1);

            self
                .emit(
                    Event::OrderPlaced(
                        OrderPlaced {
                            order_id, user: caller, token_address, is_buy: false, amount, price,
                        },
                    ),
                );

            order_id
        }

        fn cancel_order(ref self: ContractState, order_id: u64) {
            let caller = get_caller_address();
            let mut order = self.orders.entry(order_id).read();

            assert(order.user == caller, 'Not order owner');
            assert(order.is_active, 'Order not active');

            order.is_active = false;
            self.orders.entry(order_id).write(order);

            // Update order counts
            if order.is_buy {
                let current_count = self.active_buy_orders.entry(order.token_address).read();
                self.active_buy_orders.entry(order.token_address).write(current_count - 1);
            } else {
                let current_count = self.active_sell_orders.entry(order.token_address).read();
                self.active_sell_orders.entry(order.token_address).write(current_count - 1);
            }

            self.emit(Event::OrderCancelled(OrderCancelled { order_id, user: caller }));
        }

        fn match_orders_batch(
            ref self: ContractState, token_address: ContractAddress, max_matches: u32,
        ) {
            let mut matches_processed = 0;
            let best_buy_price = self.best_buy_prices.entry(token_address).read();
            let best_sell_price = self.best_sell_prices.entry(token_address).read();

            if best_buy_price == 0 || best_sell_price == 0 || best_buy_price < best_sell_price {
                return;
            }

            // Process matches up to max_matches limit for gas optimization
            while matches_processed != max_matches {
                let current_best_buy = self.best_buy_prices.entry(token_address).read();
                let current_best_sell = self.best_sell_prices.entry(token_address).read();

                if current_best_buy < current_best_sell {
                    break;
                }

                let buy_orders = self.buy_price_levels.entry((token_address, current_best_buy));
                let sell_orders = self.sell_price_levels.entry((token_address, current_best_sell));

                if buy_orders.len() == 0 || sell_orders.len() == 0 {
                    break;
                }

                let buy_order_id = buy_orders.at(0).read();
                let sell_order_id = sell_orders.at(0).read();

                let mut buy_order = self.orders.entry(buy_order_id).read();
                let mut sell_order = self.orders.entry(sell_order_id).read();

                if !buy_order.is_active || !sell_order.is_active {
                    // Skip inactive orders - break to avoid infinite loop
                    break;
                }

                let remaining_buy = buy_order.amount - buy_order.filled_amount;
                let remaining_sell = sell_order.amount - sell_order.filled_amount;
                let trade_amount = if remaining_buy < remaining_sell {
                    remaining_buy
                } else {
                    remaining_sell
                };

                // Execute trade
                self
                    ._execute_trade(
                        ref buy_order,
                        ref sell_order,
                        trade_amount,
                        current_best_sell,
                        token_address,
                    );

                self.orders.entry(buy_order_id).write(buy_order);
                self.orders.entry(sell_order_id).write(sell_order);

                matches_processed += 1;

                // Update best prices if orders are fully filled
                if buy_order.filled_amount >= buy_order.amount {
                    self._update_best_buy_price(token_address);
                }
                if sell_order.filled_amount >= sell_order.amount {
                    self._update_best_sell_price(token_address);
                }
            }

            self
                .emit(
                    Event::BatchMatchingCompleted(
                        BatchMatchingCompleted { token_address, matches_processed },
                    ),
                );
        }

        fn get_order(self: @ContractState, order_id: u64) -> Order {
            self.orders.entry(order_id).read()
        }

        fn get_best_buy_price(self: @ContractState, token_address: ContractAddress) -> u256 {
            self.best_buy_prices.entry(token_address).read()
        }

        fn get_best_sell_price(self: @ContractState, token_address: ContractAddress) -> u256 {
            self.best_sell_prices.entry(token_address).read()
        }

        fn get_order_book_depth(
            self: @ContractState, token_address: ContractAddress,
        ) -> (u32, u32) {
            let buy_count = self.active_buy_orders.entry(token_address).read();
            let sell_count = self.active_sell_orders.entry(token_address).read();
            (buy_count, sell_count)
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _execute_trade(
            ref self: ContractState,
            ref buy_order: Order,
            ref sell_order: Order,
            amount: u256,
            price: u256,
            token_address: ContractAddress,
        ) {
            let token = IERC20Dispatcher { contract_address: token_address };

            let success = token.transfer_from(sell_order.user, buy_order.user, amount);
            assert(success, 'Token transfer failed');

            buy_order.filled_amount += amount;
            sell_order.filled_amount += amount;

            if buy_order.filled_amount >= buy_order.amount {
                buy_order.is_active = false;
            }
            if sell_order.filled_amount >= sell_order.amount {
                sell_order.is_active = false;
            }

            self
                .emit(
                    Event::OrderMatched(
                        OrderMatched {
                            buy_order_id: buy_order.id,
                            sell_order_id: sell_order.id,
                            buyer: buy_order.user,
                            seller: sell_order.user,
                            token_address,
                            amount,
                            price,
                        },
                    ),
                );
        }

        fn _update_best_buy_price(ref self: ContractState, token_address: ContractAddress) {
            // Find the next highest buy price with active orders
            // This is a simplified implementation
            let current_best = self.best_buy_prices.entry(token_address).read();
            if current_best > 0 {
                self.best_buy_prices.entry(token_address).write(current_best - 1);
            }
        }

        fn _update_best_sell_price(ref self: ContractState, token_address: ContractAddress) {
            // Find the next lowest sell price with active orders
            // This is a simplified implementation
            let current_best = self.best_sell_prices.entry(token_address).read();
            self.best_sell_prices.entry(token_address).write(current_best + 1);
        }
    }
}
