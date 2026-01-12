# PayFlow

Visual Programmable Payment Workflows with MNEE

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- A wallet with Sepolia ETH (for testing)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd contracts && npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   - `PRIVATE_KEY` - Your wallet private key (for contract deployment)
   - `SEPOLIA_RPC_URL` - Sepolia RPC endpoint (get from [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/))
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID (get from [WalletConnect Cloud](https://cloud.walletconnect.com/))

### Smart Contracts

#### Current Deployment (Sepolia Testnet)

Contracts are deployed and ready to use:

- **FlowFactory**: `0x08dC530E42D4De7d6dF2c1FDeAb2A96A8b444979`
  - [View on Etherscan](https://sepolia.etherscan.io/address/0x08dC530E42D4De7d6dF2c1FDeAb2A96A8b444979)
  
- **PaymentFlow**: `0xa159999d149Ae8fDd082354406D191f3DA3e84aF`
  - [View on Etherscan](https://sepolia.etherscan.io/address/0xa159999d149Ae8fDd082354406D191f3DA3e84aF)
  
- **ApprovalManager**: `0x3D23383124A4467D2394A48A7D8cbf5110d977F3`
  - [View on Etherscan](https://sepolia.etherscan.io/address/0x3D23383124A4467D2394A48A7D8cbf5110d977F3)

- **MNEE Token**: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`

#### Deploying Contracts

If you need to deploy your own contracts:

```bash
cd contracts

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy to mainnet (production)
npm run deploy:mainnet
```

After deployment, update your `.env` file with the new contract addresses.

### Running the Frontend

1. Make sure your `.env` file has the correct contract addresses:
   ```env
   NEXT_PUBLIC_FLOW_FACTORY_ADDRESS=0x08dC530E42D4De7d6dF2c1FDeAb2A96A8b444979
   NEXT_PUBLIC_PAYMENT_FLOW_ADDRESS=0xa159999d149Ae8fDd082354406D191f3DA3e84aF
   NEXT_PUBLIC_APPROVAL_MANAGER_ADDRESS=0x3D23383124A4467D2394A48A7D8cbf5110d977F3
   NEXT_PUBLIC_CHAIN_ID=11155111
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing

Make sure you're connected to **Sepolia Testnet** in your wallet:
- Network: Sepolia
- Chain ID: 11155111
- RPC URL: Use your configured `SEPOLIA_RPC_URL` or a public endpoint

Get free Sepolia ETH from:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

## 🏗️ Project Structure

```
payflow/
├── app/                    # Next.js app directory
├── components/             # React components
├── contracts/              # Smart contracts (Hardhat)
│   ├── contracts/          # Solidity contracts
│   ├── scripts/            # Deployment scripts
│   └── hardhat.config.js   # Hardhat configuration
├── hooks/                  # React hooks for contracts
├── lib/                    # Utilities and contract ABIs
└── .env                    # Environment variables (not committed)
```

## 🔒 Security Notes

- Never commit your `.env` file to git
- Never share your private key
- Always test on testnet before mainnet deployment
- Review all contract code before deployment

## 📝 License

ISC
