/* global BigInt */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './MyTickets.css';

// Import factory ABI to get past events
import EnhancedEventFactoryABI from '../contracts/EnhancedEventFactory.json';

// Simplified ABI for EventTicket contract
const SimplifiedEventTicketABI = [
  "function eventInfo() view returns (string name, string description, uint256 date, string venue, uint256 maxTickets, uint256 ticketsSold, uint256 price, address paymentToken, string tokenScriptURI, bool active)",
  "function getTicketsOf(address user) view returns (uint256[] memory)",
  "function ticketUsed(uint256) view returns (bool)"
];

// Event Factory address
const EVENT_FACTORY_ADDRESS = "0xc8a298f687b72d10b1dc4142ce93c55ab7fc78a8";

const MyTickets = ({ signer, account, testMode }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add more logging for debugging
  useEffect(() => {
    console.log("MyTickets component mounted");
    console.log("Account:", account);
    console.log("Signer:", signer ? "Connected" : "Not connected");
    console.log("Test mode:", testMode);
    
    if (!signer || !account) {
      console.log("No signer or account, setting loading to false");
      setLoading(false);
      return;
    }
    
    fetchUserTickets();
  }, [signer, account, testMode]);
  
  const fetchUserTickets = async () => {
    console.log("Fetching user tickets for account:", account);
    setLoading(true);
    setError(null);
    
    try {
      const provider = signer.provider;
      let eventAddresses = [];
      
      // First, try to get event addresses from the factory
      try {
        console.log("Attempting to get event addresses from factory contract");
        const factoryContract = new ethers.Contract(
          EVENT_FACTORY_ADDRESS,
          EnhancedEventFactoryABI.abi,
          provider
        );
        
        // Get all event addresses
        eventAddresses = await factoryContract.getAllEvents();
        console.log("Found events from factory:", eventAddresses);
      } catch (err) {
        console.error("Error fetching events from factory:", err.message);
      }
      
      // Add known event contracts including your new one
      const knownEventContracts = [
        "0xD56C2Cc7C8a5b9247Db1db1E6BcdA239f2b99724", // Your new event
        "0x87d807d1D0E5C842709659DA4EA8294619506Cf1", // Crypto Carnival 2024
        "0xf06dbcbede8373ccea56b8aa2536a6dc16675762", // Test Event 2025
        "0x2460a187ddab1fe970f8336d4152493ae0112f81", // Crypto Carnival 2024 - ETH Edition
        "0x3D63221f334Bde7274E0C75A3f3d60b0dd9564CC"  // Test Event
      ];
      
      // Combine addresses without duplicates
      const allEventAddresses = [...new Set([...eventAddresses, ...knownEventContracts])];
      console.log("Total event addresses to check:", allEventAddresses.length);
      
      const userTickets = [];
      
      for (const contractAddress of allEventAddresses) {
        console.log(`Checking for tickets in event contract: ${contractAddress}`);
        
        try {
          const eventContract = new ethers.Contract(
            contractAddress,
            SimplifiedEventTicketABI,
            provider
          );
          
          // Get basic event info
          console.log(`Getting event info for ${contractAddress}`);
          const eventInfo = await eventContract.eventInfo();
          console.log(`Event info retrieved for ${contractAddress}: ${eventInfo.name}`);
          
          // Get tickets owned by user
          console.log(`Getting tickets for user ${account} from contract ${contractAddress}`);
          const userTokenIds = await eventContract.getTicketsOf(account);
          console.log(`User has ${userTokenIds.length} tickets for event ${eventInfo.name}`);
          
          if (userTokenIds.length > 0) {
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
                
                console.log(`Added ticket #${tokenId} from ${eventInfo.name} to user tickets`);
              } catch (err) {
                console.error(`Error checking ticket status for tokenId ${tokenId}:`, err.message);
                // Continue with next token
              }
            }
          }
        } catch (err) {
          console.error(`Error processing event contract ${contractAddress}:`, err.message);
          // Continue with next contract
        }
      }
      
      console.log(`Total user tickets found: ${userTickets.length}`);
      setTickets(userTickets);
      
    } catch (err) {
      console.error("Error fetching tickets:", err.message);
      setError("Failed to load your tickets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Render "connect wallet" message if no account
  if (!account) {
    return (
      <div className="my-tickets-container">
        <h1 className="page-title">My Tickets</h1>
        <div className="alert alert-info">
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
      
      {/* Add refresh button */}
      <div className="refresh-section">
        <button 
          className="btn btn-primary" 
          onClick={fetchUserTickets}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Tickets"}
        </button>
      </div>
    </div>
  );
};

export default MyTickets; 