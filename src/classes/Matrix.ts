import { MatrixCoordinate, MatrixElementType } from './MatrixCoordinate';

/**
 * Interface defining parameters to the Matrix class
 */
interface MatrixProps {
    size: number;
    start: [number, number];
    end: [number, number];
    blockingObjectCount: number;
}

/**
 * Represents the matrix information containing all the current game data and options to control the game progress
 */
export class Matrix {
    private _size: number;
    private _start: [number, number];
    private _end: [number, number];
    private _blockingObjectCount: number;
    private _defaultProps: MatrixProps = {
        size: 5,
        start: [0, 0],
        end: [5 - 1, 5 - 1],
        blockingObjectCount: 2,
    };
    private _matrixData: MatrixCoordinate[][] = []

    constructor(props?: MatrixProps) {
        this._size = props?.size ?? this._defaultProps.size;
        this._start = props?.start ?? this._defaultProps.start;
        this._end = props?.end ?? this._defaultProps.end;
        this._blockingObjectCount = props?.blockingObjectCount ?? this._defaultProps.blockingObjectCount;

        this.buildMatrixData();
    }
    
    get size(): number {
        return this._size;
    }
    
    get start(): [number, number] {
        return this._start;
    }
    
    get end(): [number, number] {
        return this._end;
    }
    
    get blockingObjectCount(): number {
        return this._blockingObjectCount;
    }
    
    get matrixData(): MatrixCoordinate[][] {
        return this._matrixData;
    }

    /**
     * Reloads the matrix based on the MatrixProps passed. Can be partial in which case
     * the previous value will still remain for all values which are not passed
     * @param props 
     */
    reloadMatrix(props: Partial<MatrixProps> = {}) {
        const defaultProps: MatrixProps = this._defaultProps

        const mergedProps = { ...defaultProps, ...props };
        this._size = mergedProps.size;
        this._start = mergedProps.start;
        this._end = mergedProps.end;
        this._blockingObjectCount = mergedProps.blockingObjectCount;

        this.buildMatrixData();
    }

    /**
     * Builds the initial matrix data by filling all proper states to matrix elements
     */
    private buildMatrixData() {
        this._matrixData = Array.from(
            { length: this._size },
            (_, indexX) => Array.from({ length: this._size }, (_, indexY) => new MatrixCoordinate(indexX, indexY))
        );

        this.generateStartElement()
        this.generateEndElement()
        this.generateBlockingElements()
    }

    /**
     * Generates a set of random number (no duplicates)
     * @param min - minimum number
     * @param max - maximum number
     * @param count - count of numbers which need to be generated
     * @returns set of random numbers
     */
    private getSetOfRandomNumbers(min: number, max: number, count: number) {
        let numbers = new Set<number>();

        while (numbers.size < count && count < max - min) {
            numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
        }

        return numbers
    }

    private generateStartElement() {
        this._matrixData[this._start[0]][this._start[1]].type = MatrixElementType.Start
    }

    private generateEndElement() {
        this._matrixData[this._end[0]][this._end[1]].type = MatrixElementType.End
    }

    /**
     * Gets all elements which are allowed to be replaced with blocking elements
     * and changes some of them to blocking ones. CHanged elements are retrieved randomly.
     */
    private generateBlockingElements() {
        if (this._blockingObjectCount > 0) {
            let nonBlockingElementsIndex: [number, number][] = []

            this._matrixData.forEach((row, indexX) => {
                row.forEach((matrixElement, indexY) => {
                    if ([MatrixElementType.NonBlockingElement].includes(matrixElement.type)) {
                        nonBlockingElementsIndex.push([indexX, indexY])
                    }
                })
            })

            if (nonBlockingElementsIndex.length < this._blockingObjectCount) {
                throw new Error("not enough room for blocking elements")
            }


            const blockingElementIndexes = this.getSetOfRandomNumbers(0, nonBlockingElementsIndex.length - 1, this._blockingObjectCount);
            blockingElementIndexes.forEach(index => {
                this._matrixData[nonBlockingElementsIndex[index][0]][nonBlockingElementsIndex[index][1]].type = MatrixElementType.BlockingElement
            })
        }
    }

    public toString(): string {
        let stringRepresentation = ''

        this._matrixData.forEach((rowValues : MatrixCoordinate[]) => {
            rowValues.forEach((matrixCoordinate : MatrixCoordinate) => {
                stringRepresentation += matrixCoordinate.toString()
            });
            stringRepresentation += '\n';
        })
         
        return stringRepresentation;
    }
}