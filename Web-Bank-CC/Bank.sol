// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Bank {
    // Variables
    mapping(address => int) balance;
    mapping(address => uint) lastInterestCheck;
    address public owner;
    uint public interestRate; // Interest rate in basis points (e.g., 500 = 5%)

    // Events
    event DepositMade(address account, uint value);
    event WithdrawMade(address account, uint value);
    event TransferMade(address from, address to, uint value);
    event InterestRateChanged(uint newRate);

    // Constructor
    constructor(uint _interestRate) {
        owner = msg.sender;
        interestRate = _interestRate;
    }

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    // Internal functions
    function applyInterest(address account) internal {
        uint lastCheck = lastInterestCheck[account];
        if (lastCheck == 0) {
            lastInterestCheck[account] = block.timestamp;
            return;
        }
        
        uint timeElapsed = block.timestamp - lastCheck;
        if (timeElapsed > 0 && balance[account] > 0) {
            uint interest = uint(balance[account]) * interestRate * timeElapsed / (365 days * 10000);
            balance[account] += int(interest);
        }
        
        lastInterestCheck[account] = block.timestamp;
    }

    // Public functions
    function setInterestRate(uint newRate) public onlyOwner {
        interestRate = newRate;
        emit InterestRateChanged(newRate);
    }

    function getBalance(address account) public view returns (int) {
        uint lastCheck = lastInterestCheck[account];
        if (lastCheck == 0) {
            return balance[account];
        }
        
        uint timeElapsed = block.timestamp - lastCheck;
        int projectedInterest = 0;
        if (timeElapsed > 0 && balance[account] > 0) {
            projectedInterest = int(uint(balance[account]) * interestRate * timeElapsed / (365 days * 10000));
        }
        
        return balance[account] + projectedInterest;
    }

    function deposit() public payable {
        require(msg.value > 0, "MIN_ETHER_NOT_MET");
        applyInterest(msg.sender);
        balance[msg.sender] += int(msg.value);
        emit DepositMade(msg.sender, msg.value);
    }

    function withdraw(uint amount) public {
        applyInterest(msg.sender);
        require(balance[msg.sender] - int(amount) >= -10, "NOT_ENOUGH");
        balance[msg.sender] -= int(amount);
        payable(msg.sender).transfer(amount);
        emit WithdrawMade(msg.sender, amount);
    }

    function transfer(address destination, uint amount) public {
        applyInterest(msg.sender);
        applyInterest(destination);
        require(balance[msg.sender] - int(amount) >= -10, "NOT_ENOUGH");
        balance[msg.sender] -= int(amount);
        balance[destination] += int(amount);
        emit TransferMade(msg.sender, destination, amount);
    }
}
