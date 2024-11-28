import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { NextApiRequest, NextApiResponse } from 'next';

// Promisify exec for cleaner async/await usage
const execPromise = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, language } = req.body as { code: string; language: string };

    // Supported programming languages and their configurations
    const supportedLanguages: Record<string, { extension: string; compile?: string; execute: string; image: string }> = {
        'c': { extension: '.c', compile: 'gcc', execute: './a.out', image: 'gcc:latest' },
        'cpp': { extension: '.cpp', compile: 'g++', execute: './a.out', image: 'gcc:latest' },
        'java': { extension: '.java', compile: 'javac', execute: 'java -cp /tmp Main', image: 'openjdk:latest' },
        'python': { extension: '.py', execute: 'python3 /tmp/Main.py', image: 'python:latest' },
        'javascript': { extension: '.js', execute: 'node /tmp/Main.js', image: 'node:latest' },
        'ruby': { extension: '.rb', execute: 'ruby /tmp/Main.rb', image: 'ruby:latest' },
        'go': { extension: '.go', execute: 'go run /tmp/Main.go', image: 'golang:latest' },
        'php': { extension: '.php', execute: 'php /tmp/Main.php', image: 'php:latest' },
        'swift': { extension: '.swift', execute: 'swift /tmp/Main.swift', image: 'swift:latest' },
        'haskell': { extension: '.hs', execute: 'runhaskell /tmp/Main.hs', image: 'haskell:latest' },
    };

    // Validate input
    if (!code || !language || !supportedLanguages[language]) {
        return res.status(400).json({ error: 'Unsupported or missing language.' });
    }

    const { extension, image, compile, execute } = supportedLanguages[language];
    const codeFile = path.join('/tmp', `Main${extension}`);

    try {
        // Step 1: Write the code to a temporary file
        await fs.promises.writeFile(codeFile, code);

        // Step 2: Construct the Docker command
        const dockerCommand = compile
            ? `docker run --rm -v /tmp:/tmp ${image} sh -c "${compile} /tmp/Main${extension} && ${execute}"`
            : `docker run --rm -v /tmp:/tmp ${image} ${execute}`;

        // Step 3: Execute the Docker command
        const { stdout, stderr } = await execPromise(dockerCommand);

        // Step 4: Return the result
        res.status(200).json({ stdout, stderr });
    } catch (error) {
        // Log and handle errors
        console.error('Error executing code:', error);
        res.status(500).json({ error: error.message });
    }
}
