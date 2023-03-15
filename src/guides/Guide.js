import React, { useState, useEffect, useRef } from 'react';

export default props => {
  const [showPlayground, setShowPlayground] = useState(false);

  const togglePlayground = () => {
    setShowPlayground(!showPlayground);
  };

  //playgroundRef and useEffect are used here to solve a bug in chrome
  //In the guide + ledger programming, when the user clicks on "Click to start",
  //if the user then cancels, for some reason, chrome re-renders the header
  //out of place. It is not possible then to Hide the Playground. We set a timer
  //to detect if any of the elements within the playgroundRef have an "y" below
  //its parent
  const playgroundRef = useRef(null);
  useEffect(() => {
    let timerId;
    if (playgroundRef.current) {
      timerId = window.setInterval(() => {
        for (const el of playgroundRef.current.children) {
          if (
            el.getBoundingClientRect().y <
            el.parentElement.getBoundingClientRect().y
          ) {
            el.style.position = 'absolute';
            window.setTimeout(() => {
              if (playgroundRef.current) el.style.removeProperty('position');
            }, 0);
          }
        }
      }, 500);
    }
    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  return (
    <div className={`guide ${showPlayground ? 'playgroundOn' : ''}`}>
      <div className="main" style={{ overflowWrap: 'break-word' }}>
        <button className="show-playground-button" onClick={togglePlayground}>
          Show Playground
        </button>
        {props.children}
      </div>
      <div className="playground" ref={playgroundRef}>
        <div className="playground-header" onClick={togglePlayground}>
          Hide Playground
          <svg viewBox="0 0 24 24" className="playground-cross">
            <use href="#playground-cross" fill="currentColor"></use>
            <symbol id="playground-cross">
              <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
            </symbol>
          </svg>
        </div>
        {props.sandboxIframe}
      </div>
    </div>
  );
};
