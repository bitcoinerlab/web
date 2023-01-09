import React, { useState, useRef } from 'react';
import Embed from 'react-runkit';

const source = `const ecc = require('@bitcoinerlab/secp256k1');
const { BIP32Factory } = require('bip32');
const { ECPairFactory } = require('ecpair');
const BIP32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

const keyPair1 = ECPair.fromWIF(
  'KynD8ZKdViVo5W82oyxvE18BbG6nZPVQ8Td8hYbwU94RmyUALUik'
);
const node = BIP32.fromBase58(
  'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi'
);

( { keyPair1, node } ); //Show results
`;

const Secp256k1 = () => {
  const [runkitHeight, setRunkitHeight] = useState(130);

  //The parent div
  const runkitRef = useRef(null);
  //The runkit itself
  const embedRef = useRef(null);

  const run = () => embedRef.current.evaluate();

  const runkitEvaluated = () => {
    //Keep the largest height so that it does not flicker
    setRunkitHeight(runkitRef.current.offsetHeight);
  };

  return (
    <div>
      <h3>Secp256k1</h3>
      <p>
        This project is a Javascript library for performing elliptic curve
        operations on the secp256k1 curve. It is designed to integrate into the{' '}
        <a href="https://github.com/bitcoinjs">BitcoinJS</a> and{' '}
        <a href="https://bitcoinerlab.com">BitcoinerLAB</a> ecosystems and uses
        the audited{' '}
        <a href="https://github.com/paulmillr/noble-secp256k1">
          noble-secp256k1 library
        </a>
        , created by <a href="https://paulmillr.com/noble/">Paul Miller</a>.
      </p>
      <p>
        This library is compatible with environments that do not support
        WebAssembly, such as React Native.
      </p>
      <h4>Features</h4>
      <ul>
        <li>
          Compatible with BitcoinJS{' '}
          <a href="https://github.com/bitcoinjs/ecpair">ecpair</a> and{' '}
          <a href="https://github.com/bitcoinjs/bip32">bip32</a> Factory
          functions.
        </li>
        <li>
          Based on audited code{' '}
          <a href="https://github.com/paulmillr/noble-secp256k1">
            @noble/secp256k1
          </a>
          .
        </li>
        <li>
          Can be used in environments that do not support WASM, such as React
          Native.
        </li>
        <li>
          Uses the same tests as{' '}
          <a href="https://github.com/bitcoinjs/tiny-secp256k1">
            tiny-secp256k1
          </a>
          .
        </li>
      </ul>
      <h4>Documentation</h4>
      <p>
        This module has detailed documentation available on{' '}
        <a href="https://github.com/bitcoinerlab/secp256k1">
          its Github repository
        </a>
        . In addition, you can use the playground below to experiment with the
        module and try out its features.
      </p>
      <h4>Playground</h4>
      <div
        className="runkit"
        ref={runkitRef}
        style={{ minHeight: runkitHeight + 'px' }}
      >
        <Embed
          gutterStyle="inside"
          source={source}
          ref={embedRef}
          onLoad={run}
          onEvaluate={runkitEvaluated}
          nodeVersion=">=12"
        />
      </div>
    </div>
  );
};

export default Secp256k1;
