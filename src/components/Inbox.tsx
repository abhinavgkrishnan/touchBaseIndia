import React, { useCallback, useEffect, useState } from "react";
import styles from "./Inbox.module.css";
import {
  useConsent,
  useStartConversation,
  type CachedConversation,
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
  const { startConversation } = useStartConversation();
  const [selectedConversation, setSelectedConversation] = useState<
    CachedConversation | undefined
  >(undefined);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

  const handleConversationClick = useCallback((convo: CachedConversation) => {
    setSelectedConversation(convo);
  }, []);

  const handleAddressFound = useCallback(
    async (address: string) => {
      try {
        // Instead of starting a conversation, just create it without sending a message
        const conversation = await startConversation(address);
        setSelectedConversation(conversation.cachedConversation);
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    },
    [startConversation],
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
