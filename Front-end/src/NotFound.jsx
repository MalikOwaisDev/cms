import React from "react";
import { HomeIcon, AlertTriangleIcon } from "./Icons";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const NotFound = () => {
  document.title = "Page Not Found | Care Management System";
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1D2056] text-white ">
      <div className="text-center p-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#FE4982] mb-8">
          <AlertTriangleIcon size={50} />
        </div>
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-2">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-lg text-white/70 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#FE4982] text-white font-bold py-3 px-6 rounded-lg
                   hover:bg-[#E03A6D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1D2056] focus:ring-[#FE4982]
                   transition-all duration-300 ease-in-out"
        >
          <HomeIcon />
          <span>Go to Homepage</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
