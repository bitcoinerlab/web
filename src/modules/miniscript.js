import React, { useState, useRef } from 'react';
import Embed from 'react-runkit';

const policies = [
  { policy: 'pk(key_1)', description: 'A single key' },
  {
    policy: 'or(pk(key_1),pk(key_2))',
    description: 'One of two keys (equally likely)'
  },
  {
    policy: 'or(pk(key_1),pk(key_2))',
    description:
      'One of two keys (equally likely) - with unknown private key_2',
    unknowns: ['<sig(key_2)>']
  },
  {
    policy: 'or(99@pk(key_likely),pk(key_unlikely))',
    description: 'One of two keys (one likely, one unlikely)'
  },
  {
    policy: 'or(99@pk(key_likely),pk(key_unlikely))',
    description:
      'One of two keys (one likely, one unlikely) - with unknown unlikely private key',
    unknowns: ['<sig(key_unlikely)>']
  },
  {
    policy: 'and(pk(key_user),or(99@pk(key_service),older(12960)))',
    description:
      'A user and a 2FA service need to sign off, but after 90 days the user alone is enough'
  },
  {
    policy: 'thresh(3,pk(key_1),pk(key_2),pk(key_3),older(12960))',
    description: 'A 3-of-3 that turns into a 2-of-3 after 90 days'
  },
  {
    policy: 'or(pk(key_revocation),and(pk(key_local),older(1008)))',
    description: 'The BOLT #3 to_local policy'
  },
  {
    policy:
      'or(pk(key_revocation),and(pk(key_remote),or(pk(key_local),hash160(H))))',
    description: 'The BOLT #3 offered HTLC policy'
  },
  {
    policy:
      'or(pk(key_revocation),and(pk(key_remote),or(pk(key_local),hash160(H))))',
    description:
      'The BOLT #3 offered HTLC policy - with no known preimage or revocation private key',
    unknowns: ['<hash160_preimage(H)>', '<sig(key_revocation)>']
  },
  {
    policy:
      'or(pk(key_revocation),and(pk(key_remote),or(and(pk(key_local),hash160(H)),older(1008))))',
    description: 'The BOLT #3 received HTLC policy'
  }
];
const buildSource = (
  policy,
  description,
  unknowns = []
) => `//Edit this code as you wish and then click on "run" below

//npm install @bitcoinerlab/miniscript
const { compilePolicy, compileMiniscript, satisfier } =
  require("@bitcoinerlab/miniscript");

//${description}
const policy = "${policy}";
${
  !unknowns.length
    ? ''
    : `const unknowns = ${JSON.stringify(unknowns)};
`
}
const { miniscript, asm, issane } = compilePolicy(policy);
//const { asm, issane } = compileMiniscript(miniscript);

if (issane) {
  const { nonMalleableSats, malleableSats${
    unknowns.length ? ', unknownSats' : ''
  } } = satisfier( miniscript${unknowns.length ? ', unknowns' : ''} );
  ({ miniscript, asm, nonMalleableSats, malleableSats${
    unknowns.length ? ', unknownSats' : ''
  } }); //Show results
}`;

const WuillesDemos = ({ setSource }) => {
  return (
    <ul className="wuillesDemos">
      {policies.map(({ policy, description, unknowns }) => (
        <li key={description}>
          <a
            onClick={() =>
              setSource(buildSource(policy, description, unknowns))
            }
          >
            {description}
          </a>
        </li>
      ))}
    </ul>
  );
};

const Miniscript = () => {
  const [source, setSource] = useState(
    buildSource(
      policies[0].policy,
      policies[0].description,
      policies[0].unknowns
    )
  );
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
      <h3>Miniscript</h3>
      <p>
        This project is a JavaScript implementation of{' '}
        <a href="https://bitcoin.sipa.be/miniscript/">Bitcoin Miniscript</a>, a
        high-level language for describing Bitcoin spending conditions.
      </p>
      <p>
        It includes a novel Miniscript Satisfier for generating explicit witness
        scripts that are decoupled from the tx signer, as well as a
        transpilation of{' '}
        <a href="https://github.com/sipa/miniscript">Peter Wuille's C++ code</a>{' '}
        for compiling spending policies into Miniscript and Bitcoin scripts.
      </p>
      <h4>Features</h4>
      <ul>
        <li>Compile Policies into Miniscript and Bitcoin scripts.</li>
        <li>
          A Miniscript Satisfier that discards malleable solutions and is able
          to generate explicit witness scripts from Miniscripts using variables,
          such as <code>pk(key)</code>.
        </li>
      </ul>
      <h4>Documentation</h4>
      <p>
        This module has detailed documentation available on{' '}
        <a href="https://github.com/bitcoinerlab/miniscript">
          its Github repository
        </a>
        . In addition, you can use the playground on this page to experiment
        with the module and try out its features.
      </p>
      <h4>Playground</h4>
      Let's consider the policies used for demonstration in{' '}
      <a href="https://bitcoin.sipa.be/miniscript/">Wuille's paper</a> and add
      some more that include unknown pieces of information (referred to as{' '}
      <code>unknowns</code>).
      <WuillesDemos
        setSource={source => {
          setSource(source);
          run();
        }}
      />
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
        />
      </div>
    </div>
  );
};

export default Miniscript;
