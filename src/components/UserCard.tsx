import React from "react";

interface UserCardProps {
  data: {
    basename: string;
    fid: string;
    pfp: string;
  };
  address: string;
}

const UserCard: React.FC<UserCardProps> = ({ data, address }) => {
  return (
    <div
      className="bg-white bg-opacity-60 p-3 rounded flex items-center"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <img
        src={data.pfp}
        alt="Profile Picture"
        className="w-12 h-12 rounded-full mr-3"
      />
      <div className="overflow-hidden">
        <h2 className="text-base font-medium text-black truncate">
          {data.basename}
        </h2>
        <p className="text-gray-600 text-sm font-normal">FID: {data.fid}</p>
        <p className="text-gray-600 text-xs truncate">{address}</p>
      </div>
    </div>
  );
};

export default UserCard;
