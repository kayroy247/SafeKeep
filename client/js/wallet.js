// SafeKeepABI is available here because SafeKeep.js is imported in wallet.html
const usersBalance = document.querySelector('.user-balance');
const depositForm = document.querySelector('.deposit-form');
const withdrawForm = document.querySelector('.withdraw-form');
const depositAmount = document.querySelector('.deposit-amount');
const depositButton = document.querySelector('.deposit-button');
const backupAddress = document.querySelector('.backup-address');
const withdrawAmount = document.querySelector('.withdraw-amount');
const pingButton = document.querySelector('.ping-button');

const contractAddress = '0xa055dFC2190bA3C147D96C69eD5e11442A59525f';
const hashRegex = /^0x([A-Fa-f0-9]{64})$/;
let contract;
let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
}
// Get the contract instance.
contract = new web3.eth.Contract(
  SafeKeepABI[0].abi,
  contractAddress
);

window.addEventListener('load', async () => {
  const userBalance = await contract.methods.getBalance().call();
  usersBalance.innerText = `${userBalance} ETH`;
})


const Notificate = (msg, status, timeout = 2500) => {
  UIkit.notification(msg, {
    status,
    pos: 'top-center',
    timeout
  })
}

depositForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const accounts = await web3.eth.getAccounts();
  const depo = depositAmount.value;
  const backup = backupAddress.value


  if (web3.utils.isAddress(backup) && Number(depo) > 0.001) {
    try {
      const amountToSend = web3.utils.toWei(depo, "ether");
      const trx = await contract.methods.deposit(backup).send({ from: accounts[0], value: amountToSend });
    
      if (hashRegex.test(trx.tx)) {
        const msg = `Transaction was successful
        https://ropsten.etherscan.io/tx/${trx.tx}
        `
        Notificate(msg, 'success', 6000)
        depositAmount = 0;
        backupAddress = '';
      }
    } catch (error) {
      Notificate('Something went wrong', 'danger')
      console.error(error.message);
    }

  } else {
    const errMsg = 'Check that backup address is valid and deposit is greater than 0.001';
    Notificate(errMsg, 'warning')
    console.error(errMsg)
  }
});

withdrawForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const accounts = await web3.eth.getAccounts();
  const withDraw = withdrawAmount.value;

  try {
    const amountToWithdraw = web3.utils.toWei(withDraw === '' ? '0' : withDraw, "ether");
    const trx = await contract.methods.withdraw(amountToWithdraw).send({ from: accounts[0] });
    if (hashRegex.test(trx.tx)) {
      const msg = `Transaction was successful
        https://ropsten.etherscan.io/tx/${trx.tx}
        `
      Notificate(msg, 'success', 6000)
    }
  } catch (error) {
    Notificate('Something went wrong', 'danger')
    console.error(error.message);
  }
});

//add ping function
pingButton.addEventListener('click', async (e)=> {
  const pingMsg = await contract.methods.ping().send({ from: accounts[0] });
  try {
    Notificate(pingMsg, 'success');
  }
  catch(error){
    Notificate('Something went wrong', 'danger');
    console.log(error);
  }
  
});