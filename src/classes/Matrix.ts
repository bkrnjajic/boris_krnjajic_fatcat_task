import { MatrixCoordinate, MatrixElementType } from './MatrixCoordinate';

/**
 * Interface defining parameters to the Matrix class
 */
export interface MatrixProps {
    size: number;
    start: [number, number];
    end: [number, number];
    blockingObjectCount: number;
    [key: string]: any;
}

/***
 * End result interface
 */
export interface MoveResult {
    movingObjectCoordinates: [number, number],
    blockingObjectCoordinates: [number, number][],
}

const defaultMatrixValues = {
    size: import.meta.env.VITE_DEFAULT_MATRIX_SIZE,
    start: [import.meta.env.VITE_DEFAULT_START_X_COO, import.meta.env.VITE_DEFAULT_START_Y_COO],
    end: [import.meta.env.VITE_DEFAULT_END_X_COO, import.meta.env.VITE_DEFAULT_END_Y_COO],
    blockingObjectCount: import.meta.env.VITE_DEFAULT_BLOCK_OBJ_COUNT
}

/**
 * Represents the matrix information containing all the current game data and options to control the game progress
 */
export class Matrix {
    static _lastInstance: Matrix;
    private _size: number = 5;
    private _start: [number, number] = [0, 0];
    private _end: [number, number] = [4, 4];
    private _blockingObjectCount: number = 2;
    private factorialMemo: Map<number, bigint> = new Map();
    
    // in order to avoid confusing 0 values from the config as false, we must clear the env variable values
    // and double check if the value is just falsy or actualy undefined. == null check will confirm if it is undefined or null
    private _defaultProps: MatrixProps = {
        size: defaultMatrixValues.size == null ? 5 : defaultMatrixValues.size,
        start: [
            defaultMatrixValues.start[0] == null ? 0 : defaultMatrixValues.start[0],
            defaultMatrixValues.start[1] == null ? 0 : defaultMatrixValues.start[1]
        ],
        end: [
            defaultMatrixValues.end[0] == null ? 4 : defaultMatrixValues.end[0],
            defaultMatrixValues.end[1] ? 4 : defaultMatrixValues.end[1]
        ],
        blockingObjectCount: defaultMatrixValues.blockingObjectCount == null ? 2 : defaultMatrixValues.blockingObjectCount,
    };
    private _matrixData: MatrixCoordinate[][] = []
    private _gameLog: MoveResult[] = []
    private _historicMatrixData: Matrix[] = []

    constructor(props?: MatrixProps) {
        this.resetMatrixData(props);
    }
    
