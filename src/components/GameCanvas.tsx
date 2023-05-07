import React from 'react';
import { useRef, useEffect } from "react";
import { Matrix } from '../classes/Matrix';
import { MatrixCoordinate, MatrixElementType } from '../classes/MatrixCoordinate';

/***
 * interface definining canvas input parameters
 */
interface CanvasProps {
    matrix: Matrix;
    size: number;
    rerender: number; 
}

/***
 * Canvas class initialization
 */
const Canvas: React.FC<CanvasProps> = ({ matrix, size, rerender }: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && size > 0) {
            drawMatrixOnCanvas(canvasRef.current, matrix, size);
        }
    }, [matrix, size, rerender]);

    return (
        size ? <canvas
            ref={canvasRef}
            width={size}
            height={size}
        ></canvas> : null
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
    if (!context) {
        return;
    }

    // Clear the canvas
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    const blockSize = (canvas.width / matrix.size) * 0.9
    const startPosition = (canvas.width - blockSize * matrix.size) / 2

    // Draw the matrix elements
    for (let xCoo = 0; xCoo < matrix.size; xCoo++) {
        for (let yCoo = 0; yCoo < matrix.size; yCoo++) {
            const element: MatrixCoordinate = matrix.matrixData[xCoo][yCoo];
            let color = "";

            if (element.type === MatrixElementType.BlockingElement) {
                color = "#0000FF";
            } else if (element.type === MatrixElementType.NonBlockingElement) {
                color = "#00ff00";
            } else if (element.type === MatrixElementType.Player) {
                color = "#800080";
            } else if (element.type === MatrixElementType.Start) {
                color = "#FFFF00";
            } else if (element.type === MatrixElementType.End) {
                color = "#FF0000";
            }

            drawRect(context, xCoo * blockSize, yCoo * blockSize, blockSize, blockSize, 1, color, startPosition);
        }
    }
}

export default Canvas;