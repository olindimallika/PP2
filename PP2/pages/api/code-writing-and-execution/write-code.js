import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { code, language } = req.body;

    const languageConfig = {
        'c': { extension: '.c', compile: 'gcc', execute: './a.out' },
        'cpp': { extension: '.cpp', compile: 'g++', execute: './a.out' },
        'java': { extension: '.java', compile: 'javac', execute: 'java -cp /tmp Main' },
        'python': { extension: '.py', execute: 'python3' },
        'javascript': { extension: '.js', execute: 'node' }
    };

    if (!code || !language || !languageConfig[language]) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const { extension, compile, execute } = languageConfig[language];
    const fileName = `Main${extension}`;
    const filePath = path.join('/tmp', fileName);

    try {
        await writeFileAsync(filePath, code);

        if (compile) {
            await execAsync(`${compile} ${filePath}`);
        }

        const { stdout, stderr } = await execAsync(`${execute} ${filePath}`);

        res.status(200).json({ stdout, stderr });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await unlinkAsync(filePath).catch(() => {});
    }
}