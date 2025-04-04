import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import './EventsList.css';

// Import contract ABIs
import EventFactoryABI from '../contracts/EventFactory.json';
import EventTicketABI from '../contracts/EventTicket.json';

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

const EventCard = ({ event }) => {
  return (
    <div className="event-card card">
      <div className="event-card-header">
        <h3>{event.name}</h3>
        <div className="event-date">{formatDate(event.date)}</div>
      </div>
      <div className="event-card-body">
        <p className="event-venue">{event.venue}</p>
        <p className="event-description">{event.description}</p>
        <div className="event-tickets-info">
          <span className="event-tickets-available">
            {event.maxTickets - event.ticketsSold} tickets available
          </span>
          <span className="event-ticket-price">
            {ethers.formatUnits(event.ticketPrice, 'ether')} {event.paymentToken === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'USDC'}
          </span>
        </div>
      </div>
      <div className="event-card-footer">
        <Link to={`/event/${event.contractAddress}`} className="btn">View Event</Link>
      </div>
    </div>
  );
};

const EventsList = ({ provider, eventFactoryAddress }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!provider || !eventFactoryAddress) {
        setLoading(false);
        return;
      }

      try {
        const factory = new ethers.Contract(
          eventFactoryAddress,
          EventFactoryABI.abi,
          provider
        );

        // Get number of events
        const eventCount = await factory.getEventCount();
        
        // Get all event addresses
        const eventPromises = [];
        for (let i = 0; i < eventCount; i++) {
          eventPromises.push(factory.eventContracts(i));
        }
        
        const eventAddresses = await Promise.all(eventPromises);
        
        // Fetch details for each event
        const eventDetailsPromises = eventAddresses.map(async (address) => {
          const eventContract = new ethers.Contract(
            address,
            EventTicketABI.abi,
            provider
          );
          
          // Get event details
          const eventInfo = await eventContract.eventInfo();
          const ticketsSold = await eventContract.ticketsSold();
          
          return {
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
        });
        
        const eventsData = await Promise.all(eventDetailsPromises);
        
        // Sort events by date (upcoming first)
        const sortedEvents = eventsData.sort((a, b) => a.date - b.date);
        
        setEvents(sortedEvents);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, [provider, eventFactoryAddress]);

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="events-list-container">
      <h1 className="page-title">Upcoming Events</h1>
      
      {events.length === 0 ? (
        <div className="no-events">
          <p>No events available at the moment.</p>
          <Link to="/create" className="btn">Create an Event</Link>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event.contractAddress} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList; 