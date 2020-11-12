pragma solidity >=0.4.22 <0.8.0;


contract SafeKeep  {
    
    
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
    
    
    function deposit(address backupAddress) external payable isMinimumDeposit {
        
        if(isUser(msg.sender)){
        depositorsAddresses.push(msg.sender);
        }
        depositors[msg.sender] = Depositor((depositors[msg.sender].balance + msg.value), block.timestamp, backupAddress, true);
    }
    
    function withdraw() external  {
        msg.sender.transfer(depositors[msg.sender].balance);
    }
    

  function ping() external  {
      depositors[msg.sender].lastPing = block.timestamp;
  }
  
  function isUser(address userAddress) public returns(bool isIndeed) {
  
  return depositors[userAddress].isUser;
      
  }
  
  function checkOldPing() external returns(address[] memory pingers ) {
      
      for (uint i = 0; i < depositorsAddresses.length; i++ ){
         
        if( (block.timestamp - depositors[depositorsAddresses[i]].lastPing) >= 24 weeks) {
            oldPingers.push(depositorsAddresses[i]);
        }
      }
      return oldPingers;
  }
  
  function transferToBackupAddresses() external {
      
      for(uint i= 0; i < oldPingers.length; i++){
          address payable reciever = address(uint160(depositors[oldPingers[i]].backupAddress));
          reciever.transfer(depositors[oldPingers[i]].balance);
      }
  }
    
    
}