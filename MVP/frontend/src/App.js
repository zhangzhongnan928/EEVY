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
  const [error, setError] = useState(null);
  const [testMode, setTestMode] = useState(false);
  
  // Contract addresses - Base Mainnet
  const eventFactoryAddress = "0xc8a298f687b72d10b1dc4142ce93c55ab7fc78a8"; // Enhanced Factory
  
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        setError("Please install MetaMask or another Ethereum wallet provider");
        return;
      }
      
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        setError("No accounts found. Please unlock your wallet.");
        return;
      }
      
      // Check if connected to Base Mainnet (chainId: 8453)
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      setSigner(signer);
      setAccount(accounts[0]);
      setError(null);
      
      // Listen for account changes
      ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setSigner(null);
          setAccount(null);
        } else {
          setAccount(accounts[0]);
          connectWallet(); // Reconnect with new account
        }
      });
      
      // Listen for chain changes
      ethereum.on('chainChanged', () => {
        window.location.reload(); // Refresh on chain change
      });
      
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Error connecting wallet");
    }
  };
  
  const disconnectWallet = () => {
    setSigner(null);
    setAccount(null);
    setChainId(null);
  };
  
  const toggleTestMode = () => {
    setTestMode(!testMode);
  };
  
  useEffect(() => {
    if (window.ethereum) {
      connectWallet();
    }
  }, []);
  
  return (
    <Router>
      <div className="app">
        <Header 
          account={account} 
          chainId={chainId} 
          connectWallet={connectWallet} 
          disconnectWallet={disconnectWallet}
          testMode={testMode}
          toggleTestMode={toggleTestMode}
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
            <Route 
              path="/" 
              element={
                <EventsList 
                  signer={signer} 
                  account={account} 
                  eventFactoryAddress={eventFactoryAddress}
                  testMode={testMode}
                />
              } 
            />
            <Route 
              path="/event/:contractAddress" 
              element={
                <EventDetails 
                  signer={signer} 
                  account={account}
                  testMode={testMode}
                />
              } 
            />
            <Route 
              path="/create" 
              element={
                <CreateEvent 
                  signer={signer}
                  eventFactoryAddress={eventFactoryAddress}
                />
              } 
            />
            <Route 
              path="/my-tickets" 
              element={
                <MyTickets 
                  signer={signer} 
                  account={account}
                  testMode={testMode}
                />
              } 
            />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App; 