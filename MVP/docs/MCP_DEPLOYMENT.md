# Deploying EEVY MVP Contracts with MCP Server

This guide explains how to use the MCP server functions to deploy the EEVY MVP contracts.

## Prerequisites

- Access to MCP blockchain tool functions
- Base mainnet account with ETH for gas fees

## Step 1: Compile and Deploy EventFactory Contract

Use the `mcp_blockchain_tool_server_deploy_evm_contract` function to compile and deploy the EventFactory contract:

```javascript
// Contract source code is the content of EventFactory.sol
const factorySource = `// SPDX-License-Identifier: MIT
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
}`;

// You'll need to include the EventTicket contract code as well
const ticketSource = `// SPDX-License-Identifier: MIT
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
}`;

// Combine both contracts into a single source
const combinedSource = ticketSource + "\n\n" + factorySource;

// Deploy the contract to Base mainnet
const deploymentResult = await mcp_blockchain_tool_server_deploy_evm_contract({
  sourceCode: combinedSource,
  contractName: "EventFactory",
  chainId: "0x2105", // Base mainnet
  constructorArgs: []
});

// Once deployed, store the address for frontend use
const factoryAddress = deploymentResult.contractAddress;
console.log("Factory contract deployed at:", factoryAddress);
```

## Step 2: Testing Contract Functions

After deployment, you can interact with the contract using MCP functions:

### Creating a New Event

```javascript
// Call the createEvent function on the factory contract
const createEventResult = await mcp_blockchain_tool_server_call_contract_write_function({
  contractAddress: factoryAddress,
  chain: "Base Mainnet",
  abiFragment: "function createEvent(string _name, string _description, uint256 _date, string _venue, uint256 _maxTickets, uint256 _price, address _paymentToken, string _tokenScriptURI) external returns (address)",
  functionArgs: [
    "My First Event",
    "A test event created via MCP",
    Math.floor(Date.now() / 1000) + 86400, // Tomorrow
    "Virtual Venue",
    100, // Max tickets
    ethers.utils.parseEther("0.01"), // 0.01 ETH per ticket
    "0x0000000000000000000000000000000000000000", // ETH payment
    "https://example.com/tokenscript/EventTicket.tsml" // TokenScript URL
  ]
});

console.log("New event created, transaction hash:", createEventResult.transactionHash);
```

### Reading Event Data

```javascript
// Get all events
const allEventsResult = await mcp_blockchain_tool_server_call_contract_view_function({
  contractAddress: factoryAddress,
  chain: "Base Mainnet",
  abiFragment: "function getAllEvents() external view returns (address[])",
  functionArgs: []
});

console.log("All events:", allEventsResult);

// Get event count
const eventCountResult = await mcp_blockchain_tool_server_call_contract_view_function({
  contractAddress: factoryAddress,
  chain: "Base Mainnet",
  abiFragment: "function getEventCount() external view returns (uint256)",
  functionArgs: []
});

console.log("Total event count:", eventCountResult);
```

## Step 3: Buying Tickets

Once you have an event contract address, you can buy tickets:

```javascript
// Buy a ticket with ETH
const buyTicketResult = await mcp_blockchain_tool_server_call_contract_write_function({
  contractAddress: eventContractAddress, // From the createEvent result
  chain: "Base Mainnet",
  abiFragment: "function buyTicketWithETH() external payable",
  functionArgs: [],
  value: ethers.utils.parseEther("0.01") // Same price as specified when creating event
});

console.log("Ticket purchased, transaction hash:", buyTicketResult.transactionHash);
```

## Verifying Contract Code (Optional)

It's good practice to verify your contract source code on a blockchain explorer:

```javascript
// Verify the contract source code
const verificationResult = await mcp_blockchain_tool_server_verify_contract_source({
  contractAddress: factoryAddress,
  chainId: "0x2105", // Base mainnet
  sourceCode: combinedSource,
  contractName: "contracts/EventFactory.sol:EventFactory",
  compilerVersion: "v0.8.20+commit.a1b79de6"
});

console.log("Verification result:", verificationResult);
```

## Next Steps

After deploying the contracts, you should:

1. Host the TokenScript file (`EventTicket.tsml`) on GitHub Pages or IPFS
2. Update your frontend with the deployed contract address
3. Test the entire flow from event creation to ticket purchase and validation 