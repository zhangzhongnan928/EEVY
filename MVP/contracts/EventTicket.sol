// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC5169.sol";

contract EventTicket is ERC721URIStorage, Ownable, IERC5169 {
    using Strings for uint256;

    // Event structure
    struct EventInfo {
        string name;
        string description;
        uint256 date;
        string venue;
        uint256 maxTickets;
        uint256 ticketsSold;
        uint256 price;
        address paymentToken; // Address(0) for ETH, otherwise ERC20 token
        string tokenScriptURI;
        bool active;
    }

    // Event data
    EventInfo public eventInfo;
    
    // Ticket counter
    uint256 private _ticketIdCounter;
    
    // Mapping for used tickets
    mapping(uint256 => bool) public ticketUsed;
    
    // Ticket type mapping (for different tiers if needed)
    mapping(uint256 => uint8) public ticketTypes;

    // Events
    event TicketPurchased(address buyer, uint256 ticketId);
    event TicketUsed(uint256 ticketId);
    event EventCancelled();
    
    // Constructor
    constructor(
        string memory _name,
        string memory _description,
        uint256 _date,
        string memory _venue,
        uint256 _maxTickets,
        uint256 _price,
        address _paymentToken,
        string memory _tokenScriptURI,
        address _eventOrganizer
    ) ERC721("EventTicket", "ETT") Ownable(_eventOrganizer) {
        eventInfo = EventInfo({
            name: _name,
            description: _description,
            date: _date,
            venue: _venue,
            maxTickets: _maxTickets,
            ticketsSold: 0,
            price: _price,
            paymentToken: _paymentToken,
            tokenScriptURI: _tokenScriptURI,
            active: true
        });
    }
    
    // Buy a ticket with ETH
    function buyTicketWithETH() external payable {
        require(eventInfo.active, "Event is not active");
        require(eventInfo.ticketsSold < eventInfo.maxTickets, "Event is sold out");
        require(eventInfo.paymentToken == address(0), "This event requires token payment");
        require(msg.value == eventInfo.price, "Incorrect payment amount");
        
        // Forward funds directly to event organizer
        (bool sent, ) = owner().call{value: msg.value}("");
        require(sent, "Failed to send funds to event organizer");
        
        // Mint ticket
        _mintTicket(msg.sender);
    }
    
    // Buy a ticket with ERC20 token
    function buyTicketWithToken() external {
        require(eventInfo.active, "Event is not active");
        require(eventInfo.ticketsSold < eventInfo.maxTickets, "Event is sold out");
        require(eventInfo.paymentToken != address(0), "This event requires ETH payment");
        
        IERC20 token = IERC20(eventInfo.paymentToken);
        
        // Transfer tokens directly to event organizer
        require(token.transferFrom(msg.sender, owner(), eventInfo.price), "Token transfer failed");
        
        // Mint ticket
        _mintTicket(msg.sender);
    }
    
    // Internal function to mint a ticket
    function _mintTicket(address buyer) internal {
        uint256 ticketId = _ticketIdCounter;
        _ticketIdCounter++;
        
        // Mint the NFT
        _mint(buyer, ticketId);
        
        // Set the token URI with ticket metadata
        string memory tokenURI = string(abi.encodePacked(
            "data:application/json;base64,",
            _generateTicketMetadata(ticketId)
        ));
        _setTokenURI(ticketId, tokenURI);
        
        eventInfo.ticketsSold++;
        
        emit TicketPurchased(buyer, ticketId);
    }
    
    // Generate ticket metadata in base64
    function _generateTicketMetadata(uint256 ticketId) internal view returns (string memory) {
        // This would generate the actual base64 metadata with event info
        // For MVP, we can simplify this and implement it more fully later
        return "";
    }
    
    // Mark a ticket as used
    function useTicket(uint256 ticketId) external {
        require(ownerOf(ticketId) == msg.sender || msg.sender == owner(), "Not authorized");
        require(!ticketUsed[ticketId], "Ticket already used");
        
        ticketUsed[ticketId] = true;
        emit TicketUsed(ticketId);
    }
    
    // Cancel the event
    function cancelEvent() external onlyOwner {
        eventInfo.active = false;
        emit EventCancelled();
    }
    
    // Update TokenScript URI
    function setTokenScriptURI(string memory newURI) external onlyOwner {
        eventInfo.tokenScriptURI = newURI;
    }
    
    // IERC5169 implementation for TokenScript
    function scriptURI() external view override returns (string memory) {
        return eventInfo.tokenScriptURI;
    }
    
    function tokenURI(uint256 ticketId) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(ticketId);
    }
} 