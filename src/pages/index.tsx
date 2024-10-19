import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import FidLookup from "../components/FidLookup";
import { AppController as XMTPApp } from "../controllers/AppController";
import FarcasterSignIn from "../components/FarcasterSignIn";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";
import { http } from "viem";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider } from "@farcaster/auth-kit";

// Configuration for RainbowKit
const config = getDefaultConfig({
  appName: "XMTP Next.js Example",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

const farcasterConfig = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain: "localhost:3001",
  siweUri: "https://relay.farcaster.xyz/v1/auth/verify",
};

export default function Home() {
  const [activeOption, setActiveOption] = useState(1);
  const [fid, setFid] = useState<number | null>(null);

  const handleFidReceived = (receivedFid: number | null) => {
    setFid(receivedFid);
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AuthKitProvider config={farcasterConfig}>
            <div
              className="min-h-screen flex"
              style={{
                backgroundImage: "url(/gtabg.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <FarcasterSignIn onFidReceived={handleFidReceived} />
              <Sidebar
                activeOption={activeOption}
                setActiveOption={setActiveOption}
              />

              <div
                className="flex-grow p-8 h-screen overflow-y-auto"
                style={{
                  marginLeft: "25%",
                  backgroundImage: "url(/background.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {activeOption === 1 && <FidLookup initialFid={fid} />}
                {activeOption === 2 && <XMTPApp />}
                {activeOption === 3 && (
                  <div>
                    <h1>Option 3 Content</h1>
                  </div>
                )}
              </div>
            </div>
          </AuthKitProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
