import React from "react";
import ReactMarkdownSyntax from "../ReactMarkdownSyntax";
import Guide from "./Guide";
import rewind2 from "./rewind2.md";

const Rewind2 = () => {
  return (
    <Guide
      sandboxIframe={
        //Note it is important to add a new tag to the Github project if this stops working:
        //https://github.com/codesandbox/codesandbox-client/issues/6825#issuecomment-1636136804
        <iframe
          src="https://codesandbox.io/embed/github/bitcoinerlab/playground/tree/v2.5.0/descriptors/rewind2?fontsize=13&hidenavigation=1&theme=light&view=split&codemirror=0&editorsize=65&forcerefresh=1hidedevtools=1"
          title="On-chain Wallet Backup Strategies"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe>
      }
    >
      <ReactMarkdownSyntax>{rewind2}</ReactMarkdownSyntax>
    </Guide>
  );
};
export default Rewind2;
