import { NextApiRequest, NextApiResponse } from 'next';
import DockerRuntime from './docker-runtime';

let runtime: DockerRuntime | null = null;

function initializeRuntime() {
    if (!runtime) {
        try {
            runtime = new DockerRuntime('./runtime');
        } catch (error) {
            console.error('Failed to initialize Docker runtime:', error);
            throw error;
        }
    }
    return runtime;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const runtime = initializeRuntime();

        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' });
        }

        const { code, language, input } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                errorType: 'ValidationError',
                message: 'Code and language are required.'
            });
        }

        const result = await runtime.execute(language, code, input);

        if (result.exitCode !== 0) {
            return res.status(400).json({
                errorType: result.runtimeError ? 'RuntimeError' : 'CompilationError',
                message: result.stderr || result.compileOutput || 'Execution failed',
                output: result.stdout
            });
        }

        return res.status(200).json({
            output: result.stdout
        });

    } catch (error) {
        console.error('Code execution error:', error);
        return res.status(500).json({
            errorType: 'ServerError',
            message: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
        responseLimit: false,
    },
}