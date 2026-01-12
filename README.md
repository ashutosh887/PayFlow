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

## Hackathon Submission

**Track**: Automated Finance / Commerce

**How MNEE is Used**: 
PayFlow uses MNEE (ERC-20) as the exclusive payment token for all workflows. Users deposit MNEE tokens into payment flows, and all automated payments (milestones, splits, recurring payments) are executed in MNEE. The smart contracts interact with the MNEE token contract at `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF` for all token transfers, approvals, and balance checks. This enables programmable money flows where MNEE tokens are automatically distributed based on predefined business logic.

**MNEE Token Contract**: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF` (Ethereum Sepolia)

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
NEXT_PUBLIC_FLOW_FACTORY_ADDRESS=0x0419AEb7916d951938acB45949Dc70460D25dc75
NEXT_PUBLIC_PAYMENT_FLOW_ADDRESS=0x5CC071537C35494b9FDFc74673065a579765F607
NEXT_PUBLIC_APPROVAL_MANAGER_ADDRESS=0xF8e08Bc787b5418f6346a34DA003d05d33F1Af2b
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

- **FlowFactory**: [`0x0419AEb7916d951938acB45949Dc70460D25dc75`](https://sepolia.etherscan.io/address/0x0419AEb7916d951938acB45949Dc70460D25dc75)
- **PaymentFlow** (implementation): [`0x5CC071537C35494b9FDFc74673065a579765F607`](https://sepolia.etherscan.io/address/0x5CC071537C35494b9FDFc74673065a579765F607)
- **ApprovalManager**: [`0xF8e08Bc787b5418f6346a34DA003d05d33F1Af2b`](https://sepolia.etherscan.io/address/0xF8e08Bc787b5418f6346a34DA003d05d33F1Af2b)
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

## Demo

**Live Demo URL**: [Add your deployed demo URL here]

**Test Credentials**:
- Network: Sepolia Testnet
- Wallet: Connect any Web3 wallet (MetaMask, WalletConnect)
- Test MNEE tokens required for creating flows

## Third-Party Dependencies

This project uses the following third-party libraries and services:

### Frontend
- **Next.js** (MIT) - React framework
- **wagmi** (MIT) - React Hooks for Ethereum
- **viem** (MIT) - TypeScript Ethereum library
- **RainbowKit** (MIT) - Wallet connection UI
- **React Flow** (MIT) - Flow visualization
- **OpenZeppelin Contracts** (MIT) - Smart contract libraries
- **Tailwind CSS** (MIT) - CSS framework
- **shadcn/ui** (MIT) - UI components

### Smart Contracts
- **Hardhat** (MIT) - Ethereum development environment
- **OpenZeppelin Contracts** (MIT) - Secure smart contract libraries
- **Ethers.js** (MIT) - Ethereum library

All dependencies are open-source and properly licensed. We have the right to use all included libraries and SDKs.

## License

ISC License - See [LICENSE](./LICENSE) file for details.
