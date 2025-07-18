import React from "react";

const Footer = () => {
  return (
    <div className="w-full text-center p-6 mt-10">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} MindfulTrust Care & Services. All
        Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
