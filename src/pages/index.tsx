import { useState } from "react";
import Sidebar from "../components/Sidebar";
import FidLookup from "../components/FidLookup";

export default function Home() {
  const [activeOption, setActiveOption] = useState(1);

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage: "url(/gtabg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Sidebar activeOption={activeOption} setActiveOption={setActiveOption} />

      <div
        className="flex-grow p-8 h-screen overflow-y-auto"
        style={{
          marginLeft: "25%",
          backgroundImage: "url(/background.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {activeOption === 1 && <FidLookup />}
        {activeOption === 2 && (
          <div>
            <h1>Option 2 Content</h1>
            {/* Add content for option 2 here */}
          </div>
        )}
        {activeOption === 3 && (
          <div>
            <h1>Option 3 Content</h1>
            {/* Add content for option 3 here */}
          </div>
        )}
      </div>
    </div>
  );
}
