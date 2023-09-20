import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ApiIframe({ API }) {
  if (!API) {
    throw new Error("ApiIframe requires a API prop.");
  }
  const iframeRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  function updateParentUrl(linkHref) {
    const iframe = iframeRef.current;
    const newURL = new URL(linkHref, iframe.contentWindow.location.href);

    const newParentPath = `/modules/${API}/api${newURL.pathname.replace(
      `/docs/${API}`,
      "",
    )}`;
    if (newParentPath !== location.pathname || newURL.hash !== location.hash)
      navigate(newParentPath + newURL.hash, { replace: true });
    //navigate is slow and handleIframeLoad may be load before the new hash is set
    if (newURL.hash !== location.hash) location.hash = newURL.hash;
  }

  function handleIframeLoad() {
    const parentHash = location.hash;
    const iframe = iframeRef.current;
    const iframeURL = new URL(iframe.contentWindow.location.href);
    const iframeHash = iframeURL.hash;
    if (parentHash && parentHash !== iframeHash) iframe.src += parentHash; // Append the hash
    attachLinkListeners();
    updateParentUrl(parentHash);
  }

  function handleLinkClickInsideIframe(event) {
    const linkHref = event.currentTarget.getAttribute("href");
    const iframe = iframeRef.current;
    const newURL = new URL(linkHref, iframe.contentWindow.location.href);

    // Check if the newURL origin is different from the iframe's origin
    // For example, a link to github:
    if (newURL.origin !== iframe.contentWindow.location.origin) {
      event.preventDefault();
      // Open the link in a new tab
      window.open(newURL.href, "_blank");
    } else {
      if (newURL.pathname !== iframe.contentWindow.location.pathname) {
        //Remove the a-href click listeners of the current iframe if path changes
        detachLinkListeners();
      }
      updateParentUrl(linkHref);
    }
  }

  function attachLinkListeners() {
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", handleLinkClickInsideIframe);
    });
  }

  function detachLinkListeners() {
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.querySelectorAll("a").forEach((link) => {
      link.removeEventListener("click", handleLinkClickInsideIframe);
    });
  }

  const apiPath = location.pathname.replace(`/modules/${API}/api`, "");
  const src = apiPath ? `/docs/${API}${apiPath}` : `/docs/${API}/index.html`;

  return (
    <iframe
      ref={iframeRef}
      onLoad={handleIframeLoad}
      src={src}
      className="APIIframe"
    />
  );
}

export default ApiIframe;
