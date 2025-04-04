import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
  const [isConnected, setIsConnected] = useState(false);
  
  // Contract addresses
  const eventFactoryAddress = "0x06C0203E1c1c1A0a45cA95d56Bde98c7E4a83081";
  
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            setAccount(accounts[0]);
            setProvider(provider);
            setSigner(signer);
            setIsConnected(true);
          }
        } else {
          console.log("No Ethereum wallet detected");
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };
    
    checkIfWalletIsConnected();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount(null);
          setIsConnected(false);
        }
      });
    }
  }, []);
  
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setIsConnected(true);
      } else {
        alert("Please install MetaMask or another Ethereum wallet");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };
  
  return (
    <Router>
      <div className="app">
        <Header 
          connectWallet={connectWallet} 
          isConnected={isConnected} 
          account={account} 
        />
        
        <main className="container">
          <Routes>
            <Route path="/" element={<EventsList provider={provider} eventFactoryAddress={eventFactoryAddress} />} />
            <Route path="/event/:address" element={<EventDetails provider={provider} signer={signer} />} />
            <Route path="/create" element={<CreateEvent signer={signer} eventFactoryAddress={eventFactoryAddress} />} />
            <Route path="/my-tickets" element={<MyTickets provider={provider} signer={signer} account={account} />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App; 