// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("Demo USD", "dUSD") {
        _mint(msg.sender, 1_000_000_000 ether);
    }
}
