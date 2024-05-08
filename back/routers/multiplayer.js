let express = require('express');
let router = express.Router();
let Board = require('../logic/board.js');
let db = require('../logic/dataAccess.js');
let utils = require('../logic/utils.js');
let Groq = require("groq-sdk");
const groq = new Groq({
    apiKey: process.env.GROQ_KEY1
});

router.get('/new', async (req, res) => {

    // generate new code for the game.
    let code = await db.generateCode();
    // for the moment, 6 rows and 5 columns
    let b = new Board({"columns": 5, "rows" : 6}, code);
    let bia = new Board({"columns": 5, "rows" : 6}, code);
    let resjson = {
        "board": b.board,
        "iaboard": bia.board,
        "score": b.score,
        "iascore": bia.score,
        "movecount" : b.movecount,
        "possibleMoves": b.possibleMoves,
        "code": b.code
    };
    req.session.game = resjson;
    let clone = JSON.parse(JSON.stringify(resjson));
    // En la primera jugada no se manda el codigo
    delete clone.code;
    res.send(clone);
    db.cleanup(); // Hacemos cleanup de la BD con cada NEW
    return;

});


router.get('/', (req, res) => {
    main(); //Esto es para hacer pruebas, ignorar por ahora
    res.send("200 OK");
});

async function main() {
    let matrix = [
        [16, 2, 16, 2, 16], 
        [8, 2, 2, 2, 8], 
        [8, 4, 16, 4, 8], 
        [4, 16, 4, 16, 4], 
        [4, 4, 4, 4, 4], 
        [16, -1, 8, -1, 16]
    ];
    let possibleMoves = {
        '0,0': [ [ 0, 1 ], [ 1, 0 ] ],
            '0,1': [ [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, -1 ], [ 1, -1 ] ],
            '0,2': [ [ 0, 1 ], [ 1, 0 ], [ 0, -1 ] ],
            '0,3': [ [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, -1 ], [ 1, -1 ] ],
            '0,4': [ [ 1, 0 ], [ 0, -1 ] ],
            '1,0': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] ],
            '1,1': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ],
            '1,2': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ],
            '1,3': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ],
            '1,4': [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ],
            '2,0': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] ],
            '2,1': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ],
            '2,2': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ],
            '2,3': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ],
            '2,4': [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ],
            '3,0': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] ],
            '3,1': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ],
            '3,2': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ],
            '3,3': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ],
            '3,4': [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ],
            '4,0': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] ],
            '4,1': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ],
            '4,2': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ],
            '4,3': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ],
            '4,4': [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ],
            '5,0': [ [ -1, 0 ], [ -1, 1 ] ],
            '5,1': [],
            '5,2': [ [ -1, 0 ], [ -1, 1 ], [ -1, -1 ] ],
            '5,3': [],
            '5,4': [ [ -1, 0 ], [ -1, -1 ] ]
    };

    //let sol = utils.findFirstPath(matrix, possibleMoves,1,1,[]);
    let sol = utils.findSolution(matrix,possibleMoves,10);
        console.log(sol);
    return ("200 OK");
}
async function getGroqChatCompletion() {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: `You are playing a connecting numbers game. The numbers are represented in a matrix. You have to connect a minimum of 3 numbers of the same value. You are restricted to only some possible movements along the matrix. I will pass on an array of possible movements like this: { "i,j" : [[a,b], [c,d]]} where i is the row of the matrix and j is the column of the matrix. From i,j you can move in the directions displayed by [a,b] or where a is the difference in the "rows" (i variable) and b is the difference in the columns (j variable) You must connect the most amount of numbers. Please return your proposed movement like this: {"moves":[[z,m],[x1,y1],[x2,y2],...]} where [z,m] is the starting coordinate (i,j) in the matrix and the following are the movements on the matrix (movements MUST be valid according to the array of possible movements) Also movements must be from each node, limiting its format to 1, -1 or 0. This is the matrix: [ [16, 2, 16, 2, 16], [8, 2, 2, 2, 8], [8, 4, 16, 4, 8], [4, 16, 4, 16, 4], [4, 4, 4, 4, 4], [16, -1, 8, -1, 16], ] The array of possible movements is this: { '0,0': [ [ 0, 1 ], [ 1, 0 ] ], '0,1': [ [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, -1 ], [ 1, -1 ] ], '0,2': [ [ 0, 1 ], [ 1, 0 ], [ 0, -1 ] ], '0,3': [ [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, -1 ], [ 1, -1 ] ], '0,4': [ [ 1, 0 ], [ 0, -1 ] ], '1,0': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] ], '1,1': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '1,2': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '1,3': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '1,4': [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '2,0': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] ], '2,1': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '2,2': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '2,3': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '2,4': [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '3,0': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] ], '3,1': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '3,2': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '3,3': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '3,4': [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '4,0': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] ], '4,1': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '4,2': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '4,3': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '4,4': [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '5,0': [ [ -1, 0 ], [ -1, 1 ] ], '5,1': [], '5,2': [ [ -1, 0 ], [ -1, 1 ], [ -1, -1 ] ], '5,3': [], '5,4': [ [ -1, 0 ], [ -1, -1 ] ] } Please limit your answer to ONLY the specified format. Do not be verbose.`
            }
        ],
        model: "llama3-70b-8192"
    });
}


module.exports = router;