import React, { useEffect, useRef } from 'react';
import { Matrix, MoveResult } from '../../classes/Matrix';
import Button from './StyledButton';
import { createJsonCopyLink } from '../../helpers/clipboard';
import './Table.css';

export interface ResultInterface  {
    gameMatrix: Matrix,
    matrixSize: number,
    blockingElementSize: number,
    speed: number,
    result: MoveResult[]
}

interface TableProps {
    testResults: ResultInterface[];
    rerenderTable: number;
}

const Table: React.FC<TableProps> = ({ testResults, rerenderTable }) => {
    const prevRerenderTableRef = useRef(rerenderTable);

    useEffect(() => {
        if (prevRerenderTableRef.current !== rerenderTable) {
            window.scrollTo({
                top: document.body.scrollHeight,
                left: 0,
                behavior: 'smooth'
            });
        }
        prevRerenderTableRef.current = rerenderTable;
    }, [ rerenderTable]);


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

