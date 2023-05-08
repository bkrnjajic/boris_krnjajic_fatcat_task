
# Moving Object Algorithm

  

The Moving Object Algorithm is an algorithm that moves an imaginary object (MO) through a matrix. The goal is to bring the MO from the start coordinates to the end coordinates while generating blocking objects (BO) with every move the MO makes.

  

## Terminology

  

-  **Moving Object (MO):** The imaginary object we will move through our matrix.

-  **Blocking Objects (BO):** The blocking object that will be used to block the path of our MO.

  

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

  
```
[{
    movingObjectCoordinates: [x, y],
    blockingObjectCoordinates: [[BOx1, BOy1], [BOx2, BOy2]], // a newly generated blocking block based on the number of blocking blocks per move

}...]
```

## Project Setup
When setting up the project there are few steps you need to follow:

1. After getting the code from GitHub, and before starting any work, you will have to install the following tools:
- npm version 6.x.x
- node version 14.x.x
In the case you are using an older version of node on another project, you can install NVM and handle different node versions in the same time (https://github.com/nvm-sh/nvm)
2. Run npm install on the project folder directory (it is not root directory), and make sure everything installed without errors.
3. package.json contains all available scripts. In order to start the local server run `npm run dev` , in order to check for linting issues, run `npm run lint`
4. You need to set up the `.env` file with proper starting values. You can do this by creating a new `.env` file in the project folder. Once that is done copy the values from existing `example.env` file and you are all set.
5. In Order to have proper code standard, you will have to set up the git hook pre-commit file inside your own .git directory. In order to do this, follow these instructions:
- Make sure your git has been initialized
- Go to your `.git/hooks` folder. Take in consideration that this folder might be hidden.
- Add a new file called `pre-commit` (no extensions)
- Copy the value of the `git/hooks/pre-commit` file from the project folder into newly created `.git/hooks/pre-commit` file.
- Make sure your system has executable rights on the file. In order to do this go to your project folder location with the terminal and run `chmod +x .git/hooks/pre-commit`
This will make sure every time you try to commit new code, it will first be checked by the linter, and only if there are no errors or warnings, it will be committed.

## Running the Project
After the setup has been successfully completed, all you have to do is run `npm run dev` which will start a development server on port 5173 (if you did not change any configuration) and you can view the site at: `http://localhost:5173/`