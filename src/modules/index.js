import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import Nav from './nav';
import Descriptors from './descriptors';
import Miniscript from './miniscript';
import Secp256k1 from './secp256k1';
import NotFound from '../notfound';

const Modules = () => (
  <div className="nav-article">
    <Nav />
    <article>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h1>Modules</h1>
              <p>Some modules have already been implemented and published.</p>
              <ul>
                <li>
                  <Link to="/modules/descriptors">Descriptors</Link>, which
                  enables parsing and signing complex wallet structures such as
                  multi-sig or timelocks. It allows signing with Software and
                  some Hardware Wallets.
                </li>
                <li>
                  <Link to="/modules/miniscript">Miniscript</Link>, which
                  provides a simple way to describe and work with complex
                  Bitcoin scripts.
                </li>
                <li>
                  <Link to="/modules/secp256k1">Secp256k1</Link>, for elliptic
                  curve operations on the secp256k1 curve.
                </li>
              </ul>
              <p>
                Several other modules are in the final stages of development.
                These include:
              </p>
              <ul>
                <li>
                  <Link to="/modules/discovery">Discovery</Link>, which allows
                  for the retrieval of funds from Bitcoin nodes.
                </li>
                <li>
                  <Link to="/modules/explorer">Explorer</Link>, which provides
                  access to Electrum and Esplora servers.
                </li>
                <li>
                  <Link to="/modules/coinselect">Coinselect</Link>, which helps
                  in the selection of utxos.
                </li>
                <li>
                  <Link to="/modules/fees">Fees</Link>, which estimates
                  transaction fees.
                </li>
              </ul>
              <p>
                Together, these modules make it easier to develop Bitcoin
                applications.
              </p>
            </div>
          }
        ></Route>
        <Route path="/descriptors" element={<Descriptors />}></Route>
        <Route path="/miniscript" element={<Miniscript />}></Route>
        <Route path="/secp256k1" element={<Secp256k1 />}></Route>
        <Route
          path="/discovery"
          element={
            <div>
              <h3>Discovery</h3>
              <p>
                This module allows for the retrieval of funds from Bitcoin
                nodes.
              </p>
              <p>
                It is still in development and not yet ready for use in
                production, but you can preview it on Github:{' '}
                <a href="https://github.com/bitcoinerlab/farvault-lib/blob/main/src/discovery.js">
                  src/discovery.js
                </a>
              </p>
            </div>
          }
        ></Route>

        <Route
          path="/explorer"
          element={
            <div>
              <h3>Explorer</h3>
              <p>
                This module provides access to Electrum and Esplora servers.
              </p>
              <p>
                It is still in development and not yet ready for use in
                production, but you can preview it on Github:{' '}
                <a href="https://github.com/bitcoinerlab/farvault-lib/blob/main/src/explorer">
                  src/explorer
                </a>
              </p>
            </div>
          }
        ></Route>
        <Route
          path="/coinselect"
          element={
            <div>
              <h3>Coinselect</h3>
              <p>This module helps in the selection of utxos.</p>
              <p>
                It is still in development and not yet ready for use in
                production, but you can preview it on Github:{' '}
                <a href="https://github.com/bitcoinerlab/farvault-lib/blob/main/src/coinselect.js">
                  src/coinselect.js
                </a>
              </p>
            </div>
          }
        ></Route>

        <Route
          path="/fees"
          element={
            <div>
              <h3>Fees</h3>
              <p>This module estimates transaction fees.</p>
              <p>
                It is still in development and not yet ready for use in
                production, but you can preview it on Github:{' '}
                <a href="https://github.com/bitcoinerlab/farvault-lib/blob/main/src/fees.js">
                  src/fees.js
                </a>
              </p>
            </div>
          }
        ></Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </article>
  </div>
);

export default Modules;
