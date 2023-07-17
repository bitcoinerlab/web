import React from 'react';
import Guide from './Guide';
//const MultiSigFallbackTimelock = () => (
//  <div className="guide playgroundOn">
//    <div className="playground">
//      <iframe
//        src="https://codesandbox.io/embed/github/bitcoinerlab/playground/tree/main/descriptors/multisig-fallback-timelock?fontsize=12&hidenavigation=1&theme=light&view=split&codemirror=0&editorsize=60&forcerefresh=1&hidedevtools=1"
//        title="MultiSig Fallback Timelock"
//        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
//        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
//      ></iframe>
//    </div>
//  </div>
//);
const MultiSigFallbackTimelock = () => {
  return (
    <Guide
      sandboxIframe={
        //Note it is important to add a new tag to the Github project if this stops working:
        //https://github.com/codesandbox/codesandbox-client/issues/6825#issuecomment-1636136804
        <iframe
          src="https://codesandbox.io/embed/github/bitcoinerlab/playground/tree/v1.0.6/descriptors/multisig-fallback-timelock?fontsize=12&hidenavigation=1&theme=light&view=split&codemirror=0&editorsize=60&forcerefresh=1&hidedevtools=1"
          title="MultiSig Fallback Timelock"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe>
      }
    >
      <h1>Programming Miniscript with Lunaticoin (Spanish)</h1>
      <p>
        Esta es una sesión de programación en video grabada (en español) con{' '}
        <a href="https://lunaticoin.com/">Lunaticoin</a>, experto, educador y
        divulgador de Bitcoin.
      </p>
      <p>
        Aprende cómo crear una billetera MultiSig con una dirección de respaldo
        bloqueada por tiempo.
      </p>
      <h2>Cómo ejecutar el código</h2>
      <p>
        Puedes probar el código ahora mismo haciendo clic en el botón{' '}
        <b>SHOW PLAYGROUND</b>
      </p>
      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
        <iframe
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          src="https://www.youtube.com/embed/mVGvu5NZGAU"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
      <h2>Dudas y Preguntas</h2>
      <ul>
        <li>
          Twitter: respondiendo a{' '}
          <a href="https://twitter.com/lunaticoin/status/1646795350588399616">
            este hilo
          </a>
          .
        </li>
        <li>
          Github: abriendo{' '}
          <a href="https://github.com/bitcoinerlab/playground/">
            una <emph>issue</emph>
          </a>
          .
        </li>
        <li>Youtube: comentando en el vídeo de arriba.</li>
      </ul>
    </Guide>
  );
};

export default MultiSigFallbackTimelock;
