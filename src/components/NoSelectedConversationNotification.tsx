import React from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { Notification } from "./Notification";
import { Button } from "./library/Button";
import styles from "./NoSelectedConversationNotification.module.css";

type NoSelectedConversationNotificationProps = {
  onStartNewConversation?: VoidFunction;
};

export const NoSelectedConversationNotification: React.FC<
  NoSelectedConversationNotificationProps
> = ({ onStartNewConversation }) => (
  <div className={styles.notification}>
    <Notification
      cta={
        <Button onClick={onStartNewConversation}>Start new conversation</Button>
      }
      icon={<ChatBubbleLeftRightIcon className={styles.icon} />}
      title="No conversation selected"
    >
      Select a conversation to display its messages or start a new conversation
    </Notification>
  </div>
);
