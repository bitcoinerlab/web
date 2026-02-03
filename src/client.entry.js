import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app';

//these will be taken by rollup.config.js and generate dist/public/styles.css
//do the imports here (not on server.entry.js)
import './styles.css';
import './icons.css';
import './nav-article.css'; //For guides and modules
import './guides/theme.css'; //For codesandbox
import '@codemirror/view/style.css';
//import 'highlight.js/styles/default.css'; //For react-markdown (the readme.md parser)

hydrateRoot(
  document,
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
