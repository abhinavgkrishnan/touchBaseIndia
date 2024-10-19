import React, { useState, useCallback } from "react";
import {
  SignInButton,
  useSignIn,
  StatusAPIResponse,
} from "@farcaster/auth-kit";

interface FarcasterSignInProps {
  onFidReceived: (fid: number | null) => void;
}

const FarcasterSignIn: React.FC<FarcasterSignInProps> = ({ onFidReceived }) => {
  const [error, setError] = useState(false);
  const { signIn, signOut } = useSignIn();
  const [userData, setUserData] = useState<StatusAPIResponse | null>(null);

  const handleSuccess = useCallback(
    (res: StatusAPIResponse) => {
      console.log("Sign-in successful:", res);
      setUserData(res);
      onFidReceived(res.fid);
    },
    [onFidReceived],
  );

  const handleSignOut = useCallback(() => {
    signOut();
    setUserData(null);
    onFidReceived(null); // Pass null instead of 0
  }, [signOut, onFidReceived]);

  return (
    <div className="fixed top-2 right-2 z-50">
      {!userData ? (
        <SignInButton
          onSuccess={handleSuccess}
          onError={() => setError(true)}
        />
      ) : (
        <div
          className="bg-white bg-opacity-70 p-2 rounded flex items-center"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <img
            src={userData.pfpUrl || "/default-avatar.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full mr-2"
          />
          <div className="overflow-hidden mr-2">
            <h2 className="text-sm font-medium text-black truncate">
              {userData.displayName || userData.username}
            </h2>
            <p className="text-xs text-gray-600">FID: {userData.fid}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
          >
            Sign Out
          </button>
        </div>
      )}
      {error && (
        <div className="text-red-500 text-xs mt-1">
          Unable to sign in at this time.
        </div>
      )}
    </div>
  );
};

export default FarcasterSignIn;
