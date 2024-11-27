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
//please 

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
            <div className="w-10/12 max-w-screen-xl m-14 m-auto p-5 bg-white shadow-md rounded-lg h-full">
                <h1 className="text-center text-stone-800">Code Execution</h1>
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-5 mb-5 bg-white">
                        <div className="flex-1">
                            <label className="block mb-2 text-stone-800 text-base font-bold" htmlFor="language">Language:</label>
                            <select className="w-full p-3 mb-2.5 border border-solid border-neutral-200 rounded-md text-stone-800 text-base" id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
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

                            <label className="block mb-2 text-stone-800 text-base font-bold" htmlFor="code">Code:</label>
                            <div className="flex relative bg-neutral-800 text-white border border-solid border-neutral-200 rounded-md overflow-hidden font-mono text-base leading-6">
                                <div className="py-2.5 pl-2.5 bg-zinc-800 text-zinc-400 text-right select-none text-base leading-6">
                                    <pre className="m-0 font-mono text-base leading-6">{generateLineNumbers()}</pre>
                                </div>

                                <div
                                    className="absolute top-0 left-4 right-0 h-full bottom-0 pointer-events-none z-0 overflow-y-auto p-2.5 font-mono text-base leading-6 whitespace-pre-wrap break-words text-slate-50"
                                    ref={highlightRef}
                                    aria-hidden="true"
                                >
                                </div>
                                <textarea
                                    id="code"
                                    ref={textareaRef}
                                    className="absolute top-0 left-4 right-0 bottom-0 bg-transparent text-transparent caret-white font-mono text-base leading-6 p-2.5 border-none outline-none resize-none overflow-y-auto z-10 h-full w-full"
                                     value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck={false}
                                    onScroll={syncScroll}
                                />
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col">
                            <button 
                                type="submit" 
                                className="cursor-pointer bg-green-500 text-white border-none p-2.5 rounded-md" 
                                disabled={isLoading}>
                                {isLoading ? 'Running...' : 'Run'}
                            </button>
                            <label className="block mb-2 text-stone-800 text-base font-bold" htmlFor="input">Input (stdin):</label>
                            <textarea
                                id="input"
                                className="w-full p-2.5 mb-2.5 border border-solid border-neutral-200 rounded-md font-mono text-base"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter input for your program..."
                            />
                        </div>
                    </div>

                    <div className="mt-5 bg-slate-50 p-2.5 rounded-md">
                        {output && (
                            <div className="text-black">
                                <h3>Output:</h3>
                                <pre>{output}</pre>
                            </div>
                        )}
                        {error && (
                            <div className="mt-4 p-2.5 rounded-md font-bold">
                                <h3 className="text-black">Error:</h3>
                                <pre className="bg-red-500">
                                    <strong>Type:</strong> {error.type}{"\n"}
                                    <strong>Details:</strong> {error.message}
                                </pre>
                            </div>
                        )}
                        {logs && (
                            <div className="bg-neutral-700 text-red-100 p-2.5 rounded-md max-h-52 overflow-y-auto text-base">
                                <h3>Logs:</h3>
                                <pre>{logs}</pre>
                            </div>
                        )}
                    </div>
                    <button 
                        className="cursor-pointer bg-green-500 text-white border-none p-2.5 rounded-md"
                        type="button" 
                        onClick={fetchLogs}>
                        Show Logs
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Input;