import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>EEVY</h3>
            <p>Web3 event ticketing platform powered by NFTs and TokenScript</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Events</a></li>
              <li><a href="/create">Create Event</a></li>
              <li><a href="/my-tickets">My Tickets</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="https://github.com/zhangzhongnan928/EEVY" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://tokenscript.org/" target="_blank" rel="noopener noreferrer">TokenScript</a></li>
              <li><a href="https://base.org/" target="_blank" rel="noopener noreferrer">Base Blockchain</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} EEVY. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 