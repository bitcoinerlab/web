import React from 'react';
import ReactMarkdown from 'react-markdown';
//Load Prism from cjs or otherwise there are SSR rendering errors when
//directly loading the descriptors page. Also load the light bundler not to
//pack too many unused languages. Just bash and typescript
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism-light';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
SyntaxHighlighter.registerLanguage('javascript', typescript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('bash', bash);

//import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
//https://github.com/PrismJS/prism-themes
import { materialOceanic as prismStyle } from 'react-syntax-highlighter/dist/cjs/styles/prism';
//Hydration errors are because of this: https://www.youtube.com/watch?v=eGWG22olL0o&t=310s
//It is the runkit thingy: <script src="https://embed.runkit.com"></script>

import rehypeRaw from 'rehype-raw'; //So that <details><summary> tags work

export default props => {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              children={String(children).replace(/\n$/, '')}
              style={prismStyle}
              customStyle={{ fontSize: '0.95em' }}
              language={match[1]}
              PreTag="div"
              {...props}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {props.children}
    </ReactMarkdown>
  );
};
