// A utility function for getting current account
const getAccount = async () => {
  const accounts = await web3.eth.getAccounts();
  return accounts;
};

const refresh = () => {
  setTimeout(() => {
    window.location.reload();
  }, 6100);
}

const getUserBalance = async () => {
  try {
    const [account] = await getAccount();
    const userBalance = await contract.methods
      .getBalance()
      .call({ from: account });
    usersBalance.innerText = `${web3.utils.fromWei(userBalance, 'ether')} ETH`;
    walletAddress.innerText = account;
    walletAddress.setAttribute('uk-tooltip', account);
  } catch (error) {
    Notificate('Unable to get balance', 'warning');
    console.log(error);
  }
};

const loading = (bool, spinner, btn, text) => {
  spinner.style.display = bool ? 'inline-block' : 'none';
  btn.disabled = bool;
  btn.innerText = bool ? 'Processing... ' : text;
};

let usersBalance,
  depositForm,
  withdrawForm,
  depositAmount,
  depositButton,
  backupAddress,
  withdrawAmount,
  withdrawButton,
  pingButton,
  depositSpinner,
  withdrawSpinner,
  walletAddress,
  hashRegex,
  contract;
function getDomNodes() {
  usersBalance = document.querySelector('.user-balance');
  depositForm = document.querySelector('.deposit-form');
  withdrawForm = document.querySelector('.withdraw-form');
  depositAmount = document.querySelector('.deposit-amount');
  depositButton = document.querySelector('.deposit-button');
  backupAddress = document.querySelector('.backup-address');
  withdrawAmount = document.querySelector('.withdraw-amount');
  withdrawButton = document.querySelector('.withdraw-button');
  walletAddress = document.querySelector('.wallet-address');
  pingButton = document.querySelector('.ping-button');
  depositSpinner = document.querySelector('#deposit-modal .spinner');
  withdrawSpinner = document.querySelector('#withdraw-modal .spinner');
  checkOldPingersButton = document.querySelector('.check-old-pingers');

  contractAddress = '0xa055dFC2190bA3C147D96C69eD5e11442A59525f';
  hashRegex = /^0x([A-Fa-f0-9]{64})$/;
}

// SafeKeepABI is available here because SafeKeep.js is imported in wallet.html
// Get the contract instance.
// transactionConfirmationBlocks is 3 so that transactions can be confirmed faster
// so as to get a transaction response
window.addEventListener('load', () => {
  getDomNodes();
  depositEvent();
  withdrawEvent();
  pingEvent();
  checkOldPingersEvent();
  contract = new web3.eth.Contract(SafeKeepABI[0].abi, contractAddress, {
    transactionConfirmationBlocks: 3,
  });

  checkNetwork();
  getUserBalance();
});

function depositEvent() {
  return depositForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const [account] = await getAccount();
    let depo = depositAmount.value;
    let backup = backupAddress.value;

    if (web3.utils.isAddress(backup) && Number(depo) > 0.001) {
      try {
        loading(true, depositSpinner, depositButton);
        const amountToSend = web3.utils.toWei(depo, 'ether');
        const trx = await contract.methods
          .deposit(backup)
          .send({ from: account, value: amountToSend });

        if (hashRegex.test(trx.transactionHash)) {
          let msg = `Transaction was successful`;
          Notificate(msg, 'success', 6000);
          depo = 0;
          backup = '';
          loading(false, depositSpinner, depositButton, 'Deposit');
          document
            .querySelector('#deposit-modal .uk-modal-close-default')
            .click();
          refresh();
        }
      } catch (error) {
        Notificate('Something went wrong', 'danger');
        console.error(error.message);
      }
    } else {
      const errMsg =
        'Check that backup address is valid and deposit is greater than 0.001';
      Notificate(errMsg, 'warning');
      console.error(errMsg);
    }
  });
}

function withdrawEvent() {
  return withdrawForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const [account] = await getAccount();
    let withDraw = withdrawAmount.value;

    try {
      loading(true, withdrawSpinner, withdrawButton);
      const amountToWithdraw = web3.utils.toWei(
        withDraw === '' ? '0' : withDraw,
        'ether'
      );
      const trx = await contract.methods
        .withdraw(amountToWithdraw)
        .send({ from: account });
      if (hashRegex.test(trx.transactionHash)) {
        let msg = `Transaction was successful`;
        Notificate(msg, 'success', 6000);
        withDraw = 0;
        loading(false, withdrawSpinner, withdrawButton, 'Withdraw');
        document
          .querySelector('#withdraw-modal .uk-modal-close-default')
          .click();
          refresh();
      }
    } catch (error) {
      Notificate('Something went wrong', 'danger');
      console.error(error.message);
    }
  });
}

// ping function
function pingEvent() {
  return pingButton.addEventListener('click', async (e) => {
    try {
      const [account] = await getAccount();
      const pingMsg = await contract.methods.ping().send({ from: account });
      if (hashRegex.test(pingMsg.transactionHash)) {
        Notificate('Ping Successful', 'success');
      }
    }
    catch (error) {
      Notificate('Something went wrong', 'danger');
      console.log(error);
    }

  });
}

function checkOldPingersEvent() {
  checkOldPingersButton.addEventListener('click', async (e) => {
    console.log(await getAccount());
    try {
      const accounts = await getAccount();
      let account;
      if (accounts.length) {
        account = accounts[0];
        const checkOldPingersMsg = await contract.methods
          .checkOldPing()
          .send({ from: account });

        Notificate(checkOldPingersMsg, 'successful');
      }
    } catch (error) {
      Notificate('something went wrong', 'danger');
      console.log(error);
    }
  });
};
