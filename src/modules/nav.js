import React from 'react';
import { NavLink } from 'react-router-dom';

const Nav = () => {
  const links = [
    { path: '/modules/descriptors', label: 'Descriptors' },
    { path: '/modules/miniscript', label: 'Miniscript' },
    { path: '/modules/discovery', label: 'Discovery' },
    { path: '/modules/explorer', label: 'Explorer' },
    { path: '/modules/secp256k1', label: 'Secp256k1' },
    { path: '/modules/coinselect', label: 'Coinselect' },
  ];

  return (
    <nav>
      <ul>
        {links.map(link => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) => (isActive ? 'selected' : undefined)}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Nav;
