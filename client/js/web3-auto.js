// This is for auto login once a user lands on your page, just include web-auto.js in a script on the page

window.addEventListener('load', async () => {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
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
})