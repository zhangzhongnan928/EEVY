# EEVY - Event Ticketing Platform MVP

A decentralized event ticketing platform built on blockchain technology. This MVP allows event organizers to create events and sell tickets as NFTs directly to attendees, with advanced functionality provided by TokenScript.

## 📋 Features

- **Decentralized Event Creation**: Create events without a central authority
- **NFT-based Tickets**: Tickets are represented as NFTs on the blockchain
- **TokenScript Integration**: Enhanced ticket functionality with TokenScript
- **No Backend Required**: All core functionality works directly with smart contracts
- **Direct Payments**: Funds go straight to event organizers' wallets

## 🚀 Deployed Contracts

| Contract | Network | Address | 
|----------|---------|---------|
| EventFactory | Base Mainnet (8453) | [0x1680caa2e77c6a84a901bf735c15b60f616b59ae](https://basescan.org/address/0x1680caa2e77c6a84a901bf735c15b60f616b59ae) |

## 🏗️ Architecture

- **Smart Contracts**: Solidity contracts for event management and ticket sales
- **TokenScript**: XML-based description of token functionality 
- **Frontend** (Coming Soon): React interface for easy interaction

## 📖 Documentation

- [MVP Proposal](docs/MVP_Proposal.md): The original proposal and design
- [Deployment Guide](docs/DEPLOYMENT.md): How to deploy your own version
- [Deployed Contract Info](docs/DEPLOYED.md): Information about the deployed contracts

## 🧪 How to Use

### For Event Organizers

1. Call the `createEvent` function on the EventFactory contract
2. Use the returned event contract address to monitor sales
3. Update the TokenScript file with your event contract address
4. Host the TokenScript file on GitHub Pages or IPFS

### For Ticket Buyers

1. Find an event contract address
2. Call `buyTicketWithETH()` or `buyTicketWithToken()` on the event contract
3. View your ticket in a TokenScript-compatible wallet
4. Present the QR code for verification at the event

## 📱 TokenScript Capability

TokenScript enables enhanced functionality for ticket NFTs:
- Display ticket information
- Generate verification QR codes
- Check ticket validity
- Mark tickets as used

## 🛠️ Development

This repository contains the MVP implementation. To run your own version:

1. Clone this repository
2. Deploy the EventFactory contract
3. Host the TokenScript files using GitHub Pages
4. Create events through the factory contract

## 📄 License

MIT
