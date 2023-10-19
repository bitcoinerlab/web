import React from 'react';
import ReactMarkdownSyntax from '../ReactMarkdownSyntax';
import Guide from './Guide';
import ledgerProgramming from './ledgerProgramming.md';

const LedgerProgramming = () => {
  return (
    <Guide
      sandboxIframe={
        //Note it is important to add a new tag to the Github project if this stops working:
        //https://github.com/codesandbox/codesandbox-client/issues/6825#issuecomment-1636136804
        <iframe
          src="https://codesandbox.io/embed/github/bitcoinerlab/playground/tree/v2.0.2/descriptors/ledger?fontsize=13&hidenavigation=1&theme=light&view=split&codemirror=0&expanddevtools=1&editorsize=65&forcerefresh=1"
          title="Descriptors"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe>
      }
    >
      <ReactMarkdownSyntax>{ledgerProgramming}</ReactMarkdownSyntax>
    </Guide>
  );
};
export default LedgerProgramming;
