import React from "react";
import Button from "./Button";

function Navbar({ openAuth }) {
  return (
    <header className="sticky top-0 ">
      <nav className="px-[100px] py-[20px] flex items-center justify-between">
        <div className="text-xl font-bold">
          <span>
            <img src="" alt="Logo" />
          </span>
          <span className="text-primary"> TripLink</span>
        </div>
        <ul className="flex space-x-6">
          <li>
            <a href="#" className="hover:text-primary">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-primary">
              Destinations
            </a>
          </li>
        </ul>

        <button onClick={openAuth} className="bg-primary rounded-md text-white px-5 py-2 hover:scale-[1.02]  transition-transform shadow-md">
          Sign up / Sign in
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
