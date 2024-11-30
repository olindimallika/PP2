import React, { useState, ChangeEvent, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/router';

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

interface ExecutionError {
    type: string;
    message: string;
}

interface ExecutionResponse {
    output?: string;
    errorType?: string;
    message?: string;
}

const ModifyTemplate: React.FC<{ darkMode: boolean }> = ( {darkMode } ) => {
    const [modifiedCode, setModifiedCode] = useState<string>('');

    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [forkedTemplate, setForkedTemplate] = useState<any>(null);
    const [resultTemplate, setResultTemplate] = useState<any>(null);

    const [template, setTemplate] = useState({    
        title: '',
        explanation: '',
        code: '', 
        tags: [''],     
    });
  
    const router = useRouter();
    const { id } = router.query; 

    const [language, setLanguage] = useState<string>('javascript');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [output, setOutput] = useState<string>('');
    const [codeError, setCodeError] = useState<ExecutionError | null>(null);

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

    // only need initially, to get original template to modify or run
    const fetchTemplate = async () => {
        setLoading(true);
        
        try {
            const response = await fetch(`/api/code-templates/get-template?id=${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An error occurred while getting the saved code templates.');
            }

            const data = await response.json();
            
            setTemplate(data.template);
            setError('');
      
        } catch (error) {
            setError(error.message || 'An error occurred.');
        } finally { 
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return; // prevent multiple requests
        setLoading(true);
        setError('');

        setIsLoading(true);
        setCodeError(null);
        setOutput('');

        try {
            const response = await fetch(`/api/code-templates/run-modify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    templateId: Number(id),
                    modifiedCode: modifiedCode,
                    saveAsFork: false,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An error occurred while getting the saved code templates.');
            }

            const data = await response.json();

            setResultTemplate(data.template);
            setError('');
    
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };

    const handleRun = async () => {
        
        setIsLoading(true);
        setCodeError(null);
        setOutput('');

        const code = template.code;

        try {
            const response = await fetch('/api/code-writing-and-execution/input', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, language, input:"" }),
            });
      
            const result: ExecutionResponse = await response.json();

            if (response.ok) {
                setOutput(result.output || 'Execution successful, but no output.');
                setCodeError(null);
            } else {
                setCodeError({
                    type: result.errorType || 'UnknownError',
                    message: result.message || 'An unknown error occurred.',
                });
                if (result.output) {
                    setOutput(result.output);
                }
            }
        } catch (err) {
            setCodeError({
                type: 'NetworkError',
                message: 'Failed to connect to the server. Please try again later.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFork = async () => {
        if (loading) return; // prevent multiple requests
        setLoading(true);

        setIsLoading(true);
        setCodeError(null);
        setOutput('');

        // check that user is logged in 
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('You cannot fork this template! Please log in.');
            setLoading(false);
            setIsLoading(false);
            return;
        }

        // check that user is an admin before forking template
        const userRole = localStorage.getItem('role');
        if (userRole !== 'admin') {
            setError('You are not an admin!');
            setLoading(false);
            setIsLoading(false);
            return;
        }

        const code = resultTemplate.code;

        try {
            const response = await fetch(`/api/code-templates/run-modify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    templateId: Number(id),
                    modifiedCode: code,
                    saveAsFork: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'An error occurred while forking the template.');
                return;
            }

            const data = await response.json();

            setForkedTemplate(data.template);
            setError('');
    
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
            setIsLoading(false);
        }

    };

    useEffect(() => {
        if (id) {
            fetchTemplate();
        }
    }, [id]);
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-800 py-8">
            <div className="bg-white shadow-lg rounded-lg p-12 w-full max-w-3xl dark:bg-black">
                <h1 className="text-2xl font-bold text-center mb-6 text-black dark:text-white">Run/Modify Code Templates</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Template Code */}
                    <div className="flex gap-5 mb-5">
                        <div className="flex-1">
                            
                            <div className="grid grid-cols-5 gap-3">
                                <label htmlFor="language" className="text-black py-2 px-8 dark:text-white">Language:</label>
                                <select className="bg-blue-700 text-white w-full p-2 rounded-md text-base" id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
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
                                <button 
                                    type="submit"
                                    className="text-white block px-4 rounded-lg bg-blue-700 hover:bg-blue-800">
                                        {"Modify"}
                                </button>   
                                <button 
                                    className="text-white block px-6 rounded-lg bg-blue-700 hover:bg-blue-800"
                                    disabled={isLoading}
                                    onClick={handleRun}>
                                    {isLoading ? 'Running...' : 'Run'}
                                </button> 
                            </div>

                            <label className="block mb-2 text-stone-800 text-base font-bold dark:text-white" htmlFor="code">Code:</label>
                            {/* CodeMirror Editor, specific CodeMirror syntax from youtube video "Javascript CodeMirror Syntax Highlighter Example to Highlight Source Code in Browser Full Example" by freemediatools and chatgpt*/}
                            <CodeMirror
                                className="text-black dark:text-white"
                                value={template.code}
                                height="200px"
                                theme={theme}
                                extensions={[
                                    languageExtensions[language],
                                    EditorView.lineWrapping, 
                                ]}
                                onChange={(value) => {
                                    setTemplate({ ...template, code: value });
                                    setModifiedCode(value)
                                }}
                                style={{
                                    border: "1px solid #ddd",
                                    marginTop: "20px",
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2 grid-cols-1">
                        {output && (
                            <div className="overflow-y-auto text-white bg-black rounded-lg p-4">
                                <h3 className="text-slate-500">Output:</h3>
                                <pre>{output}</pre>
                            </div>
                        )}
                        {codeError && (
                            <div className="overflow-y-auto text-red-600 bg-black rounded-lg p-4">
                                <h3 className="text-white">Error:</h3>
                                <pre>
                                    <strong className="text-white">Type:</strong> {codeError.type}{"\n"}
                                    <strong className="text-white">Details:</strong> {codeError.message}
                                </pre>
                            </div>
                        )}
                    </div>
                </form>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {resultTemplate && (
                    <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg mt-8 text-black dark:bg-black">

                        <h3 className="text-black text-lg font-bold dark:text-white">{resultTemplate.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Template ID: {resultTemplate.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{resultTemplate.explanation}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">

                            {/* Code Block Container */}
                            <div className="relative bg-gray-50 rounded-lg dark:bg-gray-700 p-6 pt-10 h-48">
                                <div className="overflow-x-scroll max-h-full">
                                    <pre>
                                        <code
                                            id="code-block"
                                            className="text-sm text-violet-300 whitespace-pre">
                                                {resultTemplate.code}
                                        </code>
                                    </pre>
                                </div>   
                            </div>                                               
                        </p>
                        <p className="text-sm mt-2 text-black dark:text-gray-400">
                            <strong>Tags:</strong>{' '}
                                {resultTemplate.tags.map((tag: any) => tag.name).join(', ')}
                        </p>
                        <button 
                            className="block p-4 md:mx-32 md:w-2/5 sm:mx-16 sm:w-3/5 text-white rounded-lg bg-blue-700 hover:bg-blue-800"
                            type="button" 
                            onClick={handleFork}>
                                Fork this template
                        </button>
                        {error && <p className="text-red-600">{error}</p>}
                    </div>
                )}
                {forkedTemplate && (
                    <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg mt-8 text-black dark:bg-black">
                        <h3 className="text-black text-lg font-bold dark:text-white">{forkedTemplate.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Template ID: {forkedTemplate.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{forkedTemplate.explanation}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">

                            {/* Code Block Container */}
                            <div className="relative bg-gray-50 rounded-lg dark:bg-gray-700 p-6 pt-10 h-48">
                                <div className="overflow-x-scroll max-h-full">
                                    <pre>
                                        <code
                                            id="code-block"
                                            className="text-sm text-violet-300 whitespace-pre">
                                                {forkedTemplate.code}
                                        </code>
                                    </pre>
                                </div>   
                            </div>                                               
                        </p>
                        <p className="text-sm mt-2 text-black dark:text-gray-400">
                            <strong>Tags:</strong>{' '}
                                {forkedTemplate.tags.map((tag: any) => tag.name).join(', ')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModifyTemplate;