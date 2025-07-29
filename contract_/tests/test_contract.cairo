use contract_::BigIncGenesis::{BigIncGenesis, IBigIncGenesisDispatcher, IBigIncGenesisDispatcherTrait};
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use snforge_std::{CheatSpan, EventSpyAssertionsTrait, cheat_caller_address, spy_events};
use starknet::{ContractAddress};
use super::setup::{owner, setup, deploy_mock_erc20};


// fn mint_share(ref self: TContractState, token_address: ContractAddress);
//     fn transfer_share(ref self: TContractState, to: ContractAddress, share_amount: u256);
//     fn donate(ref self: TContractState, token_address: ContractAddress, amount: u256);

//     // View functions
//     fn get_available_shares(self: @TContractState) -> u256;
//     fn get_shares(self: @TContractState, addr: ContractAddress) -> u256;
//     fn get_shareholders(self: @TContractState) -> Array<ContractAddress>;
//     fn is_shareholder(self: @TContractState, addr: ContractAddress) -> bool;
//     fn get_usdt_address(self: @TContractState) -> ContractAddress;
//     fn get_usdc_address(self: @TContractState) -> ContractAddress;
//     fn get_total_share_valuation(self: @TContractState) -> u256;
//     fn get_presale_share_valuation(self: @TContractState) -> u256;
//     fn get_presale_shares(self: @TContractState) -> u256;
//     fn get_shares_sold(self: @TContractState) -> u256;
//     fn is_presale_active(self: @TContractState) -> bool;

//     // Owner functions
//     fn withdraw(ref self: TContractState, token_address: ContractAddress, amount: u256);
//     fn seize_shares(ref self: TContractState, shareholder: ContractAddress);
//     fn set_partner_share_cap(ref self: TContractState, token_address: ContractAddress, cap:
//     u256);
//     fn remove_partner_share_cap(ref self: TContractState, token_address: ContractAddress);
//     fn pause(ref self: TContractState);
//     fn unpause(ref self: TContractState);

//     // Partner view functions
//     fn get_partner_share_cap(self: @TContractState, token_address: ContractAddress) -> u256;
//     fn get_shares_minted_by_partner(self: @TContractState, token_address: ContractAddress) ->
//     u256;

//     // Ownable functions
//     fn get_owner(self: @TContractState) -> ContractAddress;
//     fn transfer_owner(ref self: TContractState, new_owner: ContractAddress);
//     fn renounce_owner(ref self: TContractState);

//     // Partner token functions
//     fn mint_partner_share(
//         ref self: TContractState, token_address: ContractAddress, token_amount: u256,
//     );
//     fn set_partner_token_rate(
//         ref self: TContractState, token_address: ContractAddress, tokens_per_share: u256,
//     );
//     fn get_partner_token_rate(self: @TContractState, token_address: ContractAddress) -> u256;

fn alice() -> ContractAddress {
    'alice'.try_into().unwrap()
}

fn charlie() -> ContractAddress {
    'charlie'.try_into().unwrap()
}

fn mint(targets: Array<(ContractAddress, u256)>, dispatcher: IERC20Dispatcher) {
    for i in 0..targets.len() {
        let (recipient, amount) = *targets.at(i);
        cheat_caller_address(dispatcher.contract_address, owner(), CheatSpan::TargetCalls(1));
        dispatcher.transfer(recipient, amount);
    }
}

fn feign_mint_share(genesis: IBigIncGenesisDispatcher, token: IERC20Dispatcher, amount: u256) {
    mint(array![(charlie(), amount)], token);
    cheat_caller_address(token.contract_address, charlie(), CheatSpan::TargetCalls(1));
    token.approve(genesis.contract_address, amount);
    cheat_caller_address(genesis.contract_address, charlie(), CheatSpan::TargetCalls(1));
    genesis.mint_share(token.contract_address);
}

#[test]
fn test_genesis_mint_share_success() {
    let (genesis, usdt, _) = setup();
    let amount = 10000;
    let mut spy = spy_events();
    feign_mint_share(genesis, usdt, amount);

    let presale_share_valuation = genesis.get_presale_share_valuation();
    let shares_bought = (amount * 100000000_u256) / presale_share_valuation;
    let shares_sold = genesis.get_shares_sold();
    assert(shares_bought == shares_sold, 'SHARES VALUATION MISMATCH');
    let is_shareholder = genesis.is_shareholder(charlie());
    assert(is_shareholder, 'CHARLIE NOT SHAREHOLDER');

    let event = BigIncGenesis::Event::ShareMinted(
        BigIncGenesis::ShareMinted { buyer: charlie(), shares_bought, amount },
    );

    spy.assert_emitted(@array![(genesis.contract_address, event)]);
}

#[test]
#[should_panic(expected: 'Invalid token address')]
fn test_genesis_mint_share_should_panic_on_invalid_token() {
    let (genesis, _, _) = setup();
    let amount = 1000;
    let contract_address = deploy_mock_erc20("TOKEN", "TKN", 1000000, owner());
    let token = IERC20Dispatcher { contract_address };
    feign_mint_share(genesis, token, amount);
}

#[test]
#[should_panic(expected: 'Exceeds available shares')]
fn test_genesis_mint_share_should_panic_on_partner_share_cap_exceeded() {}

#[test]
fn test_genesis_transfer_share_success() {

}

