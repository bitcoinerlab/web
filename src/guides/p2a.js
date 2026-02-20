import React from 'react';
import ReactMarkdownSyntax from '../ReactMarkdownSyntax';
import Guide from './Guide';
import p2a from './p2a.md';

const StandardTransactions = () => {
  return (
    <Guide
      sandboxIframe={
        //Note it is important to add a new tag to the Github project if this stops working:
        //https://github.com/codesandbox/codesandbox-client/issues/6825#issuecomment-1636136804
        <iframe
          src="https://codesandbox.io/embed/github/bitcoinerlab/playground/tree/v3.0.6/descriptors/p2a?fontsize=13&hidenavigation=1&theme=light&view=split&codemirror=0&editorsize=65&forcerefresh=1&hidedevtools=1"
          title="TRUC & P2A"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe>
      }
    >
      <ReactMarkdownSyntax>{p2a}</ReactMarkdownSyntax>
    </Guide>
  );
};
export default StandardTransactions;
