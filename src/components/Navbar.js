import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <svg viewBox="0 0 32 32" fill="none">
          <circle cx="10" cy="16" r="7" fill="black" />
          <circle cx="22" cy="16" r="7" fill="black" />
          <circle cx="16" cy="16" r="5" fill="black" />
          <rect x="6" y="14" width="20" height="4" rx="2" fill="black" />
        </svg>
        <span>PrimalTraining</span>
      </Link>
      <div className="nav-links">
        <Link to="/">HOME</Link>
        <Link to="/exercises">EXERCISES</Link>
        <Link to="/login" className="nav-btn">LOG IN</Link>
      </div>
    </nav>
  );
}

export default Navbar;
