import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const handleTryNow = () => navigate('/modules/descriptors');
  return (
    <>
      <section className="home">
        <p>
          BitcoinerLAB simplifies the Bitcoin development process by providing a
          set of Javascript modules that enable the creation of Bitcoin
          applications.
        </p>
        <button onClick={handleTryNow}>Try it now!</button>
        <p>
          The development of these modules began while creating{' '}
          <a href="https://github.com/bitcoinerlab/farvault-lib">FarVault</a>, a
          Javascript Bitcoin cold storage time-lock wallet. These modules have
          already been implemented in some form, but are now being refactored
          for better modularization and reuse. The goal is to share these
          modules with the community to facilitate the development of other
          Bitcoin applications and wallets.
        </p>
      </section>
      <section className="about">
        <h3>About the author</h3>
        <div className="card">
          <img
            src="https://github.com/landabaso.png"
            alt="Jose-Luis Landabaso"
          />
          <h4>Jose-Luis Landabaso</h4>
          <h5>@landabaso</h5>
          <p>Telecom Eng. PhD in Computer Vision.</p>
          <p>
            Bitcoin dev building{' '}
            <a href="https://github.com/bitcoinerlab/farvault-lib">FarVault</a>,
            a cold storage time-lock wallet that helps protect users from coin
            theft & extortion.
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
};

export default Home;
