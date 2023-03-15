import React, { useState } from 'react';
import ReactMarkdownSyntax from '../ReactMarkdownSyntax';
import Guide from './Guide';
import standardTransactions from './standardTransactions.md';

const StandardTransactions = () => {
  return (
    <Guide
      sandboxIframe={
        <iframe
          src="https://codesandbox.io/embed/github/bitcoinerlab/playground/tree/main/descriptors/legacy2segwit?fontsize=13&hidenavigation=1&theme=light&view=split&codemirror=0&expanddevtools=1&editorsize=65&forcerefresh=1"
          title="Standrd Transactions"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe>
      }
    >
      <ReactMarkdownSyntax>{standardTransactions}</ReactMarkdownSyntax>
    </Guide>
  );
};
export default StandardTransactions;
