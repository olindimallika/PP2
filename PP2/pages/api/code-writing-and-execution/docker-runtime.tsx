import type { Docker as DockerType, Container, ContainerCreateOptions } from 'dockerode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Import Docker dynamically to avoid webpack issues
const Docker = require('dockerode');

export type ExecutionResult = {
    stdout: string;
    stderr: string;
    exitCode: number;
    compileOutput?: string;
    runtimeError?: string;
}

export type LanguageConfig = {
    dockerfile: string;
    fileExtension: string;
    compileCmd?: string[];
    runCmd: string[];
}

export type RuntimeOptions = {
    memoryLimit?: number;
    cpuLimit?: string;
    timeout?: number;
}

export class DockerRuntime {
    private docker: DockerType;
    private runtimeDir: string;
    private images: Map<string, string>;
    private readonly MEMORY_LIMIT = 128 * 1024 * 1024;
    private readonly CPU_LIMIT = '1';

    constructor(runtimeDir: string = './runtime') {
        this.docker = new Docker({
            socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock'
        });
        this.runtimeDir = runtimeDir;
        this.images = new Map();
        
        Object.keys(this.languageConfigs).forEach(lang => {
            this.images.set(lang, `runtime-${lang}:latest`);
        });
    }

    private languageConfigs: Record<string, LanguageConfig> = {
        c: {
            dockerfile: 'runtime-c',
            fileExtension: '.c',
            compileCmd: ['gcc', '-o', '/app/code.out', '/app/code.c'],
            runCmd: ['sh', '-c', 'cat /app/input.txt | /app/code.out']
        },
        cpp: {
            dockerfile: 'runtime-cpp',
            fileExtension: '.cpp',
            compileCmd: ['g++', '-o', '/app/code.out', '/app/code.cpp'],
            runCmd: ['sh', '-c', 'cat /app/input.txt | /app/code.out']
        },
        csharp: {
            dockerfile: 'runtime-csharp',
            fileExtension: '.cs',
            compileCmd: ['dotnet', 'build', '/app/project.csproj', '-c', 'Release', '-o', '/app/out'],
            runCmd: ['sh', '-c', 'cat /app/input.txt | /app/out/project']
        },
        go: {
            dockerfile: 'runtime-go',
            fileExtension: '.go',
            compileCmd: ['go', 'build', '-o', '/app/code.out', '/app/code.go'],
            // Modified to use shell command to pipe input from input.txt
            runCmd: ['sh', '-c', 'cat /app/input.txt | /app/code.out']
        },
        java: {
            dockerfile: 'runtime-java',
            fileExtension: '.java',
            compileCmd: ['sh', '-c', 'cd /app && javac Main.java'],
            runCmd: ['sh', '-c', 'cd /app && java Main']
        },
        javascript: {
            dockerfile: 'runtime-javascript',
            fileExtension: '.js',
            runCmd: ['node', '/app/code.js']  // Simplified command
        },
        
        php: {
            dockerfile: 'runtime-php',
            fileExtension: '.php',
            runCmd: ['sh', '-c', 'cat /app/input.txt | php /app/code.php']  // Modified to pipe input
        },
        python: {
            dockerfile: 'runtime-python',
            fileExtension: '.py',
            // Modified to explicitly pipe input.txt to python
            runCmd: ['sh', '-c', 'cat /app/input.txt | python -u /app/code.py']
        },
        ruby: {
            dockerfile: 'runtime-ruby',
            fileExtension: '.rb',
            // Modified to explicitly pipe input.txt to ruby
            runCmd: ['sh', '-c', 'cat /app/input.txt | ruby /app/code.rb']
        },
        rust: {
            dockerfile: 'runtime-rust',
            fileExtension: '.rs',
            compileCmd: ['rustc', '/app/code.rs', '-o', '/app/code.out'],
            // Modified to pipe input.txt to the Rust executable
            runCmd: ['sh', '-c', 'cat /app/input.txt | /app/code.out']
        },
        sql: {
            dockerfile: 'runtime-sql',
            fileExtension: '.sql',
            // Simplified to just execute the SQL file
            runCmd: ['sh', '-c', 'sqlite3 :memory: < /app/code.sql']
        },
    };

    private prepareJavaScriptCode(code: string, hasStdin: boolean): string {
        if (!hasStdin) {
            // For non-readline code, just execute the original code
            return code;
        }
    
        // For readline code, inject our input handling before the user's code
        return `
    // Clear any cached modules
    Object.keys(require.cache).forEach(key => {
        delete require.cache[key];
    });
    
    const fs = require('fs');
    const input = fs.readFileSync('/app/input.txt', 'utf8').trim().split('\\n');
    let inputIndex = 0;
    
    // Override readline before it's required by the user code
    const originalRequire = require;
    require = function(moduleName) {
        if (moduleName === 'readline') {
            const realReadline = originalRequire(moduleName);
            return {
                createInterface: (options) => {
                    const rl = realReadline.createInterface(options);
                    rl.question = (query, callback) => {
                        const response = input[inputIndex] || '';
                        inputIndex++;
                        callback(response);
                    };
                    return rl;
                }
            };
        }
        return originalRequire(moduleName);
    };
    
    // Run the actual code
    ${code}
    `;
    }

