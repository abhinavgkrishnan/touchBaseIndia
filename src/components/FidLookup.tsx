import React, { useState, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import UserCard from "./UserCard";

interface FidData {
  basename: string;
  fid: string;
  pfp: string;
}

interface FidLookupProps {
  initialFid: number | null;
}

const FidLookup: React.FC<FidLookupProps> = ({ initialFid }) => {
  const [data, setData] = useState<Record<string, FidData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialFid) {
      handleLookup(initialFid.toString());
    } else {
      // Clear data when signed out
      setData(null);
    }
  }, [initialFid]);

  const handleLookup = async (fid: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/basename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fid }),
      });

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const textStyle = {
    color: "#ff69b4", // Pink color
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
    fontFamily: "'Pricedown', cursive",
  };

  return (
    <div className="pt-20">
      {" "}
      {/* Added padding-top here */}
      <h1 className="text-3xl font-bold mb-4" style={textStyle}>
        FID Lookup Result
      </h1>
      {!initialFid && (
        <p style={textStyle} className="text-xl">
          Please sign in with Farcaster to view results.
        </p>
      )}
      {isLoading ? (
        <div className="loading-circle">
          <ThreeDots color="#ff69b4" height={80} width={80} />
        </div>
      ) : data ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(data).map((key) => (
            <UserCard key={key} data={data[key]} address={key} />
          ))}
        </div>
      ) : initialFid ? (
        <p style={textStyle} className="text-xl">
          No data available for FID: {initialFid}
        </p>
      ) : null}
    </div>
  );
};

export default FidLookup;
