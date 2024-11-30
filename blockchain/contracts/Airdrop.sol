// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IERC20 {
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract Airdrop {
    address public admin;
    IERC20 public token; // Custom token interface

    mapping(address => uint256) public balances; // Stores user balances
    mapping(uint256 => mapping(address => uint256)) public batchBalances; // Stores balances for each batch
    address[] public recipients; // Tracks all recipients
    mapping(address => bool) private isRecipient; // Prevent duplicate entries

    uint256 public currentBatchId = 0; // Start with batch 1

    // Events
    event TokensDistributed(
        address indexed recipient,
        uint256 amount,
        uint256 batchId
    );
    event TokensWithdrawn(address indexed recipient, uint256 amount);
    event OwnershipTransferred(
        address indexed oldAdmin,
        address indexed newAdmin
    );
    event AllocationRevoked(address indexed user, uint256 amount);
    event TokensRecovered(address indexed admin, uint256 amount);
    event ContractFunded(uint256 amount);
    event BatchCreated(uint256 batchId, uint256 tokenAmount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not an admin");
        _;
    }

    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Invalid token address");
        admin = msg.sender;
        token = IERC20(tokenAddress); // Set the token contract address
    }

    // Create a new batch with a specific token amount per recipient
    function createBatch(uint256 tokenAmountPerRecipient) external onlyAdmin {
        emit BatchCreated(currentBatchId, tokenAmountPerRecipient);
        currentBatchId++; // Increment the batchId after creating a new batch
    }

    // Distribute tokens to recipients in the current batch
    function distributeTokensBatch(
        address[] memory _recipients,
        uint256 tokenAmountPerRecipient
    ) external onlyAdmin {
        for (uint256 i = 0; i < _recipients.length; i++) {
            // Assign tokens to each recipient for this batch
            batchBalances[currentBatchId][
                _recipients[i]
            ] = tokenAmountPerRecipient;

            // Add to the global balance
            balances[_recipients[i]] += tokenAmountPerRecipient;

            // Add to recipients array if not already added
            if (!isRecipient[_recipients[i]]) {
                recipients.push(_recipients[i]);
                isRecipient[_recipients[i]] = true;
            }

            emit TokensDistributed(
                _recipients[i],
                tokenAmountPerRecipient,
                currentBatchId
            );
        }
    }

    // Allow users to withdraw their tokens from a specific batch
    function withdrawTokens() external {
        uint256 totalAmount = 0;

        for (uint256 i = 1; i <= currentBatchId; i++) {
            uint256 batchAmount = batchBalances[i][msg.sender];
            if (batchAmount > 0) {
                totalAmount += batchAmount;
                batchBalances[i][msg.sender] = 0; // Reset after accumulation
            }
        }

        require(totalAmount > 0, "No tokens to withdraw");

        balances[msg.sender] -= totalAmount; // Reduce global balance

        require(
            token.transfer(msg.sender, totalAmount),
            "Token transfer failed"
        );

        emit TokensWithdrawn(msg.sender, totalAmount);
    }

    // Fund the contract with tokens for the airdrop (Admin needs to send tokens to this contract)
    function fundContract(uint256 amount) external onlyAdmin {
        uint256 contractBalance = token.balanceOf(address(this));
        require(
            contractBalance >= amount,
            "Insufficient funds in the contract"
        );

        emit ContractFunded(amount);
    }

    // View contract token balance
    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getUserBatchBalance(uint256 batchId, address user)
        external
        view
        returns (uint256)
    {
        return batchBalances[batchId][user];
    }

    // Transfer ownership to a new admin
    function transferOwnership(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        emit OwnershipTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    // Revoke unclaimed allocations from users
    function revokeAllocation(address user) external onlyAdmin {
        uint256 amount = balances[user];
        require(amount > 0, "No allocation to revoke");

        balances[user] = 0;
        emit AllocationRevoked(user, amount);
    }

    // Recover unused tokens to the admin address
    function recoverTokens(uint256 amount) external onlyAdmin {
        require(amount > 0, "Invalid amount");
        require(token.transfer(admin, amount), "Token transfer failed");

        emit TokensRecovered(admin, amount);
    }

    // Get user's allocated balance
    function getUserBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    // Get the total number of unique recipients
    function getRecipientCount() external view returns (uint256) {
        return recipients.length;
    }
}
