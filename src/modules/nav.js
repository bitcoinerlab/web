import React from 'react';
import { NavLink } from 'react-router-dom';

const Nav = () => {
  const links = [
    { path: '/modules/miniscript', label: 'Miniscript' },
    { path: '/modules/descriptors', label: 'Descriptors' },
    { path: '/modules/discovery', label: 'Discovery' },
    { path: '/modules/explorer', label: 'Explorer' },
    { path: '/modules/hdsigner', label: 'HDSigner' },
    { path: '/modules/coinselect', label: 'Coinselect' },
    { path: '/modules/fees', label: 'Fees' },
    { path: '/modules/transactions', label: 'Transactions' }
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
