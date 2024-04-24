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

}


module.exports = Utils;