    /**
     * It resets the matrix values based on the new matrix parameters.
     * ALso cleares all the historic data.
     * @param props 
     */
    public resetMatrixData(props?: Partial<MatrixProps>) {
        this._size = props?.size ?? this._defaultProps.size;
        this._start = props?.start ?? this._defaultProps.start;
        this._end = props?.end ?? this._defaultProps.end;
        this._blockingObjectCount = props?.blockingObjectCount ?? this._defaultProps.blockingObjectCount;

        // reset all values to default
        this._matrixData = [];
        this._gameLog = [];
        this._historicMatrixData = []
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
    get gameLog(): MoveResult[] {
        return this._gameLog;
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
        this.resetMatrixData(props);
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
     * Gets all possible combinations of the array of strings.
     * @param arr - array of strings
     * @param len - number of elements in a single combination
     * @returns generator with all the combinations available
     */
    private getCombinations(arr: string[], len: number): Generator<string[]> {
        function* backtrack(start: number = 0, current: string[] = []): Generator<string[]> {
          if (current.length === len) {
            yield current;
            return;
          }
          for (let i = start; i < arr.length; i++) {
            yield* backtrack(i + 1, [...current, arr[i]]);
          }
        }
        return backtrack();
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
     * Calculates the factorial value of n even for very large numbers. It uses memoization to speed things up
     * @param n - target
     * @returns 
     */
    private factorial(n: number): bigint {
        this.factorialMemo.set(0, 1n);
        this.factorialMemo.set(1, 1n);
        
        for (let i = 2; i <= n; i++) {
          const prev = this.factorialMemo.get(i - 1) ?? 1n;
          const curr = prev * BigInt(i);
          this.factorialMemo.set(i, curr);
        }

        return this.factorialMemo.get(n) ?? 1n;
    }

    /**
     * In order to optimize the speed to the max we will use 3 different algorithms depending how deep we get into getting new values.
     * 
     * 1. We will start by randomly generating new blocking fields based on the fields which can be blocked.
     * 2. Once we try to randomly generate for 20000 times, we will retrieve all possible combinations and look for one we didn't have randomly generated and continue trying that path.
     * 3. For big matrixes this is also not enough. So in this case if we get to 100000 tried blocking combinations, we will retrieve the actual path to the end
     *    and not block this values too.
     * 
     * We will always keep count of unique values and make sure it is less
     * then the max number of combinations possible to have based on the formula nCr = n! / r!(n-r)!
     * 
     * Current implementation will be completely random for smaller matrixes, but later will use shortcuts.
     */
    private generateBlockingElements(): boolean {
        if (this._blockingObjectCount > 0) {
            let nonBlockingElements: MatrixCoordinate[] = []
            const currentBlockingElements: MatrixCoordinate[] = []
            const playerCoordinate = this.getPlayersCoordinates();
            const goalCoordinate = this.getEndCoordinates();
            // nCr = n! / r!(n-r)!
            const triedCombinations = new Set();
            const finalizeGameTileCount = this.getShortestPath(
                playerCoordinate.getCoordinates(),
                goalCoordinate.getCoordinates()
            ).length;

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
            let maxCombinations: bigint = this.factorial(nonBlockingElements.length) /
                (this.factorial(this._blockingObjectCount) * this.factorial(nonBlockingElements.length - this._blockingObjectCount));

            while (!generationCompleted) {
                let randomCombination : MatrixCoordinate[];
                let randomIndexes;
                let invalidValuesCounter = 0;
                let combinationGenerator = null;
                if (nonBlockingElements.length - finalizeGameTileCount < this._blockingObjectCount) {
                    this.logMove();
                    return true;
                }

                try {
                    // TODO improve the logic that if we are not able to get a random combination we need to get all
                    // combinations and get one from those
                    do {
                        randomIndexes = this.generateArrayOfRandomNumbers(nonBlockingElements.length, this._blockingObjectCount);
                        randomCombination = randomIndexes.map(index => nonBlockingElements[index]).sort((one, two) => (one.coordinateToString() > two.coordinateToString() ? -1 : 1));

                        // if our random combination generation gets stuck we will help it out by getting an actual working combination
                        if (invalidValuesCounter > 10000) {
                            combinationGenerator = combinationGenerator ?? this.getCombinations(
                                nonBlockingElements.map((coordinate: MatrixCoordinate) => coordinate.coordinateToString()), this._blockingObjectCount
                            );

                            for (const comb of combinationGenerator) {
                                if (!triedCombinations.has(comb.join(','))) {
                                    randomCombination = comb.map((coordString: string) => {
                                        const coordinates = MatrixCoordinate.stringToCoordinate(coordString);
                                        return this._matrixData[coordinates[0]][coordinates[1]];
                                    });
                                    continue;
                                }
                            }
                        } else {
                            invalidValuesCounter++;
                        }
                    } while (
                        triedCombinations.has(randomCombination.map((matrixCoordinate: MatrixCoordinate) => matrixCoordinate.coordinateToString()).join(','))
                        && maxCombinations >= triedCombinations.size);
                } catch(error) {
                    randomCombination = []
                }

                if (maxCombinations < triedCombinations.size) {
                    this.logMove();
                    return true;
                }

                // once our code is really stuck, we will help it by telling it which fields are needed
                // to get to the end of the matrix, and then we will not block these values.
                if (triedCombinations.size > 100000) {
                    const pathToEnd = this.getShortestPath(
                        playerCoordinate.getCoordinates(),
                        goalCoordinate.getCoordinates()
                    );
                    const recalculatedBlockingFields = [];
                    this._matrixData.forEach((row) => {
                        row.forEach((matrixCoordinate) => {
                            if (matrixCoordinate.type === MatrixElementType.NonBlockingElement) {
                                recalculatedBlockingFields.push(matrixCoordinate)
                            }
                        })
                    });

                    while (pathToEnd.length) {
                        const pathCoordinate = pathToEnd.pop();

                        if (pathCoordinate) {
                            const targetCoordinate: MatrixCoordinate|undefined = this._matrixData[pathCoordinate[0]][pathCoordinate[1]];
    
                            if (targetCoordinate) {
                                nonBlockingElements = nonBlockingElements.filter((coordinate: MatrixCoordinate) => coordinate !== targetCoordinate);
                                randomIndexes = this.generateArrayOfRandomNumbers(nonBlockingElements.length, this._blockingObjectCount);
                                randomCombination = randomIndexes.map(index => nonBlockingElements[index]).sort((one, two) => (one.coordinateToString() > two.coordinateToString() ? -1 : 1));
                            }
                        }
                    }
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
                    goalCoordinate.getCoordinates()
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
    public getPlayersCoordinates() : MatrixCoordinate {
        const playerCoordinates = this.getMatrixTypeCoordinates(MatrixElementType.Player);
        return !playerCoordinates.length ? this.getMatrixTypeCoordinates(MatrixElementType.Start)[0] : playerCoordinates[0];
    }

    /**
     * In the case the game is almost ended, there is no end tile, only the player tile.
     * @returns players coordinates
     */
    public getEndCoordinates() : MatrixCoordinate{
        const goalCoordinates = this.getMatrixTypeCoordinates(MatrixElementType.End);
        return !goalCoordinates.length ? this.getPlayersCoordinates() : goalCoordinates[0];
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
        const goalCoordinate = this.getEndCoordinates();

        const pathToEnd = this.getShortestPath(
            playerCoordinate.getCoordinates(),
            goalCoordinate.getCoordinates(),
        );

        if (pathToEnd.length > 1) {
            this._matrixData[pathToEnd[0][0]][pathToEnd[0][1]].returnToPreviousType();
            this._matrixData[pathToEnd[1][0]][pathToEnd[1][1]].type = MatrixElementType.Player;

            if (!this.isDone()) {
                this.generateBlockingElements();
            }
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