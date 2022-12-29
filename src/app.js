import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './home';
import Modules from './modules';
import { NavLink, useNavigate } from 'react-router-dom';
const NotFound = () => {
  // on the server
  if (typeof process !== 'undefined') {
    process.env.statusCode = 404;
  }
  return <div>Not found</div>;
};
const App = () => {
  const navigate = useNavigate();
  const handleBrandClick = () => navigate('/');
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>BitcoinerLAB</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://fonts.googleapis.com/css?family=Ubuntu:regular,bold&subset=Latin"
        />
        <link rel="stylesheet" href="/styles.css" />
        <script src="https://embed.runkit.com"></script>
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
              <a href="https://github.com/bitcoinerlab">Github</a>
            </nav>
          </div>
        </header>
        <div id="root">
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/modules/*" element={<Modules />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  );
};

export default App;
