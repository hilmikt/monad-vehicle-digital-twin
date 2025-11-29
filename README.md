# MonaDrive - Vehicle Digital Twin on Monad

## Overview
**MonaDrive** is a premium digital twin marketplace for vehicles, built on the Monad Testnet. It bridges the gap between physical vehicles and digital ownership by representing each car as a dynamic NFT. This NFT tracks the vehicle's entire lifecycle: from the showroom floor, through the delivery process, to its service history.

## Key Features

### 🛒 Digital Marketplace
- **Browse & Buy**: Explore a curated selection of premium vehicles (Tesla, Rivian, BMW).
- **Instant Purchase**: Buy vehicles directly on-chain using native MON tokens.
- **Infinite Demo**: Experience the buying flow repeatedly with our "Infinite Fleet" of Rivian R1Ts.

### 🚚 Live Delivery Tracking
- **Real-Time Updates**: Watch your vehicle move from "Factory" to "Regional Hub" to "Delivery Center".
- **Visual Progress**: A dynamic, animated delivery tracker shows exactly where your vehicle is.
- **On-Chain Status**: Delivery stages (Not Started, In Transit, Delivered) are stored on the blockchain.

### 🔧 Service History & Digital Logbook
- **Immutable Records**: All service events (maintenance, repairs, upgrades) are recorded on-chain.
- **Odometer Tracking**: Service logs include odometer readings for verifiable mileage history.
- **Owner Dashboard**: Manage your garage, view service history, and track delivery status in one place.

### 🏎️ "My Garage" Experience
- **Digital Ownership**: View all your owned vehicles in a sleek, Tesla-inspired dashboard.
- **Actions**: Rent out your vehicle, sell it, or log a new service event.
- **Live Activity Feed**: A real-time feed of all marketplace actions (Purchases, Rentals, Services).

## Tech Stack
- **Blockchain**: Solidity, Hardhat, Monad Testnet (Chain ID: 10143)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Web3 Integration**: Wagmi v2, Viem, TanStack Query
- **Styling**: Custom CSS animations, Glassmorphism, Premium Dark Mode

## Setup & Installation

### Prerequisites
- Node.js v18+
- A Monad Testnet wallet with funds (MON)

### 1. Clone the Repository
```bash
git clone <repo-url>
cd monad-vehicle-digital-twin
```

### 2. Install Dependencies
**Root (Hardhat & Scripts):**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_wallet_private_key
NEXT_PUBLIC_CONTRACT_ADDRESS=0xFB143834dE4d0C8b44b9EF48630052CEd91Fde66
NEXT_PUBLIC_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_CHAIN_ID=10143
```

### 4. Run the Application
**Start the Frontend:**
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Flow
1.  **Connect Wallet**: Click "Connect Wallet" in the top right.
2.  **Buy a Car**: Go to the Marketplace, select the **Rivian R1T**, and click "Buy". Confirm the transaction.
3.  **Track Delivery**: Watch the delivery animation in the success screen or check "Orders".
4.  **Check Garage**: Go to "My Garage" to see your new vehicle.
5.  **Add Service**: Click "Add Service Log", enter details (e.g., "Tire Rotation", "5,000 mi"), and confirm.
6.  **Verify**: See the new service badge appear on your vehicle card.

## License
MIT