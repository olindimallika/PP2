import React, { useState } from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { go } from "@codemirror/lang-go";
import { php } from "@codemirror/lang-php";
import { rust } from "@codemirror/lang-rust";
import { sql } from '@codemirror/lang-sql';
import { EditorView } from "@codemirror/view";

//logic by chatgpt, prompt "Allow users to execute code and run it"

interface ExecutionError {
    type: string;
    message: string;
}

interface ExecutionResponse {
    output?: string;
    errorType?: string;
    message?: string;
}

const Input: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
    const [code, setCode] = useState<string>('');
    const [language, setLanguage] = useState<string>('javascript');
    const [input, setInput] = useState<string>('');
    const [output, setOutput] = useState<string>('');
    const [error, setError] = useState<ExecutionError | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const theme = darkMode ? "dark" : "light";

    const languageExtensions: { [key: string]: any } = {
        javascript: javascript(),
        python: python(),
        c: cpp(),
        cpp: cpp(),
        csharp: cpp(),
        java: java(),
        go: go(),
        php: php(),
        rust: rust(),
        sql: sql(),
        ruby: python(),
    };

    const defaultCode: { [key: string]: string } = {
        javascript: 'console.log("Hello, World!");',
        python: 'print("Hello, World!")',
        c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
        cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
        java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
        go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
        php: '<?php\necho "Hello, World!";\n?>',
        rust: 'fn main() {\n    println!("Hello, World!");\n}',
        sql: 'SELECT "Hello, World!" as greeting;',
        ruby: 'puts "Hello, World!"',
        csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}'
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        setCode(defaultCode[newLang] || '');
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

        try {
            const response = await fetch('/api/code-writing-and-execution/input', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, language, input }),
            });

            const result: ExecutionResponse = await response.json();

            if (response.ok) {
                setOutput(result.output || 'Execution successful, but no output.');
                setError(null);
            } else {
                setError({
                    type: result.errorType || 'UnknownError',
                    message: result.message || 'An unknown error occurred.',
                });
                if (result.output) {
                    setOutput(result.output);
                }
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

    return (
        <div id="background" className="flex flex-col items-center justify-center min-h-screen dark:bg-zinc-700 bg-gray-100 py-8">
            <div className="w-10/12 max-w-screen-xl m-14 m-auto p-5 bg-white dark:bg-black shadow-md rounded-lg h-full">
                <h1 className="text-xl font-bold text-center text-zince-700 dark:text-white text-black">Code Execution</h1>
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-5 mb-5 dark:bg-black bg-white">
                        <div className="flex-1">
                            <label className="block mb-2 text-stone-800 dark:text-white text-base font-bold" htmlFor="language">
                                Language:
                            </label>
                            <select 
                                className="w-full p-3 mb-2.5 border border-solid border-neutral-200 rounded-md text-stone-800 text-base text-black dark:border-gray-600 dark:bg-zinc-700 dark:text-white" 
                                id="language" 
                                value={language} 
                                onChange={handleLanguageChange}
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="c">C</option>
                                <option value="cpp">C++</option>
                                <option value="csharp">C#</option>
                                <option value="java">Java</option>
                                <option value="go">Go</option>
                                <option value="php">PHP</option>
                                <option value="rust">Rust</option>
                                <option value="sql">SQL</option>
                                <option value="ruby">Ruby</option>
                            </select>

                            <label className="block mb-2 text-stone-800 dark:text-white text-base font-bold" htmlFor="code">
                                Code:
                            </label>
                            <CodeMirror
                                className="text-black dark:text-white"
                                value={code}
                                height="200px"
                                theme={theme}
                                extensions={[
                                    languageExtensions[language],
                                    EditorView.lineWrapping, 
                                ]}
                                onChange={(value) => setCode(value)}
                                style={{
                                    border: "1px solid #ddd",
                                    marginTop: "20px",
                                }}
                            />
                        </div>

                        <div className="flex flex-1 flex-col">
                            <button 
                                type="submit" 
                                className="cursor-pointer bg-green-500 text-white border-none p-2.5 mt-8 rounded-md hover:bg-green-600 transition-colors duration-200" 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Running...' : 'Run'}
                            </button>
                            <label className="block mb-2 mt-4 text-stone-800 dark:text-white text-base font-bold" htmlFor="input" >
                                Input (stdin):
                            </label>
                            <textarea
                                id="input"
                                className="w-full p-2.5 mb-2.5 border border-solid border-neutral-200 rounded-md font-mono text-base resize-vertical min-h-[100px] text-black dark:border-gray-600 dark:bg-zinc-700 dark:text-white"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter input for your program..."
                            />
                        </div>
                    </div>

                    <div className="mt-5 bg-slate-50 p-2.5 rounded-md">
                        {output && (
                            <div className="text-black">
                                <h3 className="font-bold mb-2">Output:</h3>
                                <pre className="bg-white p-4 rounded-md overflow-x-auto">
                                    {output}
                                </pre>
                            </div>
                        )}
                        {error && (
                            <div className="mt-4 p-2.5 rounded-md">
                                <h3 className="text-black font-bold mb-2">Error:</h3>
                                <pre className="bg-red-100 text-red-900 p-4 rounded-md overflow-x-auto">
                                    <strong>Type:</strong> {error.type}{"\n"}
                                    <strong>Details:</strong> {error.message}
                                </pre>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Input;