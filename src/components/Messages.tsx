import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useClient,
  useMessages,
  useSendMessage,
  useStreamMessages,
  CachedConversation,
} from "@xmtp/react-sdk";
import { ContentTypeReaction } from "@xmtp/content-type-reaction";
import { ContentTypeId } from "@xmtp/content-type-primitives";
import styles from "./Messages.module.css";
import { AddressInput } from "./library/AddressInput";
import { Messages as MessagesList } from "./library/Messages";
import { MessageInput } from "./library/MessageInput";

type ConversationMessagesProps = {
  conversation: CachedConversation;
};

export const Messages: React.FC<ConversationMessagesProps> = ({
  conversation,
}) => {
  const [isSending, setIsSending] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading } = useMessages(conversation);
  const { client } = useClient();
  useStreamMessages(conversation);
  const { sendMessage } = useSendMessage();

  const filteredMessages = useMemo(
    () =>
      messages.filter((message) => {
        const contentType = ContentTypeId.fromString(message.contentType);
        return (
          // supported content types
          message.content !== undefined &&
          // not reactions
          !contentType.sameAs(ContentTypeReaction)
        );
      }),
    [messages],
  );

  const handleSendMessage = useCallback(
    async (message: string) => {
      setIsSending(true);
      await sendMessage(conversation, message);
      setIsSending(false);
      // ensure focus of input by waiting for a browser tick
      setTimeout(() => messageInputRef.current?.focus(), 0);
    },
    [conversation, sendMessage],
  );

  useEffect(() => {
    messageInputRef.current?.focus();
  }, [conversation]);

  return (
    <div className={styles.messagesWrapper}>
      <div className={styles.messagesContent}>
        <div className={styles.messagesHeader}>
          <AddressInput
            value={conversation.peerAddress}
            avatarUrlProps={{ address: conversation.peerAddress }}
          />
        </div>
        <div className={styles.messagesScrollContainer}>
          <MessagesList
            conversation={conversation}
            isLoading={isLoading}
            messages={filteredMessages}
            clientAddress={client?.address}
          />
        </div>
        <div className={styles.messageInputWrapper}>
          <MessageInput
            isDisabled={isSending}
            onSubmit={handleSendMessage}
            ref={messageInputRef}
          />
        </div>
      </div>
    </div>
  );
};
