   
import React from 'react';

type Props = {
  error?: any;
};


  
function Error({error}:Props){

    return(
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
      <div className="bg-gradient-to-br from-red-500/10 to-red-900/20 border border-red-500/30 shadow-2xl rounded-2xl px-8 py-6 text-center w-[90%] max-w-md animate-fadeIn">
        
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-500/20 p-3 rounded-full">
            ❌
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-red-400">
          Join Failed 
        </h2>

        {/* Message */}
        <p className="mt-3 text-red-300 text-sm">
          {error}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-center mt-6">
          
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 shadow-lg hover:scale-105"
          >
            Try Again
          </button>

          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="px-5 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all duration-200"
          >
            Go Home
          </button>

        </div>
      </div>
    </div>
    )
  
}

export{
  Error
}