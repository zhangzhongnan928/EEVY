/* global BigInt */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import './CreateEvent.css';

// Import ABIs
import EnhancedEventFactoryABI from '../contracts/EnhancedEventFactory.json';

// USDC token address on Base Mainnet
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const CreateEvent = ({ signer, eventFactoryAddress }) => {
  const navigate = useNavigate();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [maxTickets, setMaxTickets] = useState(100);
  const [price, setPrice] = useState('0.01');
  const [paymentType, setPaymentType] = useState('eth'); // 'eth', 'usdc', or 'custom'
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [customTokenDecimals, setCustomTokenDecimals] = useState(18);
  const [tokenScriptURI, setTokenScriptURI] = useState('https://raw.githubusercontent.com/zhangzhongnan928/EEVY/main/MVP/tokenscript/EventTicket-ETH.tsml');
  
  // UI state
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Convert local datetime to unix timestamp
  const getUnixTimestamp = () => {
    const dateTimeStr = `${date}T${time}`;
    const dateTime = new Date(dateTimeStr);
    return Math.floor(dateTime.getTime() / 1000);
  };
  
  const validateForm = () => {
    if (!name.trim()) return "Event name is required";
    if (!description.trim()) return "Description is required";
    if (!date) return "Date is required";
    if (!time) return "Time is required";
    if (!venue.trim()) return "Venue is required";
    if (maxTickets <= 0) return "Max tickets must be greater than 0";
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) return "Price must be a valid number";
    
    if (paymentType === 'custom') {
      if (!ethers.isAddress(customTokenAddress)) {
        return "Please enter a valid ERC20 token address";
      }
      if (isNaN(customTokenDecimals) || customTokenDecimals < 0 || customTokenDecimals > 18) {
        return "Token decimals must be a number between 0 and 18";
      }
    }
    
    const dateTime = new Date(`${date}T${time}`);
    if (dateTime <= new Date()) return "Event date must be in the future";
    
    return null;
  };
  
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    if (!signer) {
      setError("Please connect your wallet to create an event");
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      // Convert form data
      const timestamp = getUnixTimestamp();
      
      // Determine payment token address
      let paymentTokenAddress;
      let tokenDecimals;
      
      if (paymentType === 'eth') {
        paymentTokenAddress = ethers.ZeroAddress;
        tokenDecimals = 18;
      } else if (paymentType === 'usdc') {
        paymentTokenAddress = USDC_ADDRESS;
        tokenDecimals = 6;
      } else if (paymentType === 'custom') {
        paymentTokenAddress = customTokenAddress;
        tokenDecimals = parseInt(customTokenDecimals);
      }
      
      // Price in Wei or equivalent
      const priceInSmallestUnit = ethers.parseUnits(price, tokenDecimals);
      
      // Use the appropriate TokenScript URI based on payment type
      const finalTokenScriptURI = paymentType === 'eth' 
        ? 'https://raw.githubusercontent.com/zhangzhongnan928/EEVY/main/MVP/tokenscript/EventTicket-ETH.tsml'
        : 'https://raw.githubusercontent.com/zhangzhongnan928/EEVY/main/MVP/tokenscript/EventTicket-ready.tsml';
      
      console.log("Creating event with the following parameters:");
      console.log("Name:", name);
      console.log("Description:", description);
      console.log("Date/Time:", new Date(timestamp * 1000).toLocaleString());
      console.log("Venue:", venue);
      console.log("Max Tickets:", maxTickets);
      console.log("Price:", priceInSmallestUnit.toString());
      console.log("Payment Token:", paymentTokenAddress);
      console.log("TokenScript URI:", finalTokenScriptURI);
      
      // Create factory contract instance
      const factoryContract = new ethers.Contract(
        eventFactoryAddress,
        EnhancedEventFactoryABI.abi,
        signer
      );
      
      // Estimate gas for transaction
      const gasEstimate = await factoryContract.createEvent.estimateGas(
        name,
        description,
        timestamp,
        venue,
        maxTickets,
        priceInSmallestUnit,
        paymentTokenAddress,
        finalTokenScriptURI
      );
      
      console.log("Gas estimate:", gasEstimate.toString());
      
      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100);
      
      // Send transaction
      const tx = await factoryContract.createEvent(
        name,
        description,
        timestamp,
        venue,
        maxTickets,
        priceInSmallestUnit,
        paymentTokenAddress,
        finalTokenScriptURI,
        {
          gasLimit: gasLimit
        }
      );
      
      console.log("Transaction sent:", tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      // Extract the event contract address from the transaction receipt
      const eventCreatedLog = receipt.logs.find(log => {
        try {
          // Try to find the EventCreated event
          const parsedLog = factoryContract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          return parsedLog && parsedLog.name === 'EventCreated';
        } catch (err) {
          return false;
        }
      });
      
      if (eventCreatedLog) {
        try {
          const parsedLog = factoryContract.interface.parseLog({
            topics: eventCreatedLog.topics,
            data: eventCreatedLog.data
          });
          
          // Get the created event contract address
          const eventContractAddress = parsedLog.args.eventContract;
          console.log("Created event at address:", eventContractAddress);
          
          setSuccess(`Event created successfully! Contract address: ${eventContractAddress}`);
          
          // Redirect to the event details page
          setTimeout(() => {
            navigate(`/event/${eventContractAddress}`);
          }, 2000);
          
        } catch (err) {
          console.error("Error parsing event log:", err);
        }
      } else {
        console.log("EventCreated log not found in receipt");
        setSuccess("Event created successfully, but event address couldn't be extracted.");
      }
      
    } catch (err) {
      console.error("Error creating event:", err);
      
      let errorMessage = "Failed to create event. ";
      
      if (err.message.includes("user rejected transaction")) {
        errorMessage += "You rejected the transaction.";
      } else if (err.message.includes("insufficient funds")) {
        errorMessage += "You don't have enough funds to cover the gas costs.";
      } else {
        errorMessage += err.message.split('(')[0]; // Get the first part of the error message
      }
      
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };
  
  // Show custom token fields if user selects custom token
  const showCustomTokenFields = paymentType === 'custom';
  
  if (!signer) {
    return (
      <div className="create-event-container">
        <div className="alert alert-info">
          <p>Please connect your wallet to create an event.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="create-event-container">
      <div className="create-event-card card">
        <h1 className="form-title">Create New Event</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleCreateEvent} className="create-event-form">
          <div className="form-group">
            <label htmlFor="name">Event Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Blockchain Conference"
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event..."
              required
              className="form-control"
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="time">Time *</label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="form-control"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="venue">Venue *</label>
            <input
              type="text"
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Virtual Event or Crypto Convention Center"
              required
              className="form-control"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="maxTickets">Maximum Tickets *</label>
              <input
                type="number"
                id="maxTickets"
                value={maxTickets}
                onChange={(e) => setMaxTickets(parseInt(e.target.value))}
                min="1"
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="price">Ticket Price *</label>
              <div className="price-input-group">
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.001"
                  required
                  className="form-control"
                />
                <select 
                  className="currency-select"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <option value="eth">ETH</option>
                  <option value="usdc">USDC</option>
                  <option value="custom">Custom Token</option>
                </select>
              </div>
            </div>
          </div>
          
          {showCustomTokenFields && (
            <div className="custom-token-section">
              <div className="form-group">
                <label htmlFor="customTokenAddress">Token Address *</label>
                <input
                  type="text"
                  id="customTokenAddress"
                  value={customTokenAddress}
                  onChange={(e) => setCustomTokenAddress(e.target.value)}
                  placeholder="0x..."
                  required={paymentType === 'custom'}
                  className="form-control"
                />
                <small className="form-text">Enter the ERC20 token contract address</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="customTokenDecimals">Token Decimals *</label>
                <input
                  type="number"
                  id="customTokenDecimals"
                  value={customTokenDecimals}
                  onChange={(e) => setCustomTokenDecimals(parseInt(e.target.value))}
                  min="0"
                  max="18"
                  required={paymentType === 'custom'}
                  className="form-control"
                />
                <small className="form-text">Most tokens use 18 decimals. USDC uses 6.</small>
              </div>
            </div>
          )}
          
          <div className="form-submit">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
            >
              {isCreating ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent; 