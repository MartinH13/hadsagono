class Utils {

    // Los numeros con -2 indican que la casilla esta vacia
    // entonces bajarán los numeros que estén por encima de ellos
    // dejando un -3 arriba con lo reemplazado
    // Generada mediante el asistente: Claude
    static applyGravity(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        // Iterate through each column
        for (let col = 0; col < cols; col++) {
            let writeIndex = rows - 1;

            // Iterate through each row from bottom to top
            for (let row = rows - 1; row >= 0; row--) {
                if (matrix[row][col] !== -2) {
                    // Move the number down to the next available position
                    matrix[writeIndex][col] = matrix[row][col];
                    writeIndex--;
                }
            }

            // Fill the remaining spaces above with -3
            while (writeIndex >= 0) {
                matrix[writeIndex][col] = -3;
                writeIndex--;
            }
        }
        return matrix;
    }

    // Given a matrix, select a number based on the probabilities of each number
    // in the matrix. For example, if the matrix is [[1, 2, 3], [1, 2, 3], [1, 2, 3]],
    // then the function should return 1, 2, or 3 with equal probability.
    // Generated using Claude.ai
    static selectNumberBasedOnProbs(matrix) {

        // Flatten the matrix into a single array
        let flattenedMatrix = matrix.flat();

        // Filter out -1, -2, and -3 from the flattened array
        let filteredMatrix = flattenedMatrix.filter(num => num !== -1 && num !== -2 && num !== -3);

        // Create an array to store the numbers based on their frequency
        let frequencyArray = [];

        // Iterate over each number in the filtered matrix
        filteredMatrix.forEach(num => {
            // Add the number to the frequency array as many times as it appears
            let times = filteredMatrix.filter(n => n === num).length;
            for (let i = 0; i < times; i++) {
                frequencyArray.push(num);
            }
        });

        // Remove the highest number from the frequency array
        let max = -1;
        frequencyArray.forEach(num => {
            if (num > max) {
                max = num;
            }
        });
        frequencyArray = frequencyArray.filter(num => num !== max);
        

        // Select a random index from the frequency array
        const randomIndex = Math.floor(Math.random() * frequencyArray.length);

        // Return the number at the randomly selected index
        return frequencyArray[randomIndex];
    }

    // Given a path of moves, transform it into a series of moves that can be executed
    static transformPathToMoves(path) {
        let moves = [];
        // we assume path >= 3
        moves.push([path[0][0], path[0][1]])
        let current = path[0];
        for (let i = 1; i < path.length; i++) {
            let rowDiff = path[i][0] - current[0];
            let colDiff = path[i][1] - current[1];
            moves.push([rowDiff, colDiff]);
            current = path[i];
        }
        return moves;
    }

    static chooseNSolutions(matrix, movements, minLength=6,n=5) {
        const arr = Utils.findSolutions(matrix, movements, minLength);
        if (arr === null) return null;
        if (n >= arr.length) {
            return arr.slice();
          }
        
          const result = [];
          const step = arr.length / n;
        
          for (let i = 0; i < n; i++) {
            const index = Math.floor(i * step);
            result.push(arr[index]);
          }
        
          return result;
    }

    static findSolutions(matrix, movements, requiredLength=3) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        let possibleSolutions = [];
        // Iterate over each cell in the matrix
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Find the longest path starting from the current cell
                const path = Utils.findFirstPath(matrix, movements, row, col, [], requiredLength);
                
                if (!path) continue;
                possibleSolutions.push(path);
            }
        }
        if (possibleSolutions.length > 0) return possibleSolutions
        if(requiredLength <= 3) return null;
        return(Utils.findSolutions(matrix, movements, requiredLength-1));
    }

    // other option: use map    
    static findFirstPath(matrix, movements, startRow, startCol, path = [], requiredLength=3) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const currentValue = matrix[startRow][startCol];
      
        // Add the current position to the path
        if (Utils.includesSubarray(path, [startRow, startCol])) {
            return null;
        }
        path.push([startRow, startCol]);
      
        // Base case: if the path length longer or equal the requested, return the path
        if (path.length >= requiredLength) {
          return path;
        }
        else {
            // Recursive case: explore possible movements
            const possibleMoves = movements[`${startRow},${startCol}`];
            for (const [rowDiff, colDiff] of possibleMoves) {
            const newRow = startRow + rowDiff;
            const newCol = startCol + colDiff;
        
            // Check if the new position has the same value as the current position
            if (matrix[newRow][newCol] === currentValue) {
            // Recursively explore the new position
                const solution = Utils.findFirstPath(matrix, movements, newRow, newCol, path, requiredLength);
                if (solution) {
                    return solution;
                }
            }
            }
        }
        // If no solution is found, backtrack by removing the current position from the path
        path.pop();
        return null;
      }

      static includesSubarray(array, x) {
        return array.some(subarray => subarray.every((value, index) => value === x[index]));
      }


}


module.exports = Utils;