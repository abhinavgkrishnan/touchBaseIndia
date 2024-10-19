import React from "react";
import { LinkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useClient } from "@xmtp/react-sdk";
import { useCallback } from "react";
import { useWalletClient } from "wagmi";
import { Notification } from "./Notification";
import { Button } from "./library/Button";
import styles from "./XMTPConnect.module.css";

type XMTPConnectButtonProps = {
  label: string;
  isPink?: boolean;
};

const XMTPConnectButton: React.FC<XMTPConnectButtonProps> = ({
  label,
  isPink = false,
}) => {
  const { initialize } = useClient();
  const { data: walletClient } = useWalletClient();

  const handleConnect = useCallback(() => {
    void initialize({
      signer: walletClient,
      options: {
        env: "production",
      },
    });
  }, [initialize, walletClient]);

  return (
    <Button onClick={handleConnect}>
      <span className={isPink ? styles.pinkText : undefined}>{label}</span>
    </Button>
  );
};

export const XMTPConnect: React.FC = () => {
  const { isLoading, error } = useClient();

  if (error) {
    return (
      <Notification
        icon={<ExclamationTriangleIcon />}
        title="Could not connect to XMTP"
        cta={<XMTPConnectButton label="Try again" />}
      >
        Something went wrong
      </Notification>
    );
  }

  if (isLoading) {
    return <Notification title="Connecting to XMTP"></Notification>;
  }

  return (
    <Notification
      cta={<XMTPConnectButton label="Connect to XMTP" isPink={true} />}
    ></Notification>
  );
};
