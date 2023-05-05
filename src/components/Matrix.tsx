import { Matrix } from '../classes/Matrix';
import './Matrix.css';

/**
 * Creates a simple test representation of the target matrix
 * @returns 
 */
const MatrixElement = () => {
    const matrix = new Matrix();

    return (
        <>
        {matrix.toString().split('\n').map((row: string, index: number) => (
            <p key={index}>{row}</p>
        ))}
        </>
    );
};

export default MatrixElement;