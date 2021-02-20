import { NavLink, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';


const Nav = () => {
  const { connect, account } = useAuth();
  console.log(account)
  const history = useHistory();

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
    <nav className="uk-navbar-container uk-navbar-transparent uk-margin" uk-navbar="mode: click">
      <NavLink className="uk-navbar-item uk-logo" to="/"><img src="../images/LogoWhite.png" width="40px" height="100px" alt="" />&nbsp; SafeKeep</NavLink>
      <div className="uk-navbar-right">
        <ul className="uk-navbar-nav">
          <li><NavLink exact to="/" activeClassName="uk-active">Home</NavLink></li>
          <li><NavLink to="/about-us" activeClassName="uk-active">About Us</NavLink></li>
          <li><NavLink to="/roadmap" activeClassName="uk-active">Roadmap</NavLink></li>
          <li><a href="#*"><button onClick={handleConnect} className="uk-button enableEthereumButton uk-button-default">{account.length ? 'Connected' : 'Connect'}</button></a></li>
        </ul>
      </div>
      <ToastContainer />
    </nav>
  )
}

export default Nav;
