/**
 * Enum representation of the matrix element types
 */
export enum MatrixElementType {
    BlockingElement = '□',
    NonBlockingElement = '\u2714',
    Player = '\u1F468',
    Start = '\u25B6',
    End = '\u1F7E1',
}

/**
 * MatrixCoordinate Class containing all the required information per specific matrix element.
 */
export class MatrixCoordinate {
    private _type: MatrixElementType = MatrixElementType.NonBlockingElement;
    private _lastType: MatrixElementType = MatrixElementType.NonBlockingElement;
    private readonly _x: number;
    private readonly _y: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }
  
    get type(): MatrixElementType {
        return this._type;
    }

    public set type(v: MatrixElementType) {
        this._lastType = this._type;
        this._type = v;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    public getCoordinates(): [number, number] {
        return [this._x, this._y];
    }

    
    /**
     * Used to retrieve the type which was set before it was last changed.
     */
    public returnToPreviousType() {
        this._type = this._lastType || this._type;
    }

    public equals(other: MatrixCoordinate): boolean {
        return this._x === other._x && this._y === other._y;
    }

    public coordinateToString(): string {
        return `${this._x}:${this._y}`;
    }

    static stringToCoordinate(stringValue: string): [number, number] {
        const values = stringValue.split(':');

        if (values.length === 2) {
            return [parseInt(values[0]), parseInt(values[1])];
        }

        return [-1, -1];
    }

    public toString(): string {
        return this._type;
    }
}
