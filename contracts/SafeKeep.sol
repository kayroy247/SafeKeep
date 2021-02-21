// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.8.0;
// This works only on remix
// Uncomment this if you want to test the contract on remix
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/SafeERC20.sol";

// This works locally on truffle
import 'openzeppelin-solidity/contracts/access/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol';
import { ILendingPool, IProtocolDataProvider } from "./Interfaces.sol";

contract SafeKeep is Ownable {
   using SafeMath for uint;
   using SafeERC20 for IERC20;

    address[] private assets = new address[](7);
    assets[0] = address(0xB597cd8D3217ea6477232F9217fa70837ff667Af); // Kovan AAVE
    assets[1] = address(0x2d12186Fbb9f9a8C28B3FfdD4c42920f8539D738); // Kovan BAT
    assets[2] = address(0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD); // Kovan DAI
    assets[3] = address(0x075A36BA8846C6B6F53644fDd3bf17E5151789DC); // Kovan UNI
    assets[4] = address(0xb7c325266ec274fEb1354021D27FA3E3379D840d); // Kovan YFI
    assets[5] = address(0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789); // Kovan LINK
    assets[6] = address(0x7FDb81B0b8a010dd4FFc57C3fecbf145BA8Bd947); // Kovan SNX
    
     struct Depositor {
        uint balance;
        uint lastPing;
        address backupAddress;
        bool isUser;
    }
    
  
    mapping(address => Depositor) private depositors;
    address[] depositorsAddresses;
    address[] oldPingers;
    
    ILendingPool constant lendingPool = ILendingPool(address(0x9FE532197ad76c5a68961439604C037EB79681F0)); // Kovan
    IProtocolDataProvider constant dataProvider = IProtocolDataProvider(address(0x3c73A5E5785cAC854D468F727c606C07488a29D6)); // Kovan
    address constant multiSig = address(0x0231976737E2D745e4bd523F4e20648E6e8EA9cA); // Multisig address

    modifier onlyMultisig() {
        require(msg.sender == multiSig, "Not Multisig");
        _;
    }
    
    
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
    
    
    // AAVE LENDING POOL functions
      /**
     * @notice Deposits an `amount` of `_asset` into the underlying Aave reserve and thereby receiving the overlying interestbearing aToken,
     * e.g., user deposits 1 WETH and receives 1 aWETH.
     * @param _asset The address of the underlying asset
     * @param _amountToDeposit The amount to be deposited
     * onBehalfOf = address(this)  TODO
     * referralCode = 0;
     */
     function depositInReserve(address _asset, uint256 _amountToDeposit) public onlyMultisig {
         IERC20(_asset).safeApprove(address(lendingPool), _amountToDeposit);
         lendingPool.deposit(_asset, _amountToDeposit, address(this), 0);
     }
     
    
    /**
     * @notice Withdraw as much underlying `_asset` as possible by burning aTokens
     * @param _asset The address of the underlying asset from the reserve
     * uint256(-1) = amount; means to withdraw all your funds from the lending pool
     * msg.sender = recipient of the withdrawn _asset;
     */
    function withdrawFromReserve(address _asset) public onlyOwner {
        lendingPool.withdraw(_asset, uint256(-1), msg.sender);
    }
    
     /**
     * @notice Transfers a given `amount` of the interest bearing `asset` to another account.
     * Used as a helper function but `transferAsset` could be used with the aTokenAddress directly.
     * @param _asset The address of the underlying asset
     * @param _amountToTransfer The amount of aTokens to Transfer
     * @param _to The address to receive the asset
     */
    function transferAToken(address _asset, uint256 _amountToTransfer, address _to) public onlyOwner {
        (address aTokenAddress, , ) = dataProvider.getReserveTokensAddresses(_asset);
        IERC20(aTokenAddress).safeTransfer(_to, _amountToTransfer);
    }
    
     /**
     * @notice Gets the balance of aTokens for the underlying `_asset`
     * @param _asset The address of the underlying asset
     * @return The balance of aTokens
     * address(this) here might be replaced by the address of the user on SafeKeep
     */
    function getAtokenBalance(address _asset) public view returns (uint256) {
        (address aTokenAddress, , ) = dataProvider.getReserveTokensAddresses(_asset);
        return IERC20(aTokenAddress).balanceOf(address(this));
    }
    
    //  /**
    //  * @notice Borrow a specific `_amountBorrowed` of the underlying `_asset` if the user has sufficient collateral
    //  * will borrow with stable interest rate and 0 as the referral code.
    //  * @param _asset The address of the underlying asset to borrow
    //  * @param _amountBorrowed The amount to be borrowed
    //  */
    // function borrow(address _asset, uint256 _amountBorrowed) public onlyOwner {
    //     lendingPool.borrow(_asset, _amountBorrowed, 1, 0, address(this));
    // }

    // /**
    //  * @notice Repays a borrowed `_amountBorrowed` on a specific reserve, burning the equivalent debt tokens.
    //  * will repay with stable interest rate.
    //  * @param _asset The address of the borrowed underlying asset previously borrowed
    //  * @param _amountBorrowed The amount to pay back.
    //  */
    // function repay(address _asset, uint256 _amountBorrowed) public onlyOwner {
    //     IERC20(_asset).safeApprove(address(lendingPool), _amountBorrowed);
    //     lendingPool.repay(_asset, _amountBorrowed, 1, address(this));
    // }
}
