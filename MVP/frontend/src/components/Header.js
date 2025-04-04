import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';

const Header = ({ connectWallet, isConnected, account }) => {
  // Function to truncate the wallet address
  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <h1>EEVY</h1>
          </Link>
        </div>
        
        <nav className="app-nav">
          <NavLink to="/" end>Events</NavLink>
          <NavLink to="/create">Create Event</NavLink>
          <NavLink to="/my-tickets">My Tickets</NavLink>
        </nav>
        
        <div className="wallet-connect">
          {isConnected ? (
            <div className="connected-account">
              <span className="account-address">{truncateAddress(account)}</span>
              <div className="connection-indicator"></div>
            </div>
          ) : (
            <button className="btn" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 