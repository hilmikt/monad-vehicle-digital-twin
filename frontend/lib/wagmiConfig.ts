import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "10143");
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://testnet-rpc.monad.xyz";

export const monadTestnet = {
    id: chainId,
    name: "Monad Testnet",
    nativeCurrency: {
        name: "Monad Testnet Token",
        symbol: "tMON",
        decimals: 18,
    },
    rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
    },
} as const;

export const config = createConfig({
    chains: [monadTestnet],
    transports: {
        [monadTestnet.id]: http(rpcUrl),
    },
    connectors: [
        injected({
            shimDisconnect: true,
        }),
    ],
});
