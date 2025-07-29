import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center flex-col h-screen bg-[#212121] text-stone-300 px-6">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-red-500 mb-4 animate-pulse">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Oops! The page you're looking for doesn’t exist.
        </h2>
        <p className="text-lg md:text-xl text-stone-400 mb-8">
          It might have been moved or deleted.
        </p>
        <Link to="/">
          <button className="px-6 py-2 text-lg transition-all duration-500 hover:scale-105 hover:text-black hover:bg-stone-200 bg-[#414141]  rounded border border-stone-500">
            Go Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
