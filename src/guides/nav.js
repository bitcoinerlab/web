import React from "react";
import { NavLink } from "react-router-dom";

const Nav = () => {
  const links = [
    { path: "/guides/standard-transactions", label: "Standard Transactions" },
    {
      path: "/guides/miniscript-vault",
      label: "TimeLocked Vault with Miniscript",
    },
    {
      path: "/guides/p2a",
      label: "Zero-Fee Transactions: TRUC and P2A",
    },
    { path: "/guides/ledger-programming", label: "Programming a Ledger Nano" },
    {
      path: "/guides/multisig-fallback-timelock",
      label: "Miniscript with Lunaticoin (Spanish)",
    },
  ];

  return (
    <nav>
      <ul>
        {links.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) => (isActive ? "selected" : undefined)}
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