    private prepareExecutionWithCSharpWrapper(code: string): string {
        // Check if the code already contains a class definition or Program.Main
        const hasClassDefinition = code.includes("class Program") || code.includes("class ");
        const hasMainMethod = code.includes("static void Main") || code.includes("static async Task Main");
        
        if (hasClassDefinition || hasMainMethod) {
            // If it has proper structure, return as-is
            return code;
        }
        
        // Otherwise, wrap the code in a proper Program class
        return `
    using System;
    
    public class Program
    {
        public static void Main(string[] args)
        {
            ${code}
        }
    }`;
    }
    
    
    
    private async prepareExecution(
        language: string,
        code: string,
        stdin?: string
    ): Promise<{ tempDir: string; execId: string }> {
        if (!this.languageConfigs[language]) {
            throw new Error(`Unsupported language: ${language}`);
        }

        const execId = uuidv4();
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `code_exec_${execId}_`));

        const config = this.languageConfigs[language];
        const codeFile = language === 'java' ? 'Main.java' : `code${config.fileExtension}`;
        
        const codePath = path.join(tempDir, codeFile);
            // Special handling for C#
    // Special handling for C#
    if (language === 'csharp') {
        // Create project file
        const projectContent = `
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <OutputType>Exe</OutputType>
        <TargetFramework>net7.0</TargetFramework>
        <ImplicitUsings>enable</ImplicitUsings>
        <Nullable>enable</Nullable>
    </PropertyGroup>
</Project>`;
        fs.writeFileSync(path.join(tempDir, 'project.csproj'), projectContent);
        
        // Wrap the code if needed
        const wrappedCode = this.prepareExecutionWithCSharpWrapper(code);
        fs.writeFileSync(codePath, wrappedCode);
    } else if (language === 'javascript') {
        const hasStdin = code.includes('readline') || code.includes('rl.question');
        const modifiedCode = this.prepareJavaScriptCode(code, hasStdin);
        fs.writeFileSync(codePath, modifiedCode);
    } else if (language === 'java') {
        const modifiedCode = code.replace(/public\s+class\s+\w+/, 'public class Main');
        fs.writeFileSync(codePath, modifiedCode);
        } else if (language === 'sql') {
            // Replace double quotes with single quotes for string literals in SQL
            const modifiedCode = code.replace(/"([^"]+)"/g, "'$1'");
            fs.writeFileSync(codePath, modifiedCode);
        }else {
            fs.writeFileSync(codePath, code);
        }

            //    // Modify JavaScript code to handle stdin if needed
            //    const finalCode = language === 'javascript' 
            //    ? this.prepareJavaScriptCode(code)
            //    : code;
   // Write stdin to input.txt
   const normalizedStdin = (stdin || '').replace(/\r\n/g, '\n');
   fs.writeFileSync(path.join(tempDir, 'input.txt'), normalizedStdin);

   return { tempDir, execId };
    }

    async execute(
        language: string,
        code: string,
        stdin?: string,
        options: RuntimeOptions = {}
    ): Promise<ExecutionResult> {
        if (!this.images.has(language)) {
            throw new Error(`Runtime for ${language} not built`);
        }
    
        const { tempDir, execId } = await this.prepareExecution(language, code, stdin);
        const config = this.languageConfigs[language];
        let container: Container | null = null;
    
        try {
            const containerConfig: ContainerCreateOptions = {
                Image: this.images.get(language)!,
                Cmd: ['sh', '-c', 'tail -f /dev/null'],  // Keep container running
                HostConfig: {
                    Binds: [`${tempDir}:/app`],
                    Memory: options.memoryLimit || this.MEMORY_LIMIT,
                    CpuQuota: parseInt((options.cpuLimit || this.CPU_LIMIT)) * 100000,
                    CpuPeriod: 100000,
                    NetworkMode: 'none'
                },
                Tty: false,
                OpenStdin: true,
                StdinOnce: true,
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                WorkingDir: '/app'
            };
    
            container = await this.docker.createContainer(containerConfig);
            await container.start();
    
            // Only handle stdin streaming for non-Java languages
            if (stdin && language !== 'java') {
                const stream = await container.attach({
                    stream: true,
                    stdin: true,
                    stdout: true,
                    stderr: true
                });
                
                stream.write(stdin);
                stream.end();
            }
    
            const result: ExecutionResult = {
                stdout: '',
                stderr: '',
                exitCode: 0
            };
    
            // Java-specific handling
            if (language === 'java') {
                try {
                    const compileExec = await container.exec({
                        Cmd: ['sh', '-c', 'cd /app && javac Main.java'],
                        AttachStdout: true,
                        AttachStderr: true,
                        WorkingDir: '/app'
                    });
    
                    const compileStream = await compileExec.start();
                    const compileOutput = await this.streamToString(compileStream);
                    const compileInspect = await compileExec.inspect();
    
                    if (compileInspect.ExitCode !== 0) {
                        result.exitCode = compileInspect.ExitCode;
                        result.stderr = compileOutput || 'Compilation failed';
                        return result;
                    }
    
                    // Run Java program with stdin
                    const runCmd = stdin 
                        ? `cd /app && java Main < /app/input.txt`
                        : 'cd /app && java Main';
    
                    const exec = await container.exec({
                        Cmd: ['sh', '-c', runCmd],
                        AttachStdout: true,
                        AttachStderr: true,
                        WorkingDir: '/app'
                    });
    
                    const stream = await exec.start();
                    const output = await this.streamToString(stream);
                    const inspect = await exec.inspect();
    
                    const cleanedOutput = this.cleanOutput(output);
                    
                    if (inspect.ExitCode !== 0) {
                        result.stderr = cleanedOutput;
                    } else {
                        result.stdout = cleanedOutput;
                    }
                    
                    result.exitCode = inspect.ExitCode;
                    return result;
                } catch (error) {
                    throw new Error('Java execution failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
                }
            }
    
            // Non-Java languages handling
            // Compile if needed
            if (config.compileCmd) {
                try {
                    const compileExec = await container.exec({
                        Cmd: config.compileCmd,
                        AttachStdout: true,
                        AttachStderr: true,
                    });
    
                    const compileStream = await compileExec.start();
                    const compileOutput = await this.streamToString(compileStream);
                    
                    if (compileOutput) {
                        result.compileOutput = this.cleanOutput(compileOutput);
                    }
    
                    const compileInspect = await compileExec.inspect();
                    if (compileInspect.ExitCode !== 0) {
                        result.exitCode = compileInspect.ExitCode;
                        result.stderr = result.compileOutput || 'Compilation failed';
                        return result;
                    }
                } catch (error) {
                    if (error instanceof Error && error.message.includes('not running')) {
                        await container.start();
                        throw new Error('Container stopped during compilation');
                    }
                    throw error;
                }
            }
    
            // Execute code for non-Java languages
            try {
                const exec = await container.exec({
                    Cmd: config.runCmd,
                    AttachStdout: true,
                    AttachStderr: true,
                    Tty: false
                });
    
                const stream = await exec.start();
                const output = await this.streamToString(stream);
                const inspect = await exec.inspect();
    
                
                const cleanedOutput = this.cleanOutput(output);

                if (inspect.ExitCode !== 0) {
                    result.stderr = cleanedOutput;
                } else {
                    result.stdout = cleanedOutput;
                }
                
                result.exitCode = inspect.ExitCode;
    
            } catch (error) {
                if (error instanceof Error && error.message.includes('not running')) {
                    throw new Error('Container stopped during execution');
                }
                throw error;
            }
    
            return result;
    
        } catch (error) {
            return {
                stdout: '',
                stderr: error instanceof Error ? error.message : 'Unknown error',
                exitCode: 1,
                runtimeError: 'Execution failed'
            };
        } finally {
            if (container) {
                try {
                    // Force remove the container
                    await container.remove({ force: true, v: true });
                } catch {
                    // Ignore cleanup errors
                }
            }
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            } catch {
                // Ignore cleanup errors
            }
        }
    }
    // Logic by chatgpt, prompt was "Allow users to execute code and run it"
    private cleanOutput(output: string): string {
        return output
            .replace(/^[^\w\n]*\.\s*/, '') // Remove leading special characters or a period
            .replace(/^[^\w]*(\w)/, '$1') // Remove all leading non-alphanumeric characters
            .replace(/\*\s*/g, '') // Remove standalone asterisks and spaces after them
            .replace(/^\s*[\uFEFF\x00-\x1F]*[\[\(]?/gm, '') // Remove leading weird characters, control chars, and optional brackets per line
            .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove all control characters
            .replace(/\r\n/g, '\n') // Normalize line endings (CRLF -> LF)
            .replace(/\n{2,}/g, '\n') // Collapse multiple blank lines
            .trim() // Trim any remaining leading/trailing whitespace
            .split('\n') // Split into lines
            .map(line => line.trim()) // Trim each line to remove stray spaces
            .join('\n'); // Join the lines back with a single newline character
    }


    
    
    
    private async streamToString(stream: NodeJS.ReadableStream): Promise<string> {
        return new Promise((resolve, reject) => {
            let output = '';
            
            stream.on('data', (chunk) => {
                output += chunk;
            });
            
            stream.on('error', reject);
            
            stream.on('end', () => {
                resolve(output);
            });
        });
    }

    async cleanup(): Promise<void> {
        const containers = await this.docker.listContainers();
        for (const container of containers) {
            if (container.Image.startsWith('runtime-')) {
                const containerInstance = this.docker.getContainer(container.Id);
                await containerInstance.remove({ force: true });
            }
        }
    }
}

export default DockerRuntime;