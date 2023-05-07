import React, { useLayoutEffect, useEffect, useState } from "react";
import { Matrix, MatrixProps } from '../classes/Matrix';
import Canvas from './GameCanvas.js';
import Button from './interaction/StyledButton.js'
import { Input, InputDefinition } from './interaction/Input.js'
import './MatrixContainer.css';

enum InputMatrixTypes {
    SIZE = 'size',
    START_X = 'start.0',
    START_Y = 'start.1',
    END_X = 'end.0',
    END_Y = 'end.1',
    BLOCK_COUNT = 'blockingObjectCount',
}

/***
 * We want to make sure not to make the matrix huge, so we will limit the size
 * based on the numberof tiles. single tile can be maximum 120 px wide
 */
function processWidthSize(screenSize: number, matrix: Matrix) {
    const maxSizePerMatrix = matrix.size * 120 > 1200 ? 1200 : matrix.size * 120;
    return screenSize > maxSizePerMatrix ? maxSizePerMatrix : screenSize;
}

/**
 * Cleans the simple values (matrix values representing numbers)
 * input string and saves it on the MatrixProps
 * @param type - matrix value type
 * @param value - new value
 * @param propToUpdate - prop used to rerender the matrix on restart button
 * @returns string value if there was an error
 */
function updateMatrixSimpleValues(type: InputMatrixTypes, value: string, propToUpdate: MatrixProps): string|void {
    // we only need integers, so to avoid writing code which might not be used, we will only
    // check inputs for integers
    if (Number.isNaN(value)) {
        return 'Value must be a number';
    }
    const targetValue = Number(value);


    // type specific validation
    if (type === InputMatrixTypes.SIZE && (targetValue < 4 || targetValue > 200)) {
        return 'Matrix size can not be smaller then 3, or larger then 200. Anything larger then 20 will use a lot of your computer resources.';
    }

    if (type === InputMatrixTypes.BLOCK_COUNT) {
        if (targetValue < 0 ) {
            return 'Block count must be zero or a positive integer value.';
        }
        if (targetValue > propToUpdate.size * 2 - 1) {
            return 'Maximum of blocks generated must be less then there can bee free tiles to finish the maze. Number of blocks must be less then: (Matrix Size * 2 - 1)';
        }
    }

    let propName: string = type.split('.')[0];
    propToUpdate[propName] = targetValue;
}

/**
 * Cleans the coordinate values (matrix values representing coordinates)
 * input string and saves it on the MatrixProps
 * @param type - matrix value type
 * @param value - new value
 * @param propToUpdate - prop used to rerender the matrix on restart button
 * @returns string value if there was an error
 */
function updateMatrixCoordinates(type: InputMatrixTypes, value: string, propToUpdate: MatrixProps): string|void {
    // we only need integers, so to avoid writing code which might not be used, we will only
    // check inputs for integers
    if (Number.isNaN(value) || value == null) {
        return 'Value must be a number';
    }
    const targetValue: number = Number(value);

    if (type === InputMatrixTypes.START_X || type === InputMatrixTypes.START_Y) {
        if (targetValue < 0 || targetValue > propToUpdate.size - 1) {
            return 'Start coordinate must be a valid matrix coordinate in the range of the matrix size.';
        }

        if (targetValue === propToUpdate.end[type === InputMatrixTypes.START_X ? 0 : 1]
            && propToUpdate.start[type === InputMatrixTypes.START_X ? 1 : 0] === propToUpdate.end[type === InputMatrixTypes.START_X ? 1 : 0]
        ) {
            return 'Start coordinate can not be on the same place as end coordinates.';
        }
    }

    if (type === InputMatrixTypes.END_X || type === InputMatrixTypes.END_Y) {
        if (targetValue < 0 || targetValue > propToUpdate.size - 1) {
            return 'End coordinate must be a valid matrix coordinate.';
        }
        if (targetValue === propToUpdate.start[type === InputMatrixTypes.END_X ? 0 : 1]
            && propToUpdate.start[type === InputMatrixTypes.END_X ? 1 : 0] === propToUpdate.end[type === InputMatrixTypes.END_X ? 1 : 0]
        ) {
            return 'End coordinate can not be on the same place as the start coordinates.';
        }
    }

    const targetInfo = type.split('.');
    let propName: string = targetInfo[0];
    let arrayIndex: number = Number(targetInfo[1]);
    propToUpdate[propName][arrayIndex] = targetValue;
}

/**
 * Defines the input values on the page
 * @param matrixStartValues - matrix MatrixProps values
 * @returns array of input data representing InputDefinition
 */
