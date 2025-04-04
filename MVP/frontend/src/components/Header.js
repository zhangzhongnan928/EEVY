import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ account, connectWallet, disconnectWallet, isConnecting }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo">
            EEVY
          </Link>
          <nav className="nav-links">
            <Link to="/" className="nav-link">
              Events
            </Link>
            <Link to="/create" className="nav-link">
              Create Event
            </Link>
            <Link to="/my-tickets" className="nav-link">
              My Tickets
            </Link>
          </nav>
        </div>
        
        <div className="header-right">
          {account ? (
            <div className="wallet-info">
              <div className="account-display">
                {formatAddress(account)}
              </div>
              <button 
                className="btn btn-sm btn-outline" 
                onClick={disconnectWallet}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 