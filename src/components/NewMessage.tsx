import React, { useState } from "react";
import { isValidAddress, useCanMessage } from "@xmtp/react-sdk";
import Modal from "./Modal";
import styles from "./NewMessage.module.css";

type NewMessageProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddressFound: (address: string) => void;
};

export const NewMessage: React.FC<NewMessageProps> = ({
  isOpen,
  onClose,
  onAddressFound,
}) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { canMessage } = useCanMessage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleLookup = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch address");
      }

      const { address } = await response.json();

      if (address) {
        const canMessageResult = await canMessage(address);
        if (canMessageResult) {
          onAddressFound(address);
          onClose();
        } else {
          setError("This address is not on the XMTP network");
        }
      } else {
        setError("No matching address found");
      }
    } catch (error) {
      setError("Error looking up address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className={styles.title}>Start New Conversation</h2>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Enter FC username or Basename"
        className={styles.input}
      />
      <button
        onClick={handleLookup}
        className={styles.button}
        disabled={isLoading}
      >
        {isLoading ? "Looking up..." : "Start Chat"}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </Modal>
  );
};
