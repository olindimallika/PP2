// import { exec } from 'child_process';
// import fs from 'fs';
// import path from 'path';

// export default async function handler(req, res) {
//     if (req.method === 'POST') {
//         const { code, language, input } = req.body;

//         const languageConfig = {
//             c: { extension: '.c', compile: 'gcc', execute: './a.out' },
//             cpp: { extension: '.cpp', compile: 'g++', execute: './a.out' },
//             java: { extension: '.java', compile: 'javac', execute: 'java Main' },
//             python: { extension: '.py', execute: 'python3' },
//             javascript: { extension: '.js', execute: 'node' },
//             ruby: { extension: '.rb', execute: 'ruby' },
//             rust: { extension: '.rs', compile: 'rustc', execute: './Main' },
//             go: { extension: '.go', execute: 'go run' },
//             swift: { extension: '.swift', execute: 'swift' },
//             php: { extension: '.php', execute: 'php' },
//         };

//         if (!code || !language || !languageConfig[language]) {
//             return res.status(400).json({ error: 'Invalid input. Check code, language, or input parameters.' });
//         }

//         const { extension, compile, execute } = languageConfig[language];
//         const fileName = `Main${extension}`;
//         const filePath = path.join('/tmp', fileName);

//         try {
//             await fs.promises.writeFile(filePath, code);

//             if (compile) {
//                 await new Promise((resolve, reject) => {
//                     exec(`${compile} ${filePath}`, (err, stdout, stderr) => {
//                         if (err) reject({ type: 'Compilation Error', details: stderr });
//                         else resolve();
//                     });
//                 });
//             }

//             const child = exec(`${execute} ${filePath}`, (err, stdout, stderr) => {
//                 if (err) {
//                     return res.status(500).json({
//                         error: `Runtime Error: ${stderr}`,
//                         context: 'An error occurred while executing your program. This may be due to incorrect logic, invalid input, or system-level exceptions.',
//                     });
//                 }
//                 res.status(200).json({ output: stdout.trim(), error: stderr.trim() });
//             });

//             if (input) {
//                 child.stdin.write(input.toString());
//             }
//             child.stdin.end();

//             child.on('exit', async () => {
//                 await fs.promises.unlink(filePath).catch(console.error);
//             });

//         } catch (error) {
//             const errorType = error.type || 'System Error';
//             res.status(500).json({
//                 error: `${errorType}: ${error.details || error.message}`,
//                 context: 'An unexpected error occurred while processing your request.',
//             });
//         }
//     } else {
//         res.status(405).json({ error: 'Method not allowed. Use POST instead.' });
//     }
// }

import { exec } from "child_process";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: "C code is required." });
        }

        const fileName = "Main.c";
        const filePath = path.join("/tmp", fileName);

        try {
            // Write the provided C code to a temporary file
            await fs.promises.writeFile(filePath, code);

            // Run the C Docker container to compile and execute the code
            const dockerCommand = `docker run --rm -v ${filePath}:/usr/src/app/Main.c language-c`;
            exec(dockerCommand, (err, stdout, stderr) => {
                if (err) {
                    return res.status(500).json({
                        error: `Execution Error: ${stderr || "Unknown error"}`,
                    });
                }

                res.status(200).json({ output: stdout.trim(), error: stderr.trim() });
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: "Method not allowed. Use POST." });
    }
}
