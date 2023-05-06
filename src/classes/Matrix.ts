import { MatrixCoordinate, MatrixElementType } from './MatrixCoordinate';
import bigInt from 'big-integer';

/**
 * Interface defining parameters to the Matrix class
 */
interface MatrixProps {
    size: number;
    start: [number, number];
    end: [number, number];
    blockingObjectCount: number;
}

/***
 * End result interface
 */
interface MoveResult {
    movingObjectCoordinates: [number, number],
    blockingObjectCoordinates: [number, number][],
}

/**
 * Represents the matrix information containing all the current game data and options to control the game progress
 */
export class Matrix {
    static _lastInstance: Matrix;
    private _size: number;
    private _start: [number, number];
    private _end: [number, number];
    private _blockingObjectCount: number;
    private _defaultProps: MatrixProps = {
        size: 5,
        start: [0, 0],
        end: [5 - 1, 5 - 1],
        blockingObjectCount: 3,
    };
    private _matrixData: MatrixCoordinate[][] = []
    private _gameLog: MoveResult[] = []
    private _historicMatrixData: Matrix[] = []

    constructor(props?: MatrixProps) {
        this._size = props?.size ?? this._defaultProps.size;
        this._start = props?.start ?? this._defaultProps.start;
        this._end = props?.end ?? this._defaultProps.end;
        this._blockingObjectCount = props?.blockingObjectCount ?? this._defaultProps.blockingObjectCount;

        this.buildMatrixData();
    }
    
