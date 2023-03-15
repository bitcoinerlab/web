import React from 'react';
import ReactMarkdownSyntax from '../../ReactMarkdownSyntax';

import readme from './descriptorsREADME.md';

export default () => (
  <div style={{ overflowWrap: 'break-word' }}>
    <ReactMarkdownSyntax>{readme}</ReactMarkdownSyntax>
    <p>
      This module provides an easy way to express complex wallet structures such
      as multi-sig or timelocks.
    </p>
    <p>
      It is currently in development and not yet ready for use in production,
      but you can preview it on Github:{' '}
      <a href="https://github.com/bitcoinerlab/farvault-lib/blob/descriptors/src/descriptors.js">
        src/descriptors.js
      </a>
    </p>
  </div>
);
