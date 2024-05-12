let express = require('express');
let router = express.Router();
let Board = require('../logic/board.js');
let db = require('../logic/dataAccess.js');
let utils = require('../logic/utils.js');
let ChatGroq = require("@langchain/groq").ChatGroq;
let ChatPromptTemplate = require("@langchain/core/prompts").ChatPromptTemplate;
require('dotenv').config();
const model = new ChatGroq({
    apiKey: process.env.GROQ_KEY_1,
  });


router.get('/new', async (req, res) => {

    // generate new code for the game.
    let code = await db.generateCode();
    // for the moment, 6 rows and 5 columns
    let b = new Board({"columns": 5, "rows" : 6}, code);
    let bia = new Board({"board": b.board, "movecount" : b.movecount, "score": b.score}, code);
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

router.post('/move', async (req, res) => {
    if (req.session.game === undefined || req.session.game === null) {
        res.send({"error": 203});
        return;
    }
    let moves = {"nodes" : req.body.moves};
    let game = req.session.game;
    const parsedData = game;
    // Create new objects for JSON1 and JSON2
    const json1 = {
        board: parsedData.board,
        score: parsedData.score,
        code: parsedData.code,
        movecount: parsedData.movecount,
   };

    const json2 = {
        board: parsedData.iaboard,
        score: parsedData.iascore,
        code: parsedData.code,
        movecount: parsedData.movecount

    };

    let b = new Board(json1, game.code);
    let bAI = new Board(json2, game.code);
    let resu = b.executeMove(moves);
    if (resu != 100) {
        res.send({"error": resu});
        return;
    }

    // AI move
    // de momento, cogemos el primer camino de 3 que haya
    let aiMove = utils.findSolutions(bAI.board, bAI.possibleMoves, 3)[0];
    let aiJsonMove = {"nodes": aiMove};
    let aiResu = bAI.executeMove(aiJsonMove);

    let resjson = {
        "board": b.board,
        "iaboard": bAI.board,
        "score": b.score,
        "iascore": bAI.score,
        "iaResult" : aiResu
    };

    // session save
    let sess = {
        "board": b.board,
        "iaboard": bAI.board,
        "score": b.score,
        "iascore": bAI.score,
        "movecount" : b.movecount,
        "possibleMoves": b.possibleMoves,
        "code": b.code
    };

    req.session.game = sess;
    // Guardar cada 3 turnos
    if (b.movecount % 3 == 0) {
        await db.saveAI(b.board, b.score, b.movecount, b.code, true, bAI.board, bAI.score);
        resjson["code"] = b.code;
    }
    res.send(resjson);
    
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
    let sol = utils.findSolutions(matrix,possibleMoves,10);
        console.log(sol);

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant"],
            ["human", "{input}"],
          ]);
          const chain = prompt.pipe(model);
          const response = await chain.invoke({
            input: "Hello",
          });
          console.log("response", response);
    return ("200 OK");
}


module.exports = router;