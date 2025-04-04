import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <div className="footer-brand">EEVY</div>
          <p className="footer-tagline">Decentralized Event Ticketing Platform</p>
        </div>
        
        <div className="footer-links">
          <div className="footer-links-column">
            <h3 className="footer-heading">Platform</h3>
            <ul>
              <li><a href="/">Events</a></li>
              <li><a href="/create">Create Event</a></li>
              <li><a href="/my-tickets">My Tickets</a></li>
            </ul>
          </div>
          
          <div className="footer-links-column">
            <h3 className="footer-heading">Resources</h3>
            <ul>
              <li><a href="https://github.com/zhangzhongnan928/EEVY" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://base.org" target="_blank" rel="noopener noreferrer">Base Blockchain</a></li>
              <li><a href="https://tokenscript.org" target="_blank" rel="noopener noreferrer">TokenScript</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="copyright">&copy; {new Date().getFullYear()} EEVY. All rights reserved.</p>
        <p className="powered-by">Built on <a href="https://base.org" target="_blank" rel="noopener noreferrer">Base</a> with <a href="https://tokenscript.org" target="_blank" rel="noopener noreferrer">TokenScript</a></p>
      </div>
    </footer>
  );
};

export default Footer; 