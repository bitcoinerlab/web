import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './home';
import Modules from './modules';
import { Link } from 'react-router-dom';
const Installation = () => (
  <div>
    <h2>Installation</h2>
    <p>
      To install the npm package for <code>@bitcoinerlab/miniscript</code>, run
      the following command:
    </p>
    <pre>npm install @bitcoinerlab/miniscript</pre>
    <p>
      You can also install the other modules in the same way, by replacing{' '}
      <code>@bitcoinerlab/miniscript</code> with the name of the desired module.
    </p>
  </div>
);
const NotFound = () => {
  // on the server
  if (typeof process !== 'undefined') {
    process.env.statusCode = 404;
  }
  return <div>Not found</div>;
};
const App = () => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>BitcoinerLAB</title>
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link
        rel="stylesheet"
        type="text/css"
        href="http://fonts.googleapis.com/css?family=Ubuntu:regular,bold&subset=Latin"
      />
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <header className="header">
        <div className="container">
          <div className="brand">
            <div className="logo"></div>
            <span className="bitcoiner">Bitcoiner</span>
            <span className="lab">LAB</span>
          </div>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/installation">Installation</Link>
            <Link to="/modules">Modules</Link>
          </nav>
        </div>
      </header>
      <div id="root">
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/installation" element={<Installation />} />
          <Route path="/modules/*" element={<Modules />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <script src="/bundle.js"></script>
    </body>
  </html>
);

export default App;
