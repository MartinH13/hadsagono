// Yo haría que esta clase se llamase Board y que haga todas las funciones importantes del codigo
class Functions {

    //Al final lo vamos a hacer estático?
    constructor() {
        this.possibleMoves = Functions.generatePossibleMoves(5, 6);
    }

    // siendo i la fila y j la columna
    static m = {
        n : [-1,0],
        ne : [-1,1],
        e : [0,1],
        se : [1,1],
        s : [1,0],
        sw : [1,-1],
        w : [0,-1],
        nw : [-1,-1],
    }

    // Pre: Columns must be odd and 3 or more
    // Pre: Rows must be even and 4 or more
    static generatePossibleMoves(rows, cols) {
        let arr = {};
        let m = Functions.m;
        
        // Check just in case
        if (rows % 2 == 1 || cols % 2 == 0) {
            return "Rows must be odd and 3 or more, columns must be even and 4 or more";
        } else if (rows < 4 || cols < 3) {
            return "Rows must be odd and 3 or more, columns must be even and 4 or more";
        }
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let key = i + "," + j;
                //
                // ------------ Corners ------------
                //
                // Left upper corner
                if (i == 0 && j == 0) {
                    arr[key] = [m.e, m.s];
                }
                // Right upper corner
                else if (i == 0 && j == cols - 1) {
                    arr[key] = [m.s, m.w];
                }
                // Left lower corner
                else if (i == rows - 1 && j == 0) {
                    arr[key] = [m.n, m.ne];
                }
                // Right lower corner
                else if (i == rows - 1 && j == cols - 1) {
                    arr[key] = [m.n, m.nw];
                }
                //
                // ------------ Borders ------------
                //
                // Left border
                else if (j == 0) {
                    arr[key] = [m.n, m.ne, m.e, m.s];
                }
                // Right border
                else if (j == cols - 1) {
                    arr[key] = [m.n, m.s, m.w, m.nw];
                }
                // Upper border (odd cols)
                else if (i == 0 && j % 2 == 1) {
                    arr[key] = [m.e, m.se, m.w];
                }
                // Upper border (even cols)
                else if (i == 0 && j % 2 == 0) {
                    arr[key] = [m.e, m.se, m.s, m.sw, m.w];
                }
                // Lower border (even cols)
                else if (i == rows - 1 && j % 2 == 0) {
                    arr[key] = [m.n, m.ne, m.nw];
                }
                // Lower border (odd cols) - must be -1 so no movements
                else if (i == rows - 1 && j % 2 == 1) {
                    arr[key] = [];
                }
                //
                // ------------ Middle ones ------------
                //
                // even cols
                else if (j % 2 == 0) {
                    arr[key] = [m.n, m.ne, m.e, m.s, m.w, m.nw];
                }
                // odd cols
                else if (j % 2 == 1) {
                    arr[key] = [m.n, m.e, m.se, m.s, m.sw, m.w];
                }
            }
        }
        return arr;
    }

    static verifier2000(moves) {
        //La función ha recibido un JSON que contiene la posición inicial y los movimientos que se realizan
        
        //Para cada false, habrá que devolver un mensaje 2xx pero de error 

        // Check if the variable is a JSON object
        if (typeof moves !== 'object' || moves === null || Array.isArray(moves)) {
            return false;
        }

        // Check if the JSON object has a key called "nodes"
        if (!moves.hasOwnProperty('nodes')) {
            return false;
        }

        // Check if "nodes" is an array
        if (!Array.isArray(moves.nodes)) {
            return false;
        }

        // Check if each element in "nodes" is an array of two integers
        for (let i = 0; i < moves.nodes.length; i++) {
            const node = moves.nodes[i];
            if (!Array.isArray(node) || node.length !== 2 || !Number.isInteger(node[0]) || !Number.isInteger(node[1])) {
                return false;
            }
        }

        //TODO Hay que comprobar que hay al menos 3 arrays en el JSON
        if (moves.length < 3) {
            return false;
        }

        //La posición actual será la primera
        currentPosition = moves.nodes[0];

        //Recorremos el array de movimientos
        for (let i = 1; i < moves.nodes.length; i++) {

            //TODO Se comprueba que es válido
            //Habrá que pasar el valor a i + "," + j
            curPosString = currentPosition[0] + "," + currentPosition[1];
            if (!possibleMoves[curPosString].includes(moves.nodes[i])) {
                return false;
            }

            //Si es válido, actualizamos la posición actual
            currentPosition = moves.nodes[i];
        }

        //TODO se pone todo en marcha
    }

    //Función a la que se llama con un array de coordenadas. Esos son los hexagonos
    //sobre los que se tiene que ejecutar la acción.
    static executeMove

}

module.exports = Functions;