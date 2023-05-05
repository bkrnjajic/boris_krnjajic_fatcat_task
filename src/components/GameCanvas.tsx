import { useRef, useEffect } from "react";
import { Matrix } from '../classes/Matrix';
import { MatrixCoordinate, MatrixElementType } from '../classes/MatrixCoordinate';

/***
 * interface definining canvas input parameters
 */
interface CanvasProps {
    matrix: Matrix;
    size: number
}

/***
 * Canvas class initialization
 */
export const Canvas: React.FC<CanvasProps> = ({ matrix, size }: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        if (canvasRef.current && size > 0) {
            drawMatrixOnCanvas(canvasRef.current, matrix, size);
        }
    }, [matrix]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
        ></canvas>
    );
};

/**
 * Draws a rectangle which gets filled with a target color and a black border is added to it afterwards.
 * @param context - canvas isntance
 * @param x - x start coordinate where to start drawing the rectangle
 * @param y - y start coordinate where to start drawing the rectangle
 * @param width - target rectangle width
 * @param height - target rectangle height
 * @param border - target rectangle border size
 * @param color - target rectangle color
 */
const drawRect = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    border: number,
    color: string,
    startPosition: number
) => {
    context.fillStyle = color;
    context.fillRect(startPosition + x + border / 2, startPosition + y + border / 2, width, height);

    context.lineWidth = border;
    context.strokeStyle = "black";
    context.strokeRect(startPosition + x, startPosition + y, width, height);
};

/***
 * Draws the current matrix data on the canvas
 */
function drawMatrixOnCanvas(canvas: HTMLCanvasElement, matrix: Matrix, screenWidth : number) {
    const context = canvas.getContext("2d");
    const blockSize = (screenWidth / matrix.size) * 0.9
    const startPosition = (screenWidth - blockSize * matrix.size) / 2
    if (!context) {
        return;
    }

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the matrix elements
    for (let i = 0; i < matrix.size; i++) {
        for (let j = 0; j < matrix.size; j++) {
            const element: MatrixCoordinate = matrix.matrixData[i][j];
            let color = "";

            if (element.type === MatrixElementType.BlockingElement) {
                color = "#0000FF";
            } else if (element.type === MatrixElementType.NonBlockingElement) {
                color = "#00ff00";
            } else if (element.type === MatrixElementType.Player) {
                color = "#FF0000";
            } else if (element.type === MatrixElementType.Start) {
                color = "#FFFF00";
            } else if (element.type === MatrixElementType.End) {
                color = "#FF0000";
            }

            drawRect(context, j * blockSize, i * blockSize, blockSize, blockSize, 4, color, startPosition);
        }
    }
}
