import './App.css';
import Web3 from 'web3';
import {useEffect, useState} from 'react';
import abi from './safekeepabi.js';

function App() {
  const [account, setAccount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [depositAmount, setDepositAmount] = useState([]);
  const [backupAddress, setBackupAdress] = useState([]);

  useEffect(() => {
    // if (!ethEnabled()) {
    //   alert(
    //     'Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!'
    //   );
    // }
    loadBlockchainData();
  }, [accounts]);

  window.ethereum.on('accountsChanged', function (accounts) {
    checkAccount();
  });

  const checkAccount = async () => {
    const account = await window.web3.eth.getAccounts();
    setAccounts(account);
  };
  const loadBlockchainData = async () => {
    window.web3 = new Web3(window.ethereum);
    const network = await window.web3.eth.net.getNetworkType();
    const contractAddress = '0xa055dFC2190bA3C147D96C69eD5e11442A59525f';
    window.safeKeepContract = new window.web3.eth.Contract(
      abi,
      contractAddress
    );
    console.log(network);
    const accounts = await window.web3.eth.getAccounts();
    setAccount(accounts[0]);
    console.log('accounts', accounts[0]);
  };

  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  };

  const deposit = async (event) => {
    event.preventDefault();
    const hash = await window.safeKeepContract.methods
      .deposit(backupAddress)
      .send({
        from: account,
        value: window.web3.utils.toWei(depositAmount, 'ether'),
      });
    console.log(hash);
  };
  const withdraw = () => {};
  const ping = () => {};
  const transferTobackup = () => {};

  const handleChange = (event) => {
    setDepositAmount(event.target.value);
  };
  const handleAddressChange = (event) => {
    setBackupAdress(event.target.value);
  };

  const handleConnect = async () => {
    console.log('connect');
    window.ethereum.enable();
    checkAccount();
  };
  return (
    <>
      <nav className="navbar  px-4 navbar-light bg-light">
        <a className="navbar-brand" href="#">
          <h1>SafeKeep</h1>
        </a>

        <span class="navbar-text">{account}</span>
        <button
          onClick={handleConnect}
          className="btn btn-outline-success my-1 my-sm-0"
          type="submit"
        >
          {account ? 'connected' : 'connect'}
        </button>
      </nav>
      <div className="container">
        <div style={{height: '300px'}} className="hero">
          <h1>Save and backup with us</h1>
          <p>Your Current Account: {account} </p>
        </div>
        <div class="row">
          <div class="col">
            <h4>DEPOSIT</h4>
            <form class="form-inline">
              <div class="form-group mx-sm-3 mb-2">
                <label htmlFor="deposit" class="sr-only">
                  ETH
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="deposit"
                  placeholder="Amount in ETH"
                  value={depositAmount}
                  onChange={handleChange}
                />
              </div>
              <div class="form-group mx-sm-3 mb-2">
                <label htmlFor="address" class="sr-only">
                  ETH
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="address"
                  placeholder="Backup Address"
                  value={backupAddress}
                  onChange={handleAddressChange}
                />
              </div>
              <button
                type="submit"
                onClick={deposit}
                class="btn btn-primary mb-2"
              >
                Deposit
              </button>
            </form>
          </div>
          <div class="col border-left">
            <h4>Withdrawal</h4>
            <form class="form-inline">
              <div class="form-group mx-sm-3 mb-2">
                <label htmlFor="withdraw" class="sr-only">
                  withdraw
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="withdraw"
                  placeholder="ETH"
                />
              </div>
              <button
                type="submit"
                onClick={withdraw}
                class="btn btn-primary mb-2"
              >
                Withdraw
              </button>
            </form>
          </div>
        </div>
        <hr />
        <div className="row ma-4">
          PING Atleast once in 6 months
          <div className="col">
            <button type="submit" onClick={ping} class="btn btn-primary mb-2">
              Ping
            </button>
          </div>
          <div className="col">
            Transter to backup addresses
            <button
              type="submit"
              onClick={transferTobackup}
              class="btn btn-primary mb-2"
            >
              TransferTobackup
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
