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
      className="bg-white bg-opacity-70 p-4 rounded flex items-center"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <img
        src={data.pfp}
        alt="Profile Picture"
        className="w-16 h-16 rounded-full mr-4"
      />
      <div className="overflow-hidden">
        <h2 className="text-lg font-medium text-black truncate">
          {data.basename}
        </h2>
        <p className="text-gray-600 font-normal">{data.fid}</p>
        <p className="text-gray-600 text-sm truncate">{address}</p>
      </div>
    </div>
  );
};

export default UserCard;
