/***
 * We want to make sure not to make the matrix huge, so we will limit the size
 * based on the number of tiles. single tile can be maximum 120 px wide
 */
export function processWidthSize(screenSize: number, matrixSize = 5) {
    const maxSizePerMatrix = matrixSize * 120 > 1200 ? 1200 : matrixSize * 120;
    return screenSize > maxSizePerMatrix ? maxSizePerMatrix : screenSize;
}