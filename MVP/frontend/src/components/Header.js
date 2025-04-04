import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ 
  account, 
  chainId,
  connectWallet, 
  disconnectWallet, 
  testMode,
  toggleTestMode 
}) => {
  // Check if we're on Base Mainnet (8453) or a testnet
  const isBaseMainnet = chainId === '0x2105'; // 8453 in hex
  
  // Format account address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            EEVY
          </Link>
        </div>
        
        <nav className="nav">
          <Link to="/" className="nav-link">Events</Link>
          <Link to="/create" className="nav-link">Create Event</Link>
          {account && (
            <Link to="/my-tickets" className="nav-link">My Tickets</Link>
          )}
        </nav>
        
        <div className="wallet-actions">
          {testMode && (
            <span className="test-mode-badge">Test Mode</span>
          )}
          
          <button 
            className="test-mode-toggle"
            onClick={toggleTestMode}
          >
            {testMode ? 'Exit Test Mode' : 'Test Mode'}
          </button>
          
          {!account ? (
            <button 
              className="connect-button" 
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          ) : (
            <div className="account-info">
              {!isBaseMainnet && (
                <div className="network-warning">
                  Not on Base Network
                </div>
              )}
              <span className="account-address">
                {formatAddress(account)}
              </span>
              <button 
                className="disconnect-button"
                onClick={disconnectWallet}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 