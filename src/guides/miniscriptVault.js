import React, { useState } from 'react';
import ReactMarkdownSyntax from '../ReactMarkdownSyntax';
import Guide from './Guide';
import miniscriptVault from './miniscriptVault.md';

const MiniscriptVault = () => {
  return (
    <Guide
      sandboxIframe={
        //Note it is important to add a new tag to the Github project if this stops working:
        //https://github.com/codesandbox/codesandbox-client/issues/6825#issuecomment-1636136804
        <iframe
          src="https://codesandbox.io/embed/github/bitcoinerlab/playground/tree/v1.0.4/descriptors/miniscript?fontsize=13&hidenavigation=1&theme=light&view=split&codemirror=0&expanddevtools=1&editorsize=65&forcerefresh=1"
          title="TimeLocked Vault with Miniscript"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe>
      }
    >
      <ReactMarkdownSyntax>{miniscriptVault}</ReactMarkdownSyntax>
    </Guide>
  );
};
export default MiniscriptVault;
