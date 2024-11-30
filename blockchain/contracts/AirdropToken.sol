// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AirdropToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("AirdropToken", "ADT") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10**18);
    }

    // Mint new tokens
    function mint(address account, uint256 amount) public  {
        _mint(account, amount);
    }

    // Burn tokens
    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }
}
