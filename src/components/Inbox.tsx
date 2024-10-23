import React, { useCallback, useEffect, useState } from "react";
import styles from "./Inbox.module.css";
import {
  useConsent,
  useConversations,
  type CachedConversation,
  useClient,
} from "@xmtp/react-sdk";
import {
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { Conversations } from "./Conversations";
import { Messages } from "./Messages";
import { NewMessage } from "./NewMessage";
import { useWallet } from "../hooks/useWallet";
import { NoSelectedConversationNotification } from "./NoSelectedConversationNotification";
import { Button } from "./library/Button";

export const Inbox: React.FC = () => {
  const { disconnect } = useWallet();
  const { loadConsentList } = useConsent();
  const [selectedConversation, setSelectedConversation] = useState<
    CachedConversation | undefined
  >(undefined);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

  const { client } = useClient();
  const { conversations } = useConversations();

  const handleConversationClick = useCallback((convo: CachedConversation) => {
    setSelectedConversation(convo);
  }, []);

  const handleAddressFound = useCallback(
    async (address: string) => {
      if (!client) {
        console.error("XMTP client is not initialized");
        return;
      }

      try {
        const conversation =
          await client.conversations.newConversation(address);
        const cachedConversation: CachedConversation = {
          peerAddress: conversation.peerAddress,
          topic: conversation.topic,
          createdAt: conversation.createdAt,
          updatedAt: new Date(), // Use current time as updatedAt
          isReady: true, // Assume the conversation is ready
          walletAddress: client.address, // Use the client's address as walletAddress
        };
        setSelectedConversation(cachedConversation);
        setIsNewMessageModalOpen(false);
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    },
    [client],
  );

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const handleStartNewConversation = useCallback(() => {
    setIsNewMessageModalOpen(true);
  }, []);

  useEffect(() => {
    void loadConsentList();
  }, [loadConsentList]);

  return (
    <div className={styles.inboxWrapper}>
      <div className={styles.inbox}>
        <div className={styles.inboxHeader}>
          <div className={styles.inboxHeaderXmtp}>Chats</div>
          <div className={styles.inboxHeaderActions}>
            <Button
              icon={<PlusCircleIcon width={24} />}
              onClick={handleStartNewConversation}
              className="bg-pink-500 text-white px-4 py-2 rounded"
            >
              New message
            </Button>
            <Button
              secondary
              onClick={handleDisconnect}
              icon={<ArrowRightOnRectangleIcon width={24} />}
              className={styles.disconnectButton}
            >
              Disconnect
            </Button>
          </div>
        </div>
        <div className={styles.inboxContent}>
          <div className={styles.inboxConversationsList}>
            <Conversations
              onConversationClick={handleConversationClick}
              selectedConversation={selectedConversation}
            />
          </div>
          <div className={styles.inboxConversationsMessages}>
            {selectedConversation ? (
              <Messages conversation={selectedConversation} />
            ) : (
              <NoSelectedConversationNotification
                onStartNewConversation={handleStartNewConversation}
              />
            )}
          </div>
        </div>
      </div>
      <NewMessage
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        onAddressFound={handleAddressFound}
      />
    </div>
  );
};
