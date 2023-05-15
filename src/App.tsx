import './App.css';
import Game from './components/MatrixContainer';
import ResultCalculator from './components/ResultCalculator';
import { Matrix, MatrixProps } from './classes/Matrix';
import { ResultInterface } from './components/interaction/Table';
import { useState } from 'react';

// test configuration
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
 * Test generator that only runs individual tests by requesting the generator value.
 * @returns ResultInterface[]
 */
function* calculate(): Generator<ResultInterface> {
    for (let index = 0; index < resultMatrixConfigurations.length; index++) {
        const matrixConfiguration: MatrixProps = resultMatrixConfigurations[index];
        const gameMatrix = new Matrix(matrixConfiguration);
        const startTime = Date.now();
        while(!gameMatrix.isDone()) {
            gameMatrix.movePlayer();
        }
        const endTime = Date.now();

        yield {
            gameMatrix: gameMatrix,
            matrixSize: gameMatrix.size,
            blockingElementSize: gameMatrix.blockingObjectCount,
            speed: endTime - startTime,
            result: gameMatrix.gameLog
        };
    }
}

/***
 * App class initialization
 */
const App: React.FC = () => {
    const [resultsGenerator, rebuildResultsGenerator] = useState<Generator<ResultInterface>>(calculate());

    const gameMatrix: Matrix = Matrix.getLast();
    const matrixProps: MatrixProps = {
        size: gameMatrix.size,
        start: gameMatrix.getPlayersCoordinates().getCoordinates(),
        end: gameMatrix.getEndCoordinates().getCoordinates(),
        blockingObjectCount: gameMatrix.blockingObjectCount
    };

    return (
        <>
            <div className="card">
                <Game gameMatrix={gameMatrix} matrixProps={matrixProps}/>
            </div>
            <div className="result-card">
                <ResultCalculator
                    resultGenerator={resultsGenerator}
                    regenerateResults={() => {
                        rebuildResultsGenerator(calculate());
                    }}
                />
            </div>
        </>
    );
};

export default App;
