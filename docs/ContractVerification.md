# Factory-Deployed Contract Verification Guide

This guide provides step-by-step instructions for verifying smart contracts that have been deployed by a factory contract on Base Mainnet or other EVM-compatible networks.

## Challenges with Factory-Deployed Contract Verification

When verifying contracts that were deployed by a factory contract, there are several unique challenges:

1. **Bytecode Format**: The deployed bytecode includes both the contract code and constructor arguments
2. **Constructor Arguments**: The constructor arguments must exactly match those used by the factory during deployment
3. **Compiler Settings**: All compiler settings must precisely match those used when the factory was compiled
4. **Standard Verification Interfaces**: Block explorers like BaseScan may not automatically decode the constructor arguments 

## Step-by-Step Verification Process

### Step 1: Gather Information

Collect the following information:
- Factory contract address
- Child contract address to verify
- Transaction hash in which the factory deployed the child contract
- Source code of both the factory and child contract
- Hardhat/Foundry configuration or deployment scripts

### Step 2: Analyze the Factory Deployment Transaction

1. Navigate to the transaction on BaseScan: `https://basescan.org/tx/{TRANSACTION_HASH}`
2. Click the "Internal Txns" tab to find the contract creation call
3. Note the child contract address that was created
4. Click on "Click to see More" to view the input data for this internal transaction
5. Copy the entire input data (this contains both the creation code and constructor arguments)

### Step 3: Extract Constructor Arguments

The input data follows this format:
```
0x{CONTRACT_CREATION_CODE}{CONSTRUCTOR_ARGUMENTS}
```

To extract constructor arguments:
1. Look for the metadata hash marker (often begins with "a265" or similar)
2. The constructor arguments start immediately after this marker
3. Copy the entire constructor arguments string

For experienced developers:
- You can also use tools like ethereumjs to decode the transaction input and extract arguments
- Or inspect the deployment bytecode in the runtime section of a tool like Remix

### Step 4: Identify the Compiler Version

To find the exact compiler version:
1. Look for version identifier in the bytecode (e.g., "0x081d" for Solidity 0.8.29)
2. Check the factory contract's verified source code for its compiler version
3. Refer to the deployment scripts or configuration files

For our example, we found the compiler version was `v0.8.29+commit.ab55807c`

### Step 5: Verify the Contract

On BaseScan or similar explorer:
1. Navigate to the child contract address
2. Click on "Contract" tab
3. Click "Verify and Publish"
4. Select "Solidity (Single file)" if your contract fits in one file, or the appropriate option
5. Enter the exact compiler version (e.g., `v0.8.29+commit.ab55807c`)
6. Set compiler configuration:
   - Optimization: Enabled or Disabled (match the factory's configuration)
   - Optimization runs: Usually 200 for production contracts
   - EVM Version: Paris (or match the correct target)
7. Paste the unmodified child contract source code
8. Enter the constructor arguments in the "ABI-encoded Constructor Arguments" field
9. Submit for verification

### Step 6: Troubleshooting Common Issues

If verification fails, check these common problems:

1. **Compiler Version Mismatch**: Ensure you're using the exact compiler version, including the commit hash
2. **Optimization Settings**: Optimization and optimization runs must match
3. **EVM Version**: The EVM version must match the deployment setting
4. **Constructor Arguments Format**: Must be the exact hex string without "0x" prefix
5. **Source Code**: Must be identical to the deployed version, including comments and whitespace
6. **Libraries**: If your contract uses libraries, you must provide their addresses

## Real-World Example: EventTicket Contract

We successfully verified the EventTicket contract at `0xf06dbcbede8373ccea56b8aa2536a6dc16675762` that was deployed by a factory at `0x1680Caa2e77c6a84A901BF735c15B60F616B59ae` on Base Mainnet.

### Key Details Used:

1. **Source Code**: EventTicket contract implementation with 9 constructor parameters
2. **Contract Name**: EventTicket
3. **Compiler Version**: v0.8.29+commit.ab55807c (exact match)
4. **Optimization**: Enabled with 200 runs
5. **EVM Version**: Paris
6. **Constructor Arguments**: 
```
000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000067eb2c8000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000003e800000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000008349fc69c48af23e030a655736375d8942de5347000000000000000000000000000000000000000000000000000000000000000f54657374204576656e74203230323500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000033412074657374206576656e7420776974682031303030207469636b6574732070726963656420617420302e303030312045544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d5669727475616c2056656e756500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006168747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f7a68616e677a686f6e676e616e3932382f454556592f6d61696e2f4d56502f746f6b656e7363726970742f4576656e745469636b65742d4554482e74736d6c00000000000000000000000000000000000000000000000000000000000000
```

### Decoded Constructor Arguments:
- **Name**: "Test Event 2025"
- **Description**: "A test event with 1000 tickets priced at 0.0001 ETH"
- **Date**: 1743465600 (Unix timestamp)
- **Venue**: "Virtual Venue"
- **MaxTickets**: 1000
- **Price**: 100000000000000 wei (0.0001 ETH)
- **PaymentToken**: 0x0000000000000000000000000000000000000000 (ETH)
- **TokenScriptURI**: "https://raw.githubusercontent.com/zhangzhongnan928/EEVY/main/MVP/tokenscript/EventTicket-ETH.tsml"
- **EventOrganizer**: 0x8349fc69c48af23e030a655736375d8942de5347

### Verification Success:
- Verification GUID: 26xcrwbpzf2cu1neheze6nyfap6cjkaa71u2davergsqc7juik
- Status: "Pass - Verified"
- Contract can now be viewed on BaseScan with full source code and function labeling.

## Future Improvements

For future contract deployments, consider:

1. **Using Hardhat/Foundry Verification Plugins**: These can automate much of the verification process
2. **Flat Files**: Use flattened contract files to simplify verification of contracts with imports
3. **Documentation**: Always document the compiler settings and constructor arguments used in deployment
4. **Proxy Contracts**: For upgradeable contracts, verify both the proxy and implementation contracts

## Conclusion

Contract verification enhances transparency and user trust in your project. By following this guide, you can successfully verify factory-deployed contracts on Base Mainnet or other EVM-compatible networks. 