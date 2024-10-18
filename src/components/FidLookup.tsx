import React, { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import UserCard from "./UserCard";

interface FidData {
  basename: string;
  fid: string;
  pfp: string;
}

const FidLookup: React.FC = () => {
  const [fid, setFid] = useState("");
  const [data, setData] = useState<Record<string, FidData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

  return (
    <>
      <h1
        className="text-2xl font-bold mb-4 text-black"
        style={{ fontFamily: "'Pricedown', cursive" }}
      >
        Enter FID
      </h1>
      <form onSubmit={handleSubmit} className="flex space-x-4">
        <input
          type="text"
          value={fid}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFid(e.target.value)
          }
          placeholder="Enter FID"
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Submit
        </button>
      </form>

      {isLoading ? (
        <div className="loading-circle">
          <ThreeDots color="#00BFFF" height={80} width={80} />
        </div>
      ) : data ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(data).map((key) => (
            <UserCard key={key} data={data[key]} address={key} />
          ))}
        </div>
      ) : null}
    </>
  );
};

export default FidLookup;
