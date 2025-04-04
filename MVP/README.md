# EEVY MVP

A minimal viable product for an event ticket platform based on smart contracts and TokenScript, without reliance on attestations or backend services.

## Overview

This MVP provides a decentralized event ticketing system where:
- Event organizers can create events and sell tickets
- Tickets are NFTs with embedded functionality via TokenScript
- Payments go directly to the event organizer's wallet
- No backend server is required for core functionality

## Project Structure

- **contracts/**: Solidity smart contracts for event management and ticket sales
  - `EventTicket.sol`: NFT contract for event tickets with ERC-5169 support
  - `EventFactory.sol`: Factory contract for creating event contracts
  
- **tokenscript/**: TokenScript definitions for ticket NFTs
  - `EventTicket.tsml`: TokenScript template for event tickets
  
- **frontend/**: Web interface for event creation and ticket purchasing
  
- **docs/**: Project documentation
  - `MVP_Proposal.md`: Original proposal and architecture
  - `DEPLOYMENT.md`: Deployment instructions for the system
  - `MCP_DEPLOYMENT.md`: Specific instructions for MCP server deployment

## Quick Start

1. **Deploy the Factory Contract**:
   - Follow the instructions in `docs/MCP_DEPLOYMENT.md` to deploy the EventFactory contract
   - Note the deployed contract address

2. **Host the TokenScript**:
   - Upload the `tokenscript/EventTicket.tsml` file to GitHub Pages or IPFS
   - Get the public URL for the TokenScript

3. **Create an Event**:
   - Call the `createEvent` function on the factory contract
   - Pass event details including the TokenScript URL

4. **Purchase Tickets**:
   - Users can purchase tickets by calling `buyTicketWithETH()` or `buyTicketWithToken()`
   - Payments go directly to the event organizer's wallet
   - Buyers receive the ticket as an NFT

5. **Use Tickets**:
   - Open the NFT in a TokenScript-compatible wallet
   - Generate a QR code for entry verification
   - Event organizers scan the QR code and mark tickets as used

## Target Audience

- **Event Organizers**: Create and manage events, sell tickets, and collect payments
- **Event Attendees**: Buy tickets and attend events using their crypto wallets

## Technologies

- **Blockchain**: Base mainnet (Chain ID 8453)
- **Smart Contracts**: Solidity 0.8.20
- **TokenScript**: ERC-5169 for linking NFTs to TokenScript files
- **Frontend**: React with ethers.js

## Future Enhancements

This MVP can be extended with:
- Multiple ticket tiers
- Secondary market with royalties
- Advanced ticket validation
- Integration with event management platforms
- Expanded metadata for tickets

## Documentation

See the `docs/` directory for detailed documentation:
- [MVP Proposal](docs/MVP_Proposal.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [MCP Deployment](docs/MCP_DEPLOYMENT.md)

## License

MIT 