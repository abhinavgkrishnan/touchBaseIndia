import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import FidLookup from "../components/FidLookup";
import { AppController as XMTPApp } from "../controllers/AppController";
import FarcasterSignIn from "../components/FarcasterSignIn";
import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  getDefaultConfig,
  ConnectButton,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, useAccount, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider } from "@farcaster/auth-kit";
import { mainnet } from "@wagmi/core/chains";
import { http } from "@wagmi/core";

// Configuration for RainbowKit
const config = getDefaultConfig({
  appName: "XMTP Next.js Example",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
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
  domain: "localhost:3000",
  siweUri: "https://relay.farcaster.xyz/v1/auth/verify",
};

function HomeContent() {
  const [activeOption, setActiveOption] = useState(1);
  const [fid, setFid] = useState<number | null>(null);
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleFidReceived = (receivedFid: number | null) => {
    setFid(receivedFid);
  };

  const handleSetActiveOption = (option: number) => {
    if (option === 2) {
      // Force disconnect when selecting XMTP option
      disconnect();
    }
    setActiveOption(option);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage: "url(/gtabg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {activeOption === 1 && (
        <FarcasterSignIn onFidReceived={handleFidReceived} />
      )}
      <Sidebar
        activeOption={activeOption}
        setActiveOption={handleSetActiveOption}
      />

      <div
        className={`flex-grow p-8 h-screen overflow-y-auto ${
          activeOption === 2 ? "w-4/5" : "w-3/4"
        }`}
        style={{
          marginLeft: activeOption === 2 ? "20%" : "25%",
          backgroundImage: "url(/background.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {activeOption === 1 && <FidLookup initialFid={fid} />}
        {activeOption === 2 && (
          <div className="h-full flex items-center justify-center">
            {!isConnected && (
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  return (
                    <div
                      {...(!mounted && {
                        "aria-hidden": true,
                        style: {
                          opacity: 0,
                          pointerEvents: "none",
                          userSelect: "none",
                        },
                      })}
                    >
                      {(() => {
                        if (!mounted || !account || !chain) {
                          return (
                            <button
                              onClick={openConnectModal}
                              type="button"
                              className="text-pink-400 text-2xl font-bold py-2 px-4 transition-shadow duration-200 ease-in-out"
                              style={{
                                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                              }}
                            >
                              Connect Wallet
                            </button>
                          );
                        }
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            )}
            {isConnected && <XMTPApp key={`xmtp-app-${Date.now()}`} />}
          </div>
        )}
        {activeOption === 3 && (
          <div>
            <h1>Option 3 Content</h1>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthKitProvider config={farcasterConfig}>
          <RainbowKitProvider>
            <HomeContent />
          </RainbowKitProvider>
        </AuthKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
