import React from 'react';
import express from 'express';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './app';

let app = express();

// Serve static files from the "public" directory
app.use(express.static('dist/public'));

app.get('*', (req, res) => {
  const html = ReactDOMServer.renderToString(
    <StaticRouter location={req.url}>
      <App />
    </StaticRouter>
  );
  res
    .status(Number(process.env.statusCode) === 404 ? 404 : 200)
    .send('<!DOCTYPE html>' + html);
  delete process.env.statusCode;
});
const port = 3101;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
