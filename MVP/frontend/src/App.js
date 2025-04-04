import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ethers } from 'ethers';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import EventsList from './components/EventsList';
import EventDetails from './components/EventDetails';
import CreateEvent from './components/CreateEvent';
import MyTickets from './components/MyTickets';

// Contract ABIs
import EventFactoryABI from './contracts/EventFactory.json';
import EventTicketABI from './contracts/EventTicket.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [testMode, setTestMode] = useState(false);
  
  // Contract addresses - Using the correct EventFactory address
  const eventFactoryAddress = "0xc8a298f687b72d10b1dc4142ce93c55ab7fc78a8"; // Base Mainnet
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Refresh the provider and signer
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        
        const userSigner = await web3Provider.getSigner();
        setSigner(userSigner);
        setAccount(await userSigner.getAddress());
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet extension to use this application.");
    }
  };
  
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
  };
  
  const toggleTestMode = () => {
    setTestMode(!testMode);
  };
  
  useEffect(() => {
    const initWeb3 = async () => {
      // Modern dapp browsers
      if (window.ethereum) {
        try {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);

          // Request account access
          const accounts = await web3Provider.listAccounts();
          
          if (accounts.length > 0) {
            const userSigner = await web3Provider.getSigner();
            setSigner(userSigner);
            setAccount(await userSigner.getAddress());
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', async (accounts) => {
            if (accounts.length > 0) {
              const userSigner = await web3Provider.getSigner();
              setSigner(userSigner);
              setAccount(await userSigner.getAddress());
            } else {
              setSigner(null);
              setAccount(null);
            }
          });
          
          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
          
        } catch (error) {
          console.error("User denied account access or another error occurred:", error);
        }
      } 
      // If no ethereum provider
      else {
        console.log("No Ethereum browser extension detected, falling back to read-only mode");
        // You can set up a read-only provider here if needed
      }
    };

    initWeb3();
  }, []);
  
  return (
    <Router>
      <div className="app">
        <Header 
          account={account} 
          connectWallet={connectWallet} 
          disconnectWallet={disconnectWallet}
          isConnecting={isConnecting}
        />
        
        <main className="main-content">
          {/* Test Mode Toggle */}
          <div className="test-mode-toggle">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={testMode} 
                onChange={toggleTestMode} 
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">Test Mode: {testMode ? 'On' : 'Off'}</span>
            {testMode && (
              <div className="test-mode-notice">
                Using hardcoded data instead of blockchain calls
              </div>
            )}
          </div>
          
          <Routes>
            <Route path="/" element={<EventsList signer={signer} account={account} eventFactoryAddress={eventFactoryAddress} testMode={testMode} />} />
            <Route path="/event/:contractAddress" element={<EventDetails signer={signer} account={account} testMode={testMode} />} />
            <Route path="/create" element={<CreateEvent signer={signer} eventFactoryAddress={eventFactoryAddress} />} />
            <Route path="/my-tickets" element={<MyTickets signer={signer} account={account} testMode={testMode} />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App; 