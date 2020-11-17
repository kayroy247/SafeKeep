const usersBalance = document.querySelector('.user-balance');
const depositForm = document.querySelector('.deposit-form');
const withdrawForm = document.querySelector('.withdraw-form');
const depositAmount = document.querySelector('.deposit-amount');
const depositButton = document.querySelector('.deposit-button');
const backupAddress = document.querySelector('.backup-address');
const withdrawAmount = document.querySelector('.withdraw-amount');
const withdrawButton = document.querySelector('.withdraw-button');
const pingButton = document.querySelector('.ping-button');
const depositSpinner = document.querySelector('#deposit-modal .spinner');
const withdrawSpinner = document.querySelector('#withdraw-modal .spinner');

const contractAddress = '0xa055dFC2190bA3C147D96C69eD5e11442A59525f';
const hashRegex = /^0x([A-Fa-f0-9]{64})$/;
let contract;
let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
}

// SafeKeepABI is available here because SafeKeep.js is imported in wallet.html
// Get the contract instance.
// transactionConfirmationBlocks is 3 so that transactions can be confirmed faster 
// so as to get a transaction response
contract = new web3.eth.Contract(
  SafeKeepABI[0].abi,
  contractAddress,
  { transactionConfirmationBlocks: 3 }
);

const getUserBalance = async () => {
  const userBalance = await contract.methods.getBalance().call();
  usersBalance.innerText = `${web3.utils.fromWei(userBalance)} ETH`;
}

const getAccount = async () => {
  const accounts = await web3.eth.getAccounts();
  return accounts;
}

window.addEventListener('load', async () => {
  // const [account] = await getAccount();
  getUserBalance();
})


const Notificate = (msg, status, timeout = 3000) => {
  UIkit.notification(msg, {
    status,
    pos: 'top-center',
    timeout
  })
}

const loading = (bool, spinner, btn, text) => {
  spinner.style.display = bool ? 'inline-block' : 'none';
  btn.disabled = bool;
  btn.innerText = bool ? 'Processing... ' : text;
}

depositForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const [account] = await getAccount();
  let depo = depositAmount.value;
  let backup = backupAddress.value

  if (web3.utils.isAddress(backup) && Number(depo) > 0.001) {
    try {
      loading(true, depositSpinner, depositButton);
      const amountToSend = web3.utils.toWei(depo, "ether");
      const trx = await contract.methods.deposit(backup).send({ from: account, value: amountToSend });
   
      if (hashRegex.test(trx.transactionHash)) {
        let msg = `Transaction was successful`
        Notificate(msg, 'success', 6000)
        depo = 0;
        backup = '';
        loading(false, depositSpinner, depositButton, 'Deposit');
        document.querySelector('#deposit-modal .uk-modal-close-default').click();
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

  const [account] = await getAccount();

  const withDraw = withdrawAmount.value;
  
  try {
    loading(true, withdrawSpinner, withdrawButton);
    const amountToWithdraw = web3.utils.toWei(withDraw === '' ? '0' : withDraw, "ether");
    const trx = await contract.methods.withdraw(amountToWithdraw).send({ from: account });

    if (hashRegex.test(trx.transactionHash)) {
      const msg = `Transaction was successful`
      Notificate(msg, 'success', 6000);
      withDraw = 0;
      loading(false, withdrawSpinner, withdrawButton, 'Withdraw');
      document.querySelector('#withdraw-modal .uk-modal-close-default').click();
    }
  } catch (error) {
    Notificate('Something went wrong', 'danger');
    console.error(error.message);
  }
});

//add ping function
pingButton.addEventListener('click', async (e)=> {
  const pingMsg = await contract.methods.ping().call();
  try {
    Notificate(pingMsg, 'successful');
  }
  catch(error){
    Notificate('something does not seem right', 'not successful');
    console.log(error);
  }
  
});