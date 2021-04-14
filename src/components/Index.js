import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';

const Home = () => {
  const { connect, loadWeb3, account } = useAuth();
  const history = useHistory();

  useEffect(() => {
    loadWeb3()
  }, [loadWeb3, account])

  const handleConnect = async () => {
    const res = await connect();
    if (res && res.length === 42) {
      history.push('/dashboard');
    } else {
      toast(res.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }

  return (
    <div>
      <ToastContainer />
      <header>
        <div className="uk-flex">
          <div className="header-text uk-animation-slide-left-small">
            <div className="header-info">
              <h1 className="header-main">SafeKeep</h1>
              <h4>Guaranteed storage and safety backup for your Ethereum &<br /> ERC-20 tokens</h4>
              <button onClick={handleConnect} className="uk-button enableEthereumButton uk-button-default">{account.length ? 'Connected' : 'Connect'}</button>
              <p className="sponsored-by">Built on  <img src="../images/eth-diamond-rainbow.png" width="55px"  alt="ethereum logo"/></p>
            </div>
          </div>
          <div className="illus">
            <div className="image-container">
              <img src="../images/eth-diamond-rainbow.png" alt="eth logo" />
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

export default Home;
