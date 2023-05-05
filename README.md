# Moving Object Algorithm

The Moving Object Algorithm is an algorithm that moves an imaginary object (MO) through a matrix. The goal is to bring the MO from the start coordinates to the end coordinates while generating blocking objects (BO) with every move the MO makes.

## Terminology

- **Moving Object (MO):** The imaginary object we will move through our matrix.
- **Blocking Objects (BO):** The blocking object that will be used to block the path of our MO.

## Rules

- There are `n` BO created on each step where your MO cannot move to.
- BOs are placed randomly on the matrix at each step and they are not removed at the start of the next step.
- You can only move the MO horizontally or vertically, you cannot move it diagonally.
- BO can be put anywhere on the matrix if the BO does not close the available path for the MO.
- If the BO closes all possible available paths, you will retry the generation of BO until there is a path. If every possible BO creation triggers a closed path, no more BO will be generated, and the result array will be empty for the remaining `blockingObjectsCoordinates` key.

## Algorithm Steps

1. Generate `n` random blocking objects (BO).
2. Check if there is a path available for the MO.
3. If there is no available path, retry the generation of BO until there is a path.
4. Move the MO to the next position.
5. Repeat steps 1-4 until the MO reaches the end coordinates.

## Output

The result should be an array of objects containing `movingObjectCoordinates` and `blockingObjectCoordinates` keys. For each step of the algorithm, you will have an object. This object represents the current coordinates of our MO (movingObjectCoordinates) and all the BO and their coordinates (blockingObjectCoordinates).

    [{
	    movingObjetCoordinates: [x, y],
		blockingObjectCoordinates: [[BOx1, BOy1], [BOx2, BOy2]], // a newly generated blocking block based on the number of blocking blocks per move 
	}]

