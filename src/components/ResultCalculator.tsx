import { useState, useEffect } from 'react';
import { Matrix, MatrixProps } from '../classes/Matrix';
import Button from './interaction/StyledButton.js';
import Table, { ResultInterface } from './interaction/Table.js';
import './MatrixContainer.css';

const resultMatrixConfigurations: MatrixProps[] = [
    {
        size: 5,
        blockingObjectCount: 1,
        start: [0, 0],
        end: [4, 4]
    },
    {
        size: 5,
        blockingObjectCount: 2,
        start: [0, 0],
        end: [4, 4]
    },
    {
        size: 5,
        blockingObjectCount: 3,
        start: [0, 0],
        end: [4, 4]
    },{
        size: 10,
        blockingObjectCount: 2,
        start: [0, 0],
        end: [9, 9]
    },
    {
        size: 10,
        blockingObjectCount: 3,
        start: [0, 0],
        end: [9, 9]
    },
    {
        size: 10,
        blockingObjectCount: 4,
        start: [0, 0],
        end: [9, 9]
    },
    {
        size: 20,
        blockingObjectCount: 3,
        start: [0, 0],
        end: [19, 19]
    },
    {
        size: 20,
        blockingObjectCount: 4,
        start: [0, 0],
        end: [19, 19]
    },
    {
        size: 20,
        blockingObjectCount: 5,
        start: [0, 0],
        end: [19, 19]
    },
    {
        size: 50,
        blockingObjectCount: 5,
        start: [0, 0],
        end: [49, 49]
    },
    {
        size: 50,
        blockingObjectCount: 6,
        start: [0, 0],
        end: [49, 49]
    },
    {
        size: 50,
        blockingObjectCount: 7,
        start: [0, 0],
        end: [49, 49]
    }
];

/**
 * Runs the test on resultMatrixConfigurations and returns the results
 * @returns ResultInterface[]
 */
function calculate() {
    const results: ResultInterface[] = [];

    resultMatrixConfigurations.forEach((matrixConfiguration: MatrixProps) => {
        const gameMatrix = new Matrix(matrixConfiguration);
        const startTime = Date.now();
        while(!gameMatrix.isDone()) {
            gameMatrix.movePlayer();
        }
        const endTime = Date.now();

        results.push({
            matrixSize: gameMatrix.size,
            blockingElementSize: gameMatrix.blockingObjectCount,
            speed: endTime - startTime,
            result: gameMatrix.gameLog
        });
    });

    return results;
}

function ResultCalculator() {
    const [rerenderValue, rerender] = useState<number>(0);
    const [disableButton, changeButtonState] = useState<boolean>(false);
    const [results, setResults] = useState<ResultInterface[]>([]);

    useEffect(() => {
        if (disableButton) {
            // in the case of no timeout here, the button will not actualy get disabled, because
            // setResults will take the code execution and block the UI
            setTimeout(() => {
                setResults(calculate());
                rerender(rerenderValue + 1);
                changeButtonState(false);
            }, 100);
        }
    }, [ disableButton, rerenderValue]);

    return (
        <div className="results">
            <Button disabled={disableButton} onClick={() => {
                changeButtonState(true);
            }}>
                Calculate test results:
            </Button>
            <Table testResults={results} rerender={rerenderValue}></Table>
        </div>
    );
}

export default ResultCalculator;