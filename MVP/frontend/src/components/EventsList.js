/* global BigInt */
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import './EventsList.css';

// Import ABIs
import EnhancedEventFactoryABI from '../contracts/EnhancedEventFactory.json';

// USDC token address on Base Mainnet
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Get token symbol for well-known tokens
const getTokenSymbol = (tokenAddress) => {
  if (!tokenAddress || tokenAddress === ethers.ZeroAddress) return 'ETH';
  
  // Known token addresses on Base
  const knownTokens = {
    [USDC_ADDRESS.toLowerCase()]: 'USDC',
    // Add other known tokens as needed
  };
  
  return knownTokens[tokenAddress.toLowerCase()] || 'Token';
};

const EventsList = ({ signer, account, eventFactoryAddress, testMode }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to format date from timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Simplified ABI for EventTicket from SimplifiedEventFactory.sol
  const SimplifiedEventTicketABI = useMemo(() => [
    "function eventInfo() view returns (string name, string description, uint256 date, string venue, uint256 maxTickets, uint256 ticketsSold, uint256 price, address paymentToken, string tokenScriptURI, bool active)",
    "function owner() view returns (address)"
  ], []);

  // Hardcoded event data for fallback
  const getHardcodedEvents = () => {
    return [
      {
        contractAddress: "0x3D63221f334Bde7274E0C75A3f3d60b0dd9564CC",
        name: "Test Event",
        description: "This is a test event",
        date: 1744797600, // April 15, 2025
        venue: "Test Venue",
        maxTickets: 100,
        ticketsSold: 0,
        price: ethers.parseEther("0"), // Price is 0 ETH
        paymentToken: ethers.ZeroAddress,
        tokenScriptURI: "https://raw.githubusercontent.com/zhangzhongnan928/EEVY/main/MVP/tokenscript/EventTicket-ETH.tsml",
        active: true
      },
      {
        contractAddress: "0x2460a187ddab1fe970f8336d4152493ae0112f81",
        name: "Crypto Carnival 2024 - ETH Edition",
        description: "The wildest blockchain party this side of the metaverse! Now accepting ETH payments!",
        date: 1719792000, // July 1, 2024
        venue: "The Decentralized Dancehall, Base City",
        maxTickets: 100,
        ticketsSold: 10,
        price: ethers.parseEther("0.01"),
        paymentToken: ethers.ZeroAddress,
        tokenScriptURI: "https://raw.githubusercontent.com/zhangzhongnan928/EEVY/main/MVP/tokenscript/EventTicket-ETH.tsml",
        active: true
      },
      {
        contractAddress: "0x87d807d1d0e5c842709659da4ea8294619506cf1",
        name: "Crypto Carnival 2024",
        description: "The wildest blockchain party this side of the metaverse!",
        date: 1719792000, // July 1, 2024
        venue: "The Decentralized Dancehall, Base City",
        maxTickets: 100,
        ticketsSold: 5,
        price: ethers.parseUnits("0.01", 6), // USDC has 6 decimals
        paymentToken: USDC_ADDRESS, // USDC on Base
        tokenScriptURI: "https://raw.githubusercontent.com/zhangzhongnan928/EEVY/main/MVP/tokenscript/EventTicket-ready.tsml",
        active: true
      },
      {
        contractAddress: "0xf06dbcbede8373ccea56b8aa2536a6dc16675762",
        name: "Test Event 2025",
        description: "A test event with 1000 tickets priced at 0.0001 ETH",
        date: 1743465600, // May 29, 2025
        venue: "Virtual Venue",
        maxTickets: 1000,
        ticketsSold: 25,
        price: ethers.parseUnits("0.0001", "ether"), // 0.0001 ETH
        paymentToken: ethers.ZeroAddress,
        tokenScriptURI: "https://raw.githubusercontent.com/zhangzhongnan928/EEVY/main/MVP/tokenscript/EventTicket-ETH.tsml",
        active: true
      },
      {
        contractAddress: "0xF60b153Ea280d5094EA4feDce708e5Be79134E7A",
        name: "MCP lover",
        description: "love MCP",
        date: 1760608800, // August 16, 2025
        venue: "HK",
        maxTickets: 100,
        ticketsSold: 0,
        price: ethers.parseUnits("0.01", 6), // USDC has 6 decimals
        paymentToken: USDC_ADDRESS, // USDC on Base
        tokenScriptURI: "https://raw.githubusercontent.com/zhangzhongnan928/EEVY/main/MVP/tokenscript/EventTicket-ETH.tsml",
        active: true
      }
    ];
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      if (testMode) {
        // Use hardcoded data in test mode
        const hardcodedEvents = getHardcodedEvents();
        setEvents(hardcodedEvents);
        setIsLoading(false);
        return;
      }
      
      if (!signer || !eventFactoryAddress) {
        setIsLoading(false);
        return;
      }
      
      try {
        const provider = signer.provider;
        
        // Use the EnhancedEventFactory ABI
        const factoryContract = new ethers.Contract(
          eventFactoryAddress,
          EnhancedEventFactoryABI.abi,
          provider
        );
        
        // Get all event addresses
        const eventAddresses = await factoryContract.getAllEvents();
        console.log(`Found ${eventAddresses.length} event addresses.`);
        
        if (eventAddresses.length === 0) {
          setEvents([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch details for each event
        const eventDetailsPromises = eventAddresses.map(async (address) => {
          try {
            const eventContract = new ethers.Contract(
              address,
              SimplifiedEventTicketABI,
              provider
            );
            
            // Fetch event information
            console.log(`Fetching info for event at ${address}`);
            const eventInfo = await eventContract.eventInfo();
            const owner = await eventContract.owner();
            
            console.log(`Successfully fetched event: ${eventInfo.name}`);
            
            return {
              contractAddress: address,
              name: eventInfo.name,
              description: eventInfo.description,
              date: Number(eventInfo.date),
              venue: eventInfo.venue,
              maxTickets: Number(eventInfo.maxTickets),
              ticketsSold: Number(eventInfo.ticketsSold),
              price: eventInfo.price,
              paymentToken: eventInfo.paymentToken,
              tokenScriptURI: eventInfo.tokenScriptURI,
              active: eventInfo.active,
              owner: owner
            };
          } catch (err) {
            console.error(`Error fetching event details for ${address}:`, err.message);
            // Return null for events that fail to load
            return null;
          }
        });
        
        const eventDetails = await Promise.all(eventDetailsPromises);
        const validEvents = eventDetails.filter(event => event !== null);
        console.log(`Successfully loaded ${validEvents.length} of ${eventAddresses.length} events`);
        
        // Sort events by date (newest first)
        validEvents.sort((a, b) => a.date - b.date);
        
        setEvents(validEvents);
      } catch (err) {
        console.error("Error fetching events:", err.message);
        setError("Failed to load events. Please try again later.");
        
        // Use hardcoded data as fallback in case of error
        const hardcodedEvents = getHardcodedEvents();
        setEvents(hardcodedEvents);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [signer, account, eventFactoryAddress, testMode, SimplifiedEventTicketABI]);

  // Get decimal places and format price correctly based on token
  const formatPrice = (price, paymentToken) => {
    if (paymentToken === ethers.ZeroAddress) {
      return ethers.formatEther(price);
    } else if (paymentToken.toLowerCase() === USDC_ADDRESS.toLowerCase()) {
      return ethers.formatUnits(price, 6); // USDC has 6 decimals
    } else {
      // Default to 18 decimals for unknown tokens
      return ethers.formatUnits(price, 18);
    }
  };

  if (isLoading) {
    return (
      <div className="events-list-container">
        <div className="loading">
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-list-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="events-list-container">
        <div className="no-events">
          <p>No events found. Be the first to create one!</p>
          <Link to="/create" className="btn btn-primary">Create Event</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="events-list-container">
      <h1 className="section-title">Upcoming Events</h1>
      
      <div className="events-grid">
        {events.map((event) => (
          <div className="event-card" key={event.contractAddress}>
            <div className="event-card-header">
              <h2>{event.name}</h2>
              <div className="event-date">{formatDate(event.date)}</div>
            </div>
            
            <div className="event-card-content">
              <div className="event-venue">
                <i className="fas fa-map-marker-alt"></i> {event.venue}
              </div>
              <p className="event-description">{event.description}</p>
              
              <div className="event-details">
                <div className="detail-item">
                  <span className="detail-label">Available:</span>
                  <span className="detail-value">{event.maxTickets - event.ticketsSold} / {event.maxTickets}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">
                    {`${formatPrice(event.price, event.paymentToken)} ${getTokenSymbol(event.paymentToken)}`}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`status ${event.active ? 'active' : 'inactive'}`}>
                    {event.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="event-card-footer">
              <Link to={`/event/${event.contractAddress}`} className="btn btn-primary">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsList; 