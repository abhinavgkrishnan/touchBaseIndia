import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  isValidAddress,
  useCanMessage,
  useStartConversation,
  CachedConversation,
} from "@xmtp/react-sdk";
import "./NewMessage.module.css";
import { AddressInput } from "./library/AddressInput";
import { MessageInput } from "./library/MessageInput";

type NewMessageProps = {
  onSuccess?: (conversation?: CachedConversation) => void;
};

export const NewMessage: React.FC<NewMessageProps> = ({ onSuccess }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [peerAddress, setPeerAddress] = useState("");
  const [isOnNetwork, setIsOnNetwork] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { startConversation } = useStartConversation();
  const { canMessage } = useCanMessage();

  const handleChange = useCallback((updatedValue: string) => {
    setPeerAddress(updatedValue);
  }, []);

  const handleStartConversation = useCallback(
    async (message: string) => {
      console.log("handleStartConversation called", {
        peerAddress,
        isOnNetwork,
        message,
      });
      if (peerAddress && isOnNetwork) {
        setIsLoading(true);
        try {
          console.log("Starting conversation...");
          const result = await startConversation(peerAddress, message);
          console.log("Conversation result:", result);
          setIsLoading(false);
          if (result) {
            console.log("Calling onSuccess");
            onSuccess?.(result.cachedConversation);
          } else {
            console.log("No result from startConversation");
          }
        } catch (error) {
          console.error("Error starting conversation:", error);
          setIsLoading(false);
        }
      } else {
        console.log("Cannot start conversation", { peerAddress, isOnNetwork });
      }
    },
    [isOnNetwork, onSuccess, peerAddress, startConversation],
  );

  useEffect(() => {
    const checkAddress = async () => {
      if (isValidAddress(peerAddress)) {
        setIsLoading(true);
        console.log("Checking address:", peerAddress);
        try {
          const canMessageResult = await canMessage(peerAddress);
          console.log("Can message result:", canMessageResult);
          setIsOnNetwork(canMessageResult);
        } catch (error) {
          console.error("Error checking canMessage:", error);
          setIsOnNetwork(false);
        }
        setIsLoading(false);
      } else {
        setIsOnNetwork(false);
      }
    };
    void checkAddress();
  }, [canMessage, peerAddress]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  let subtext: string | undefined;
  let isError = false;
  if (peerAddress === "") {
    subtext = "Enter a 0x wallet address";
  } else if (isLoading) {
    subtext = "Finding address on the XMTP network...";
  } else if (!isValidAddress(peerAddress)) {
    subtext = "Please enter a valid 0x wallet address";
  } else if (!isOnNetwork) {
    subtext =
      "Sorry, we can't message this address because its owner hasn't used it with XMTP yet";
    isError = true;
  }

  return (
    <>
      <AddressInput
        ref={inputRef}
        subtext={subtext}
        value={peerAddress}
        onChange={handleChange}
        isError={isError}
        avatarUrlProps={{
          address: isOnNetwork ? peerAddress : "",
        }}
      />
      <div />
      <div className="NewMessageInputWrapper">
        <MessageInput
          isDisabled={isLoading || !isValidAddress(peerAddress) || isError}
          onSubmit={handleStartConversation}
        />
      </div>
    </>
  );
};