    /**
     * Simple singleton pattern to stop multiple generation of the matrix if react is rerendering something
     * @returns 
     */
    static getLast(): Matrix {
        if (this._lastInstance) {
            return this._lastInstance;
        }

        this._lastInstance = new Matrix();
        return this.getLast();
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
     * Gets the neighbors of the current matrix positions which are accessible
     * @param node - current coordinates
     * @returns array of all available neighbors
     */
    private getNeighbors(node: [number, number]): [number, number][] {
        const [xCoo, yCoo] = node;
        const neighbors: [number, number][] = [];
        
        // Check West
        if (xCoo > 0 && this._matrixData[xCoo - 1][yCoo].type !== MatrixElementType.BlockingElement) {
            neighbors.push([xCoo - 1, yCoo]);
        }
        // Check East
        if (xCoo < this._matrixData.length - 1 && this._matrixData[xCoo + 1][yCoo].type !== MatrixElementType.BlockingElement) {
            neighbors.push([xCoo + 1, yCoo]);
        }
        // Check North
        if (yCoo > 0 && this._matrixData[xCoo][yCoo - 1].type !== MatrixElementType.BlockingElement) {
            neighbors.push([xCoo, yCoo - 1]);
        }
        // Check South
        if (yCoo < this._matrixData[0].length - 1 && this._matrixData[xCoo][yCoo + 1].type !== MatrixElementType.BlockingElement) {
            neighbors.push([xCoo, yCoo + 1]);
        }

        return neighbors;
    }

    /**
     * Finds the shortest path from the current position to the end goal
     * @param start - start (current) coordinates
     * @param end - end coordinates
     * @returns 
     */
    public getShortestPath(start: [number, number], end: [number, number]): [number, number][] {
        const queue: [number, number][] = [start];
        const visited: Set<string> = new Set([start.toString()]);
        const parents: Record<string, [number, number]> = {};
    
        while (queue.length > 0) {
            const curr = queue.shift()!;
            if (curr[0] === end[0] && curr[1] === end[1]) {
                // Build and return the path
                const path = [end];
                let currPos = end.toString();

                while (currPos !== start.toString()) {
                    path.unshift(parents[currPos]);
                    currPos = parents[currPos].toString();
                }

                path.unshift(start);

                return Array.from(new Set(path));
            }
        
            // Check all possible moves from the current point
            const neighbors: [number, number][] = this.getNeighbors(curr);

            for (const neighbor of neighbors) {
                // Check if the neighbor is not blocked and hasn't been visited yet
                // TODO add logic to be able to go back into a visited element only in the case there are no non blocked neighbors
                if (!visited.has(neighbor.toString())) {
                    queue.push(neighbor);
                    visited.add(neighbor.toString());
                    parents[neighbor.toString()] = curr;
                }
            }
        }
    
        // No path found
        return [];
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

    private generateStartElement() {
        this._matrixData[this._start[0]][this._start[1]].type = MatrixElementType.Start
    }

    private generateEndElement() {
        this._matrixData[this._end[0]][this._end[1]].type = MatrixElementType.End
    }

    /***
     * Generates array of random numbers used to randomly target indexes of an existing array with some data.
     */
    private generateArrayOfRandomNumbers(max: number, amount: number): number[] {
        let allNumbers = Array.from({length: max}, (_, i) => i);
        let result: number[] = [];

        if (amount > max) {
            return result;
        }

        while (result.length < amount) {
            const randomIndex = Math.floor(Math.random() * allNumbers.length);
            const randomNumber = allNumbers[randomIndex];
            allNumbers.splice(randomIndex, 1);

            result.push(randomNumber);
        }
        
        return result;
    }

    /**
     * Calucaltes the factorial value of n even for very large numbers
     * @param n - target
     * @returns 
     */
    private factorial(n: number): bigInt.BigInteger {
        if (n <= 1) {
            return bigInt(1);
        }
        return bigInt(n).times(this.factorial(n - 1));
    }

    /**
     * IN order to optimize the application for some more normal values, the algorithm works by generating a random set of
     * tiles to be blocked based on the current not blocked tiles. We keep count of unique values and make sure it is less
     * then the max number of combinations possible to have based on the formula nCr = n! / r!(n-r)!
     * 
     * This will work much faster for normal size matrixes, but will get increasingly slow the higher values there are.
     * Other option would be to generate all combinations before hand and randomly pick few, but considering for a matrix of
     * 20x20 and 10 blocking fields, numbers can be in milions and it is extremely slow.
     * 
     * Current implementation will be slower for very high numbers, because it is possible to get same combination sets when generating
     * random values which are then skipped.
     */
    private generateBlockingElements(): boolean {
        if (this._blockingObjectCount > 0) {
            const nonBlockingElements: MatrixCoordinate[] = []
            const currentBlockingElements: MatrixCoordinate[] = []
            const playerCoordinate = this.getPlayersCoordinates();
            const goalCoordinate = this.getMatrixTypeCoordinates(MatrixElementType.End)[0];
            // nCr = n! / r!(n-r)!
            const maxCombinations = this.factorial(nonBlockingElements.length).divide(this.factorial(this._blockingObjectCount).multiply(this.factorial(nonBlockingElements.length - this._blockingObjectCount)))
            const triedCombinations = new Set();

            this._matrixData.forEach((row) => {
                row.forEach((matrixCoordinate) => {
                    if (matrixCoordinate.type === MatrixElementType.NonBlockingElement) {
                        nonBlockingElements.push(matrixCoordinate)
                    } else if (matrixCoordinate.type === MatrixElementType.BlockingElement) {
                        currentBlockingElements.push(matrixCoordinate)
                    }
                })
            })

            let generationCompleted = false;

            while (!generationCompleted) {        
                let randomCombination : MatrixCoordinate[];
                let randomIndexes;
                try {
                    do {
                        randomIndexes = this.generateArrayOfRandomNumbers(nonBlockingElements.length, this._blockingObjectCount);
                        randomCombination = randomIndexes.map(index => nonBlockingElements[index]).sort((one, two) => (one.coordinateToString() > two.coordinateToString() ? -1 : 1));
                    } while (triedCombinations.has(randomCombination.map((matrixCoordinate: MatrixCoordinate) => matrixCoordinate.coordinateToString()).join(',')) || maxCombinations.greater(triedCombinations.size));

                } catch(error) {
                    randomCombination = []
                }

                triedCombinations.add(randomCombination.map((matrixCoordinate: MatrixCoordinate) => matrixCoordinate.coordinateToString()).join(','))
                                    
                // in order to check if new blocks can be added, we will have to remove them later on if the path can not be found
                // we could also duplicate the matrix and work with the copy, but that is the worse way
                const newBlockingElements: MatrixCoordinate[] = [];

                for (let index = 0; index < randomCombination.length; index++) {
                    const combination: MatrixCoordinate = randomCombination[index];
                    combination.type = MatrixElementType.BlockingElement
                    newBlockingElements.push(combination)
                }

                if (this.getShortestPath(
                    playerCoordinate.getCoordinates(),
                    goalCoordinate ? goalCoordinate.getCoordinates() : playerCoordinate.getCoordinates()
                ).length > 0) {
                    generationCompleted = true;
                    this.logMove(newBlockingElements);
                    break;
                } else {
                    randomCombination.forEach((matrixCoordinate: MatrixCoordinate) => {
                        matrixCoordinate.returnToPreviousType();
                    })
                }
            }

            if (!generationCompleted) {
                this.logMove();
            }

            return true;
        }

        return false;
    }

    /**
     * Iterates the matrix and return specific types of elements
     * @param type - target type
     * @param matrixData - matrix. Defaults to _matrixData if nothign was passed
     * @returns 
     */
    public getMatrixTypeCoordinates(
        type: MatrixElementType,
        matrixData: MatrixCoordinate[][] = this._matrixData
    ): MatrixCoordinate[] {
        const result: MatrixCoordinate[] = [];

        matrixData.forEach((row: MatrixCoordinate[]) => {
            row.forEach((coordinate: MatrixCoordinate) => {
                if (coordinate.type === type) {
                    result.push(coordinate);
                }
            })
        })

        return result;
    }

    /**
     * In the case the game just started, there is no player, only the start element.
     * @returns players coordinates
     */
    public getPlayersCoordinates() : MatrixCoordinate{
        const playerCoordinates = this.getMatrixTypeCoordinates(MatrixElementType.Player);
        return !playerCoordinates.length ? this.getMatrixTypeCoordinates(MatrixElementType.Start)[0] : playerCoordinates[0];
    }

    /**
     * Checks if hte game is done by checking if the END Matrix Coordinate is still present.
     * If not it means it was repalced by the player element.
     * @returns if game ended
     */
    public isDone(): boolean {
        return !this.getMatrixTypeCoordinates(MatrixElementType.End).length;
    }

    /***
     * Moves the player single step
     */
    public movePlayer(): void {
        if (this.isDone()) {
            return;
        }

        const playerCoordinate = this.getPlayersCoordinates();
        const goalCoordinate = this.getMatrixTypeCoordinates(MatrixElementType.End)[0];

        const pathToEnd = this.getShortestPath(
            playerCoordinate.getCoordinates(),
            goalCoordinate ? goalCoordinate.getCoordinates() : playerCoordinate.getCoordinates()
        );

        if (pathToEnd.length > 1) {
            this._matrixData[pathToEnd[0][0]][pathToEnd[0][1]].returnToPreviousType();
            this._matrixData[pathToEnd[1][0]][pathToEnd[1][1]].type = MatrixElementType.Player;
            this.generateBlockingElements();
        }
        
        if (this.isDone()) {
            console.log(this._gameLog)
        }
    }

    /**
     * Must be used after any player movement to log the traversing
     * history and store it in the format of hte requested reult array.
     * @param newBlockingElements - newly added blocking elements in the last move.
     */
    private logMove(newBlockingElements: MatrixCoordinate[] = []): void {
        const playersLocation = this.getPlayersCoordinates();
        this._gameLog.push({
            movingObjectCoordinates: [playersLocation.x, playersLocation.y],
            blockingObjectCoordinates: newBlockingElements.length ? newBlockingElements.map((coordinate: MatrixCoordinate) => coordinate.getCoordinates()) : [],
        });
        // preserves the data if we want to replay the game in the future
        this._historicMatrixData.push(
            Object.assign({}, this)
        )
    }

    /**
     * Prints the move results
     * @returns move result in the requested format
     */
    public printResult(): MoveResult[] {
        return this._gameLog;
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