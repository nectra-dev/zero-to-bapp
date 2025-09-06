// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {Token} from "../src/Token.sol";
import {Vault} from "../src/Vault.sol";

contract Deploy is Script {
    function run() external {
        // Load private key from env
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        Token token = new Token();
        // RedStone BTC/USD oracle address on Citrea testnet
        address oracle = 0xc555c100DB24dF36D406243642C169CC5A937f09;
        Vault vault = new Vault(address(token), oracle);

        console.log("Token address:", address(token));
        console.log("Vault address:", address(vault));

        // Seed the vault with some tokens for faucet to work
        token.transfer(address(vault), token.totalSupply());

        vm.stopBroadcast();
    }
}
