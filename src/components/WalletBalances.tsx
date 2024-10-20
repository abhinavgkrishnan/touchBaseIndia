import React, { useState, useEffect } from "react";
import { useAccount, useContractWrite, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import styles from "./Modal.module.css";

interface Balance {
  chain: string;
  symbol: string;
  amount: string;
  decimals: number;
  address?: string;
}

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
];

const WalletBalances: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const { address } = useAccount();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Balance | null>(null);
  const [recipientInput, setRecipientInput] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const {
    data: transferData,
    write: transferERC20,
    isLoading: isERC20Loading,
    isSuccess: isERC20Success,
  } = useContractWrite({
    address:
      selectedToken?.address !== "native"
        ? (selectedToken?.address as `0x${string}`)
        : undefined,
    abi: ERC20_ABI,
    functionName: "transfer",
  });

  const {
    data: sendData,
    sendTransaction,
    isLoading: isETHLoading,
    isSuccess: isETHSuccess,
  } = useSendTransaction();

  const isLoading = isERC20Loading || isETHLoading;
  const isSuccess = isERC20Success || isETHSuccess;

  useEffect(() => {
    console.log("Selected Token:", selectedToken);
    console.log("Recipient Input:", recipientInput);
    console.log("Transfer Amount:", transferAmount);
    console.log("Transfer function available:", Boolean(transferERC20));
    console.log(
      "Send transaction function available:",
      Boolean(sendTransaction),
    );
  }, [
    selectedToken,
    recipientInput,
    transferAmount,
    transferERC20,
    sendTransaction,
  ]);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!address) return;

      const options = {
        method: "GET",
        headers: { "X-Dune-Api-Key": "Cid5KAnCnnFvIPEdKDICozjk9KBMqNjy" },
      };

      try {
        const response = await fetch(
          `https://api.dune.com/api/beta/balance/${address}`,
          options,
        );
        const data = await response.json();
        setBalances(data.balances);
      } catch (err) {
        console.error("Error fetching balances:", err);
        setError("Failed to fetch balances");
      }
    };

    fetchBalances();
  }, [address]);

  const handleTransferClick = () => {
    setIsTransferModalOpen(true);
    setModalError(null);
  };

  const handleTokenSelect = (token: Balance) => {
    setSelectedToken(token);
  };

  const handleRecipientLookup = async () => {
    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: recipientInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch address");
      }

      const { address } = await response.json();
      if (address) {
        setRecipientInput(address);
        setModalError(null);
      } else {
        setModalError("No matching address found");
      }
    } catch (error) {
      setModalError("Error looking up address");
    }
  };

  const handleTransfer = async () => {
    if (!selectedToken || !recipientInput || !transferAmount) {
      setModalError("Please fill in all fields");
      return;
    }

    try {
      if (selectedToken.address === "native") {
        if (!sendTransaction) {
          throw new Error("Send transaction function is not available");
        }
        await sendTransaction({
          to: recipientInput as `0x${string}`,
          value: parseEther(transferAmount),
        });
      } else {
        if (!transferERC20) {
          throw new Error("Transfer function is not available");
        }
        await transferERC20({
          args: [recipientInput as `0x${string}`, parseEther(transferAmount)],
        });
      }
      setModalError(null);
    } catch (error) {
      console.error("Transfer error:", error);
      if (error instanceof Error) {
        setModalError(`Transfer failed: ${error.message}`);
      } else {
        setModalError("Transfer failed: Unknown error");
      }
    }
  };

  const formatBalance = (amount: string, decimals: number): string => {
    if (!amount || isNaN(decimals) || decimals < 0) return "0";

    try {
      const amountBN = BigInt(amount);
      const divisor = BigInt(10 ** Math.floor(decimals));
      const integerPart = (amountBN / divisor).toString();
      const fractionalPart = (amountBN % divisor)
        .toString()
        .padStart(Math.floor(decimals), "0");
      return `${integerPart}.${fractionalPart}`;
    } catch (error) {
      console.error("Error formatting balance:", error);
      return "0";
    }
  };

  return (
    <div className="p-4">
      <h2
        className="text-2xl font-bold mb-4 text-pink-400"
        style={{
          fontFamily: "'Pricedown', cursive",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
        }}
      >
        Wallet Balances
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {balances.map((balance, index) => (
          <div
            key={index}
            className="bg-white bg-opacity-60 p-3 rounded flex items-center justify-between"
            style={{ backdropFilter: "blur(10px)" }}
          >
            <div>
              <h3 className="text-xl font-medium text-pink-500">
                {balance.symbol || "Unknown"}
              </h3>
              <p className="text-lg text-pink-500">
                Chain : {balance.chain || "Unknown"}
              </p>
              <p className="text-base text-black font-mono">
                {formatBalance(balance.amount, balance.decimals)}{" "}
                {balance.symbol || ""}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleTransferClick}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Transfer Funds
      </button>

      {isTransferModalOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <button
              className={styles.closeButton}
              onClick={() => setIsTransferModalOpen(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-pink-500">
              Transfer Funds
            </h3>
            {modalError && <p className="text-red-500 mb-2">{modalError}</p>}
            <select
              onChange={(e) =>
                handleTokenSelect(balances[parseInt(e.target.value)])
              }
              className="w-full p-2 mb-2 border rounded text-black font-mono"
            >
              <option value="">Select Token</option>
              {balances.map((balance, index) => (
                <option key={index} value={index}>
                  {balance.symbol} ({balance.chain})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              placeholder="Enter recipient username, basename, or address"
              className="w-full p-2 mb-2 border rounded text-black font-mono"
            />
            <button
              onClick={handleRecipientLookup}
              className="bg-green-600 text-white px-4 py-2 rounded mb-2"
            >
              fetch address
            </button>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-2 mb-2 border rounded text-black font-mono"
            />
            <div className="flex justify-between">
              <button
                onClick={handleTransfer}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                {isLoading ? "Transferring..." : "Transfer"}
              </button>
            </div>
            {isSuccess && (
              <p className="text-green-60000 mt-2">Transfer successful!</p>
            )}
            {modalError && <p className="text-red-500 mt-2">{modalError}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletBalances;
