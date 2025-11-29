import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { type Chain } from 'viem'

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 10143; // Default to Monad Testnet ID if not set
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet-rpc.monad.xyz';

const customMonadChain: Chain = {
    id: chainId,
    name: 'Monad Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Monad',
        symbol: 'MON',
    },
    rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
    },
    testnet: true,
}

export const config = createConfig({
    chains: [customMonadChain],
    transports: {
        [customMonadChain.id]: http(rpcUrl),
    },
    connectors: [
        injected(),
    ],
    ssr: true,
})
