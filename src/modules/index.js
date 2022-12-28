import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import Nav from './nav';
import Miniscript from './miniscript';

const Modules = () => (
  <div className="modules">
    <Nav />
    <article>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <p>
                The <Link to="/modules/miniscript">Miniscript module</Link> has
                already been implemented which provides a simple way to describe
                and work with complex Bitcoin scripts.
              </p>
              <p>
                Several other modules are in the final stages of development.
                These include:
              </p>
              <ul>
                <li>
                  <Link to="/modules/descriptors">Descriptors</Link>, which
                  enables the expression of complex wallet structures such as
                  multi-sig or timelocks.
                </li>
                <li>
                  <Link to="/modules/discovery">Discovery</Link>, which allows
                  for the retrieval of funds from Bitcoin nodes.
                </li>
                <li>
                  <Link to="/modules/explorer">Explorer</Link>, which provides
                  access to Electrum and Esplora servers.
                </li>
                <li>
                  <Link to="/modules/hdsigner">HDSigner</Link>, which enables
                  hierarchical deterministic signing with software and hardware
                  devices like Ledger Nano.
                </li>
                <li>
                  <Link to="/modules/coinselect">Coinselect</Link>, which helps
                  in the selection of utxos.
                </li>
                <li>
                  <Link to="/modules/fees">Fees</Link>, which estimates
                  transaction fees.
                </li>
                <li>
                  <Link to="/modules/transactions">Transactions</Link>, which
                  constructs and signs transactions.
                </li>
              </ul>
              <p>
                Together, these modules make it easier to develop Bitcoin
                applications.
              </p>
            </div>
          }
        ></Route>
        <Route path="/miniscript" element={<Miniscript />}></Route>
        <Route
          path="/descriptors"
          element={
            <div>
              <h3>Descriptors</h3>
              <p>
                This module provides an easy way to express complex wallet
                structures such as multi-sig or timelocks.
              </p>
              <p>
                It is currently in development and not yet ready for use in
                production, but you can preview it on Github:{' '}
                <a href="https://github.com/bitcoinerlab/farvault-lib/blob/descriptors/src/descriptors.js">
                  src/descriptors.js
                </a>
              </p>
            </div>
          }
        ></Route>
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
          path="/hdsigner"
          element={
            <div>
              <h3>HDSigner</h3>
              <p>
                This module enables hierarchical deterministic signing with
                software and hardware devices like Ledger Nano.
              </p>
              <p>
                It is still in development and not yet ready for use in
                production, but you can preview it on Github:{' '}
                <a href="https://github.com/bitcoinerlab/farvault-lib/tree/main/src/HDSigner">
                  src/HDSigner
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
        <Route
          path="/transactions"
          element={
            <div>
              <h3>Transactions</h3>
              <p>This module constructs and signs transactions.</p>
              <p>
                It is still in development and not yet ready for use in
                production, but you can preview it on Github:{' '}
                <a href="https://github.com/bitcoinerlab/farvault-lib/blob/main/src/transactions.js">
                  src/transactions.js
                </a>
              </p>
            </div>
          }
        ></Route>
      </Routes>
    </article>
  </div>
);

export default Modules;
