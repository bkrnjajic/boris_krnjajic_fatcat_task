import React, { useEffect } from 'react';
import { MoveResult } from '../../classes/Matrix';
import Button from './StyledButton';
import './Table.css';

export interface ResultInterface  {
    matrixSize: number,
    blockingElementSize: number,
    speed: number,
    result: MoveResult[]
}

interface TableProps {
    testResults: ResultInterface[];
    rerender: number;
}

/**
 * Copies the JSON into clipboard
 * @param jsonString - json data as a string
 */
function createJsonCopyLink(jsonString: string) {
    navigator.clipboard.writeText(jsonString)
        .then(() => {
            console.log('JSON copied to clipboard');
        })
        .catch((err) => {
            console.error('Failed to copy JSON: ', err);
        });
}

const Table: React.FC<TableProps> = ({ testResults, rerender }) => {
    useEffect(() => {
        // simple way to rerender the component on rerender prop variable change
    }, [ rerender]);

    return (
        <table className="results-table">
            <thead>
                <tr>
                    <th>Matrix Size</th>
                    <th>Blocking Element Count</th>
                    <th>Execution Time in ms</th>
                    <th>Result JSON</th>
                </tr>
            </thead>
            <tbody>
                {testResults ? testResults.map(((testResult: ResultInterface, resultIndex: number) => {
                    return (
                        <tr key={resultIndex}>
                            <td>{testResult.matrixSize}</td>
                            <td>{testResult.blockingElementSize}</td>
                            <td>{testResult.speed}</td>
                            <td><Button onClick={() => {
                                createJsonCopyLink(JSON.stringify(testResult.result, null, 2));
                            }}>COPY RESULT JSON</Button></td>
                        </tr>
                    );
                })) : null}
            </tbody>
        </table>
    );
};

export default Table;

