import React from 'react';

const Home = () => (
  <>
    <section className="home">
      <p>
        BitcoinerLAB is a set of Javascript modules that allow creating Bitcoin
        wallets. So far <code>@bitcoinerlab/miniscript</code> is already
        implemented. And new modules are coming including{' '}
        <code>@bitcoinerlab/descriptors</code> (an easy way to express complex
        scripts), <code>@bitcoinerlab/discovery</code> (to retrieve funds from
        the blockchain nodes), <code>@bitcoinerlab/explorer</code> (Electrum and
        Esplora clients).
      </p>
      <p>
        All these modules have been developed while creating the{' '}
        <a href="https://github.com/farvault/">FarVault</a>. FarVault is a A
        javascript Bitcoin cold storage time-lock wallet for Node.js, browsers
        and React-Native compatible. Since this is convenient code, it was
        decided to share them to the community.
      </p>
    </section>
    <section className="about">
      <h3>About the author</h3>
      <div className="card">
        <img src="https://github.com/landabaso.png" alt="Jose-Luis Landabaso" />
        <h4>Jose-Luis Landabaso</h4>
        <h5>@landabaso</h5>
        <p>Telecom Eng. PhD in Signal Processing.</p>
        <p>
          Bitcoin dev building{' '}
          <a href="https://github.com/farvault/">FarVault</a>, a cold storage
          time-lock wallet that helps protect users from coin theft & extortion.
          <br />
          I'm also the guy behind{' '}
          <a href="https://labolsavirtual.com/">LaBolsaVirtual.com</a>.
        </p>
        <div className="socialButtons">
          <a className="social twitter" href="https://twitter.com/landabaso">
            TWITTER
          </a>
          <a className="social github" href="https://github.com/landabaso">
            GITHUB
          </a>
        </div>
      </div>
    </section>
  </>
);

export default Home;
