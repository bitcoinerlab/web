import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const handleTryNow = () => navigate("/guides");
  return (
    <>
      <section className="home">
        <p>
          BitcoinerLAB simplifies the Bitcoin development process by providing a
          set of TypeScript modules that enable the creation of Bitcoin
          applications.
        </p>
        <button onClick={handleTryNow}>Try it now!</button>
        <p>
          The development of these modules began while creating{" "}
          <a href="https://rewindbitcoin.com">RewindBitcoin</a>, a cold storage
          time-lock wallet. The goal is to share these modules with the
          community to facilitate the development of other Bitcoin applications
          and wallets.
        </p>
      </section>
      <section className="support">
        <div className="support-card">
          <a className="support-link" href="https://opensats.org">
            <span className="support-logo" aria-hidden="true" />
            Supported by <span className="support-brand">OpenSats</span>
          </a>
        </div>
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
            Developing{' '}
            <a href="https://rewindbitcoin.com">RewindBitcoin</a>, a Wallet that
            reverts theft & extortion. Open-sourcing the libs via{' '}
            <a href="https://bitcoinerlab.com">BitcoinerLab.com</a>.
            <br />
            Also, I'm the guy behind{' '}
            <a href="https://labolsavirtual.com/">La Bolsa Virtual</a>.
          </p>
          <div className="socialButtons">
            <a className="social x" href="https://x.com/landabaso">
              x.com
            </a>
            <a className="social github" href="https://github.com/landabaso">
              GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
