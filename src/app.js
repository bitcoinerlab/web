import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './home';
import Modules from './modules';
import Guides from './guides';
import { NavLink, useNavigate } from 'react-router-dom';
import NotFound from './notfound';

const App = () => {
  const navigate = useNavigate();
  const handleBrandClick = () => navigate('/');
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Routes>
          <Route
            path="/"
            exact
            element={
              <>
                <title>BitcoinerLAB</title>
                <meta
                  name="description"
                  content="BitcoinerLAB simplifies the Bitcoin development process by providing a set of TypeScript modules that enable the creation of Bitcoin applications."
                />
              </>
            }
          />
          <Route
            path="/modules/miniscript"
            exact
            element={
              <>
                <title>Miniscript</title>
                <meta
                  name="description"
                  content="A JavaScript implementation of Bitcoin Miniscript, a high-level language for describing Bitcoin spending conditions."
                />
              </>
            }
          />
          <Route path="*" element={<title>BitcoinerLAB</title>} />
        </Routes>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://fonts.googleapis.com/css?family=Ubuntu:regular,bold&subset=Latin"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://fonts.googleapis.com/css?family=Roboto%20Mono"
        />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <header className="header">
          <div className="container">
            <div className="brand" onClick={handleBrandClick}>
              <div className="logo"></div>
              <span className="bitcoiner">Bitcoiner</span>
              <span className="lab">LAB</span>
            </div>
            <nav className="nav">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? 'selected' : undefined
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/modules"
                className={({ isActive }) =>
                  isActive ? 'selected' : undefined
                }
              >
                Modules
              </NavLink>
              <NavLink
                to="/guides"
                className={({ isActive }) =>
                  isActive ? 'selected' : undefined
                }
              >
                Guides
              </NavLink>
              <a href="https://github.com/bitcoinerlab">Github</a>
            </nav>
          </div>
        </header>
        <div id="root">
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/modules/*" element={<Modules />} />
            <Route path="/guides/*" element={<Guides />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  );
};

export default App;
