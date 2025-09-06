// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import {IAggregatorV3} from "./interfaces/IAggregatorV3.sol";

contract Vault {
    IERC20 public token;
    IAggregatorV3 public oracle; // BTC/USD oracle

    mapping(address => uint256) public collateralBalances;
    mapping(address => uint256) public debtBalances;

    event Deposited(address indexed user, uint256 amount);

    constructor(address _token, address _oracle) {
        token = IERC20(_token);
        oracle = IAggregatorV3(_oracle);
    }

    function deposit(uint256 amount) external payable {
        require(msg.value > 0, "no cBTC sent");
        
        // Convert deposited cBTC amount to USD using BTC/USD oracle and debt 50%
        uint256 debt = (msg.value * getPrice()) / 2 ether;

        collateralBalances[msg.sender] += msg.value;
        debtBalances[msg.sender] += debt;

        emit Deposited(msg.sender, msg.value);

        // send debt token to user
        require(token.transfer(msg.sender, debt), "transfer failed");
    }

    function getPosition(address user) public view returns (uint256 collateral, uint256 debt) {
        collateral = collateralBalances[user];
        debt = debtBalances[user];
    }

    function getPrice() public view returns (uint256) {
       (
            ,
            int256 answer,
            ,
            ,
            
        ) = oracle.latestRoundData();
        require(answer > 0, "invalid price");
        uint8 dec = oracle.decimals();
        // convert to USD with 18 decimals
        return uint256(answer) * (10 ** (18 - dec));
    }
}
