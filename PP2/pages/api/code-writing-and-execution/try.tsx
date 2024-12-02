import { NextApiRequest, NextApiResponse } from 'next';
import { loadPyodide } from 'pyodide/pyodide';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const pyodide = await loadPyodide();
        const { code, input = '' } = req.body;

        // Set up stdin and capture stdout
        await pyodide.runPythonAsync(`
import sys
import io

sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
${input ? `sys.stdin = io.StringIO("""${input}""")` : ''}

${code}

output = sys.stdout.getvalue()
error = sys.stderr.getvalue()
        `);

        const output = await pyodide.globals.get('output');
        const error = await pyodide.globals.get('error');

        if (error) {
            return res.status(400).json({ error });
        }

        return res.status(200).json({ output });
    } catch (error) {
        return res.status(400).json({ 
            error: error instanceof Error ? error.message : 'Execution failed'
        });
    }
}

export const config = {
    api: {
        bodyParser: { sizeLimit: '1mb' },
    },
}