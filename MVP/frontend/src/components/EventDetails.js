/* global BigInt */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import './EventDetails.css';

// Import ABIs
import ERC20ABI from '../contracts/ERC20.json';
import EnhancedEventTicketABI from '../contracts/EnhancedEventTicket.json';

// USDC token address on Base Mainnet
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

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

// Simplified ABI for EventTicket from SimplifiedEventFactory.sol
const SimplifiedEventTicketABI = [
  // Read functions
  "function eventInfo() view returns (string name, string description, uint256 date, string venue, uint256 maxTickets, uint256 ticketsSold, uint256 price, address paymentToken, string tokenScriptURI, bool active)",
  "function owner() view returns (address)",
  "function ticketUsed(uint256) view returns (bool)",
  "function scriptURI() view returns (string)",
  
  // Write functions
  "function buyTicketWithETH() payable",
  "function buyTicketWithToken()",
  "function useTicket(uint256 ticketId) returns (bool)",
  "function setTokenScriptURI(string memory newURI)",
  
  // Events
  "event TicketPurchased(address buyer, uint256 ticketId)",
  "event TicketUsed(uint256 ticketId)"
];

const EventDetails = ({ signer, account, testMode }) => {
  const { contractAddress } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [tokenAllowance, setTokenAllowance] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [tokenSymbol, setTokenSymbol] = useState("");
  
  // Hardcoded event data for fallback
  const getHardcodedEventData = (address) => {
    const knownEvents = {
      "0x3D63221f334Bde7274E0C75A3f3d60b0dd9564CC": {
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
      "0x2460a187ddab1fe970f8336d4152493ae0112f81": {
        contractAddress: "0x2460a187ddab1fe970f8336d4152493ae0112f81",
        name: "Crypto Carnival 2024 - ETH Edition",
        description: "The wildest blockchain party this side of the metaverse! Now accepting ETH payments!",
        date: 1719792000, // July 1, 2024
        venue: "The Decentralized Dancehall, Base City",
        maxTickets: 100,
        ticketsSold: 0,
        price: ethers.parseEther("0.01"),
        paymentToken: ethers.ZeroAddress,
        tokenScriptURI: "https://raw.githubusercontent.com/zhangzhongnan928/EEVY/main/MVP/tokenscript/EventTicket-ETH.tsml",
        active: true
      },
      "0x87d807d1d0e5c842709659da4ea8294619506cf1": {
        contractAddress: "0x87d807d1d0e5c842709659da4ea8294619506cf1",
        name: "Crypto Carnival 2024",
        description: "The wildest blockchain party this side of the metaverse!",
        date: 1719792000, // July 1, 2024
        venue: "The Decentralized Dancehall, Base City",
        maxTickets: 100,
        ticketsSold: 0,
        price: ethers.parseUnits("0.01", 6), // USDC has 6 decimals
        paymentToken: USDC_ADDRESS, // USDC on Base
        tokenScriptURI: "https://raw.githubusercontent.com/zhangzhongnan928/EEVY/main/MVP/tokenscript/EventTicket-ready.tsml",
        active: true
      },
      "0xf06dbcbede8373ccea56b8aa2536a6dc16675762": {
        contractAddress: "0xf06dbcbede8373ccea56b8aa2536a6dc16675762",
        name: "Test Event 2025",
        description: "A test event with 1000 tickets priced at 0.0001 ETH",
        date: 1743465600, // May 29, 2025
        venue: "Virtual Venue",
        maxTickets: 1000,
        ticketsSold: 0,
        price: ethers.parseUnits("0.0001", "ether"), // 0.0001 ETH
        paymentToken: ethers.ZeroAddress,
        tokenScriptURI: "https://raw.githubusercontent.com/zhangzhongnan928/EEVY/main/MVP/tokenscript/EventTicket-ETH.tsml",
        active: true
      },
      "0xF60b153Ea280d5094EA4feDce708e5Be79134E7A": {
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
    };
    
    // Convert address to lowercase for case-insensitive matching
    const normalizedAddress = address.toLowerCase();
    
    for (const [key, value] of Object.entries(knownEvents)) {
      if (key.toLowerCase() === normalizedAddress) {
        return value;
      }
    }
    
    return null;
  };
  
  // Check token allowance and balance when event data changes or account changes
  useEffect(() => {
    const checkTokenData = async () => {
      if (!signer || !account || !event || event.paymentToken === ethers.ZeroAddress) {
        return;
      }
      
      try {
        const tokenContract = new ethers.Contract(
          event.paymentToken,
          ERC20ABI.abi,
          signer
        );
        
        // Get token details
        try {
          const decimals = await tokenContract.decimals();
          setTokenDecimals(decimals);
          
          const symbol = await tokenContract.symbol();
          setTokenSymbol(symbol);
        } catch (err) {
          console.error("Error fetching token metadata:", err);
          // Use fallback values if metadata calls fail
          setTokenDecimals(18); // Default to 18 decimals
          setTokenSymbol(getTokenSymbol(event.paymentToken));
        }
        
        // Get balance
        const balance = await tokenContract.balanceOf(account);
        setTokenBalance(balance);
        
        // Get allowance
        const allowance = await tokenContract.allowance(account, contractAddress);
        setTokenAllowance(allowance);
        
        console.log(`Token details - Symbol: ${tokenSymbol}, Decimals: ${tokenDecimals}, Balance: ${balance}, Allowance: ${allowance}`);
      } catch (err) {
        console.error("Error fetching token data:", err);
      }
    };
    
    checkTokenData();
  }, [signer, account, event, contractAddress, tokenSymbol, tokenDecimals]);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching event details for address:", contractAddress);
      
      // Try to get hardcoded data as fallback
      const hardcodedEvent = getHardcodedEventData(contractAddress);
      
      if (!contractAddress) {
        setError("Invalid event address.");
        setIsLoading(false);
        return;
      }
      
      // If we're in test mode or we have hardcoded data for this contract, use it immediately
      if (testMode || hardcodedEvent) {
        console.log("Using hardcoded data for this contract", hardcodedEvent);
        setEvent(hardcodedEvent);
        setIsLoading(false);
        
        // If we're in test mode, we don't need to try fetching real data
        if (testMode || !signer) return;
      } else if (!signer) {
        setError("Event not found. Connect wallet to see more details.");
        setIsLoading(false);
        return;
      }
      
      // Only try to fetch from blockchain if we have a signer and not in test mode
      if (signer && !testMode) {
        try {
          console.log("Attempting to fetch event data from blockchain");
          const provider = signer.provider;
          const eventContract = new ethers.Contract(
            contractAddress,
            SimplifiedEventTicketABI,
            provider
          );
          
          // Get event details - using the simplified event contract format
          const eventInfo = await eventContract.eventInfo();
          console.log("Event info retrieved:", eventInfo);
          
          const eventData = {
            contractAddress: contractAddress,
            name: eventInfo.name,
            description: eventInfo.description,
            date: Number(eventInfo.date),
            venue: eventInfo.venue,
            maxTickets: Number(eventInfo.maxTickets),
            ticketsSold: Number(eventInfo.ticketsSold),
            price: eventInfo.price,
            paymentToken: eventInfo.paymentToken,
            tokenScriptURI: eventInfo.tokenScriptURI,
            active: eventInfo.active
          };
          
          setEvent(eventData);
        } catch (err) {
          console.error("Error fetching event details from blockchain:", err);
          
          // If we already have hardcoded data, we don't need to set an error
          if (!hardcodedEvent) {
            setError("Event not found or could not be loaded.");
            setIsLoading(false);
          }
        } finally {
          if (!hardcodedEvent) {
            setIsLoading(false);
          }
        }
      }
    };
    
    fetchEventDetails();
  }, [signer, account, contractAddress, testMode]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && event && value <= (event.maxTickets - event.ticketsSold)) {
      setTicketQuantity(value);
    }
  };
  
  const approveTokens = async () => {
    if (!signer || !event || event.paymentToken === ethers.ZeroAddress) return;
    
    setIsApproving(true);
    setError(null);
    
    try {
      const tokenContract = new ethers.Contract(
        event.paymentToken,
        ERC20ABI.abi,
        signer
      );
      
      const totalCost = event.price * window.BigInt(ticketQuantity);
      console.log(`Approving ${totalCost.toString()} tokens for contract ${contractAddress}`);
      
      // Approve the contract to spend tokens
      const tx = await tokenContract.approve(contractAddress, totalCost);
      console.log("Approval transaction sent:", tx.hash);
      
      // Wait for confirmation
      await tx.wait();
      console.log("Approval transaction confirmed");
      
      // Update allowance
      const newAllowance = await tokenContract.allowance(account, contractAddress);
      setTokenAllowance(newAllowance);
      
      setSuccessMessage(`Successfully approved ${ethers.formatUnits(totalCost, tokenDecimals)} ${tokenSymbol}!`);
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error("Error approving tokens:", err);
      const errorMessage = err.message || "Unknown error occurred";
      
      if (errorMessage.includes("user rejected")) {
        setError("Transaction was rejected by the user");
      } else {
        setError(`Failed to approve tokens: ${errorMessage}`);
      }
    } finally {
      setIsApproving(false);
    }
  };
  
  const purchaseTickets = async () => {
    if (!signer || !event) return;
    
    setIsPurchasing(true);
    setError(null);
    
    try {
      const eventContract = new ethers.Contract(
        contractAddress,
        SimplifiedEventTicketABI,
        signer
      );
      
      let tx;
      
      if (event.paymentToken === ethers.ZeroAddress) {
        // If ETH payment
        const totalCost = event.price * window.BigInt(ticketQuantity);
        console.log("Buying ticket with ETH, value:", totalCost.toString());
        
        // Handle each ticket purchase separately for better error handling
        for (let i = 0; i < ticketQuantity; i++) {
          console.log(`Purchasing ticket ${i+1} of ${ticketQuantity}`);
          
          try {
            // Add extra options for gas estimation
            const options = {
              value: event.price,
              gasLimit: 300000  // Set a higher gas limit to avoid estimation errors
            };
            
            tx = await eventContract.buyTicketWithETH(options);
            console.log(`Transaction sent for ticket ${i+1}:`, tx.hash);
            await tx.wait();
            console.log(`Transaction confirmed for ticket ${i+1}`);
          } catch (err) {
            console.error(`Error purchasing ticket ${i+1}:`, err);
            const errorMessage = err.message || "Unknown error occurred";
            
            // Extract more helpful error message if available
            if (errorMessage.includes("user rejected")) {
              throw new Error("Transaction was rejected by the user");
            } else if (errorMessage.includes("insufficient funds")) {
              throw new Error("Insufficient funds to complete the purchase");
            } else if (errorMessage.includes("Event is sold out")) {
              throw new Error("This event is sold out");
            } else if (errorMessage.includes("Event is not active")) {
              throw new Error("This event is no longer active");
            } else {
              throw new Error(`Failed to purchase ticket: ${errorMessage}`);
            }
          }
        }
      } else {
        // ERC20 token payment
        // Check allowance first
        const totalCost = event.price * window.BigInt(ticketQuantity);
        
        if (!tokenAllowance || tokenAllowance < totalCost) {
          setError(`Please approve at least ${ethers.formatUnits(totalCost, tokenDecimals)} ${tokenSymbol} before purchasing.`);
          setIsPurchasing(false);
          return;
        }
        
        // Check balance
        if (!tokenBalance || tokenBalance < totalCost) {
          setError(`Insufficient ${tokenSymbol} balance. You need at least ${ethers.formatUnits(totalCost, tokenDecimals)} ${tokenSymbol}.`);
          setIsPurchasing(false);
          return;
        }
        
        console.log(`Buying ${ticketQuantity} tickets with tokens for total cost: ${ethers.formatUnits(totalCost, tokenDecimals)} ${tokenSymbol}`);
        
        // Purchase one ticket at a time
        for (let i = 0; i < ticketQuantity; i++) {
          try {
            console.log(`Purchasing ticket ${i+1} of ${ticketQuantity}`);
            
            // Set higher gas limit to avoid estimation issues
            const options = {
              gasLimit: 300000
            };
            
            tx = await eventContract.buyTicketWithToken(options);
            console.log(`Transaction sent for token ticket ${i+1}:`, tx.hash);
            await tx.wait();
            console.log(`Transaction confirmed for token ticket ${i+1}`);
          } catch (err) {
            console.error(`Error purchasing ticket with token ${i+1}:`, err);
            const errorMessage = err.message || "Unknown error occurred";
            
            if (errorMessage.includes("user rejected")) {
              throw new Error("Transaction was rejected by the user");
            } else if (errorMessage.includes("Token transfer failed")) {
              throw new Error("Token transfer failed. Please check your token balance and allowance.");
            } else {
              throw new Error(`Failed to purchase ticket: ${errorMessage}`);
            }
          }
        }
      }
      
      setSuccessMessage(`Successfully purchased ${ticketQuantity} ticket(s)!`);
      setIsPurchasing(false);
      
      // Refresh event data after purchase
      setTimeout(() => {
        setSuccessMessage(null);
        navigate('/my-tickets');
      }, 3000);
      
    } catch (err) {
      console.error("Error during ticket purchase:", err);
      setError(err.message || "Failed to purchase tickets");
      setIsPurchasing(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="event-details-container">
        <div className="loading">
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }
  
  if (error && !event) {
    return (
      <div className="event-details-container">
        <div className="alert alert-error">{error}</div>
        <div className="back-link">
          <a href="/" className="btn btn-outline">Back to Events</a>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="event-details-container">
        <div className="alert alert-error">Event not found</div>
        <div className="back-link">
          <a href="/" className="btn btn-outline">Back to Events</a>
        </div>
      </div>
    );
  }
  
  const isTokenPayment = event.paymentToken !== ethers.ZeroAddress;
  const needsApproval = isTokenPayment && (!tokenAllowance || tokenAllowance < (event.price * window.BigInt(ticketQuantity)));
  const insufficientBalance = isTokenPayment && tokenBalance !== null && tokenBalance < (event.price * window.BigInt(ticketQuantity));
  const displayTokenSymbol = tokenSymbol || getTokenSymbol(event.paymentToken);
  
  return (
    <div className="event-details-container">
      <div className="event-details-card card">
        <div className="event-header">
          <h1 className="event-title">{event.name}</h1>
          <div className="event-date">{formatDate(event.date)}</div>
        </div>
        
        <div className="event-info">
          <div className="event-venue">
            <i className="fas fa-map-marker-alt"></i> {event.venue}
          </div>
          <div className="event-description">
            <p>{event.description}</p>
          </div>
          
          <div className="event-stats">
            <div className="event-stat">
              <span className="stat-label">Available Tickets:</span>
              <span className="stat-value">{event.maxTickets - event.ticketsSold} / {event.maxTickets}</span>
            </div>
            <div className="event-stat">
              <span className="stat-label">Price:</span>
              <span className="stat-value">
                {isTokenPayment 
                  ? `${ethers.formatUnits(event.price, tokenDecimals || 6)} ${displayTokenSymbol}`
                  : `${ethers.formatEther(event.price)} ETH`
                }
              </span>
            </div>
            <div className="event-stat">
              <span className="stat-label">Payment:</span>
              <span className="stat-value">
                {isTokenPayment ? `${displayTokenSymbol} (ERC20)` : 'ETH'}
              </span>
            </div>
          </div>
          
          {event.active ? (
            <div className="event-purchase-section">
              <h2>Purchase Tickets</h2>
              
              {!account ? (
                <div className="alert alert-info">
                  Please connect your wallet to purchase tickets.
                </div>
              ) : (
                <>
                  {error && <div className="alert alert-error">{error}</div>}
                  {successMessage && <div className="alert alert-success">{successMessage}</div>}
                  
                  <div className="ticket-quantity">
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={event.maxTickets - event.ticketsSold}
                      value={ticketQuantity}
                      onChange={handleQuantityChange}
                    />
                  </div>
                  
                  <div className="total-cost">
                    <span className="total-label">Total Cost:</span>
                    <span className="total-value">
                      {isTokenPayment 
                        ? `${ethers.formatUnits(event.price * window.BigInt(ticketQuantity), tokenDecimals || 6)} ${displayTokenSymbol}`
                        : `${ethers.formatEther(event.price * window.BigInt(ticketQuantity))} ETH`
                      }
                    </span>
                  </div>
                  
                  {isTokenPayment && (
                    <div className="token-info">
                      <div className="token-balance">
                        <span className="token-label">Your Balance:</span>
                        <span className="token-value">
                          {tokenBalance ? `${ethers.formatUnits(tokenBalance, tokenDecimals || 6)} ${displayTokenSymbol}` : 'Loading...'}
                        </span>
                      </div>
                      <div className="token-allowance">
                        <span className="token-label">Your Allowance:</span>
                        <span className="token-value">
                          {tokenAllowance ? `${ethers.formatUnits(tokenAllowance, tokenDecimals || 6)} ${displayTokenSymbol}` : 'Loading...'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="purchase-actions">
                    {isTokenPayment && needsApproval && (
                      <button 
                        className="btn btn-primary" 
                        onClick={approveTokens}
                        disabled={isApproving || isPurchasing || insufficientBalance}
                      >
                        {isApproving ? 'Approving...' : `Approve ${displayTokenSymbol}`}
                      </button>
                    )}
                    
                    <button 
                      className="btn btn-primary" 
                      onClick={purchaseTickets}
                      disabled={isPurchasing || (isTokenPayment && needsApproval) || insufficientBalance}
                    >
                      {isPurchasing 
                        ? 'Purchasing...' 
                        : `Buy ${ticketQuantity} Ticket${ticketQuantity > 1 ? 's' : ''}`
                      }
                    </button>
                  </div>
                  
                  {insufficientBalance && (
                    <div className="alert alert-error">
                      Insufficient balance to complete purchase
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="event-closed">
              <div className="alert alert-error">
                This event is no longer active.
              </div>
            </div>
          )}
        </div>
        
        <div className="back-link">
          <a href="/" className="btn btn-outline">Back to Events</a>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 