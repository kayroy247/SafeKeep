import { createContext, useState, useContext, useCallback } from 'react';
import Web3 from 'web3';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [networkID, setNetworkID] = useState(0);
  const network = 42;

   // Checks if network is locked on kovan
   const checkNetwork = useCallback(async () => {
    const networkId = await window.web3.eth.net.getId();
    setNetworkID(networkId)
    if (networkId !== network) {
      window.alert('Please switch to the Kovan TestNet and try again', 'warning');
      return;
    }
    return networkId;
  }, [network])

  const loadWeb3 = useCallback(async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-ethereum browser detected. You should consider trying MetaMask!')
    }
    await checkNetwork();
  }, [checkNetwork])



  const connect = async () => {
    try {
      if (networkID !== network) {
        window.alert("you're not connected to the Kovan network")
        return;
      }
      const [account] = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(account);
      return account;
    } catch (error) {
      return error
    }
  }

  return (
    <AuthContext.Provider value={{ account, connect, checkNetwork, loadWeb3 }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);