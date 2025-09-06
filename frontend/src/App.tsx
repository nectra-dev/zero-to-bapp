import React from "react";
import { WagmiProvider, http, createConfig } from "wagmi";
import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, rabbyWallet, walletConnectWallet, rainbowWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defineChain } from "viem";
import { Toaster, toast } from "sonner";
import "@rainbow-me/rainbowkit/styles.css";
import MainBapp from "./components/MainBapp";

function App() {
  const citreaTestnet = defineChain({
    id: 5115,
    name: "Citrea Testnet",
    network: "citrea-testnet",
    nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 },
    rpcUrls: {
      default: { http: ["https://rpc.testnet.citrea.xyz"] },
    },
    blockExplorers: {
      default: { name: "Citrea Explorer", url: "https://explorer.testnet.citrea.xyz" },
    },
    testnet: true,
  });

  const connectors = connectorsForWallets(
    [
      {
        groupName: "recommended", 
        wallets: [metaMaskWallet],
      },
      {
        groupName: "Supported", 
        wallets: [rabbyWallet, walletConnectWallet, rainbowWallet],
      }
    ],
    {
      appName: "Zero to BApp",
      projectId: "demo", // Replace with your WalletConnect projectId
    }
  );

  const config = createConfig({
    connectors,
    chains: [citreaTestnet] as const,
    transports: {
      [citreaTestnet.id]: http("https://rpc.testnet.citrea.xyz"),
    },
    ssr: false,
  });

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          <MainBapp />
          <Toaster richColors position="top-right" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;