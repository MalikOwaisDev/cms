import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1D2056]">
      {/* You can replace this with your actual logo component */}
      <div className="bg-white/10 w-24 h-24 rounded-full mb-6 flex items-center justify-center">
        <p className="text-white font-bold text-sm">LOGO</p>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-[#FE4982] animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-[#FE4982] animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-[#FE4982] animate-pulse"></div>
      </div>
      <p className="text-white/80 text-lg mt-4">
        Preparing the future of care...
      </p>
    </div>
  );
};

export default Loader;
