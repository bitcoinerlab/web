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
          set of Javascript / Typescript modules that enable the creation of
          Bitcoin applications.
        </p>
        <button onClick={handleTryNow}>Try it now!</button>
        <p>
          The development of these modules began while creating a Bitcoin cold
          storage time-lock wallet. The goal is to share these modules with the
          community to facilitate the development of other Bitcoin applications
          and wallets.
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
            Developing FarVault, a Bitcoin Vault to protect against theft &
            extortion. Open-sourcing the libs via{" "}
            <a href="https://bitcoinerlab.com">BitcoinerLab.com</a>. Also,
            creator of{" "}
            <a href="https://www.labolsavirtual.com">LaBolsaVirtual.com</a>.
            <br />
            I'm also the guy behind{" "}
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
