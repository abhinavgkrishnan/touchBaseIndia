import React from "react";

interface SidebarProps {
  activeOption: number;
  setActiveOption: (option: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeOption, setActiveOption }) => {
  return (
    <div
      className="w-1/4 p-4 fixed h-full"
      style={{ backgroundColor: "transparent" }}
    >
      <h2
        className="text-3xl font-bold mb-0 text-white text-center"
        style={{
          fontFamily: "'Pricedown', cursive",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
        }}
      >
        Touch
      </h2>
      <h2
        className="text-3xl font-bold mb-0 text-white text-center"
        style={{
          fontFamily: "'Pricedown', cursive",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
          marginTop: "-15px",
          marginLeft: "10px",
        }}
      >
        Base
      </h2>
      <h3
        className="text-3xl font-bold mb-4 text-white text-center"
        style={{
          fontFamily: "'Pricedown', cursive",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
          marginTop: "-14px",
          marginRight: "6px",
        }}
      >
        India
      </h3>
      <ul className="flex flex-col items-center">
        {[1, 2, 3].map((option) => (
          <li
            key={option}
            className={`cursor-pointer p-3 transform transition duration-300
              ${activeOption === option ? "text-white bg-[#009333]" : "text-pink-400 bg-transparent"}
              hover:bg-[#009333] hover:text-white`}
            onClick={() => setActiveOption(option)}
            style={{
              transition: "all 0.3s ease",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
              clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0 100%)",
              padding: "0.75rem 1.5rem",
              width: "80%",
              textAlign: "center",
            }}
          >
            {option === 1
              ? "Find Base"
              : option === 2
                ? "Based Chat"
                : `Option ${option}`}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Sidebar;
