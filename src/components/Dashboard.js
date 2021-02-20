import { useState, useEffect, useCallback, useReducer } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import { Button } from 'antd';
import { Blockie } from './Blockies';
import smartTrim from '../util/smartTrim';
import SFPModal, { WithdrawForm, DepositForm, UpdateBackup, WithdrawDaiForm, DepositDaiForm } from './Modal';

import SafeKeep from '../contracts/artifacts/SafeKeep.json';
import ERC20 from '../contracts/artifacts/ERC20.json';
import SFKP from '../contracts/artifacts/SFKP.json';



const Dashboard = () => {
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [safeKeepCon, setSafeKeepCon] = useState({});
  const [daiCon, setDaiCon] = useState({});
  const [ethBalance, setEthBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [sfkpBalance, setSfkpBalance] = useState('0');
  const [bkpAddress, setBkpAddress] = useState('');
  const [lastPing, setLastPing] = useState('');
  const [modalType, setModalType] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [inputValue, setInputVal] = useState({
    withdrawAmount: '',
    backupAddress: '',
    depositAmount: '',
    updateBackup: '',
    withdrawDaiAmount: '',
    depositDaiAmount: ''
  })

  const { loadWeb3 } = useAuth();

  const hashRegex = /^0x([A-Fa-f0-9]{64})$/;
  const web3 = window.web3;

  const kDaiData = { address: '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD' } //kDai
  // const mDaiData = { address: '0x2394cb90FC30EaE5cFdeb49db401368a2aa5188F' } //mDai


  const getModal = (modalType, onChange) => {
    switch (modalType) {
      case 'Deposit': {
        return <DepositForm onChange={onChange} />
      }

      case 'Withdraw': {
        return <WithdrawForm onChange={onChange} />
      }

      case 'Deposit DAI': {
        return <DepositDaiForm onChange={onChange} />
      }
      case 'Withdraw DAI': {
        return <WithdrawDaiForm onChange={onChange} />
      }

      case 'Update': {
        return <UpdateBackup onChange={onChange} />
      }

      default:
        break;
    }
  }

  const Notificate = (msg) => toast(msg, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (modalType === 'Withdraw') {
      return withdrawEth();
    } else if (modalType === 'Deposit') {
      return depositEth();
    } else if (modalType === 'Deposit DAI') {
      return depositDai();
    } else if (modalType === 'Withdraw DAI') {
      return withdrawDai();
    }
    return updateBackupFn();
  };

  const handleCancel = () => {
    setLoading(false)
    setInputVal({});
    setIsModalVisible(false);
  };

  const onChange = (e) => {
    setInputVal(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
  }

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
      const daiToken = new web3.eth.Contract(ERC20.abi, kDaiData.address)
      setDaiCon(daiToken);

    const safeKeepData = { address: '0x1Bf70Ba5741C66746C28AE7D27F3ce0CFB63DA60' }
    //Load SafeKeep   
      const safeKeep = new web3.eth.Contract(SafeKeep.abi, safeKeepData.address)
      setSafeKeepCon(safeKeep);
      console.log(safeKeep.methods)
      let bkpAddress = await safeKeep.methods.getBackupAddress().call({ from: userAccount });
      setBkpAddress(bkpAddress)
      let lstPing = await safeKeep.methods.getLastPing().call({ from: userAccount });
      setLastPing(lstPing);
      let etherBalance = await safeKeep.methods.getBalance().call({ from: userAccount });
      setEthBalance(etherBalance.toString())
      let userInterest = await safeKeep.methods.checkUserInterest().call({ from: userAccount })
      setSfkpBalance(userInterest.toString());
      let daiBalance = await safeKeep.methods.checkTokenBalance(kDaiData.address).call({ from: userAccount });
      setTokenBalance(daiBalance.toString())
  
  }, [kDaiData.address])

  const depositEth = async () => {
    if (web3.utils.isAddress(`${inputValue.backupAddress}`) && Number(inputValue.depositAmount) > 0.001) {
      try {
        setLoading(true);
        const amountToSend = web3.utils.toWei(`${inputValue.depositAmount}`, 'ether');
        const trx = await safeKeepCon.methods.depositEther(inputValue.backupAddress)
          .send({ from: account, value: amountToSend });

        if (hashRegex.test(trx.transactionHash)) {
          let msg = `Transaction was successful`;
          Notificate(msg)
          setLoading(false);
          handleCancel();
          setInputVal({});
          let etherBalance = await safeKeepCon.methods.getBalance().call({ from: account });
          setEthBalance(etherBalance.toString())
        }
      } catch (error) {
        setLoading(false);
        Notificate('Something went wrong')
        console.error(error.message);
      }
    } else {
      setLoading(false);
      const errMsg = 'Check that backup address is valid and deposit is greater than 0.001';
      Notificate(errMsg);
      console.error(errMsg);
    }
  };

  const withdrawEth = async () => {
    let withDraw = `${inputValue.withdrawAmount}`;

    try {
      setLoading(true);
      const amountToWithdraw = web3.utils.toWei(
        withDraw === '' ? '0' : withDraw,
        'ether'
      );
      const trx = await safeKeepCon.methods
        .withdraw(amountToWithdraw)
        .send({ from: account });
      if (hashRegex.test(trx.transactionHash)) {
        let msg = `Transaction was successful`;
        Notificate(msg);
        setLoading(false);
        handleCancel()
        setInputVal({})
        let etherBalance = await safeKeepCon.methods.getBalance().call({ from: account });
        setEthBalance(etherBalance.toString())
      }
    } catch (error) {
      setLoading(false);
      Notificate('Something went wrong');
      console.error(error.message);
    }
  }

  const depositDai = () => {
    setLoading(true)
    const amountToSend = web3.utils.toWei(`${inputValue.depositDaiAmount}`, 'ether');
    daiCon.methods.approve(safeKeepCon._address, amountToSend).send({ from: account }).on('transactionHash', (hash) => {
      safeKeepCon.methods.depositToken(amountToSend, kDaiData.address).send({ from: account }).on('transactionHash', async (hash) => {
        let daiBalance = await safeKeepCon.methods.checkTokenBalance(kDaiData.address).call({ from: account });
        setTokenBalance(daiBalance.toString())
        setLoading(false)
        Notificate('Transaction Successful');
        handleCancel()
        setInputVal({})
      })
    })
  }

  const withdrawDai = async () => {
    setLoading(true);
    let withDraw = `${inputValue.withdrawDaiAmount}`;

    try {
      setLoading(true);
      const amountToWithdraw = web3.utils.toWei(
        withDraw === '' ? '0' : withDraw,
        'ether'
      );
      const trx = await safeKeepCon.methods
        .withdrawToken(kDaiData.address, amountToWithdraw)
        .send({ from: account });
      if (hashRegex.test(trx.transactionHash)) {
        let msg = `Transaction was successful`;
        Notificate(msg);
        setLoading(false);
        handleCancel()
        setInputVal({})
      }
    } catch (error) {
      setLoading(false);
      Notificate('Something went wrong');
      console.error(error.message);
    }
  }

  const updateBackupFn = async () => {
    if (!web3.utils.isAddress(`${inputValue.updateBackup}`)) {
      Notificate('Invalid Wallet Address');
      return;
    }

    try {
      setLoading(true);
      const trx = await safeKeepCon.methods
        .updateBackupAddress(inputValue.updateBackup)
        .send({ from: account });
      if (hashRegex.test(trx.transactionHash)) {
        let msg = `Transaction was successful`;
        Notificate(msg);
        setLoading(false);
        handleCancel()
        setInputVal({})
      }
    } catch (error) {
      setLoading(false);
      Notificate('Something went wrong');
      console.error(error.message);
    }
  }

  const handlePing = async () => {
    try {
      const pingMsg = await safeKeepCon.methods.ping().send({ from: account });
      if (hashRegex.test(pingMsg.transactionHash)) {
        Notificate('Ping Successful');
      }
    }
    catch (error) {
      Notificate('Something went wrong', error.message);
      console.log(error);
    }
  }

  useEffect(() => {
    loadWeb3()
    loadData()
  }, [loadWeb3, loadData, ethBalance, tokenBalance, account])

  return (
    <div className="dashboard">
      <ToastContainer />
      <SFPModal visible={isModalVisible} onOk={handleOk} title={modalType} buttonText={modalType} loading={loading} onCancel={handleCancel}>
        {getModal(modalType, onChange)}
      </SFPModal>

      <nav className="uk-navbar-container" uk-navbar="mode: click">
        <div className="uk-navbar-left">
          <ul className="uk-navbar-nav">
            <li className="uk-active">
              <NavLink to="/" className="font-size-nav">
                <img className="uk-margin-right logo" src="../images/LogoWhite.png" alt="safekeep logo" />
                  Dashboard
                </NavLink>
            </li>
            <li />
            <li className="uk-position-right">
              <div className="font-size-user" style={{ display: 'flex', alignItems: 'center' }}>
                <Blockie address={account} />
                <span className="wallet-address uk-margin-small-left">{smartTrim(account, 15)}</span>
                {/* <i className="material-icons uk-margin-right uk-margin-small-left">keyboard_arrow_down</i> */}
              </div>
              {/* <div className="uk-navbar-dropdown">
                <ul className="uk-nav uk-navbar-dropdown-nav">
                  <li><a href="#">Log Out</a></li>
                </ul>
              </div> */}
            </li>
          </ul>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* uk-child-width-1-3@m */}
        <div className="uk-flex  uk-flex-left uk-margin-medium-top uk-grid-small  paddingCards" uk-grid="true">
          <div className="uk-width-1-2@s">
            <div className="uk-card uk-card-default uk-card-body balance-card">
              <h3 className="uk-card-title">Ethereum Balance</h3>
              <p className="uk-card-paragraph user-balance">{`${web3?.utils?.fromWei(ethBalance, 'ether')} ETH`}</p>
              {/* <span className=" user-balance-usd">0 USD</span> */}
              <div className=" uk-text-left uk-margin-medium-left">
                {/* <a href="#withdraw-modal" uk-toggle> */}
                <button onClick={() => {
                  setModalType('Withdraw')
                  showModal()
                }} className=" uk-button depWith-button uk-button-default uk-align-right ">
                  Withdraw
                    </button>
                {/* </a> */}
                {/* <a href="#deposit-modal" uk-toggle> */}
                <button onClick={() => {
                  setModalType('Deposit')
                  showModal()
                }} className="uk-button depWith-button uk-button-default uk-align-right">
                  Deposit
                  </button>
                {/* </a> */}
              </div>
            </div>
            <div className="uk-card uk-margin-medium-top uk-card-default uk-card-body balance-card">
              <h3 className="uk-card-title">DAI Balance</h3>
              <p className="uk-card-paragraph user-balance">{`${web3?.utils?.fromWei(tokenBalance, 'ether')} DAI`}</p>
              {/* <span class=" user-balance-usd">0 USD</span> */}
              <div className=" uk-text-left uk-margin-medium-left">
                <button onClick={() => {
                  setModalType('Withdraw DAI')
                  showModal()
                }} className="uk-button depWith-button uk-button-default uk-align-right">
                  Withdraw
                  </button>

                <button onClick={() => {
                  setModalType('Deposit DAI')
                  showModal()
                }} className="uk-button depWith-button uk-button-default uk-align-right">
                  Deposit
                    </button>
              </div>
            </div>
            <div className="uk-card uk-margin-medium-top uk-card-default uk-card-body balance-card">
              <h3 className="uk-card-title">SFP Balance</h3>
              <p className="uk-card-paragraph user-balance">{`${web3?.utils?.fromWei(sfkpBalance, 'ether')} SFP`}</p>
              {/* <span class=" user-balance-usd">0 USD</span> */}
            </div>
          </div>
          <div className="uk-width-1-3@s" style={{ marginLeft: 'auto' }}>
            <div className="uk-card uk-card-default uk-card-body balance-card">
              <h3 className="uk-card-title">Backup Address</h3>
              <p className="uk-card-paragraph user-info" style={{ padding: '5px' }}>{smartTrim(bkpAddress, 15)}</p>
              <div className=" uk-text-left uk-margin-medium-left">
                <button onClick={() => {
                  setModalType('Update')
                  showModal()
                }} className="uk-button user-info-button uk-button-primary uk-align-right" style={{ border: 'hidden' }}>
                  Update
                </button>
              </div>
            </div>

            <div className="uk-card uk-margin-medium-top uk-card-default uk-card-body balance-card">
              <h3 className="uk-card-title">Last Ping</h3>
              <p className="uk-card-paragraph user-info">{lastPing}</p>
              {/* <span class=" user-balance-usd">0 USD</span> */}
              <div className=" uk-text-left uk-margin-medium-left">
                <button onClick={handlePing} className="uk-button user-info-button uk-button-tertiary uk-align-right ping-button">
                  Ping!
                </button>
              </div>
            </div>
            <Link to="/admin">
              <Button className="uk-margin-medium-right uk-margin-medium-top" type="primary">Go To Admin &gt;</Button>
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

export default Dashboard;
