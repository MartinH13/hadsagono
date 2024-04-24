class Board {

    board;
    possibleMoves;
    score;

    constructor(rows, columns) {

        // Check just in case
        if (rows % 2 == 1 || columns % 2 == 0) {
            throw new Error("Rows must be even and 4 or more, columns must be odd and 3 or more");
        } else if (rows < 4 || columns < 3) {
            throw new Error("Rows must be even and 4 or more, columns must be odd and 3 or more");
        }


        this.board = this.generateInitialBoard(rows, columns);
        this.possibleMoves = this.generatePossibleMoves(rows, columns);
        this.score = 0;
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

    // Given the number of rows and columns, generate (randomly) the initial board
    generateInitialBoard(rows, cols) {
        let b = {
            "board": [],
            "score": 0
        };
        
        let pos = [2,4,8,16];

        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
                
                // Disabled spots
                if (i == rows -1 && j % 2 == 1) {
                    row.push(-1);
                // Borders
                } else if ((i == 0 || i == rows - 1) && (j == 0 || j == cols - 1)) {
                    row.push(16);
                // Bottom half
                } else if (i > rows / 2) {
                    row.push(pos[Math.floor(Math.random() * 2)]);
                // Bottom top
                } else if (i < rows / 2) {
                    row.push(pos[Math.floor(Math.random() * 2)]);
                // Middle row
                } else {
                    row.push(pos[Math.floor(Math.random() * 3)]);
                }
            }
            b.board.push(row);
        }

        // (rows / 2) - 1 times random 8 hexagon spots
        for (let z = 0; z < (rows / 2) - 1; z++) {
            let x = Math.floor(Math.random() * rows);
            let y = Math.floor(Math.random() * cols);
            b.board[x][y] = 8;
        }

        return b;
    }    

    // Pre: Columns must be odd and 3 or more
    // Pre: Rows must be even and 4 or more
    // Generate the array of possible moves for each hexagon
    generatePossibleMoves(rows, cols) {
        let arr = {};
        let m = Board.m;
        
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
    
    //La función ha recibido un JSON que contiene la posición inicial y los movimientos que se realizan
    verifier2000(moves) {
        
        // Check if the variable is a JSON object
        if (typeof moves !== 'object' || moves === null || Array.isArray(moves)) {
            return 201;
        }

        // Check if the JSON object has a key called "nodes"
        if (!moves.hasOwnProperty('nodes')) {
            return 251;
        }

        // Check if "nodes" is an array
        if (!Array.isArray(moves.nodes)) {
            return 252;
        }

        // Check if each element in "nodes" is an array of two integers
        let values = [0,1,-1]
        for (let i = 0; i < moves.nodes.length; i++) {
            const node = moves.nodes[i];
            // Check if the element is an array of two integers
            if (!Array.isArray(node) || node.length !== 2 || !Number.isInteger(node[0]) || !Number.isInteger(node[1])) {
                return 253;
            }
            // Check if the integers are between -1 and 1 for the movements
            if (i > 0 && !(values.includes(node[0]) || values.includes(node[1]))) {
                return 254;
            }
        }
        
        // Check if at least 3 hexagons are selected
        if (moves.length < 3) {
            return 255;
        }

        //La posición actual será la primera
        let currentPosition = moves.nodes[0];
        let num = this.board.board[currentPosition[0]][currentPosition[1]];
        
        //Recorremos el array de movimientos
        for (let i = 1; i < moves.nodes.length; i++) {

            //Habrá que pasar el valor a i + "," + j
            let curPosString = currentPosition[0] + "," + currentPosition[1];

            // Comprobamos si el movimiento es válido (nodo a nodo)
            if (!this.possibleMoves[curPosString].includes(moves.nodes[i])) {
                return 256;
            }
            let found = false;
            for (let j = 0; j < this.possibleMoves[curPosString].length; j++) {
                if (this.possibleMoves[curPosString][j][0] == moves.nodes[i][0] && this.possibleMoves[curPosString][j][1] == moves.nodes[i][1]) {
                    found = true;
                    break;
                }
            }
            
            if (!found) return 256;

            // Comprobamos si estamos moviendonos dentro del mismo numero
            if (this.board.board[currentPosition[0]][currentPosition[1]] != num) {
                return 257;
            }

            //Si es válido, actualizamos la posición actual
            currentPosition[0] += moves.nodes[i][0];
            currentPosition[1] += moves.nodes[i][1];
        }

        return 100;
    }

    //Función a la que se llama con un array de coordenadas. Esos son los hexagonos
    //sobre los que se tiene que ejecutar la acción.
    // Validará que los movimientos sean correctos y luego los ejecutará
    // Actualizará el tablero y devolverá 100 si todo ha ido bien
    executeMove(moves) {

        let res = this.verifier2000(moves);
        if (res != 100) return res;

        // por si acaso backup
        let oldboard = JSON.parse(JSON.stringify(this.board));

        // Guardamos el numero del que partimos
        let num = this.board.board[moves.nodes[0][0]][moves.nodes[0][1]];

        // Recorremos paso a paso los movimientos y rellenamos de -2
        // los hexágonos que se van a eliminar (excepto el ultimo);
        let pos = nodes.moves[0];
        for (let i = 0; i < moves.nodes.length -1; i++) {
            this.board.board[pos[0]][pos[1]] = -2;
            
            pos[0] += moves.nodes[i][0];
            pos[1] += moves.nodes[i][1];
        }
        // En el ultimo hexagono ponemos el nuevo numero
        this.board.board[pos[0]][pos[1]] = num * Math.pow(2, Math.floor(moves.nodes.length / 3));

        // Vamos recorriendo los -2 y "bajamos el resto de numeros"
        // poniendo un -3 en los que se han movido
        for (let i = 0; i < this.board.board.length; i++) {
            for (let j = 0; j < this.board.board[i].length; j++) {
                if (this.board.board[i][j] == -2) {
                    let k = i;
                    while (k > 0 && this.board.board[k-1][j] > 0) {
                        this.board.board[k][j] = this.board.board[k-1][j];
                        this.board.board[k-1][j] = -3;
                        k--;
                    }
                }
            }
        }

        return 100;
    }

}

module.exports = Board;