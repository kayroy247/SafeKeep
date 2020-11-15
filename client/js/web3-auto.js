const ethereumButton = document.querySelector('.enableEthereumButton');


ethereumButton.addEventListener('click', async () => {
    //Will Start the metamask extension

    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
            // Request account access if needed
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            });
            
          
            if (accounts[0].length === 42) {
                window.location.href = "wallet.html";
            }
           return web3;
        } catch (error) {
            console.error(error);
        }
        // Legacy dapp browsers...
    } else if (window.web3) {
        // Use Mist/MetaMask's provider.
       const web3 = window.web3;
       console.log('Injected web3 detected.');
       return web3;
      
    } else {
        const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
        return web3;
    }
});