import './App.css'
import Game from './components/MatrixContainer';
import { Matrix, MatrixProps } from './classes/Matrix';

function App() {    
    const gameMatrix: Matrix = Matrix.getLast();
    const matrixProps: MatrixProps = {
        size: gameMatrix.size,
        start: gameMatrix.getPlayersCoordinates().getCoordinates(),
        end: gameMatrix.getEndCoordinates().getCoordinates(),
        blockingObjectCount: gameMatrix.blockingObjectCount
    };

    return (
        <>
        <div className="card">
            <Game gameMatrix={gameMatrix} matrixProps={matrixProps}/>
        </div>
        </>
    )
}

export default App
