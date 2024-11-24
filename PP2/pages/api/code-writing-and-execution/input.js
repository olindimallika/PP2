import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { code, language, input } = req.body;

    const languageConfig = {
        'c': { extension: '.c', compile: 'gcc', execute: './a.out' },
        'cpp': { extension: '.cpp', compile: 'g++', execute: './a.out' },
        'java': { extension: '.java', compile: 'javac', execute: 'java -cp /tmp Main' },
        'python': { extension: '.py', execute: 'python3' },
        'javascript': { extension: '.js', execute: 'node' }
    };

    if (!code || !language || !languageConfig[language]) {
        return res.status(400).json({ error: 'Invalid input.' });
    }

    const { extension, compile, execute } = languageConfig[language];
    const fileName = `Main${extension}`;
    const filePath = path.join('/tmp', fileName);

    try {
        // Write code to a temporary file
        await fs.promises.writeFile(filePath, code);

        // Check if the code likely requires stdin input and no input was provided
        const requiresInput = /input\(|scanf|cin>>|System\.in|readline/.test(code); // Regex to detect input handling in code
        if (requiresInput && (!input || input.trim() === '')) {
            throw new Error('Please provide input in the input box.');
        }

        // Compile the code if required
        if (compile) {
            const compileCommand = `${compile} ${filePath}`;
            await new Promise((resolve, reject) => {
                exec(compileCommand, (err, stdout, stderr) => {
                    if (err) return reject(new Error(`Compilation error: ${stderr}`));
                    resolve(stdout);
                });
            });
        }

        // Execute the code and handle stdin
        const executeCommand = compile ? `${execute}` : `${execute} ${filePath}`;
        const executionResult = await new Promise((resolve, reject) => {
            const child = exec(executeCommand, (err, stdout, stderr) => {
                if (err) return reject(new Error(`Execution error: ${stderr}`));
                resolve({ stdout, stderr });
            });

            // Write stdin input to the child process
            if (child.stdin) {
                child.stdin.write(input || ''); // Pass input if provided
                child.stdin.end(); // Close stdin to signal end of input
            }
        });

        res.status(200).json({ output: executionResult.stdout, error: executionResult.stderr });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(400).json({ error: error.message });
    } finally {
        // Clean up the temporary file
        try {
            await fs.promises.unlink(filePath);
        } catch (cleanupError) {
            console.error('Failed to delete temp file:', cleanupError.message);
        }
    }
}
