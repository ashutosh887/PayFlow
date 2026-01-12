# PayFlow

<div align="left">
  <img src="./public/logo.png" alt="PayFlow Logo" width="120" height="120">
  
  **Visual Programmable Payment Workflows with MNEE**
  
  Build complex payment logic visually. Ship it instantly.
  
  *A visual layer for designing and executing programmable payment workflows.*
</div>

## Overview

PayFlow enables users to create automated payment workflows on Ethereum using the MNEE token. Features include:

- **Milestone Payments**: Release funds when milestones are completed
- **Revenue Splits**: Automatically distribute payments to multiple recipients
- **Multi-party Approvals**: Require multiple approvals before payments execute
- **Flow Management**: Pause, resume, or cancel active flows

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Web3**: wagmi, viem, RainbowKit
- **Smart Contracts**: Solidity 0.8.20, Hardhat
- **Token**: MNEE (ERC-20) on Ethereum

## Prerequisites

- Node.js 18+
- npm or yarn
- Wallet with Sepolia ETH for testing
- Sepolia RPC endpoint (Alchemy, Infura, or public)

## Installation

```bash
# Install root dependencies
npm install

# Install contract dependencies
cd contracts && npm install && cd ..
```

## Configuration

Create a `.env` file in the root directory:

```env
# Contract addresses (pre-deployed on Sepolia)
NEXT_PUBLIC_FLOW_FACTORY_ADDRESS=0x08dC530E42D4De7d6dF2c1FDeAb2A96A8b444979
NEXT_PUBLIC_PAYMENT_FLOW_ADDRESS=0xa159999d149Ae8fDd082354406D191f3DA3e84aF
NEXT_PUBLIC_APPROVAL_MANAGER_ADDRESS=0x3D23383124A4467D2394A48A7D8cbf5110d977F3
NEXT_PUBLIC_MNEE_TOKEN_ADDRESS=0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
NEXT_PUBLIC_CHAIN_ID=11155111

# Optional: WalletConnect (for additional wallet support)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# For contract deployment (contracts/.env)
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
RPC_URL=https://mainnet.infura.io/v3/your_key
ETHERSCAN_API_KEY=your_etherscan_key
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app runs on [http://localhost:3000](http://localhost:3000)

## Smart Contracts

### Deployed Addresses (Sepolia)

- **FlowFactory**: [`0x08dC530E42D4De7d6dF2c1FDeAb2A96A8b444979`](https://sepolia.etherscan.io/address/0x08dC530E42D4De7d6dF2c1FDeAb2A96A8b444979)
- **PaymentFlow** (implementation): [`0xa159999d149Ae8fDd082354406D191f3DA3e84aF`](https://sepolia.etherscan.io/address/0xa159999d149Ae8fDd082354406D191f3DA3e84aF)
- **ApprovalManager**: [`0x3D23383124A4467D2394A48A7D8cbf5110d977F3`](https://sepolia.etherscan.io/address/0x3D23383124A4467D2394A48A7D8cbf5110d977F3)
- **MNEE Token**: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`

### Contract Documentation

For detailed information about the smart contracts, see [contracts/README.md](./contracts/contracts/README.md).

### Deploy Contracts

```bash
cd contracts

# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia

# Deploy to mainnet
npm run deploy:mainnet

# Run tests
npm test
```

After deployment, update the contract addresses in `.env`.

## Usage

1. **Connect Wallet**: Use MetaMask or any WalletConnect-compatible wallet
2. **Switch to Sepolia**: Ensure your wallet is connected to Sepolia testnet
3. **Create Flow**: Navigate to "New Flow" and select a template
4. **Configure**: Set amounts, recipients, and approval requirements
5. **Deploy**: Approve MNEE token and deploy the flow
6. **Manage**: View flows in dashboard, execute payments, or cancel flows

## Project Structure

```
payflow/
├── app/                    # Next.js app router
│   ├── app/               # Main application pages
│   │   ├── flows/         # Flow management
│   │   ├── activity/      # Activity feed
│   │   └── settings/      # Settings
│   └── approve/           # Approval interface
├── components/            # React components
│   ├── app/              # App-specific components
│   ├── dashboard/        # Dashboard components
│   ├── providers/        # Context providers
│   └── ui/               # UI components
├── contracts/             # Smart contracts
│   ├── contracts/        # Solidity source
│   └── scripts/          # Deployment scripts
├── hooks/                # React hooks for contracts
├── lib/                  # Utilities and ABIs
└── config/               # App configuration
```

## Contract Architecture

- **FlowFactory**: Deploys new PaymentFlow instances
- **PaymentFlow**: Manages individual payment flows (milestones, splits, recurring)
- **ApprovalManager**: Handles multi-party approval logic

Each flow is a separate contract instance deployed by the factory.

## Testing

Connect to Sepolia testnet and use test MNEE tokens. Get Sepolia ETH from:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

## License

ISC
