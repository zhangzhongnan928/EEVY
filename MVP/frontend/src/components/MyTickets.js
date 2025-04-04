import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './MyTickets.css';

// Simplified ABI for EventTicket contract
const SimplifiedEventTicketABI = [
  "function eventInfo() view returns (string name, string description, uint256 date, string venue, uint256 maxTickets, uint256 ticketsSold, uint256 price, address paymentToken, string tokenScriptURI, bool active)",
  "function getTicketsOf(address user) view returns (uint256[] memory)",
  "function ticketUsed(uint256) view returns (bool)"
];

const MyTickets = ({ signer, account }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!signer || !account) {
      setLoading(false);
      return;
    }
    
    fetchUserTickets();
  }, [signer, account]);
  
  const fetchUserTickets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Known event contracts for demo purposes
      const knownEventContracts = [
        "0x87d807d1D0E5C842709659DA4EA8294619506Cf1", // Crypto Carnival 2024
        "0xf06dbcbede8373ccea56b8aa2536a6dc16675762", // Test Event 2025
        "0x2460a187ddab1fe970f8336d4152493ae0112f81", // Crypto Carnival 2024 - ETH Edition
        "0x3D63221f334Bde7274E0C75A3f3d60b0dd9564CC"  // Test Event
      ];
      
      const userTickets = [];
      
      for (const contractAddress of knownEventContracts) {
        const eventContract = new ethers.Contract(
          contractAddress,
          SimplifiedEventTicketABI,
          signer
        );
        
        try {
          // Get basic event info
          const eventInfo = await eventContract.eventInfo();
          
          // Get tickets owned by user using the correct getTicketsOf function
          const userTokenIds = await eventContract.getTicketsOf(account);
          
          if (userTokenIds.length > 0) {
            console.log(`User has ${userTokenIds.length} tickets for event ${eventInfo.name}`);
            
            // Process each ticket the user owns
            for (const tokenId of userTokenIds) {
              try {
                // Check if ticket is used
                const isUsed = await eventContract.ticketUsed(tokenId);
                
                userTickets.push({
                  eventName: eventInfo.name,
                  eventDate: new Date(Number(eventInfo.date) * 1000).toLocaleDateString(),
                  eventVenue: eventInfo.venue,
                  ticketId: tokenId.toString(),
                  contractAddress,
                  isUsed
                });
              } catch (err) {
                console.error("Error checking ticket status:", err);
                // Continue with next token
              }
            }
          }
        } catch (err) {
          console.error(`Error processing event contract ${contractAddress}:`, err);
          // Continue with next contract
        }
      }
      
      setTickets(userTickets);
      setLoading(false);
      
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load your tickets. Please try again later.");
      setLoading(false);
    }
  };
  
  if (!account) {
    return (
      <div className="my-tickets-container">
        <h1 className="page-title">My Tickets</h1>
        <div className="alert alert-error">
          Please connect your wallet to view your tickets.
        </div>
      </div>
    );
  }
  
  return (
    <div className="my-tickets-container">
      <h1 className="page-title">My Tickets</h1>
      
      {loading ? (
        <div className="loading">
          <p>Loading your tickets...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="no-tickets">
          <p>You don't have any tickets yet.</p>
          <a href="/" className="btn">Browse Events</a>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <div key={`${ticket.contractAddress}-${ticket.ticketId}`} className="ticket-card">
              <div className={`ticket-status ${ticket.isUsed ? 'used' : 'valid'}`}>
                {ticket.isUsed ? 'Used' : 'Valid'}
              </div>
              <h2 className="ticket-event-name">{ticket.eventName}</h2>
              <p className="ticket-info">
                <span className="info-label">Date:</span> {ticket.eventDate}
              </p>
              <p className="ticket-info">
                <span className="info-label">Venue:</span> {ticket.eventVenue}
              </p>
              <p className="ticket-info">
                <span className="info-label">Ticket ID:</span> #{ticket.ticketId}
              </p>
              <div className="ticket-actions">
                <a 
                  href={`https://basescan.org/token/${ticket.contractAddress}?a=${ticket.ticketId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  View on BaseScan
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets; 