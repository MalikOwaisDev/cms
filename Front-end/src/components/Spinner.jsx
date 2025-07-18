import React from "react";

const Spinner = () => {
  return (
    <>
      <div className="flex justify-center items-center p-16">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#FE4982] rounded-full animate-spin"></div>
      </div>
    </>
  );
};

export default Spinner;
