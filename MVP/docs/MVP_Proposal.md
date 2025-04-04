# EEVY MVP Proposal

## MVP Architecture
- Smart Contracts: Handles the core business logic (event creation, ticket sales, payments)
- TokenScript: Provides token functionality and UI for ticket NFTs
- Frontend: Simple web interface for interactions
- User Wallets: Connect directly with the contracts/frontend

## Core Components

### 1. Smart Contracts
- **EventFactory**: Central contract that creates individual event contracts
- **EventContract**: Individual contract for each event with the following features:
  - Create event with details (name, date, venue, description)
  - Set ticket pricing in ETH or any ERC20 token
  - Mint and sell tickets as NFTs
  - Collect funds from ticket sales
  - Allow withdrawal of funds by event organizer
  - Cancel event and provide refunds if necessary

### 2. TokenScript Implementation
- Embed event information and ticket metadata in NFT TokenScript
- Display ticket details, QR code for entry
- Provide validation functionality without requiring a server
- Host TokenScript files on GitHub Pages or IPFS for decentralization
- Implement ERC-5169 standard to link NFTs to their TokenScript

### 3. Frontend Components
- Event organizer dashboard
  - Create and manage events
  - Set ticket types and prices
  - View sales statistics
- User interface
  - Browse events
  - Purchase tickets
  - View owned tickets
  - Generate entry QR codes
- Connect with wallets (MetaMask, WalletConnect, etc.)

## Implementation Plan

### Phase 1: Core Smart Contracts
1. Develop EventFactory and basic EventContract templates
2. Implement ticket minting and sales functionality
3. Add support for multiple currencies (ETH/ERC20)

### Phase 2: TokenScript Integration
1. Create basic TokenScript template for tickets
2. Implement QR code generation for ticket verification
3. Establish connection method between NFTs and TokenScript (ERC-5169)

### Phase 3: Frontend Development
1. Build event creation interface
2. Develop ticket purchasing flow
3. Create ticket management dashboard
4. Implement wallet connectivity

### Phase 4: Finalization and Testing
1. Smart contract security review
2. E2E testing of the ticket purchase flow
3. Testing of the TokenScript functionality
4. Deploy to testnet for public testing

## Technical Advantages
- **No Backend Dependency**: All operations are executed via smart contracts
- **No Attestation Required**: Simplified architecture using NFTs directly
- **GitHub Hosting**: TokenScript files can be hosted on GitHub Pages
- **Progressive Enhancement**: Can add attestations and backend later if needed

## Business Benefits
- **Lower Initial Costs**: Serverless architecture reduces infrastructure costs
- **Faster Time to Market**: Simplified architecture enables quicker deployment
- **Crypto-Native Experience**: Appeals to the target audience
- **Foundation for Growth**: Architecture supports future enhancements 