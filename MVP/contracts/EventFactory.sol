// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventTicket.sol";

contract EventFactory {
    // Events
    event EventCreated(
        address indexed eventContract,
        address indexed organizer,
        string name,
        uint256 date
    );
    
    // Mapping of organizer to their events
    mapping(address => address[]) public organizerEvents;
    
    // Array of all events
    address[] public allEvents;
    
    // Create a new event
    function createEvent(
        string memory _name,
        string memory _description,
        uint256 _date,
        string memory _venue,
        uint256 _maxTickets,
        uint256 _price,
        address _paymentToken,
        string memory _tokenScriptURI
    ) external returns (address) {
        // Create new event contract
        EventTicket newEvent = new EventTicket(
            _name,
            _description,
            _date,
            _venue,
            _maxTickets,
            _price,
            _paymentToken,
            _tokenScriptURI,
            msg.sender // organizer
        );
        
        // Record the new event
        address eventAddress = address(newEvent);
        organizerEvents[msg.sender].push(eventAddress);
        allEvents.push(eventAddress);
        
        emit EventCreated(eventAddress, msg.sender, _name, _date);
        
        return eventAddress;
    }
    
    // Get all events
    function getAllEvents() external view returns (address[] memory) {
        return allEvents;
    }
    
    // Get organizer's events
    function getOrganizerEvents(address _organizer) external view returns (address[] memory) {
        return organizerEvents[_organizer];
    }
    
    // Get total number of events
    function getEventCount() external view returns (uint256) {
        return allEvents.length;
    }
} 