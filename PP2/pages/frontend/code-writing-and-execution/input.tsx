import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript.min.js';
import 'prismjs/components/prism-python.min.js';
import 'prismjs/components/prism-c.min.js';
import 'prismjs/components/prism-cpp.min.js';
import 'prismjs/components/prism-java.min.js';
import 'prismjs/components/prism-ruby.min.js';
import 'prismjs/components/prism-go.min.js';
import 'prismjs/components/prism-php.min.js';
import 'prismjs/components/prism-haskell.min.js';
import 'prismjs/components/prism-rust.min.js';

const Input: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<{ type: string; message: string } | null>(null);
  const [logs, setLogs] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const highlightCode = (code: string, language: string) => {
    const languageMap: { [key: string]: string } = {
      javascript: 'javascript',
      python: 'python',
      c: 'c',
      cpp: 'cpp',
      java: 'java',
      ruby: 'ruby',
      go: 'go',
      php: 'php',
      rust: 'rust',
      swift: 'swift',
      haskell: 'haskell',
    };
    const lang = languageMap[language] || 'javascript';
    try {
      return Prism.highlight(code, Prism.languages[lang], lang);
    } catch (error) {
      console.error('Error highlighting code:', error);
      return code;
    }
  };

  const syncScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !language) {
      setError({ type: 'InputError', message: 'Code and language are required.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput('');
    setLogs(null);

    try {
      const response = await fetch('/api/code-writing-and-execution/input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language, input }),
      });

      const result = await response.json();

      if (response.ok) {
        setOutput(result.output || 'Execution successful, but no output.');
      } else {
        setError({
          type: result.errorType || 'UnknownError',
          message: result.message || 'An unknown error occurred.',
        });
      }
    } catch (err) {
      setError({
        type: 'NetworkError',
        message: 'Failed to connect to the server. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      const result = await response.text();
      setLogs(result || 'No logs available.');
    } catch {
      setLogs('Failed to fetch logs.');
    }
  };

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.innerHTML = highlightCode(code, language);
    }
  }, [code, language]);

  const generateLineNumbers = () => {
    const lines = code.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  };

  return (
    <div className="code-execution-container">
      <div className="form-container">
        <h1>Code Execution</h1>
        <form onSubmit={handleSubmit}>
          <div className="editor-container">
            <div className="code-editor-container">
              <label htmlFor="language">Language:</label>
              <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="ruby">Ruby</option>
                <option value="go">Go</option>
                <option value="php">PHP</option>
                <option value="rust">Rust</option>
                <option value="swift">Swift</option>
                <option value="haskell">Haskell</option>
              </select>

              <label htmlFor="code">Code:</label>
              <div className="editor-wrapper">
                <div className="line-numbers">
                  <pre>{generateLineNumbers()}</pre>
                </div>
                <div
                  className="code-highlight"
                  ref={highlightRef}
                  aria-hidden="true"
                ></div>
                <textarea
                  id="code"
                  ref={textareaRef}
                  className="code-editor"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  onScroll={syncScroll}
                />
              </div>
            </div>

            <div className="stdin-container">
              <button type="submit" className="run-button" disabled={isLoading}>
                {isLoading ? 'Running...' : 'Run'}
              </button>
              <label htmlFor="input">Input (stdin):</label>
              <textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input for your program..."
              />
            </div>
          </div>

          <div className="output-container">
            {output && (
              <div>
                <h3>Output:</h3>
                <pre>{output}</pre>
              </div>
            )}
            {error && (
              <div className="error">
                <h3>Error:</h3>
                <pre>
                  <strong>Type:</strong> {error.type}{"\n"}
                  <strong>Details:</strong> {error.message}
                </pre>
              </div>
            )}
            {logs && (
              <div className="logs">
                <h3>Logs:</h3>
                <pre>{logs}</pre>
              </div>
            )}
          </div>
          <button type="button" onClick={fetchLogs}>
            Show Logs
          </button>
        </form>
      </div>
    </div>
  );
};

export default Input;
