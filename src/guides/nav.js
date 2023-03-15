import React from 'react';
import { NavLink } from 'react-router-dom';

const Nav = () => {
  const links = [
    { path: '/guides/standard-transactions', label: 'Standard Transactions' },
    //{ path: '/guides/miniscript', label: 'Descriptors & Miniscript' },
    { path: '/guides/ledger-programming', label: 'Programming a Ledger Nano' }
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
