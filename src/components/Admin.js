import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Button } from 'antd';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import { Blockie } from './Blockies';
import smartTrim from '../util/smartTrim';
import SafeKeep from '../contracts/artifacts/safeKeep.json';
import ERC20 from '../contracts/artifacts/ERC20.json';
// const LendingPoolV2Artifact = require('@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json');



const Admin = () => {
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [safeKeepCon, setSafeKeepCon] = useState({});
  const [daiCon, setDaiCon] = useState({});
  const [contractBalance, setContractBalance] = useState('0');
  const [daiTokenBalance, setDaITokenBalance] = useState('0');
  const [aTokenBalance, SetATokenBalance] = useState('0');
  const [oldPings, setOldPings] = useState(null);
  const web3 = window.web3;
  const ERC20Data = { address: '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD' }
  const safeKeepAddress = '0x1Bf70Ba5741C66746C28AE7D27F3ce0CFB63DA60';
  const lendingPoolAddress = '0x9FE532197ad76c5a68961439604C037EB79681F0';


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

  const depositInReserve = () => {
    if (daiTokenBalance === '0') return Notificate('Insufficient Dai');
    setLoading(true)
    const amountToSend = web3.utils.toWei(`${daiTokenBalance}`, 'ether');
    daiCon.methods.approve(lendingPoolAddress, amountToSend).send({ from: account }).on('transactionHash', (hash) => {
      safeKeepCon.methods.depositInReserve(ERC20Data.address, amountToSend).send({ from: account }).on('transactionHash', async (hash) => {
        setLoading(false)
        Notificate('Transaction Successful');
        let daiTokenBalance = await daiCon.methods.balanceOf(safeKeepAddress).call()
        setDaITokenBalance(daiTokenBalance.toString())
      })
    })
  }

  const checkOldPings = async () => {
    try {
      setChecking(true)
      const checkOldPingersMsg = await safeKeepCon.methods
        .checkOldPing()
        .send({ from: account });
      setOldPings(checkOldPingersMsg)
      console.log(checkOldPingersMsg)
      setChecking(false)
      Notificate('successful');
    } catch (error) {
      setChecking(false)
      Notificate('something went wrong', error.message);
      console.error(error);
    }
  };

  const getAccount = async () => {
    const [userAccount] = await window.web3.eth.getAccounts();
    setAccount(userAccount);
    return userAccount
  }

  window.ethereum.on('accountsChanged', function () {
    getAccount();
  });

  const loadData = useCallback(async () => {
    const web3 = window.web3;
    const userAccount = await getAccount();

     // DAI Token
     const daiToken = new web3.eth.Contract(ERC20.abi, ERC20Data.address)
     setDaiCon(daiToken);
     let daiTokenBalance = await daiToken.methods.balanceOf(safeKeepAddress).call()
     setDaITokenBalance(daiTokenBalance.toString())
    //Load SafeKeep
    const safeKeep = new web3.eth.Contract(SafeKeep.abi, safeKeepAddress)
    setSafeKeepCon(safeKeep);
    let ctrBalance = await safeKeep.methods.getContractBalance().call({ from: userAccount });
    setContractBalance(ctrBalance.toString())
    let aTokenBalance = await safeKeep.methods.getAtokenBalance(ERC20Data.address).call({ from: userAccount })
    SetATokenBalance(aTokenBalance)
  }, [ERC20Data.address])

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
                <span className="wallet-address uk-margin-small-left">{smartTrim(account, 15)}</span>
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
              {/* <div className=" uk-text-left uk-margin-medium-left">

                <button  className=" uk-button depWith-button uk-button-default uk-align-right ">
                  Withdraw
                  </button>
             
                <button onClick className="uk-button depWith-button uk-button-default uk-align-right">
                  Deposit
                </button>
              </div> */}
            </div>
            <div className="uk-card uk-margin-medium-top uk-card-default uk-card-body balance-card">
              <h3 className="uk-card-title">Contract DAI Balance</h3>
              <p className="uk-card-paragraph user-balance">{`${web3?.utils?.fromWei(daiTokenBalance, 'ether')} DAI`}</p>
              {/* <span class=" user-balance-usd">0 USD</span> */}
              <div className=" uk-text-left uk-margin-medium-left">

                <button disabled={withdrawing} className="uk-button depWith-button uk-button-default uk-align-right">
                  {withdrawing ? 'Processing...' : 'Withdraw'}
                </button>

                <button disabled={loading} onClick={depositInReserve} className="uk-button depWith-button uk-button-default uk-align-right">
                  {loading ? 'Processing...' : 'Deposit'}
                </button>
              </div>
            </div>
            <div className="uk-card uk-margin-medium-top uk-card-default uk-card-body balance-card">
              <h3 className="uk-card-title">aDai Balance (interest bearing)</h3>
              <p className="uk-card-paragraph user-balance">{aTokenBalance} aDai</p>
              {/* <span class=" user-balance-usd">0 USD</span> */}
            </div>
          </div>
          <div className="uk-width-1-3@s" style={{ marginLeft: 'auto' }}>
            <div className="uk-card uk-card-default uk-card-body balance-card">
              <h3 className="uk-card-title">Check Old Pings</h3>
              <p className="uk-card-paragraph user-info" style={{ padding: '5px' }}>{smartTrim(oldPings?.blockHash, 20)}</p>
              <div className=" uk-text-left uk-margin-medium-left">
                <button onClick={checkOldPings} className="uk-button user-info-button uk-button-primary uk-align-right" style={{ border: 'hidden' }}>
                  {checking ? 'Checking...' : 'Check'}
                </button>
              </div>
            </div>

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
