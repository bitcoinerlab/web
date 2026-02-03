import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism-light';
import javascriptLang from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import jsonLang from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import { prism as prismStyle } from 'react-syntax-highlighter/dist/cjs/styles/prism';

SyntaxHighlighter.registerLanguage('javascript', javascriptLang);
SyntaxHighlighter.registerLanguage('json', jsonLang);

const ESBUILD_WASM_URL = '/esbuild.wasm';
const ESM_CDN_BASE = 'https://esm.sh';

let esbuildModulePromise;
let esbuildInitPromise;
const fileCache = new Map();

const loadEsbuild = async () => {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!esbuildModulePromise) {
    esbuildModulePromise = import('esbuild-wasm');
  }
  const esbuild = await esbuildModulePromise;
  if (!esbuildInitPromise) {
    esbuildInitPromise = esbuild.initialize({
      wasmURL: ESBUILD_WASM_URL,
      worker: true
    });
  }
  await esbuildInitPromise;
  return esbuild;
};

const toEsmUrl = path => new URL(path, `${ESM_CDN_BASE}/`).href;

const createEsmFetchPlugin = () => ({
  name: 'esm-fetch-plugin',
  setup(build) {
    build.onResolve({ filter: /^https?:\/\// }, args => ({
      path: args.path,
      namespace: 'http-url'
    }));
    build.onResolve({ filter: /^\// }, args => ({
      path: toEsmUrl(args.path),
      namespace: 'http-url'
    }));
    build.onResolve({ filter: /^\.+\// }, args => {
      if (args.importer && /^https?:\/\//.test(args.importer)) {
        return {
          path: new URL(args.path, args.importer).href,
          namespace: 'http-url'
        };
      }
      return {
        errors: [{ text: `Relative imports are not supported: ${args.path}` }]
      };
    });
    build.onResolve({ filter: /.*/ }, args => ({
      path: toEsmUrl(args.path),
      namespace: 'http-url'
    }));
    build.onLoad({ filter: /.*/, namespace: 'http-url' }, async args => {
      if (fileCache.has(args.path)) {
        return fileCache.get(args.path);
      }
      const response = await fetch(args.path);
      if (!response.ok) {
        const error = new Error(`Failed to load ${args.path}`);
        error.status = response.status;
        throw error;
      }
      const contents = await response.text();
      const result = {
        contents,
        loader: 'js',
        resolveDir: new URL('./', response.url).href
      };
      fileCache.set(args.path, result);
      return result;
    });
  }
});

const RUNNER_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <script>
      (function () {
        const formatValue = (value) => {
          if (typeof value === 'string') return value;
          if (value === undefined) return 'undefined';
          if (value === null) return 'null';
          if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
          }
          if (typeof value === 'bigint') {
            return value.toString();
          }
          if (value && value.stack && value.message) {
            return value.stack;
          }
          try {
            return JSON.stringify(
              value,
              (key, val) => (typeof val === 'bigint' ? val.toString() : val),
              2
            );
          } catch (error) {
            return String(value);
          }
        };

        const send = (payload) => {
          parent.postMessage(payload, '*');
        };

        const wrapConsole = (level) => (...args) => {
          send({
            type: 'console',
            level,
            runId: activeRunId,
            args: args.map(formatValue)
          });
        };

        ['log', 'info', 'warn', 'error'].forEach((level) => {
          const original = console[level];
          console[level] = (...args) => {
            wrapConsole(level)(...args);
            if (original) {
              original.apply(console, args);
            }
          };
        });

        let activeRunId = 0;
        window.addEventListener('message', async (event) => {
          const data = event.data || {};
          if (data.type === 'playground:ping') {
            send({ type: 'playground:ready' });
            return;
          }
          if (!data || data.type !== 'execute') return;
          const runId = data.runId || 0;
          activeRunId = runId;
          let url;
          try {
            const blob = new Blob([data.code || ''], {
              type: 'text/javascript'
            });
            url = URL.createObjectURL(blob);
            await import(url);
            if (activeRunId === runId) {
              send({ type: 'done', runId });
            }
          } catch (error) {
            if (activeRunId === runId) {
              send({
                type: 'error',
                runId,
                error: error && error.message ? error.message : String(error),
                stack: error && error.stack ? error.stack : ''
              });
            }
          } finally {
            if (url) {
              URL.revokeObjectURL(url);
            }
          }
        });

        send({ type: 'playground:ready' });
      })();
    </script>
  </body>
