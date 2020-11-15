// SafeKeepABI is available here because SafeKeep.js is imported in wallet.html
const usersBalance = document.querySelector('.user-balance')
let instance;

window.addEventListener('load', async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
  }
  const accounts = await web3.eth.accounts;
  console.log(SafeKeepABI[0].abi)
  // Get the contract instance.
  instance = new web3.eth.Contract(
    SafeKeepABI[0].abi,
    '0xa055dFC2190bA3C147D96C69eD5e11442A59525f'
  );


  const userBalance = await instance.methods.getBalance().call();
  usersBalance.innerText = `${userBalance} ETH`
})
