import React, { useState, useRef } from 'react';
import Playground from '../Playground';

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

//npm install @bitcoinerlab/miniscript @bitcoinerlab/miniscript-policies
const { compilePolicy, ready } = require("@bitcoinerlab/miniscript-policies");
const { compileMiniscript, satisfier } = require("@bitcoinerlab/miniscript");

await ready;

//${description}
const policy = "${policy}";
${
  !unknowns.length
    ? ''
    : `const unknowns = ${JSON.stringify(unknowns)};
`
}
const { miniscript } = compilePolicy(policy);
const { asm, issane } = compileMiniscript(miniscript);

if (issane) {
  // Debugging: computeUnknowns is true to surface pruned solutions.
  const { nonMalleableSats, malleableSats${
    unknowns.length ? ', unknownSats' : ''
  } } = satisfier( miniscript${
    unknowns.length
      ? ', { unknowns, computeUnknowns: true }'
      : ', { computeUnknowns: true }'
  } );
  console.log({ miniscript, asm, nonMalleableSats, malleableSats${
    unknowns.length ? ', unknownSats' : ''
  } });
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
  const [playgroundHeight, setPlaygroundHeight] = useState(130);

  //The parent div
  const playgroundContainerRef = useRef(null);
  //The playground itself
  const playgroundRef = useRef(null);

  const run = nextSource => {
    if (playgroundRef.current) {
      playgroundRef.current.evaluate(nextSource);
    }
  };

  const onLoad = () => run();

  const playgroundEvaluated = () => {
    if (!playgroundContainerRef.current) return;
    setPlaygroundHeight(height =>
      Math.max(height, playgroundContainerRef.current.offsetHeight)
    );
  };
  return (
    <div>
      <h1>Miniscript</h1>
      <p>
        This project is a TypeScript implementation of{' '}
        <a href="https://bitcoin.sipa.be/miniscript/">Bitcoin Miniscript</a>, a
        structured language for describing Bitcoin spending conditions.
      </p>
      <p>
        It includes a compiler and static analyzer, plus a signer-agnostic
        satisfier that produces symbolic witness stacks (for example{' '}
        <code>&lt;sig(key)&gt; &lt;sha256_preimage(H)&gt;</code>), so you can
        reason about valid spends without private keys.
      </p>
      <h2>Features</h2>
      <ul>
        <li>Compile Miniscript into Bitcoin script (ASM).</li>
        <li>
          Analyze Miniscript for sanity and malleability via the static type
          system.
        </li>
        <li>
          Generate symbolic witness stacks with <code>satisfier</code>,
          including non-malleable solutions.
        </li>
        <li>
          Tapscript support.
        </li>
      </ul>
      <h2>Documentation</h2>
      <p>
        This module has detailed documentation available on{' '}
        <a href="https://github.com/bitcoinerlab/miniscript">
          its Github repository
        </a>
        . For a complete understanding and the latest API, please read the
        official README. In addition, you can use the playground on this page
        to experiment with the module and try out its features.
      </p>
      <h2>Playground</h2>
      Let's consider the policies used for demonstration in{' '}
      <a href="https://bitcoin.sipa.be/miniscript/">Wuille's paper</a> and add
      some more that include unknown pieces of information (referred to as{' '}
      <code>unknowns</code>).
      <WuillesDemos
        setSource={nextSource => {
          setSource(nextSource);
          run(nextSource);
        }}
      />
      <div
        className="runkit"
        ref={playgroundContainerRef}
        style={{ minHeight: playgroundHeight + 'px' }}
      >
        <Playground
          source={source}
          onSourceChange={setSource}
          ref={playgroundRef}
          onLoad={onLoad}
          onEvaluate={playgroundEvaluated}
        />
      </div>
    </div>
  );
};

export default Miniscript;
