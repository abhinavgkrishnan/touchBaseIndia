import React, { useEffect, useState } from "react";
import {
  useConversations,
  useStreamConversations,
  CachedConversation,
} from "@xmtp/react-sdk";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { ConversationList } from "./library/ConversationList";
import { Notification } from "./Notification";
import { ConversationCard } from "./ConversationCard";
import styles from "./Conversations.module.css";
import { shortAddress } from "../helpers/shortAddress";

type ConversationsProps = {
  selectedConversation?: CachedConversation;
  onConversationClick?: (conversation: CachedConversation) => void;
};

type AddressInfo = {
  basename?: string;
  username?: string;
};

type Accumulator = {
  [address: string]: AddressInfo;
};

const NoConversations: React.FC = () => (
  <Notification
    icon={<ChatBubbleLeftIcon className={styles.icon} />}
    title="No conversations found"
  >
    It looks like you don't have any conversations yet. Create one to get
    started
  </Notification>
);

export const Conversations: React.FC<ConversationsProps> = ({
  onConversationClick,
  selectedConversation,
}) => {
  const { conversations, isLoading } = useConversations();
  const [addressInfos, setAddressInfos] = useState<Record<string, AddressInfo>>(
    {},
  );
  useStreamConversations();

  useEffect(() => {
    const fetchAddressInfos = async () => {
      const addresses = conversations.map((conv) => conv.peerAddress);
      const response = await fetch("/api/addressInfos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addresses }),
      });

      if (response.ok) {
        const data = await response.json();

        // Combine basename and username for each address
        const combinedAddressInfos = addresses.reduce(
          (acc: Accumulator, address) => {
            const basename = data.base[address]?.basename;
            const username = data.fc[address]?.username;

            acc[address] = {
              basename: basename || undefined,
              username: username || undefined,
            };

            return acc;
          },
          {},
        );
        console.log("sss", combinedAddressInfos);
        console.log("yyy", data);

        setAddressInfos(combinedAddressInfos);
      }
    };

    if (conversations.length > 0) {
      fetchAddressInfos();
    }
  }, [conversations]);

  const previews = conversations.map((conversation) => {
    const addressInfo = addressInfos[conversation.peerAddress];

    // Determine the display name based on the priority
    const displayName =
      addressInfo?.basename ||
      addressInfo?.username ||
      shortAddress(conversation.peerAddress);

    return (
      <ConversationCard
        key={conversation.topic}
        conversation={conversation}
        isSelected={conversation.topic === selectedConversation?.topic}
        onConversationClick={onConversationClick}
        displayName={displayName}
      />
    );
  });

  return (
    <ConversationList
      isLoading={isLoading}
      conversations={previews}
      renderEmpty={<NoConversations />}
    />
  );
};
