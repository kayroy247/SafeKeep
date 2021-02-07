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
              <h1>An Insurance Policy for your Ethereum and ERC-20 Tokens</h1>
              <p>SafeKeep is a wallet that guarantees the safety and also access to your token,<br /> no matter the
                  consequences</p>
              <button onClick={handleConnect} className="uk-button enableEthereumButton uk-button-default">{account.length ? 'Connected' : 'Connect'}</button>
            </div>
          </div>
          <div className="illus">
            <div className="image-container">
              <img src="../images/eth-diamond-rainbow.png" alt="" />
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

export default Home;
