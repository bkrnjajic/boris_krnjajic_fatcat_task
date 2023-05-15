import { useState, useEffect, useLayoutEffect } from 'react';
import Button from './interaction/StyledButton.js';
import Table, { ResultInterface } from './interaction/Table.js';
import Canvas from './GameCanvas.js';
import { processWidthSize } from '../helpers/display.js';
import './MatrixContainer.css';
import { MatrixCoordinate } from '../classes/MatrixCoordinate.js';


/***
 * Retrieves the result from the generator. Returns null if none was found (generator has been closed)
 */
function generateTestResults(testResultGenerator: Generator<ResultInterface>): ResultInterface|null {
    const testResult = testResultGenerator.next();

    if (testResult.done) {
        return null;
    }

    return testResult.value;
}

/**
 * Component props
 */
interface ResultCalculatorProps {
    resultGenerator: Generator<ResultInterface>;
    regenerateResults: () => void
}

/***
 * Canvas class initialization
 */
const ResultCalculator: React.FC<ResultCalculatorProps> = ({resultGenerator, regenerateResults} : ResultCalculatorProps) => {
    const [appWidth, setAppWidth] = useState<number>(0);
    const [rerenderValue, rerender] = useState<number>(0);
    const [rerenderTableValue, rerenderTable] = useState<number>(0);
    const [disableButton, changeButtonState] = useState<boolean>(false);
    const [result, setResult] = useState<ResultInterface|undefined|null>();
    const [gameMatrix, setNewGameMatrix] = useState<MatrixCoordinate[][]>([]);
    const [frameCounter, setFrameCounter] = useState<number>(0);
    const [tableResults, updateTableResults] = useState<ResultInterface[]>([]);
    
    /**
     * Get the current site size and re-render the page based on it to get the matrix
     * properly shown in full size all the time
     */
    useLayoutEffect(() => {
        function updateSize() {
            setAppWidth(processWidthSize(document.documentElement.clientWidth, result?.matrixSize));
        }

        window.addEventListener('resize', updateSize);
        updateSize();

        return () => window.removeEventListener('resize', updateSize);
    });

    /**
     * Runs the test first, and then animates the matrix based on the historical data. This way we get the actual
     * execution value without any UI rendering.
     */
    useEffect(() => {
        if (!disableButton) {
            return;
        }

        if (result === undefined) {
            const result: ResultInterface|null = generateTestResults(resultGenerator);
            if (result) {
                setResult(result);
                tableResults.push(result);
                rerenderTable(rerenderTableValue + 1);
            }
        } else if (result) {
            if (frameCounter < result.gameMatrix.historicMatrixData.length) {
                setNewGameMatrix(result.gameMatrix.historicMatrixData[frameCounter]);
                setFrameCounter(frameCounter + 1);
                setTimeout(() => rerender(rerenderValue + 1), 200);
            } else {
                const result: ResultInterface|null = generateTestResults(resultGenerator);
                if (result) {
                    setFrameCounter(0);
                    setResult(result);
                    tableResults.push(result);
                    rerenderTable(rerenderTableValue + 1);
                } else {
                    setResult(null);
                }
            }
        } else {
            setFrameCounter(0);
            changeButtonState(false);
            setResult(undefined);
            regenerateResults();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result, disableButton, rerenderValue]);

    return (
        <div className="results">
            <Button onClick={() => {
                if (disableButton) {
                    setFrameCounter(0);
                    changeButtonState(false);
                    setResult(undefined);
                    regenerateResults();
                } else {
                    changeButtonState(true);
                    updateTableResults([]);
                }
            }}>
                {disableButton ? 'Stop Tests:' : 'Run Tests:' }
            </Button>
            <div className="card">
                <Canvas matrix={gameMatrix} size={appWidth} rerender={rerenderValue}/>
            </div>
            <Table testResults={tableResults} rerenderTable={rerenderTableValue}></Table>
        </div>
    );
};

export default ResultCalculator;