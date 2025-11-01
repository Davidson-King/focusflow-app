import React, { useState, useEffect } from 'react';
import { CheckIcon, XIcon } from '../components/Icons';
import Spinner from '../components/Spinner.tsx';

// Test suites to run
const testSuites = [
  { name: 'Modal Component', import: () => import('./components/Modal.test') },
  { name: 'Authentication Flow', import: () => import('./flows/Authentication.test') },
  { name: 'Tasks Flow', import: () => import('./flows/Tasks.test') },
  { name: 'Notes Flow', import: () => import('./flows/Notes.test') },
  { name: 'Journal Flow', import: () => import('./flows/Journal.test') },
  { name: 'Goals & Habits Flow', import: () => import('./flows/Goals.test') },
  { name: 'Timeline Flow', import: () => import('./flows/Timeline.test') },
  { name: 'Settings Flow', import: () => import('./flows/Settings.test') },
  { name: 'End-to-End User Journey', import: () => import('./flows/E2E.test') },
];

interface Test {
    name: string;
    fn: () => Promise<void>;
}

interface TestResult {
  suite: string;
  name:string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  error?: Error;
  duration?: number;
}

const TestRunner: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const initialResults: TestResult[] = [];
    
    // Flatten all tests from all suites
    for (const suite of testSuites) {
        try {
            const { default: tests } = await suite.import();
            tests.forEach((test: Test) => {
                initialResults.push({ suite: suite.name, name: test.name, status: 'pending' });
            });
        } catch (e) {
            console.error(`Failed to load test suite: ${suite.name}`, e);
            initialResults.push({ suite: suite.name, name: `Failed to load suite`, status: 'failed', error: e as Error });
        }
    }
    setResults(initialResults);

    // Run tests sequentially
    for (const suite of testSuites) {
        try {
            const { default: tests } = await suite.import();
            for (const test of tests) {
                
                setResults(prev => prev.map(r => r.name === test.name && r.suite === suite.name ? { ...r, status: 'running' } : r));

                const startTime = performance.now();
                try {
                    await test.fn();
                    const endTime = performance.now();
                    setResults(prev => prev.map(r => r.name === test.name && r.suite === suite.name ? { ...r, status: 'passed', duration: Math.round(endTime - startTime) } : r));
                } catch (e) {
                    const endTime = performance.now();
                    console.error(`Test failed: ${test.name}`, e);
                    setResults(prev => prev.map(r => r.name === test.name && r.suite === suite.name ? { ...r, status: 'failed', error: e as Error, duration: Math.round(endTime - startTime) } : r));
                }
            }
        } catch (e) {
             // Errors during import are already handled above
        }
    }
    setIsRunning(false);
  };
  
  useEffect(() => {
    // Automatically run tests on component mount
    runTests();
  }, []);

  const total = results.length;
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Application Test Suite</h1>
            <button onClick={runTests} disabled={isRunning} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover disabled:bg-opacity-50">
                {isRunning ? 'Running...' : 'Run Tests Again'}
            </button>
        </div>

        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-3xl font-bold">{total}</p>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Total Tests</p>
                </div>
                <div className="text-green-400">
                    <p className="text-3xl font-bold">{passed}</p>
                    <p>Passed</p>
                </div>
                <div className="text-red-400">
                    <p className="text-3xl font-bold">{failed}</p>
                    <p>Failed</p>
                </div>
            </div>
        </div>

        <div>
            {testSuites.map(suite => (
                 <div key={suite.name} className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 p-2 bg-light-card dark:bg-dark-border rounded-t-md">{suite.name}</h3>
                    <div className="space-y-1">
                    {results.filter(r => r.suite === suite.name).map(result => (
                        <div key={result.name} className={`p-3 rounded-md flex items-start gap-4 ${result.status === 'failed' ? 'bg-red-500/10' : 'bg-light-card dark:bg-dark-card'}`}>
                            <div className="flex-shrink-0 mt-1">
                                {result.status === 'passed' && <CheckIcon className="w-5 h-5 text-green-400" />}
                                {result.status === 'failed' && <XIcon className="w-5 h-5 text-red-400" />}
                                {(result.status === 'pending' || result.status === 'running') && <Spinner />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <p className="font-medium">{result.name}</p>
                                    {result.duration != null && <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{result.duration}ms</p>}
                                </div>
                                {result.status === 'failed' && result.error && (
                                    <pre className="mt-2 p-2 bg-light-bg dark:bg-dark-bg text-red-300 text-xs rounded overflow-auto">
                                        <code>{result.error.stack || result.error.message}</code>
                                    </pre>
                                )}
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default TestRunner;