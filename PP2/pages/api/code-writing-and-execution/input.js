import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

const languageConfigs = {
    c: { 
        extension: ".c", 
        dockerImage: "runtime-c",
        processCode: (code) => {
            const headers = new Set(['<stdio.h>']);
            if (code.includes('strcspn') || code.includes('strlen') || 
                code.includes('strcmp') || code.includes('strcpy')) {
                headers.add('<string.h>');
            }
            if (code.includes('malloc') || code.includes('free') || 
                code.includes('calloc') || code.includes('realloc')) {
                headers.add('<stdlib.h>');
            }
            const headerIncludes = Array.from(headers)
                .map(header => `#include ${header}`)
                .join('\n');
            const codeWithoutIncludes = code.replace(/#include\s+<[^>]+>/g, '').trim();
            return `${headerIncludes}\n\n${codeWithoutIncludes}`;
        },
        getCommand: (codeFileName) => 
            `cd /app && gcc ${codeFileName} -o code.out && ./code.out`
    }, 
    cpp: { 
        extension: ".cpp", 
        dockerImage: "runtime-cpp",
        processCode: (code) => {
            const headers = new Set(['<iostream>', '<string>']);
            if (code.includes('vector')) headers.add('<vector>');
            if (code.includes('map')) headers.add('<map>');
            
            const headerIncludes = Array.from(headers)
                .map(header => `#include ${header}`)
                .join('\n');
            
            let processedCode = headerIncludes + '\nusing namespace std;\n\n';
            processedCode += code.replace(/#include\s+<[^>]+>/g, '').trim();
            
            return processedCode;
        }
    },
    java: {
        extension: ".java",
        dockerImage: "runtime-java",
        processCode: (code, uniqueId) => {
            const className = `Main${uniqueId}`;
            let processedCode = code;
            
            if (code.includes('Scanner') && !code.includes('import java.util.Scanner')) {
                processedCode = 'import java.util.Scanner;\n' + processedCode;
            }

            if (code.includes('class')) {
                processedCode = processedCode.replace(/public\s+class\s+\w+/, `public class ${className}`);
            } else {
                processedCode = `public class ${className} {
                    public static void main(String[] args) {
                        ${code}
                    }
                }`;
            }
            return { processedCode, className };
        }
    },
    python: {
        extension: ".py",
        dockerImage: "runtime-python",
        processCode: (code) => code
    },
    javascript: {
        extension: ".js",
        dockerImage: "runtime-javascript",
        processCode: (code) => {
            code = code
                .replace(/prompt\((.*?)\)/g, 'await input($1)')
                .replace(/alert\((.*?)\)/g, 'console.log($1)');

            return `
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const input = (question) => new Promise((resolve) => {
                readline.question(question, (answer) => {
                resolve(answer);
            });
            });

            (async () => {
                try {
                    ${code}
                } finally {
                    readline.close();
                }
            })();
            `;
        }
    },
    php: {
        extension: ".php",
        dockerImage: "runtime-php",
        getCommand: (codeFileName, inputs) => 
            `cd /app && printf '${inputs.replace(/'/g, "'\\''")}\n' | php ${codeFileName}`,
        processCode: (code) => {
            code = code.replace('?>', '');
            
            if (!code.includes('<?php')) {
                return `<?php\n${code}`;
            }
            return code;
        }
    },
    csharp: {
        extension: ".cs",
        dockerImage: "runtime-csharp",
        processCode: (code) => {
            if (!code.includes("class Program")) {
                return `using System;
                    public class Program 
                    {
                        public static void Main() 
                        {
                            ${code}
                        }
                    }`;
            }
            return code;
        },
        getCommand: (codeFileName) => 
            `rm -rf /app/* && mkdir -p /app && cd /app && dotnet new console --force --no-restore && cp /tmp/${codeFileName} Program.cs && dotnet build -c Release && dotnet run`
    },
    ruby: {
        extension: ".rb",
        dockerImage: "runtime-ruby",
        processCode: (code) => {
            return `begin\n${code}\nrescue => e\nputs "Error: #{e.message}"\nend`;
        },
        getCommand: (codeFileName) => 
            `cd /tmp && ruby ${codeFileName}`
    },
    go: {
        extension: ".go",
        dockerImage: "runtime-go",
        processCode: (code) => {
            let processedCode = code;
            if (!code.includes("package main")) {
                processedCode = "package main\n\n";
                if (!code.includes("import")) {
                    processedCode += 'import "fmt"\n\n';
                }
                if (!code.includes("func main()")) {
                    processedCode += `func main() {\n${code}\n}`;
                } else {
                    processedCode += code;
                }
            }
            return processedCode;
        }
    },
    sql: {
        extension: ".sql",
        dockerImage: "runtime-sql",
        processCode: (code) => {
            const formattedCode = [
                '.mode column',
                '.headers on',
                '.nullvalue NULL',
                '.width 15',
                '.timer off',
                'PRAGMA foreign_keys=ON;',
                code
            ].join('\n');
            
            return formattedCode;
        },
        getCommand: (codeFileName) => {
            return `cd /tmp && sqlite3 :memory: ".read ${codeFileName}"`;
        }
    },
    rust: {
        extension: ".rs",
        dockerImage: "runtime-rust",
        processCode: (code) => {
            if (!code.includes("fn main()")) {
                return `
                use std::io::{self, BufRead};

                fn main() {
                    ${code}
                }`;
            }
            return code;
        }
    }
};

async function runDockerContainer(config, codeFilePath, inputs = '') {
    const tempDir = path.resolve('/tmp');
    const codeFileName = path.basename(codeFilePath);
    
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const volumeMount = `${tempDir}:/tmp`;
    let command;
    switch(config.extension) {
        case '.sql':
            command = `cd /tmp && cat ${codeFileName} | sqlite3`;
            break;
        case '.cs':
            command = `cd /tmp && \
                        mkdir -p app && cd app && \
                        dotnet new console --force --no-restore > /dev/null 2>&1 && \
                        cp /tmp/${codeFileName} Program.cs && \
                        dotnet build -c Release > /dev/null 2>&1 && \
                        timeout 10s dotnet run -c Release`;
            if (inputs) {
                command = `cd /tmp && \
                        mkdir -p app && cd app && \
                        dotnet new console --force --no-restore > /dev/null 2>&1 && \
                        cp /tmp/${codeFileName} Program.cs && \
                        dotnet build -c Release > /dev/null 2>&1 && \
                        (printf '%s\\n' "${inputs.replace(/"/g, '\\"')}" | timeout 10s dotnet run -c Release)`;
            }
            break;
        case '.go':
            command = `cd /tmp && go run ${codeFileName}`;
            break;
        case '.rb':
            command = inputs ? 
                `cd /tmp && printf '%s\\n' "${inputs.replace(/"/g, '\\"')}" | ruby ${codeFileName}` :
                `cd /tmp && ruby ${codeFileName}`;
            break;
        case '.rs':
            command = `cd /tmp && rustc ${codeFileName} -o program && ./program`;
            break;
        case '.cpp':
            command = `cd /tmp && g++ ${codeFileName} -o code.out && ./code.out`;
            break;
        case '.c':
            command = `cd /tmp && gcc ${codeFileName} -o code.out && ./code.out`;
            break;
        case '.py':
            command = `cd /tmp && python3 ${codeFileName}`;
            break;
        case '.js':
            command = inputs ? 
                `cd /tmp && (echo "${inputs.replace(/"/g, '\\"')}" | node ${codeFileName})` :
                `cd /tmp && node ${codeFileName}`;
            break;
        case '.php':
            command = `cd /tmp && printf '${inputs.replace(/'/g, "'\\''")}\n' |

 php ${codeFileName}`;
            break;
        default:
            command = 'echo "Unsupported language"';
    }

    return new Promise((resolve, reject) => {
        exec(command, { env: { ...process.env, DOCKER_HOST: 'unix:///var/run/docker.sock' }, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                return reject(`Execution error: ${stderr || error.message}`);
            }
            resolve(stdout);
        });
    });
}

export default async function handler(req, res) {
    try {
        const { language, code, inputs } = req.body;

        if (!languageConfigs[language]) {
            return res.status(400).json({ message: `Unsupported language: ${language}` });
        }

        const config = languageConfigs[language];
        const uniqueId = uuidv4();
        const codeFileName = `${uniqueId}${config.extension}`;
        const filePath = path.resolve('/tmp', codeFileName);
        const processedCode = config.processCode(code, uniqueId);

        fs.writeFileSync(filePath, processedCode);

        const result = await runDockerContainer(config, codeFileName, inputs);
        res.status(200).json({ output: result.trim() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}