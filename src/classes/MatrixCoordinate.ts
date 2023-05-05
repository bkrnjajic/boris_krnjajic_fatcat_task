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

    constructor(public x: number, public y: number) {}
  
    get type(): MatrixElementType {
        return this._type;
    }

    public set type(v : MatrixElementType) {
        this._type = v;
    }
    
    public equals(other: MatrixCoordinate): boolean {
      return this.x === other.x && this.y === other.y;
    }

    public toString(): string {
      return this._type;
    }
}
