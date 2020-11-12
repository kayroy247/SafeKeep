// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.8.0;
// This works only on remix
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

// This works locally on truffle
// Uncomment this if you want to test the contract on truffle
// import 'openzeppelin-solidity/contracts/access/Ownable.sol';
// import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract SafeKeep is Ownable {
   using SafeMath for uint;
    
     struct Depositor {
        uint balance;
        uint lastPing;
        address backupAddress;
        bool isUser;
    }
    
  
    mapping(address => Depositor) private depositors;
    address[] depositorsAddresses;
    address[] oldPingers;
    
    modifier isMinimumDeposit() {
        require((msg.value >= 0.001 ether), "Unsuccessful, The minimum you can deposit is 0.001 ether");
        _;
    }
    
    // Checks if user is trying to set his own address as backup;
    modifier isUserBackup(address _backupAddress) {
        require(msg.sender != _backupAddress, "You cannot use this address as backup");
        _;
    }
    
    function isUser(address userAddress) public view returns(bool isIndeed) {
        return depositors[userAddress].isUser;
    }
    
    function deposit(address backupAddress) external payable isMinimumDeposit isUserBackup(backupAddress) {
        if(isUser(msg.sender)){
         depositorsAddresses.push(msg.sender);
        }
        // Updated this to use SafeMath
        depositors[msg.sender] = Depositor((depositors[msg.sender].balance.add(msg.value)), block.timestamp, backupAddress, true);
    }
    
    
    function withdraw(uint _withdrawAmount) external  {
        uint userBalance = depositors[msg.sender].balance;
        // If user specifies amount to withdraw, it runs the if block and returns
        if (_withdrawAmount > 0 ether) {
            require(userBalance >= _withdrawAmount, "You cannot reap more than what you sow");
            depositors[msg.sender].balance = depositors[msg.sender].balance.sub(_withdrawAmount);
            msg.sender.transfer(_withdrawAmount);
            depositors[msg.sender].lastPing = block.timestamp;
            return;
        }
        
        // If user does not specify any amount it runs this
        depositors[msg.sender].balance = 0;
        msg.sender.transfer(userBalance);
    }
    
    function getBalance() external view returns(uint balance) {
       return depositors[msg.sender].balance;
    }
    
    function ping() external  {
        depositors[msg.sender].lastPing = block.timestamp;
    }
    
     function checkOldPing() external onlyOwner returns (address[] memory pingers) {
        for (uint256 i = 0; i < depositorsAddresses.length; i++) {
            if ((block.timestamp - depositors[depositorsAddresses[i]].lastPing) >= 24 weeks && (depositors[oldPingers[i]].balance > 0)) {
                oldPingers.push(depositorsAddresses[i]);
            }
        }
        return oldPingers;
    }
  
   function transferToBackupAddresses() external onlyOwner {
        for (uint256 i = 0; i < oldPingers.length; i++) {
            address payable receiver = address(uint160(depositors[oldPingers[i]].backupAddress));
            uint userBalance = depositors[oldPingers[i]].balance;
            depositors[oldPingers[i]].balance = 0;
            receiver.transfer(userBalance);
        }
    }
    
    function getContractBalance() public view onlyOwner returns(uint contractBalance) {
        return address(this).balance;
    }
}
