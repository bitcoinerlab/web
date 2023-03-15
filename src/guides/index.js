import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import Nav from './nav';
import NotFound from '../notfound';
import LedgerProgramming from './ledgerProgramming';
import StandardTransactions from './standardTransactions';

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
              <p>
                Welcome to our guides section! We will be adding more guides
                here as we write them, so stay tuned!
              </p>
              <p>
                In the meanwhile, we don't have complete guides, but we have a
                couple of code playgrounds that you can use to play with running
                code, including Ledger signing.
              </p>
              <p>Check out the available guides and playgrounds below:</p>
              <ul>
                <li>
                  <Link to="/guides/standard-transactions">
                    Standard Transactions
                  </Link>
                </li>
                <li>
                  <Link to="/guides/ledger-programming">
                    Ledger Programming
                  </Link>
                </li>
              </ul>
              <p>
                These and other guides are in the final stages of development.
              </p>
            </div>
          }
        ></Route>
        <Route path="/ledger-programming" element={<LedgerProgramming />} />
        <Route
          path="/standard-transactions"
          element={<StandardTransactions />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </article>
  </div>
);

export default Guides;
