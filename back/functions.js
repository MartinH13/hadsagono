class Functions {

    // static possibleMoves = {
    //     "0,0" : [m.e, m.s],
    //     "0,1" : [m.n, m.ne, m.e, m.s],
    //     "0,2" : [m.n, m.ne, m.e, m.s],
    //     "0,3" : [m.n, m.ne, m.e, m.s],
    //     "0,4" : [m.n, m.ne, m.e, m.s],
    //     "0,5" : [m.n, m.ne],

    //     "1,0" : [m.e, m.se, m.s, m.sw, m.w],
    //     "1,1" : [m.n, m.e, m.se, m.s, m.sw, m.w],
    //     "1,2" : [m.n, m.e, m.se, m.s, m.sw, m.w],
    //     "1,3" : [m.n, m.e, m.se, m.s, m.sw, m.w],
    //     "1,4" : [m.n, m.e, m.se, m.sw, m.w],

    //     "2,0" : [m.e, m.s, m.w],
    //     "2,1" : [m.n, m.ne, m.e, m.s, m.w, m.nw],
    //     "2,2" : [m.n, m.ne, m.e, m.s, m.w, m.nw],
    //     "2,3" : [m.n, m.ne, m.e, m.s, m.w, m.nw],
    //     "2,4" : [m.n, m.ne, m.e, m.s, m.w, m.nw],
    //     "2,5" : [m.n, m.ne, m.nw],

    //     "3,0" : [m.e, m.se, m.s, m.sw, m.w],
    //     "3,1" : [m.n, m.e, m.se, m.s, m.sw, m.w],
    //     "3,2" : [m.n, m.e, m.se, m.s, m.sw, m.w],
    //     "3,3" : [m.n, m.e, m.se, m.s, m.sw, m.w],
    //     "3,4" : [m.n, m.e, m.se, m.sw, m.w],

    //     "4,0" : [m.s, m.w],
    //     "4,1" : [m.n, m.s, m.w, m.nw],
    //     "4,2" : [m.n, m.s, m.w, m.nw],
    //     "4,3" : [m.n, m.s, m.w, m.nw],
    //     "4,4" : [m.n, m.s, m.w, m.nw],
    //     "4,5" : [m.n, m.nw]

    // }

    // siendo i la columna y j la fila
    // static m = {
    //     n : [0,-1],
    //     ne : [1,-1],
    //     e : [1,0],
    //     se : [1,1],
    //     s : [0,1],
    //     sw : [-1,1],
    //     w : [-1,0],
    //     nw : [-1,-1],
    // }

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
        
        //TODO Tenemos que tener un JSON con los movimientos legales

        //TODO Hay que comprobar que hay al menos 3 arrays en el JSON
        if (moves.length < 3) {
            
        }

        //La posición actual será la primera
        currentPosition = moves.nodes[0];

        //Recorremos el array de movimientos
        for (let i = 1; i < moves.nodes.length; i++) {

            //TODO Se comprueba que es válido
            //Habrá que pasar el valor a i + "," + j
            currentPosition, moves.nodes[i]

            //Si es válido, actualizamos la posición actual
            currentPosition = moves.nodes[i];
        }

        //TODO se pone todo en marcha

    }

}

module.exports = Functions;