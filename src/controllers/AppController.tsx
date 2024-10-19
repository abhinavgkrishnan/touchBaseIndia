import React, { useState, useEffect } from "react";
import {
  XMTPProvider,
  Client,
  attachmentContentTypeConfig,
  reactionContentTypeConfig,
  replyContentTypeConfig,
} from "@xmtp/react-sdk";
import { ContentTypeReaction } from "@xmtp/content-type-reaction";
import { WalletProvider } from "../contexts/WalletContext";
import { App } from "../components/App";
import { useAccount, useDisconnect } from "wagmi";

const contentTypeConfigs = [
  attachmentContentTypeConfig,
  reactionContentTypeConfig,
  replyContentTypeConfig,
];

export const AppController: React.FC = () => {
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const initializeXMTP = async () => {
      if (isConnected && address) {
        const cachedKeys = localStorage.getItem(`xmtp-keys-${address}`);
        if (cachedKeys) {
          try {
            const client = await Client.create(null, {
              env: "production",
              privateKeyOverride: cachedKeys,
            });
            await client.enableContentType(ContentTypeReaction);
            setXmtpClient(client);
          } catch (error) {
            console.error("Failed to initialize XMTP client:", error);
            localStorage.removeItem(`xmtp-keys-${address}`);
          }
        }
      } else {
        setXmtpClient(null);
      }
    };

    initializeXMTP();
  }, [isConnected, address]);

  const onConnect = async (signer: any) => {
    try {
      const client = await Client.create(signer, { env: "production" });
      await client.enableContentType(ContentTypeReaction);
      localStorage.setItem(
        `xmtp-keys-${address}`,
        await client.exportPrivateKeyBundle(),
      );
      setXmtpClient(client);
    } catch (error) {
      console.error("Failed to connect XMTP:", error);
    }
  };

  const handleDisconnect = () => {
    if (address) {
      localStorage.removeItem(`xmtp-keys-${address}`);
    }
    setXmtpClient(null);
    disconnect();
  };

  return (
    <WalletProvider>
      <XMTPProvider
        client={xmtpClient}
        onConnect={onConnect}
        contentTypeConfigs={contentTypeConfigs}
      >
        <App onDisconnect={handleDisconnect} />
      </XMTPProvider>
    </WalletProvider>
  );
};
