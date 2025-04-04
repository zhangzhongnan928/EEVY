# EEVY Frontend

This is the frontend for the EEVY event ticketing platform. It's a React-based web application that interacts with the EEVY smart contracts on the Base blockchain.

## Features

- Browse and search for events
- View event details
- Purchase tickets using ETH or USDC
- Manage your tickets
- Create new events (for organizers)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or other Web3 wallet browser extension

## Installation

1. Clone the repository:
```
git clone https://github.com/zhangzhongnan928/EEVY.git
cd EEVY/MVP/frontend
```

2. Install dependencies:
```
npm install
```

## Configuration

1. Create a `.env` file in the frontend directory with the following variables:
```
REACT_APP_FACTORY_ADDRESS=0x06C0203E1c1c1A0a45cA95d56Bde98c7E4a83081
REACT_APP_CHAIN_ID=8453
REACT_APP_RPC_URL=https://mainnet.base.org
```

2. Update the contract addresses in `src/App.js` if needed.

## Contract ABIs

Before running the app, ensure you have the contract ABIs in the `src/contracts` directory:
- `EventFactory.json`
- `EventTicket.json`
- `IERC20.json`

These files should contain the ABI definitions for the smart contracts.

## Running the app

Start the development server:
```
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Building for production

To create a production build:
```
npm run build
```

The build files will be in the `build` directory and can be deployed to any static hosting service.

## Deployment

You can deploy the app to GitHub Pages or any static hosting service like Netlify, Vercel, or AWS S3.

### GitHub Pages

1. Install gh-pages:
```
npm install --save-dev gh-pages
```

2. Add these to package.json:
```json
"homepage": "https://zhangzhongnan928.github.io/EEVY/MVP/frontend",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

3. Deploy:
```
npm run deploy
```

## Key Components

- **App.js**: Main application component with routing
- **EventsList.js**: Displays a list of all events
- **EventDetails.js**: Shows details for a single event and handles ticket purchases
- **CreateEvent.js**: Form for creating new events (requires wallet connection)
- **MyTickets.js**: Displays tickets owned by the user

## License

This project is licensed under the MIT License. 