function defineInputs(matrixStartValues: MatrixProps): InputDefinition[] {
    const sizeInput = new InputDefinition (
        'Enter matrix size:',
        'number',
        matrixStartValues.size,
        undefined,
        (event) => {
            sizeInput.updateErrorMessage(updateMatrixSimpleValues(InputMatrixTypes.SIZE, event.target.value, matrixStartValues) ?? '');
        }
    );
    const xStartCooInput = new InputDefinition (
        'Enter matrix X start position:',
        'number',
        matrixStartValues.start[0],
        undefined,
        (event) => {
            xStartCooInput.updateErrorMessage(updateMatrixCoordinates(InputMatrixTypes.START_X, event.target.value, matrixStartValues) ?? '');
        }
    )

    const yStartCooInput = new InputDefinition (
        'Enter matrix Y start position:',
        'number',
        matrixStartValues.start[1],
        undefined,
        (event) => {
            yStartCooInput.updateErrorMessage(updateMatrixCoordinates(InputMatrixTypes.START_Y, event.target.value, matrixStartValues) ?? '');
        }
    );
    const xEndCooInput = new InputDefinition (
        'Enter matrix X end position:',
        'number',
        matrixStartValues.end[0],
        undefined,
        (event) => {
            xEndCooInput.updateErrorMessage(updateMatrixCoordinates(InputMatrixTypes.END_X, event.target.value, matrixStartValues) ?? '');
        }
        
    );
    const yEndCooInput = new InputDefinition (
        'Enter matrix Y end position:',
        'number',
        matrixStartValues.end[1],
        undefined,
        (event) => {
            yEndCooInput.updateErrorMessage(updateMatrixCoordinates(InputMatrixTypes.END_Y, event.target.value, matrixStartValues) ?? '');
        }
    );
    const blockSizeCount = new InputDefinition (
        'Enter blocking element count:',
        'number',
        matrixStartValues.blockingObjectCount,
        undefined,
        (event) => {
            blockSizeCount.updateErrorMessage(updateMatrixSimpleValues(InputMatrixTypes.BLOCK_COUNT, event.target.value, matrixStartValues) ?? '');
        }
    );

    return [
        sizeInput,
        xStartCooInput,
        yStartCooInput,
        xEndCooInput,
        yEndCooInput,
        blockSizeCount
    ]
}

/**
 * Component props
 */
interface MatrixContainerProps {
    gameMatrix: Matrix;
    matrixProps: MatrixProps;
}

/***
 * Canvas class initialization
 */
const MatrixContainer: React.FC<MatrixContainerProps> = ({ gameMatrix, matrixProps }: MatrixContainerProps) => {
    const [appWidth, setAppWidth] = useState<number>(0);
    const [rerenderValue, rerender] = useState<number>(0);
    const [gameStepCount, updateGameStep] = useState<number>(0);
    const [inputs] = useState(defineInputs(matrixProps));
    const [gameRunning, setGameStatus] = useState<boolean>(false)
    let intervalId: null|NodeJS.Timeout = null;
    /**
     * Get the current site size and re-render the page based on it to get the matrix
     * properly shown in full size all the time
     */
    useLayoutEffect(() => {
        function updateSize() {
            setAppWidth(processWidthSize(document.documentElement.clientWidth, gameMatrix));
        }

        window.addEventListener('resize', updateSize);
        updateSize();

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        if (!gameMatrix.isDone() && gameRunning) {
            gameMatrix.movePlayer();
            intervalId = setTimeout(() => updateGameStep(gameStepCount + 1), 350)
        }
    }, [gameStepCount, gameRunning]);

    return (
        <div>
            <Canvas matrix={gameMatrix} size={appWidth} rerender={rerenderValue + gameStepCount}/>
            <div className="input-container">
                {inputs.map((input: InputDefinition, index: number) => {
                    return <Input
                        key={index}
                        inputDefinition={input}
                    />
                })}
            </div>
            <div className="button-container">
                <Button onClick={() => {
                    setGameStatus(false);
                    if (intervalId !== null) {
                        clearTimeout(intervalId);
                        intervalId = null;
                    }
                    gameMatrix.reloadMatrix(matrixProps);
                    setAppWidth(processWidthSize(document.documentElement.clientWidth, gameMatrix));
                    rerender(rerenderValue + 1);
                }}>
                    Restart
                </Button>
                <Button onClick={() => {
                    gameMatrix.movePlayer();
                    rerender(rerenderValue + 1);
                }}>
                    Move a Step
                </Button>
                <Button
                    onClick={() => {
                        setGameStatus(true);
                    }}
                    disabled={gameRunning}
                >
                    Move to End
                </Button>
            </div>
        </div>
    );
};

export default MatrixContainer;