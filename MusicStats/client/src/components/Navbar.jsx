import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  IoMusicalNotes,
  IoHome,
  IoPeople,
  IoDisc,
  IoMic,
  IoGrid,
  IoGlobe,
  IoSearch,
  IoMenu,
  IoClose,
} from 'react-icons/io5';
import './Navbar.css';

const navLinks = [
  { to: '/', label: 'Home', icon: <IoHome /> },
  { to: '/artists', label: 'Artists', icon: <IoPeople /> },
  { to: '/albums', label: 'Albums', icon: <IoDisc /> },
  { to: '/songs', label: 'Songs', icon: <IoMic /> },
  { to: '/genres', label: 'Genres', icon: <IoGrid /> },
  { to: '/countries', label: 'Countries', icon: <IoGlobe /> },
  { to: '/search', label: 'Search', icon: <IoSearch /> },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="navbar-mobile-header">
        <div className="navbar-brand-mobile">
          <IoMusicalNotes className="navbar-logo-icon" />
          <span>MusicStats</span>
        </div>
        <button
          className="navbar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <IoClose /> : <IoMenu />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className="navbar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <nav className={`navbar-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="navbar-brand">
          <IoMusicalNotes className="navbar-logo-icon" />
          <span className="navbar-brand-text">MusicStats</span>
        </div>

        <ul className="navbar-links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <span className="navbar-link-icon">{link.icon}</span>
                <span className="navbar-link-label">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-footer">
          <p>© 2025 MusicStats</p>
        </div>
      </nav>
    </>
  );
}
