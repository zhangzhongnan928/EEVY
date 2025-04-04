import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import './EventDetails.css';

// Import contract ABIs
import EventTicketABI from '../contracts/EventTicket.json';
import IERC20ABI from '../contracts/IERC20.json';

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

const EventDetails = ({ provider, signer }) => {
  const { address } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!provider || !address) {
        setIsLoading(false);
        return;
      }
      
      try {
        const eventContract = new ethers.Contract(
          address,
          EventTicketABI.abi,
          provider
        );
        
        // Get event details
        const eventInfo = await eventContract.eventInfo();
        const ticketsSold = await eventContract.ticketsSold();
        
        const eventData = {
          contractAddress: address,
          name: eventInfo.name,
          date: Number(eventInfo.date),
          venue: eventInfo.venue,
          description: eventInfo.description,
          maxTickets: Number(eventInfo.maxTickets),
          ticketPrice: eventInfo.ticketPrice,
          paymentToken: eventInfo.paymentToken,
          ticketsSold: Number(ticketsSold),
          organizer: eventInfo.organizer
        };
        
        setEvent(eventData);
        setIsLoading(false);
        
        // Check token approval if user is connected and event requires token payment
        if (signer && eventData.paymentToken !== ethers.ZeroAddress) {
          checkTokenApproval(eventData.paymentToken, eventData.ticketPrice);
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details. Please try again later.");
        setIsLoading(false);
      }
    };
    
    const checkTokenApproval = async (tokenAddress, ticketPrice) => {
      try {
        const userAddress = await signer.getAddress();
        const tokenContract = new ethers.Contract(
          tokenAddress,
          IERC20ABI.abi,
          provider
        );
        
        const allowance = await tokenContract.allowance(userAddress, address);
        const totalCost = ticketPrice * ticketQuantity;
        
        setIsApproved(allowance >= totalCost);
      } catch (err) {
        console.error("Error checking token approval:", err);
      }
    };
    
    fetchEventDetails();
  }, [provider, signer, address, ticketQuantity]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && event && value <= (event.maxTickets - event.ticketsSold)) {
      setTicketQuantity(value);
    }
  };
  
  const approveTokens = async () => {
    if (!signer || !event) return;
    
    setIsApproving(true);
    setError(null);
    
    try {
      const tokenContract = new ethers.Contract(
        event.paymentToken,
        IERC20ABI.abi,
        signer
      );
      
      // Approve a large amount to avoid frequent approvals
      const totalCost = event.ticketPrice * ticketQuantity;
      const tx = await tokenContract.approve(address, totalCost);
      await tx.wait();
      
      setIsApproved(true);
      setIsApproving(false);
    } catch (err) {
      console.error("Error approving tokens:", err);
      setError("Failed to approve tokens. Please try again.");
      setIsApproving(false);
    }
  };
  
  const purchaseTickets = async () => {
    if (!signer || !event) return;
    
    setIsPurchasing(true);
    setError(null);
    
    try {
      const eventContract = new ethers.Contract(
        address,
        EventTicketABI.abi,
        signer
      );
      
      let tx;
      
      if (event.paymentToken === ethers.ZeroAddress) {
        // If ETH payment
        const totalCost = event.ticketPrice * ticketQuantity;
        tx = await eventContract.buyTicketWithETH({ value: totalCost });
      } else {
        // If token payment (e.g., USDC)
        tx = await eventContract.buyTicketWithToken(ticketQuantity);
      }
      
      await tx.wait();
      
      setSuccessMessage(`Successfully purchased ${ticketQuantity} ticket(s)!`);
      setIsPurchasing(false);
      
      // Refresh event data after purchase
      setTimeout(() => {
        setSuccessMessage(null);
        navigate('/my-tickets');
      }, 3000);
      
    } catch (err) {
      console.error("Error purchasing tickets:", err);
      setError("Failed to purchase tickets. Please try again.");
      setIsPurchasing(false);
    }
  };
  
  if (isLoading) {
    return <div className="spinner"></div>;
  }
  
  if (error && !event) {
    return <div className="alert alert-error">{error}</div>;
  }
  
  if (!event) {
    return <div className="alert alert-error">Event not found.</div>;
  }
  
  const eventHasPassed = event.date * 1000 < Date.now();
  const isSoldOut = event.ticketsSold >= event.maxTickets;
  const canPurchase = !eventHasPassed && !isSoldOut && signer;
  
  return (
    <div className="event-details-container">
      <div className="event-header">
        <h1 className="event-title">{event.name}</h1>
        <div className="event-meta">
          <div className="event-meta-item">
            <span className="meta-label">Date:</span>
            <span className="meta-value">{formatDate(event.date)}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-label">Venue:</span>
            <span className="meta-value">{event.venue}</span>
          </div>
        </div>
      </div>
      
      <div className="event-content">
        <div className="event-information card">
          <h2>Event Information</h2>
          <p className="event-description">{event.description}</p>
          
          <div className="ticket-stats">
            <div className="stat-item">
              <span className="stat-label">Available Tickets:</span>
              <span className="stat-value">{event.maxTickets - event.ticketsSold} / {event.maxTickets}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ticket Price:</span>
              <span className="stat-value">
                {ethers.formatUnits(event.ticketPrice, 'ether')} {event.paymentToken === ethers.ZeroAddress ? 'ETH' : 'USDC'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="purchase-section card">
          <h2>Purchase Tickets</h2>
          
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          
          {error && (
            <div className="alert alert-error">{error}</div>
          )}
          
          {eventHasPassed ? (
            <div className="purchase-message">
              <p>This event has already ended. Tickets are no longer available for purchase.</p>
            </div>
          ) : isSoldOut ? (
            <div className="purchase-message">
              <p>This event is sold out. No more tickets available.</p>
            </div>
          ) : !signer ? (
            <div className="purchase-message">
              <p>Please connect your wallet to purchase tickets.</p>
            </div>
          ) : (
            <div className="purchase-form">
              <div className="form-group">
                <label htmlFor="quantity" className="form-label">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={event.maxTickets - event.ticketsSold}
                  value={ticketQuantity}
                  onChange={handleQuantityChange}
                  className="form-control"
                />
              </div>
              
              <div className="total-cost">
                <span>Total Cost:</span>
                <span>
                  {ethers.formatUnits(event.ticketPrice * BigInt(ticketQuantity), 'ether')} 
                  {event.paymentToken === ethers.ZeroAddress ? 'ETH' : 'USDC'}
                </span>
              </div>
              
              {event.paymentToken !== ethers.ZeroAddress && !isApproved ? (
                <button 
                  className="btn" 
                  onClick={approveTokens} 
                  disabled={isApproving}
                >
                  {isApproving ? 'Approving...' : 'Approve USDC'}
                </button>
              ) : (
                <button 
                  className="btn" 
                  onClick={purchaseTickets} 
                  disabled={isPurchasing}
                >
                  {isPurchasing ? 'Processing...' : 'Purchase Tickets'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 