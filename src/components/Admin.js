import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import  { Button } from 'antd';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import { Blockie } from './Blockies';

import SafeKeep from '../contracts/artifacts/SafeKeep.json';
import ERC20 from '../contracts/artifacts/ERC20.json';
const LendingPoolV2Artifact = require('@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json');


const Admin = () => {
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [safeKeepCon, setSafeKeepCon] = useState({});
  const [daiCon, setDaiCon] = useState({});
  const [contractBalance, setContractBalance] = useState('0');
  const [daiTokenBalance, setDaITokenBalance] = useState('0');
  const web3 = window.web3;

  const { loadWeb3 } = useAuth();

  const Notificate = (msg) => toast(msg, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

  const loadData = useCallback(async () => {
    const web3 = window.web3;
    const [userAccount] = await web3.eth.getAccounts();
    setAccount(userAccount)

    // const networkId = await window.web3.eth.net.getId();
    const safeKeepData = { address: '0x60E26ee03023b5963FAb0655E6b263CC3D1Fd67C' }
    //Load SafeKeep
    // const safeKeepData = networkId && SafeKeep.networks[networkId];
    if (safeKeepData) {
      const safeKeep = new web3.eth.Contract(SafeKeep.abi, safeKeepData.address)
      setSafeKeepCon(safeKeep);
      let ctrBalance = await safeKeep.methods.getContractBalance().call({ from: userAccount });
      setContractBalance(ctrBalance.toString())
    } else {
      window.alert('SafeKeep contract not deployed')
    }

    // DAI Token
    const ERC20Data = { address: '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD' }
    const daiToken = new web3.eth.Contract(ERC20, ERC20Data.address)
    setDaiCon(daiToken);
    let daiTokenBalance = await daiToken.methods.balanceOf(safeKeepData.address).call()
    setDaITokenBalance(daiTokenBalance.toString())
  }, [])

  useEffect(() => {
    loadWeb3()
    loadData()
  }, [loadWeb3, loadData])

  return (
    <div className="dashboard">
      <ToastContainer />
    
      <nav className="uk-navbar-container" uk-navbar="mode: click">
        <div className="uk-navbar-left">
          <ul className="uk-navbar-nav">
            <li className="uk-active">
              <NavLink to="/" className="font-size-nav">
                <img className="uk-margin-right logo" src="../images/LogoWhite.png" alt="safekeep logo" />
                Admin
              </NavLink>
            </li>
            <li />
            <li className="uk-position-right">
              <div className="font-size-user" style={{ display: 'flex', alignItems: 'center' }}>
                <Blockie address={account} />
                <span className="wallet-address uk-margin-small-left">{account}</span>
                {/* <i className="material-icons uk-margin-right uk-margin-small-left">keyboard_arrow_down</i> */}
              </div>
            </li>
          </ul>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* uk-child-width-1-3@m */}
        <div className="uk-flex  uk-flex-left uk-margin-medium-top uk-grid-small  paddingCards" uk-grid="true">
          <div className="uk-width-1-2@s">
            <div className="uk-card uk-card-default uk-card-body balance-card">
              <h3 className="uk-card-title">Contract Balance (ETH)</h3>
              <p className="uk-card-paragraph user-balance">{`${web3?.utils?.fromWei(contractBalance, 'ether')} ETH`}</p>
              {/* <span className=" user-balance-usd">0 USD</span> */}
              <div className=" uk-text-left uk-margin-medium-left">

                <button  className=" uk-button depWith-button uk-button-default uk-align-right ">
                  Withdraw
                  </button>
             
                <button onClick className="uk-button depWith-button uk-button-default uk-align-right">
                  Deposit
                </button>
          
              </div>
            </div>
            <div className="uk-card uk-margin-medium-top uk-card-default uk-card-body balance-card">
              <h3 className="uk-card-title">Contract DAI Balance</h3>
              <p className="uk-card-paragraph user-balance">{`${web3?.utils?.fromWei(daiTokenBalance, 'ether')} DAI`}</p>
              {/* <span class=" user-balance-usd">0 USD</span> */}
              <div className=" uk-text-left uk-margin-medium-left">

                <button className="uk-button depWith-button uk-button-default uk-align-right">
                  Withdraw
                </button>

                <button className="uk-button depWith-button uk-button-default uk-align-right">
                  Deposit
                </button>
              </div>
            </div>
            <div className="uk-card uk-margin-medium-top uk-card-default uk-card-body balance-card">
              <h3 className="uk-card-title">aDai Balance (interest bearing)</h3>
              <p className="uk-card-paragraph user-balance">0 aDai</p>
              {/* <span class=" user-balance-usd">0 USD</span> */}
            </div>
          </div>
          <div className="uk-width-1-3@s" style={{ marginLeft: 'auto' }}>
           
            <Link to="/dashboard">
              <Button className="uk-margin-right uk-margin-medium-top" type="primary">&lt; Go To Dashboard</Button>
            </Link>
          </div>
        </div>
        {/* <div class="">
          <button
              class="headerButtonTransfer uk-button uk-button-default uk-align-right uk-margin-medium-right uk-margin-top ping-button">
              Ping
          </button>
      </div> */}
        <div className="uk-position-bottom-left">
          <button className="uk-button uk-button-default uk-align-left uk-margin-medium-right uk-margin-top check-old-pingers" style={{ visibility: 'hidden' }}>Check Old Pingers</button>
        </div>
      </div>

    </div>
  )
}

export default Admin;
