import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, hardhat } from 'wagmi/chains'

// Define the chain to use. Defaulting to hardhat for local dev if env var not present.
// In production, you would check NEXT_PUBLIC_CHAIN_ID and map it to a chain object.
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) : hardhat.id;

// Helper to get chain object
const getChain = (id: number) => {
    if (id === sepolia.id) return sepolia;
    if (id === mainnet.id) return mainnet;
    return hardhat;
}

export const config = createConfig({
    chains: [getChain(chainId)],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [hardhat.id]: http(),
    },
    ssr: true,
})
