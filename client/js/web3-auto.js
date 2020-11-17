const ethereumButton = document.querySelector('.enableEthereumButton');
let web3;

const checkNetwork = async () => {
    // 3 represents the ID of the ropsten network
    const network = 3;
    const networkId = await web3.eth.net.getId();

    if (networkId !== network) {
        Notificate('Please switch to the Ropsten TestNet and try again', 'warning');
        return;
    }
    return networkId;
}

window.addEventListener('load', () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        // return web3;
    } else if (window.web3) {
        // Use Mist/MetaMask's provider.
        web3 = window.web3;
        console.log('Injected web3 detected.');
        // return web3;

    } else {
        web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
        // return web3;
    }

    checkNetwork();
})

const Notificate = (msg, status, timeout = 3000) => {
    UIkit.notification(msg, {
        status,
        pos: 'top-center',
        timeout
    })
}

ethereumButton.addEventListener('click', async () => {
    //Will Start the metamask extension
    const network = 3;
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