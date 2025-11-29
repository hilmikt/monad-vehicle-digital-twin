import { http, createConfig } from 'wagmi';
import { defineChain } from 'viem';
import { injected } from 'wagmi/connectors';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet-rpc.monad.xyz';
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 10143;

export const customMonadChain = defineChain({
    id: CHAIN_ID,
    name: 'Monad Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Monad',
        symbol: 'MON',
    },
    rpcUrls: {
        default: { http: [RPC_URL] },
    },
    blockExplorers: {
        default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' }, // Assuming explorer URL
    },
    testnet: true,
});

export const config = createConfig({
    chains: [customMonadChain],
    transports: {
        [customMonadChain.id]: http(RPC_URL),
    },
    connectors: [injected()],
    ssr: true,
});
