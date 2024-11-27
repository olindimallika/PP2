import React, { useState, ChangeEvent, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/router';

const ModifyTemplate: React.FC = () => {
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

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);  

    const [language, setLanguage] = useState<string>('javascript');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [output, setOutput] = useState<string>('');
    const [codeError, setCodeError] = useState<{ type: string; message: string } | null>(null);
    const [logs, setLogs] = useState<string | null>(null);

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
        setLogs(null);

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

    const handleCodeModified = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setTemplate({ ...template, code: e.target.value });
        setModifiedCode(e.target.value);
    }

    const handleRun = async () => {
        setIsLoading(true);
        setCodeError(null);
        setOutput('');
        setLogs(null);

        const code = template.code;

        try {
            const response = await fetch('/api/code-writing-and-execution/write-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, language }),
            });
      
            const result = await response.json();
      
            if (response.ok) {
                setOutput(result.stdout || 'Execution successful, but no output.');
            } else {
                setCodeError({
                    type: result.errorType || 'UnknownError',
                    message: result.message || 'An unknown error occurred.',
                });
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
        setLogs(null);

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

    const syncScroll = () => {
        if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const generateLineNumbers = () => {
        const lines = template.code.split('\n').length;
        return Array.from({ length: lines }, (_, i) => i + 1).join('\n');
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
        if (id) {
            fetchTemplate();
        }
    }, [id]);
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
            <div className="bg-white shadow-lg rounded-lg p-12 w-full max-w-3xl">
                <h1 className="text-2xl font-bold text-center mb-6 text-black">Run/Modify Code Templates</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Template Code */}
                    <div className="flex gap-5 mb-5">
                        <div className="flex-1">
                            
                            <div className="grid grid-cols-5 gap-3">
                                <label htmlFor="language" className="text-black py-2 px-8">Language:</label>
                                <select id="language" className="text-black bg-blue-600 rounded-lg p-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="c">C</option>
                                    <option value="cpp">C++</option>
                                    <option value="java">Java</option>
                                    <option value="ruby">Ruby</option>
                                    <option value="go">Go</option>
                                    <option value="php">PHP</option>
                                    <option value="swift">Swift</option>
                                    <option value="haskell">Haskell</option>
                                </select>
                                <button 
                                    type="submit"
                                    className="block px-4 rounded-lg bg-blue-700 hover:bg-blue-800">
                                        {"Modify"}
                                </button>   
                                <button 
                                    className="block px-6 rounded-lg bg-blue-700 hover:bg-blue-800"
                                    disabled={isLoading}
                                    onClick={handleRun}>
                                    {isLoading ? 'Running...' : 'Run'}
                                </button> 
                                <button 
                                    className="block px-8 rounded-lg bg-blue-700 hover:bg-blue-800"
                                    type="button" 
                                    onClick={fetchLogs}>
                                    Show Logs
                                </button>
                            </div>

                            <div className="flex relative mt-4 bg-zinc-900 text-white border rounded-md overflow-y-auto font-mono text-sm">
                                <div className="bg-zinc-800 text-right select-none leading-6 py-2.5 pl-2.5 pt-2.5">
                                    <pre>{generateLineNumbers()}</pre>
                                </div>
                                        
                                <textarea
                                    id="code"
                                    ref={textareaRef}
                                    className="bg-transparent caret-white text-white text-s overflow-y-auto w-full p-2.5 pt-3 outline-none"
                                    value={template.code}
                                    onChange={handleCodeModified}
                                    spellCheck={false}
                                    placeholder="Enter your code here..."
                                    onScroll={syncScroll}
                                />
                            </div>
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
                        {logs && (
                            <div className="overflow-y-auto text-red-600 bg-black rounded-lg p-4">
                                <h3 className="text-white">Logs:</h3>
                                <pre>{logs}</pre>
                            </div>
                        )}
                    </div>
                </form>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {resultTemplate && (
                    <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg mt-8 text-black">

                        <h3 className="text-black text-lg font-bold">{resultTemplate.title}</h3>
                        <p className="text-sm text-gray-600">Template ID: {resultTemplate.id}</p>
                        <p className="text-sm text-gray-600">{resultTemplate.explanation}</p>
                        <p className="text-sm text-gray-600">

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
                        <p className="text-sm mt-2 text-black">
                            <strong>Tags:</strong>{' '}
                                {resultTemplate.tags.map((tag: any) => tag.name).join(', ')}
                        </p>
                        <button 
                            className="block p-4 text-white rounded-lg bg-blue-700 hover:bg-blue-800"
                            type="button" 
                            onClick={handleFork}>
                                Fork this template
                        </button>
                        {error && <p className="text-red-600">{error}</p>}
                    </div>
                )}
                {forkedTemplate && (
                    <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg mt-8 text-black">
                        <h3 className="text-black text-lg font-bold">{forkedTemplate.title}</h3>
                        <p className="text-sm text-gray-600">Template ID: {forkedTemplate.id}</p>
                        <p className="text-sm text-gray-600">{forkedTemplate.explanation}</p>
                        <p className="text-sm text-gray-600">

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
                        <p className="text-sm mt-2 text-black">
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