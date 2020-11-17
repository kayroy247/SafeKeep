// SafeKeepABI is available here because SafeKeep.js is imported in wallet.html
let usersBalance,
  depositForm,
  withdrawForm,
  depositAmount,
  depositButton,
  backupAddress,
  withdrawAmount,
  pingButton,
  hashRegex,
  contract,
  web3;
function getDomNodes() {
  usersBalance = document.querySelector('.user-balance');
  depositForm = document.querySelector('.deposit-form');
  withdrawForm = document.querySelector('.withdraw-form');
  depositAmount = document.querySelector('.deposit-amount');
  depositButton = document.querySelector('.deposit-button');
  backupAddress = document.querySelector('.backup-address');
  withdrawAmount = document.querySelector('.withdraw-amount');
  pingButton = document.querySelector('.ping-button');

  contractAddress = '0xa055dFC2190bA3C147D96C69eD5e11442A59525f';
  hashRegex = /^0x([A-Fa-f0-9]{64})$/;

  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
  }
  // Get the contract instance.
  contract = new web3.eth.Contract(SafeKeepABI[0].abi, contractAddress);
}
window.addEventListener('load', async () => {
  getDomNodes();
  depositEvent();
  withdrawEvent();
  try {
    const acct = await web3.eth.getAccounts();
    const userBalance = await contract.methods
      .getBalance()
      .call({from: acct[0]});
    console.log(userBalance);
  } catch (error) {
    console.log(error);
  }
  usersBalance.innerText = `${web3.utils.fromWei(userBalance, 'ether')} ETH`;
});

const Notificate = (msg, status, timeout = 2500) => {
  UIkit.notification(msg, {
    status,
    pos: 'top-center',
    timeout,
  });
};

function depositEvent() {
  return depositForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();
    const depo = depositAmount.value;
    const backup = backupAddress.value;

    if (web3.utils.isAddress(backup) && Number(depo) > 0.001) {
      try {
        const amountToSend = web3.utils.toWei(depo, 'ether');
        const trx = await contract.methods
          .deposit(backup)
          .send({from: accounts[0], value: amountToSend});

        if (hashRegex.test(trx.tx)) {
          const msg = `Transaction was successful
          https://ropsten.etherscan.io/tx/${trx.tx}
          `;
          Notificate(msg, 'success', 6000);
          depositAmount = 0;
          backupAddress = '';
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

    const accounts = await web3.eth.getAccounts();
    const withDraw = withdrawAmount.value;

    try {
      const amountToWithdraw = web3.utils.toWei(
        withDraw === '' ? '0' : withDraw,
        'ether'
      );
      const trx = await contract.methods
        .withdraw(amountToWithdraw)
        .send({from: accounts[0]});
      if (hashRegex.test(trx.tx)) {
        const msg = `Transaction was successful
          https://ropsten.etherscan.io/tx/${trx.tx}
          `;
        Notificate(msg, 'success', 6000);
      }
    } catch (error) {
      Notificate('Something went wrong', 'danger');
      console.error(error.message);
    }
  });
}