</html>`;

const buildInput = (source, prelude) => {
  const preludeBlock = prelude ? `${prelude}\n` : '';
  return `import process from 'process';
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  if (!window.process) window.process = process;
  if (!window.Buffer) window.Buffer = Buffer;
  if (!window.global) window.global = window;
  if (!window.process.env) window.process.env = {};
  const envKey = 'NODE_ENV';
  window.process.env[envKey] = 'production';
}
${preludeBlock}${source}`;
};

const Playground = forwardRef(
  (
    {
      source = '',
      onSourceChange,
      onLoad,
      onEvaluate,
      className,
      prelude
    },
    ref
  ) => {
    const iframeRef = useRef(null);
    const editorContainerRef = useRef(null);
    const editorViewRef = useRef(null);
    const editableCompartmentRef = useRef(new Compartment());
    const isApplyingExternalRef = useRef(false);
    const sourceRef = useRef(source);
    const runIdRef = useRef(0);
    const activeRunIdRef = useRef(0);
    const pendingEvaluateRef = useRef(false);
    const onLoadRef = useRef(onLoad);
    const onEvaluateRef = useRef(onEvaluate);
    const onSourceChangeRef = useRef(onSourceChange);

    const [iframeReady, setIframeReady] = useState(false);
    const [esbuildReady, setEsbuildReady] = useState(false);
    const [running, setRunning] = useState(false);
    const [outputLines, setOutputLines] = useState([]);
    const [initError, setInitError] = useState(null);

    const ready = iframeReady && esbuildReady && !initError;
    const isEditable = typeof onSourceChange === 'function';

    useEffect(() => {
      sourceRef.current = source;
    }, [source]);

    useEffect(() => {
      onLoadRef.current = onLoad;
    }, [onLoad]);

    useEffect(() => {
      onEvaluateRef.current = onEvaluate;
    }, [onEvaluate]);

    useEffect(() => {
      onSourceChangeRef.current = onSourceChange;
    }, [onSourceChange]);

    useEffect(() => {
      if (typeof window === 'undefined') return undefined;
      if (!editorContainerRef.current || editorViewRef.current) return undefined;

      const updateListener = EditorView.updateListener.of(update => {
        if (!update.docChanged) return;
        if (isApplyingExternalRef.current) {
          isApplyingExternalRef.current = false;
          return;
        }
        if (onSourceChangeRef.current) {
          onSourceChangeRef.current(update.state.doc.toString());
        }
      });

      const state = EditorState.create({
        doc: source,
        extensions: [
          basicSetup,
          javascript({ typescript: true }),
          EditorView.lineWrapping,
          editableCompartmentRef.current.of(EditorView.editable.of(isEditable)),
          updateListener
        ]
      });

      editorViewRef.current = new EditorView({
        state,
        parent: editorContainerRef.current
      });

      return () => {
        if (editorViewRef.current) {
          editorViewRef.current.destroy();
          editorViewRef.current = null;
        }
      };
    }, []);

    useEffect(() => {
      let cancelled = false;
      loadEsbuild()
        .then(() => {
          if (!cancelled) {
            setEsbuildReady(true);
          }
        })
        .catch(error => {
          if (!cancelled) {
            setInitError(error);
          }
        });
      return () => {
        cancelled = true;
      };
    }, []);

    useEffect(() => {
      if (!editorViewRef.current) return;
      editorViewRef.current.dispatch({
        effects: editableCompartmentRef.current.reconfigure(
          EditorView.editable.of(isEditable)
        )
      });
    }, [isEditable]);

    useEffect(() => {
      const view = editorViewRef.current;
      if (!view) return;
      const currentValue = view.state.doc.toString();
      if (source === currentValue) return;
      isApplyingExternalRef.current = true;
      view.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: source
        }
      });
    }, [source]);

    useEffect(() => {
      if (ready && onLoadRef.current) {
        onLoadRef.current();
      }
    }, [ready]);

    useEffect(() => {
      if (typeof window === 'undefined') return undefined;
      const handleMessage = event => {
        if (!iframeRef.current) return;
        if (event.source !== iframeRef.current.contentWindow) return;
        const data = event.data;
        if (!data || typeof data !== 'object') return;

        if (data.type === 'playground:ready') {
          setIframeReady(true);
          return;
        }

        if (data.runId !== activeRunIdRef.current) {
          return;
        }

        if (data.type === 'console') {
          const text = (data.args || []).join(' ');
          setOutputLines(lines => [
            ...lines,
            {
              level: data.level || 'log',
              text
            }
          ]);
          return;
        }

        if (data.type === 'error') {
          setOutputLines(lines => {
            const next = [
              ...lines,
              {
                level: 'error',
                text: data.error || 'Unknown error'
              }
            ];
            if (data.stack) {
              next.push({ level: 'error', text: data.stack });
            }
            return next;
          });
          setRunning(false);
          pendingEvaluateRef.current = true;
          return;
        }

        if (data.type === 'done') {
          setRunning(false);
          pendingEvaluateRef.current = true;
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
      if (typeof window === 'undefined') return undefined;
      let cancelled = false;
      let attempts = 0;
      const tryPing = () => {
        if (cancelled || iframeReady) return;
        const iframeWindow = iframeRef.current
          ? iframeRef.current.contentWindow
          : null;
        if (iframeWindow) {
          iframeWindow.postMessage({ type: 'playground:ping' }, '*');
        }
        attempts += 1;
        if (attempts < 12) {
          setTimeout(tryPing, 200);
        }
      };
      tryPing();
      return () => {
        cancelled = true;
      };
    }, [iframeReady]);

    useEffect(() => {
      if (!pendingEvaluateRef.current) return;
      pendingEvaluateRef.current = false;
      if (onEvaluateRef.current) {
        onEvaluateRef.current();
      }
    }, [outputLines, running]);

    const evaluate = async overrideSource => {
      if (!ready) {
        return;
      }

      const esbuild = await loadEsbuild();
      if (!esbuild) {
        setOutputLines([{ level: 'error', text: 'Playground not available.' }]);
        pendingEvaluateRef.current = true;
        return;
      }

      const runId = runIdRef.current + 1;
      runIdRef.current = runId;
      activeRunIdRef.current = runId;

      setRunning(true);
      setOutputLines([]);

      const currentSource =
        typeof overrideSource === 'string' ? overrideSource : sourceRef.current;

      try {
        const input = buildInput(currentSource, prelude);
        const result = await esbuild.build({
          stdin: {
            contents: input,
            loader: 'js',
            resolveDir: '/',
            sourcefile: 'index.js'
          },
          bundle: true,
          write: false,
          plugins: [createEsmFetchPlugin()],
          format: 'esm',
          platform: 'browser',
          target: ['es2022']
        });

        if (!result.outputFiles || !result.outputFiles.length) {
          throw new Error('Build failed: no output generated.');
        }

        if (runId !== activeRunIdRef.current) {
          return;
        }

        if (!iframeRef.current || !iframeRef.current.contentWindow) {
          throw new Error('Playground sandbox is not ready.');
        }

        iframeRef.current.contentWindow.postMessage(
          {
            type: 'execute',
            runId,
            code: result.outputFiles[0].text
          },
          '*'
        );
      } catch (error) {
        if (runId !== activeRunIdRef.current) {
          return;
        }
        setRunning(false);
        setOutputLines([
          {
            level: 'error',
            text: error && error.message ? error.message : String(error)
          }
        ]);
        if (error && error.stack) {
          setOutputLines(lines => [...lines, { level: 'error', text: error.stack }]);
        }
        pendingEvaluateRef.current = true;
      }
    };

    useImperativeHandle(ref, () => ({ evaluate }));

    const outputText = outputLines
      .map(line =>
        line.level && line.level !== 'log'
          ? `[${line.level}] ${line.text}`
          : line.text
      )
      .join('\n');
    const outputLanguage = outputText.trim().startsWith('{') ||
      outputText.trim().startsWith('[')
        ? 'json'
        : 'javascript';

    const statusLabel = initError
      ? 'Playground failed to initialize.'
      : !ready
      ? 'Loading environment...'
      : running
      ? 'Running...'
      : 'Ready';

    const rootClassName = ['playground', className].filter(Boolean).join(' ');

    return (
      <div className={rootClassName} aria-busy={running || !ready}>
        <div className="playground-toolbar">
          <button
            type="button"
            onClick={() => evaluate()}
            disabled={!ready || running}
          >
            Run
          </button>
          <div className="playground-status">{statusLabel}</div>
        </div>
        <div className="playground-section">
          <div className="playground-section-title">Code</div>
          <div className="playground-editor" ref={editorContainerRef} />
        </div>
        <div className="playground-section">
          <div className="playground-section-title">Output</div>
          <div className="playground-output">
            {outputLines.length === 0 ? (
              <div className="playground-output-placeholder">No output yet.</div>
            ) : (
              <SyntaxHighlighter
                language={outputLanguage}
                style={prismStyle}
                customStyle={{
                  background: 'transparent',
                  margin: 0,
                  padding: 0,
                  fontSize: '1.3rem',
                  lineHeight: 1.5
                }}
                codeTagProps={{
                  style: {
                    fontFamily:
                      "Menlo, Monaco, Consolas, 'Courier New', monospace"
                  }
                }}
              >
                {outputText}
              </SyntaxHighlighter>
            )}
          </div>
        </div>
        <iframe
          ref={iframeRef}
          title="Playground sandbox"
          sandbox="allow-scripts"
          srcDoc={RUNNER_HTML}
          onLoad={() => {
            const iframeWindow = iframeRef.current
              ? iframeRef.current.contentWindow
              : null;
            if (iframeWindow) {
              iframeWindow.postMessage({ type: 'playground:ping' }, '*');
            }
          }}
          style={{ display: 'none' }}
        />
      </div>
    );
  }
);

Playground.displayName = 'Playground';

export default Playground;
