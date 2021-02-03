// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;
// This works only on remix
// Uncomment this if you want to test the contract on remix
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

// This works locally on truffle
// Uncomment this if you want to test the contract on truffle
import 'openzeppelin-solidity/contracts/access/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';
import 'openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol';

contract SafeKeep is Ownable,ReentrancyGuard {
   using SafeMath for uint;
    
     struct Depositor {
        uint balance;
        uint lastPing;
        address backupAddress;
        bool isUser;
        IERC20 _token;
        address[] tokens;
       
    }
    
    //mapping (address => mapping (address => uint256)) private _allowances;
    mapping(address=>mapping( address=>bool)) _hasToken;
    mapping (address=>mapping(address=>uint)) _tokenBal;  
    mapping(address => Depositor) private depositors;
    address[] depositorsAddresses;
    address[] oldPingers;
    
    event depositedToken(address indexed _token,uint _amount );
    event withdrawnToken(address indexed token,uint amount);
    
    modifier isMinimumDeposit() {
        require((msg.value >= 0.001 ether), "Unsuccessful, The minimum you can deposit is 0.001 ether");
        _;
    }
    
    modifier aUser(address _check){
         require(depositors[_check].isUser==true,"not a User");
        _;
    }

    modifier hasToken(address _target,address _token) {
        require(depositors[_target].isUser==true,"not a User");
        require(_hasToken[_target][_token]==true,"you do not have this token");
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
    
    function depositEther(address backupAddress) external payable isMinimumDeposit isUserBackup(backupAddress) {
        if(isUser(msg.sender)){
         depositorsAddresses.push(msg.sender);
        }
        
        // Updated this to use SafeMath
        
        
        depositors[msg.sender].balance+=msg.value;
        depositors[msg.sender].lastPing=block.timestamp;
        depositors[msg.sender].backupAddress=backupAddress;
        depositors[msg.sender].isUser=true;
        
    }
    
    
    //amount will have to be infinite for token(address)e.g uint-1
    function depositToken(uint _amount,address _token) public aUser(msg.sender) nonReentrant(){
        depositors[msg.sender]._token= IERC20(_token);
        //holder should call approve from the token contract address and pass in this address as spender
        depositors[msg.sender]._token.transferFrom(msg.sender,address(this),_amount);
        depositors[msg.sender].tokens.push(_token);
        _hasToken[msg.sender][_token]=true;
        _tokenBal[msg.sender][_token]+=_amount;
        emit depositedToken(_token,_amount);
    }
    
    
    function checkTokenBalance(address _token) public aUser(msg.sender) hasToken(msg.sender,_token) view returns(uint){
        return _tokenBal[msg.sender][_token];
    }
    
    function withdrawToken(address _token,uint _amount) public aUser(msg.sender) hasToken(msg.sender,_token) nonReentrant() returns(uint){
        require (_tokenBal[msg.sender][_token]>= _amount,"your balance is not enough");
          depositors[msg.sender]._token= IERC20(_token);
          depositors[msg.sender]._token.transfer(msg.sender,_amount);
          if(_tokenBal[msg.sender][_token]==0){
              _hasToken[msg.sender][_token]=false;
          }
          emit withdrawnToken(_token,_amount);
          return _amount;
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
