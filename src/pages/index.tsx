import { useState } from "react";
import Sidebar from "../components/Sidebar";
import FidLookup from "../components/FidLookup";
import { AppController as XMTPApp } from "../controllers/AppController";
import "@rainbow-me/rainbowkit/styles.css";
// import "../styles/xmtp-styles.css";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "@wagmi/core/chains";
import { http } from "@wagmi/core";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

export default function Home() {
  const [activeOption, setActiveOption] = useState(1);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div
            className="min-h-screen flex"
            style={{
              backgroundImage: "url(/gtabg.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
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
              {activeOption === 1 && <FidLookup />}
              {activeOption === 2 && <XMTPApp />}
              {activeOption === 3 && (
                <div>
                  <h1>Option 3 Content</h1>
                  {/* Add content for option 3 here */}
                </div>
              )}
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
