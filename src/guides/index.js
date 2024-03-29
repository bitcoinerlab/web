import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import Nav from './nav';
import NotFound from '../notfound';
import StandardTransactions from './standardTransactions';
import MiniscriptVault from './miniscriptVault';
import LedgerProgramming from './ledgerProgramming';
import MultiSigFallbackTimelock from './multisigFallbackTimelock';
const Guides = () => (
  <div className="nav-article">
    <Nav />
    <article>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h1>Guides</h1>
              <p>Welcome to our guides section!</p>
              <p>Check out the available guides and playgrounds below:</p>
              <ul>
                <li>
                  <Link to="/guides/standard-transactions">
                    Standard Transactions
                  </Link>
                  , for learning how to create a Bitcoin transaction that moves
                  funds from/to standard Bitcoin outputs such as P2PKH and
                  P2WPKH.
                </li>
                <li>
                  <Link to="/guides/miniscript-vault">
                    Timelock Vault with Miniscript
                  </Link>
                  , for creating a Bitcoin TimeLocked Vault using Miniscript,
                  protecting users against extortion and coin theft.
                </li>
                <li>
                  <Link to="/guides/ledger-programming">
                    Ledger Programming
                  </Link>
                  , for how to program a Ledger Nano device, including using
                  Miniscript.
                </li>
                <li>
                  <Link to="/guides/multisig-fallback-timelock">
                    Programming Miniscript with Lunaticoin (Spanish)
                  </Link>
                  , for a recorded video programming session (in Spanish) with{' '}
                  <a href="https://lunaticoin.com/">Lunaticoin</a>, a Bitcoin
                  expert, educator, and advocate. Learn how to create a MultiSig
                  wallet with a time-locked fallback address.
                </li>
              </ul>
            </div>
          }
        ></Route>
        <Route path="/ledger-programming" element={<LedgerProgramming />} />
        <Route
          path="/standard-transactions"
          element={<StandardTransactions />}
        />
        <Route path="/miniscript-vault" element={<MiniscriptVault />} />
        <Route
          path="/multisig-fallback-timelock"
          element={<MultiSigFallbackTimelock />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </article>
  </div>
);

export default Guides;
