import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Nav from './nav';

const Modules = () => (
  <div className="modules">
    <Nav />
    <article>
      <Routes>
        <Route
          path=""
          element={
            <div>
              Parent
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          }
        ></Route>
        <Route
          path="miniscript"
          element={
            <div>
              <h3>@bitcoinerlab/miniscript</h3>
              <p>
                This module provides a Bitcoin miniscript compiler and
                satisfyer.
              </p>
            </div>
          }
        ></Route>
        <Route
          path="descriptors"
          element={
            <div>
              <h3>@bitcoinerlab/descriptors</h3>
              <p>
                This module provides an easy way to express complex scripts.
              </p>
            </div>
          }
        ></Route>
        <Route
          path="discovery"
          element={
            <div>
              <h3>@bitcoinerlab/discovery</h3>
              <p>
                This module allows you to retrieve funds from the blockchain
                nodes.
              </p>
            </div>
          }
        ></Route>
        <Route
          path="explorer"
          element={
            <div>
              <h3>@bitcoinerlab/explorer</h3>
              <p>This module provides Electrum and Esplora clients.</p>
            </div>
          }
        ></Route>
      </Routes>
    </article>
  </div>
);

export default Modules;
