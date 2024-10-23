import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import FidLookup from "../components/FidLookup";
import { AppController as XMTPApp } from "../controllers/AppController";
import FarcasterSignIn from "../components/farcasterSignIn";
import WalletBalances from "../components/WalletBalances"; // Import the new component
import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  getDefaultConfig,
  ConnectButton,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, useAccount, useDisconnect, useConnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider } from "@farcaster/auth-kit";
import { mainnet, sepolia } from "@wagmi/core/chains";
import { http } from "@wagmi/core";

// Configuration for RainbowKit
const config = getDefaultConfig({
  appName: "XMTP Next.js Example",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

const farcasterConfig = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain: "touch-base-india.vercel.app",
  siweUri: "https://relay.farcaster.xyz/v1/auth/verify",
};

function HomeContent() {
  const [activeOption, setActiveOption] = useState(1);
  const [fid, setFid] = useState<number | null>(null);
  const [results, setResults] = useState(null);
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const storedConnectionState = localStorage.getItem("walletConnected");
      if (storedConnectionState === "true" && !isConnected) {
        setIsConnecting(true);
        const connector = connectors.find((c) => c.ready);
        if (connector) {
          try {
            await connect({ connector });
          } catch (error) {
            console.error("Failed to reconnect:", error);
            localStorage.removeItem("walletConnected");
          }
        }
        setIsConnecting(false);
      }
    };

    checkConnection();
  }, [isConnected, connect, connectors]);

  useEffect(() => {
    if (isConnected) {
      localStorage.setItem("walletConnected", "true");
    }
  }, [isConnected]);

  const handleFidReceived = (receivedFid: number | null) => {
    setFid(receivedFid);
  };

  const handleSetActiveOption = (option: number) => {
    if (activeOption === 1 && option !== 1) {
      setResults(null);
      setFid(null);
    }

    setActiveOption(option);
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem("walletConnected");
  };

  if (!isConnected && !isConnecting) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url(/gtabg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              onClick={openConnectModal}
              type="button"
              className="text-pink-400 text-4xl font-bold py-4 px-8 hover:bg-[#009333]"
              style={{
                transition: "all 0.3s ease",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
                clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0 100%)",
                padding: "0.75rem 1.5rem",
                width: "50%",
                textAlign: "center",
              }}
            >
              Connect Wallet
            </button>
          )}
        </ConnectButton.Custom>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-2xl">Connecting...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex relative"
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
        {activeOption === 1 && (
          <FidLookup initialFid={fid} setResults={setResults} />
        )}
        {activeOption === 2 && (
          <div className="h-full flex items-center justify-center">
            <XMTPApp />
          </div>
        )}
        {activeOption === 3 && <WalletBalances />}{" "}
        {/* Display WalletBalances for option 3 */}
      </div>

      {/* Disconnect button */}
      <button
        onClick={handleDisconnect}
        className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
      >
        Disconnect
      </button>
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
