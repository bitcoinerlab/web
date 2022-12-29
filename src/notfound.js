import React from 'react';
const NotFound = () => {
  // on the server
  if (typeof process !== 'undefined') {
    process.env.statusCode = 404;
  }
  return (
    <article className="notfound">
      <h1>404 Error: Page Not Found</h1>
      <p>Sorry, the requested page could not be found on our server.</p>
      <p>Please try the following options:</p>
      <ul>
        <li>Go to the homepage and navigate to the desired page from there</li>
        <li>Contact us if you believe this is a mistake</li>
      </ul>
    </article>
  );
};
export default NotFound;
