import React from 'react';
import { Link } from 'react-router-dom';

const Nav = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/modules/miniscript">Miniscript</Link>
        </li>
        <li>
          <Link to="/modules/descriptors">Descriptors</Link>
        </li>
        <li>
          <Link to="/modules/discovery">Discovery</Link>
        </li>
        <li>
          <Link to="/modules/explorer">Explorer</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
