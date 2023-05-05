import { useLayoutEffect, useState } from "react";
import './App.css'
import { Canvas } from './components/GameCanvas.js'
import { Matrix } from './classes/Matrix.js';
function App() {
    const [appWidth, setAppWidth] = useState<number>(0);
    const [isTimerActive, setIsTimerActive] = useState(false);

    /**
     * Get the current site size and re-render the page based on it to get the matrix
     * properly shown in full size all the time
     */
    useLayoutEffect(() => {
        function updateSize() {
            // try to only update it after a delay to not have the game rerendered all the time while resizing
            if (!isTimerActive) {
                setIsTimerActive(true);
                setTimeout(() => {
                    setAppWidth(document.documentElement.clientWidth);
                    setIsTimerActive(false);
                }, 500);
            }
        }

        window.addEventListener('resize', updateSize);
        updateSize();

        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return (
        <>
        <div className="card">
            <Canvas matrix={new Matrix()} size={appWidth}/>
        </div>
        </>
    )
}

export default App
