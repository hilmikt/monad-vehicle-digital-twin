# Monad Vehicle Digital Twin

## Description
A digital twin for cars represented as NFTs. Each vehicle is an NFT that captures marketplace listing, delivery lifecycle (Not Started, In Transit, Delivered), and service history. This project demonstrates a complete flow from minting to delivery tracking and service logging on-chain.

## Tech Stack
- **Blockchain**: Solidity, Hardhat, Monad/EVM Testnet
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Web3**: Wagmi, Viem

## Setup Steps
1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd vehicle-digital-twin
   ```

2. **Install Dependencies**
   Root (Hardhat):
   ```bash
   npm install
   ```
   Frontend:
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Configuration**
   Copy `.env.example` to `.env` in the root directory and fill in the values:
   ```bash
   cp .env.example .env
   ```
   - `TESTNET_RPC_URL`: Your EVM testnet RPC URL.
   - `PRIVATE_KEY`: Your wallet private key (ensure it has funds).
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: (After deployment) The address of the deployed VehicleNFT contract.
   - `NEXT_PUBLIC_CHAIN_ID`: Chain ID of your testnet.
   - `NEXT_PUBLIC_RPC_URL`: Same as TESTNET_RPC_URL or a public one for the frontend.

## Commands

- **Compile Contracts**:
  ```bash
  npx hardhat compile
  ```

- **Deploy Contracts**:
  ```bash
  npx hardhat run scripts/deploy.ts --network testnet
  ```
  *Note: After deployment, update `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env`.*

- **Start Frontend**:
  ```bash
  cd frontend
  npm run dev
  ```

## Walkthrough
1. **Mint/List**: The owner can mint new vehicle NFTs which are automatically listed.
2. **Purchase**: Users can connect their wallet and purchase listed vehicles.
3. **Delivery**: The owner can advance the delivery stage (Not Started -> In Transit -> Delivered).
4. **Service History**: Service centers (or any user in this demo) can add service records to the vehicle's history.

## Notes
This is a hackathon prototype. Future extensions could include real GPS integration via oracles, authorized service center whitelisting, and financing integrations.