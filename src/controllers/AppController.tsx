import React, { useState, useEffect, useCallback } from "react";
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

const contentTypeConfigs = [
  attachmentContentTypeConfig,
  reactionContentTypeConfig,
  replyContentTypeConfig,
];

export const AppController: React.FC = () => (
  <WalletProvider>
    <XMTPProvider contentTypeConfigs={contentTypeConfigs}>
      <App />
    </XMTPProvider>
  </WalletProvider>
);
