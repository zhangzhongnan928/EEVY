# EEVY MVP Deployment Guide

This guide explains how to deploy the EEVY MVP contracts to Base mainnet and how to host the TokenScript files.

## Smart Contract Deployment

The EEVY MVP consists of two main contracts:
1. `EventFactory.sol` - The factory contract that creates individual event contracts
2. `EventTicket.sol` - The contract template for individual events that handles ticket sales and NFT minting

### Step 1: Compile Contracts

Using the MCP server, compile the contracts with the following Solidity version:

```
// Use Solidity 0.8.20
```

### Step 2: Deploy EventFactory Contract

1. Use the MCP server to deploy the EventFactory contract to Base mainnet (chain ID 8453)
2. Record the contract address for future reference

```javascript
// Example deployment
const contractAddress = await deployContract({
  sourceCode: "EventFactory.sol content here",
  contractName: "EventFactory",
  chainId: "0x2105" // Base mainnet
});
```

## TokenScript Hosting

TokenScript files need to be hosted in a publicly accessible location. Here are two options:

### Option 1: GitHub Pages

1. Create a GitHub repository
2. Add the TokenScript file (`EventTicket.tsml`) to the repository
3. Enable GitHub Pages in the repository settings
4. The TokenScript will be available at `https://[username].github.io/[repo-name]/EventTicket.tsml`

### Option 2: IPFS

1. Install IPFS Desktop or use a service like Pinata
2. Upload the TokenScript file to IPFS
3. Pin the file to ensure it remains available
4. Use the IPFS hash (CID) to access the file: `ipfs://[CID]/EventTicket.tsml`

## Connecting Contracts to TokenScript

When creating a new event through the EventFactory, you'll need to provide the TokenScript URI:

1. Deploy the TokenScript file to GitHub Pages or IPFS
2. Get the public URL of the TokenScript
3. When creating an event, pass this URL as the `_tokenScriptURI` parameter

The event contract implements the ERC-5169 interface via the `scriptURI()` function, which returns the TokenScript URI. This allows compatible wallets to find and use the TokenScript.

## Frontend Deployment

The frontend can be deployed to any standard web hosting service:

1. Build the frontend: `cd MVP/frontend && npm run build`
2. Deploy the contents of the `build` directory to your web host
3. Configure the frontend with the deployed EventFactory contract address

## Testing the Complete System

1. Create an event using the frontend or by directly interacting with the EventFactory contract
2. Buy a ticket by sending ETH or tokens to the event contract
3. View the ticket NFT in a TokenScript-compatible wallet
4. Test the validation functionality by using the QR code feature

## Maintenance and Updates

- If you need to update the TokenScript, simply replace the file in your hosting location
- For urgent fixes to a specific event, the event organizer can call `setTokenScriptURI()` to update the TokenScript URI 