document.addEventListener('DOMContentLoaded', function () {
  connectApp();
});

// 3 represents the ID of the ropsten network
const network = 3;
let web3;

const Notificate = (msg, status, timeout = 3000) => {
  UIkit.notification(msg, {
    status,
    pos: 'top-center',
    timeout
  })
}

// Checks if network is locked on ropsten
const checkNetwork = async () => {
  const networkId = await web3.eth.net.getId();

  if (networkId !== network) {
    Notificate('Please switch to the Ropsten TestNet and try again', 'warning');
    return;
  }
  return networkId;
}

// separated the check for ethereum/web3 in this event listener so that web3 can be used 
// in wallet.js instead of checking for window.ethereum there again.
window.addEventListener('load', () => {
  if (window.ethereum) {

    web3 = new Web3(window.ethereum);
  } else if (window.web3) {
    // Use Mist/MetaMask's provider.
    web3 = window.web3;
    console.log('Injected web3 detected.');

  } else {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }

  checkNetwork();
})

function connectApp() {
  const ethereumButton = document.querySelector('.enableEthereumButton');

  ethereumButton.addEventListener('click', async () => {
    //Will Start the metamask extension
    const res = await checkNetwork();

    if (res !== network) {
      return;
    }

    const accounts = await ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts[0].length === 42) {
      window.location.href = "wallet.html";
    }
  });
}
