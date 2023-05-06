import { useLayoutEffect, useState } from "react";
import { Matrix } from '../classes/Matrix';
import { Canvas } from './GameCanvas.js';
import Button from './interaction/StyledButton.js'
import Input from './interaction/Input.js'
import './MatrixContainer.css';

/**
 * Creates a simple test representation of the target matrix
 * @returns 
 */
const MatrixContainer = () => {
    const [appWidth, setAppWidth] = useState<number>(0);
    const [matrixSize, setMatrixSize] = useState<number>(0);

    function handleMatrixSizeChange(event: any) {
        setMatrixSize(event.target.value);
    }
    
    const gameMatrix: Matrix = Matrix.getLast();
    /**
     * Get the current site size and re-render the page based on it to get the matrix
     * properly shown in full size all the time
     */
    useLayoutEffect(() => {
        function updateSize() {
            setAppWidth(document.documentElement.clientWidth);
        }

        window.addEventListener('resize', updateSize);
        updateSize();

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return (
        <div>
            <Canvas matrix={gameMatrix} size={appWidth}/>
            <div className="input-container">
                <Input
                    label="Enter matrix size:"
                    type="number"
                    value={matrixSize}
                    onChange={handleMatrixSizeChange}
                />
                <Input
                    label="Enter matrix X start position:"
                    type="number"
                    value={matrixSize}
                    onChange={handleMatrixSizeChange}
                />
                <Input
                    label="Enter matrix Y start position:"
                    type="number"
                    value={matrixSize}
                    onChange={handleMatrixSizeChange}
                />
                <Input
                    label="Enter matrix X end position:"
                    type="number"
                    value={matrixSize}
                    onChange={handleMatrixSizeChange}
                />
                <Input
                    label="Enter matrix Y end position:"
                    type="number"
                    value={matrixSize}
                    onChange={handleMatrixSizeChange}
                />
                <Input
                    label="Enter blocking element count:"
                    type="number"
                    value={matrixSize}
                    onChange={handleMatrixSizeChange}
                />
            </div>
            <div className="actions">
                <Button onClick={()=>{console.log('click')}}>
                    start/restart
                </Button>
                <Button onClick={()=>{console.log('click')}}>
                    Move a Step
                </Button>
                <Button onClick={()=>{console.log('click')}}>
                    Move
                </Button>
            </div>
        </div>
    );
};

export default MatrixContainer;