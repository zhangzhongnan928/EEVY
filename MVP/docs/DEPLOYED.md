# EEVY MVP Deployment Information

## Deployed Contracts

| Contract | Network | Address | 
|----------|---------|---------|
| EventFactory | Base Mainnet (8453) | 0x1680caa2e77c6a84a901bf735c15b60f616b59ae |

## Contract Usage

### Creating an Event

To create a new event, call the `createEvent` function on the EventFactory contract with the following parameters:

```javascript
const createEventParams = {
  _name: "Your Event Name", 
  _description: "Event description",
  _date: 1714521600, // Unix timestamp for event date
  _venue: "Event Location",
  _maxTickets: 100, 
  _price: ethers.utils.parseEther("0.01"), // Ticket price in ETH
  _paymentToken: "0x0000000000000000000000000000000000000000", // Address(0) for ETH, or ERC20 address
  _tokenScriptURI: "https://your-github-username.github.io/eevy-tokenscript/EventTicket-ready.tsml" // TokenScript URL
};
```

### TokenScript Hosting

The TokenScript file needs to be hosted on GitHub Pages or IPFS:

1. Create a GitHub repository to host the TokenScript file
2. Upload the `EventTicket-ready.tsml` file from the `MVP/tokenscript/` directory
3. Update the file to reference your event contract address once created
4. Enable GitHub Pages in the repository settings
5. Use the GitHub Pages URL when creating events

Example TokenScript URL format: `https://your-github-username.github.io/your-repo-name/EventTicket-ready.tsml`

### Buying Tickets

End users can buy tickets by:

1. Calling `buyTicketWithETH()` on the event contract (not the factory) with the appropriate ETH value
2. Or calling `buyTicketWithToken()` if the event accepts ERC20 tokens

### Using Tickets

Tickets can be used in TokenScript-compatible wallets that support the ERC-5169 interface:

1. The wallet will display the ticket information and QR code
2. Event organizers can scan the QR code for verification
3. The ticket can be marked as used by calling the `useTicket()` function with the ticket ID

## Contract Verification

The contract has been deployed to Base mainnet. To verify it on Basescan, use the following information:

- Contract Address: 0x1680caa2e77c6a84a901bf735c15b60f616b59ae
- Contract Name: EventFactory
- Compiler Version: v0.8.29
- Optimizer: Enabled (200 runs)
- Source Code: See `SimplifiedEventFactory.sol`

## Next Steps

1. Host the TokenScript file on GitHub Pages or IPFS
2. Create your first event through the factory contract
3. Update the TokenScript file with your event contract address
4. Test the full flow by purchasing and using a ticket
5. Develop frontend components for easier interaction 