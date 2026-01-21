import React, { useEffect, useState } from "react";

const Mermaid = ({ chart }) => {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let canceled = false;

    const render = async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({ startOnLoad: false, theme: "default" });
      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      const { svg } = await mermaid.render(id, chart);
      if (!canceled) {
        setSvg(svg);
      }
    };

    render().catch(() => {
      if (!canceled) {
        setSvg("");
      }
    });

    return () => {
      canceled = true;
    };
  }, [chart]);

  if (!svg) {
    return <pre className="mermaid-fallback">{chart}</pre>;
  }

  return <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default Mermaid;
