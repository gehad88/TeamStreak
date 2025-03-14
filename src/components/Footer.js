import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="font-medium text-indigo-600">TeamTrack</div>
            <div className="text-sm text-gray-500">
              Build habits together, achieve more
            </div>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">
              Help Center
            </a>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} TeamTrack. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;