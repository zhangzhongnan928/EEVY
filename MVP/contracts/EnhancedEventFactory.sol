// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface for ERC20 tokens
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

// Enhanced ERC721 implementation for tickets with ERC20 payment support
contract EnhancedEventTicket {
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

    // Basic ERC721 implementation
    string public name;
    string public symbol;
    address public owner;
    
    // Event data
    EventInfo public eventInfo;
    
    // Ticket counter
    uint256 private _ticketIdCounter;
    
    // Mapping for used tickets
    mapping(uint256 => bool) public ticketUsed;
    
    // Ticket ownership
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256[]) private _ownedTokens;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
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
    ) {
        name = "EventTicket";
        symbol = "ETT";
        owner = _eventOrganizer;
        
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
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    // Buy a ticket with ETH
    function buyTicketWithETH() external payable {
        require(eventInfo.active, "Event is not active");
        require(eventInfo.ticketsSold < eventInfo.maxTickets, "Event is sold out");
        require(eventInfo.paymentToken == address(0), "This event requires token payment");
        require(msg.value == eventInfo.price, "Incorrect payment amount");
        
        // Forward funds directly to event organizer
        (bool sent, ) = owner.call{value: msg.value}("");
        require(sent, "Failed to send funds to event organizer");
        
        // Mint ticket
        _mintTicket(msg.sender);
    }
    
    // Buy a ticket with ERC20 token
    function buyTicketWithToken() external {
        require(eventInfo.active, "Event is not active");
        require(eventInfo.ticketsSold < eventInfo.maxTickets, "Event is sold out");
        require(eventInfo.paymentToken != address(0), "This event requires ETH payment");
        
        // Transfer tokens from buyer to event organizer
        IERC20 token = IERC20(eventInfo.paymentToken);
        
        // Check allowance
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= eventInfo.price, "Token allowance too low");
        
        // Transfer tokens
        bool success = token.transferFrom(msg.sender, owner, eventInfo.price);
        require(success, "Token transfer failed");
        
        // Mint ticket
        _mintTicket(msg.sender);
    }
    
    // Internal function to mint a ticket
    function _mintTicket(address buyer) internal {
        uint256 ticketId = _ticketIdCounter;
        _ticketIdCounter++;
        
        // Mint the NFT
        ownerOf[ticketId] = buyer;
        _ownedTokens[buyer].push(ticketId);
        
        eventInfo.ticketsSold++;
        
        emit Transfer(address(0), buyer, ticketId);
        emit TicketPurchased(buyer, ticketId);
    }
    
    // Mark a ticket as used
    function useTicket(uint256 ticketId) external {
        require(ownerOf[ticketId] == msg.sender || msg.sender == owner, "Not authorized");
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
    
    // Get TokenScript URI
    function scriptURI() external view returns (string memory) {
        return eventInfo.tokenScriptURI;
    }
    
    // Get user's tickets
    function getTicketsOf(address user) external view returns (uint256[] memory) {
        return _ownedTokens[user];
    }
}

// Factory contract to create events
contract EnhancedEventFactory {
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
        EnhancedEventTicket newEvent = new EnhancedEventTicket(
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