import React from "react";
import { Route, Routes, Link } from "react-router-dom";
import Nav from "./nav";
import ReactMarkdownSyntax from "../ReactMarkdownSyntax";
import DocsAndAPI from "./DocsAndAPI";
import Miniscript from "./miniscript";
import Secp256k1 from "./secp256k1";
import NotFound from "../notfound";

import explorerReadme from "../../dist/public/docs/explorer/README.md";
import discoveryReadme from "../../dist/public/docs/discovery/README.md";
import coinselectReadme from "../../dist/public/docs/coinselect/README.md";
import descriptorsReadme from "../../dist/public/docs/descriptors/README.md";

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
              <p>
                All the modules listed below have been implemented and are
                available for use:
              </p>

              <ul>
                <li>
                  <Link to="/modules/descriptors">Descriptors</Link>, a
                  versatile tool for parsing Bitcoin Descriptors, including
                  Miniscript language constructs. This module facilitates the
                  creation of Outputs and the generation of Partially Signed
                  Bitcoin Transactions (PSBTs). It integrates BIP32,
                  single-signature, and Hardware Wallet signing capabilities,
                  and also enables the finalization of transactions prior to
                  network submission.
                </li>
                <li>
                  <Link to="/modules/discovery">Discovery</Link>, a module
                  enabling the retrieval of data from the Bitcoin network. It
                  supports querying blockchain information using Bitcoin
                  descriptors syntax, streamlining access to essential data like
                  balance, UTXOs, and transaction history.
                </li>
                <li>
                  <Link to="/modules/coinselect">Coinselect</Link>, designed for
                  Bitcoin transaction management. It leverages Bitcoin
                  Descriptors to define inputs and outputs, enabling optimal
                  UTXO (Unspent Transaction Output) selection and accurate
                  transaction size calculations.
                </li>
                <li>
                  <Link to="/modules/miniscript">Miniscript</Link>, offering an
                  intuitive approach to handling complex Bitcoin scripts.
                  Essential to the ecosystem, this module is integrated into
                  most of the other modules.
                </li>
                <li>
                  <Link to="/modules/explorer">Explorer</Link>, offering
                  seamless access to Electrum and Esplora servers. This module
                  establishes a unified interface utilized by the
                  @bitcoinerlab/discovery module for retrieving network data
                  across various protocols.
                </li>
                <li>
                  <Link to="/modules/secp256k1">Secp256k1</Link>, specializing
                  in elliptic curve operations on the secp256k1 curve. This
                  foundational module underpins the majority of other modules,
                  providing essential low-level cryptographic functionality.
                </li>
              </ul>
              <p>
                Together, these modules provide comprehensive tools for
                developing Bitcoin applications, making it easier to create
                Miniscript-enabled wallets and apps.
              </p>
            </div>
          }
        ></Route>
        <Route
          path="/descriptors/*"
          element={
            <DocsAndAPI
              API="descriptors"
              docs={
                <div className="breakWord">
                  <ReactMarkdownSyntax>{descriptorsReadme}</ReactMarkdownSyntax>
                </div>
              }
            />
          }
        ></Route>
        <Route
          path="/discovery/*"
          element={
            <DocsAndAPI
              API="discovery"
              docs={
                <div className="breakWord">
                  <ReactMarkdownSyntax>{discoveryReadme}</ReactMarkdownSyntax>
                </div>
              }
            />
          }
        ></Route>
        <Route
          path="/coinselect/*"
          element={
            <DocsAndAPI
              API="coinselect"
              docs={
                <div className="breakWord">
                  <ReactMarkdownSyntax>{coinselectReadme}</ReactMarkdownSyntax>
                </div>
              }
            />
          }
        ></Route>
        <Route
          path="/explorer/*"
          element={
            <DocsAndAPI
              API="explorer"
              docs={
                <div className="breakWord">
                  <ReactMarkdownSyntax>{explorerReadme}</ReactMarkdownSyntax>
                </div>
              }
            />
          }
        ></Route>
        {/*<Route path="/miniscript" element={<Miniscript />}></Route>*/}
        <Route
          path="/miniscript/*"
          element={<DocsAndAPI API="miniscript" docs={<Miniscript />} />}
        ></Route>
        <Route path="/secp256k1" element={<Secp256k1 />}></Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </article>
  </div>
);

export default Modules;
