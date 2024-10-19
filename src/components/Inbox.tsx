import styles from "./Inbox.module.css";
import { useCallback, useEffect, useState } from "react";
import { useConsent, type CachedConversation } from "@xmtp/react-sdk";
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
  const [isNewMessage, setIsNewMessage] = useState(false);

  const handleConversationClick = useCallback((convo: CachedConversation) => {
    setSelectedConversation(convo);
    setIsNewMessage(false);
  }, []);

  const handleStartNewConversation = useCallback(() => {
    setIsNewMessage(true);
  }, []);

  const handleStartNewConversationSuccess = useCallback(
    (convo?: CachedConversation) => {
      setSelectedConversation(convo);
      setIsNewMessage(false);
    },
    [],
  );

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  useEffect(() => {
    void loadConsentList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.inbox}>
      <div className={styles.inboxHeader}>
        <div className={styles.inboxHeaderXmtp}>
          <img src="/xmtp-icon.png" alt="XMTP logo" width="32" />
        </div>
        <div className={styles.inboxHeaderActions}>
          <Button
            icon={<PlusCircleIcon width={24} />}
            onClick={handleStartNewConversation}
          >
            New message
          </Button>
          <Button
            secondary
            onClick={handleDisconnect}
            icon={<ArrowRightOnRectangleIcon width={24} />}
          >
            Disconnect
          </Button>
        </div>
      </div>
      <div className={styles.inboxConversations}>
        <div className={styles.inboxConversationsList}>
          <Conversations
            onConversationClick={handleConversationClick}
            selectedConversation={selectedConversation}
          />
        </div>
        <div className={styles.inboxConversationsMessages}>
          {isNewMessage ? (
            <NewMessage onSuccess={handleStartNewConversationSuccess} />
          ) : selectedConversation ? (
            <Messages conversation={selectedConversation} />
          ) : (
            <NoSelectedConversationNotification
              onStartNewConversation={handleStartNewConversation}
            />
          )}
        </div>
      </div>
    </div>
  );
};
