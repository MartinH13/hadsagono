let express = require('express');
let router = express.Router();
let Board = require('../logic/board.js');
let db = require('../logic/dataAccess.js');
let utils = require('../logic/utils.js');
let aitools = require('../logic/aiPrompts.js');
let ChatGroq = require("@langchain/groq").ChatGroq;
let ChatPromptTemplate = require("@langchain/core/prompts").ChatPromptTemplate;
require('dotenv').config();
const model = new ChatGroq({
    apiKey: process.env.GROQ_KEY_1,
  });
const prompt = ChatPromptTemplate.fromMessages([
    ["system", aitools.generateBasePrompt()],
    ["human", "{input}"],
]);
const chain = prompt.pipe(model);

const DEFAULT_PATH_GENERATION_LENGTH = 10;

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
        "iaPathGeneration" : DEFAULT_PATH_GENERATION_LENGTH,
        "possibleMoves": b.possibleMoves,
        "consumedDisadvantages": [],
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
        possibleMoves: parsedData.possibleMoves
   };

    const json2 = {
        board: parsedData.iaboard,
        score: parsedData.iascore,
        code: parsedData.code,
        movecount: parsedData.movecount,
        possibleMoves: parsedData.possibleMoves
    };

    let b = new Board(json1, game.code);
    let bAI = new Board(json2, game.code);
    let resu = b.executeMove(moves);
    if (resu != 100) {
        res.send({"error": resu});
        return;
    }
    // just in case the game hasn't been loaded with the default path generation metric
    if (typeof parsedData.iaPathGeneration === 'undefined') {
        parsedData.iaPathGeneration = DEFAULT_PATH_GENERATION_LENGTH;
    }
    let possibleSols = utils.chooseNSolutions(bAI.board, parsedData.possibleMoves, parsedData.iaPathGeneration)
    let movesPrompt = aitools.generateMovementsPrompt(bAI.board, parsedData.possibleMoves, possibleSols);
    const response = await chain.invoke({
        input: movesPrompt,
    });
    let iachoose = Array.from(response.content)[0];
    let aiMove = null;
    try {
        aiMove = utils.transformPathToMoves(possibleSols[Number(iachoose)-1]);
    } catch (error) {
        ; // NOP
    }
    
    let playerMove1 = utils.findSolutions(b.board, b.possibleMoves, 15);
    if (!playerMove1) {
        //Aqui hay que meter comunicacion con frontend para acabar la partida
        console.log("No hay movimientos Player");
        return;
    }
    
    let aiJsonMove = {"nodes": aiMove};
    let aiResu = (aiMove === null) ? 302 : bAI.executeMove(aiJsonMove);

    let resjson = {
        "board": b.board,
        "iaboard": bAI.board,
        "score": b.score,
        "iascore": bAI.score,
        "iaPathGeneration" : parsedData.iaPathGeneration,
        "consumedDisadvantages": parsedData.iaPathGeneration,
        "iaResult" : aiResu
    };

    // session save
    let sess = {
        "board": b.board,
        "iaboard": bAI.board,
        "score": b.score,
        "iascore": bAI.score,
        "iaPathGeneration": parsedData.iaPathGeneration,
        "movecount" : b.movecount,
        "consumedDisadvantages": parsedData.consumedDisadvantages,
        "possibleMoves": b.possibleMoves,
        "code": b.code
    };

    req.session.game = sess;
    // Guardar cada 3 turnos
    if (b.movecount % 3 == 0) {
        await db.saveAI(b.board, b.score, b.movecount, b.code, true, bAI.board, bAI.score, parsedData.consumedDisadvantages);
        resjson["code"] = b.code;
    }
    res.send(resjson);
    
});

router.post('/disadvantage', async (req, res) => {
    if (req.session.game === undefined || req.session.game === null) {
        res.send({"error": 203});
        return;
    }
    let disadvantage = req.body.disadvantage;
    let resjson;
    switch (disadvantage) {
        case 1: // Max path reduction - 200 points
            if (req.session.game.score < 200) {
                res.send({"error": 303});
                return;
            }
            req.session.game.score -= 200;
            resjson = {
                "board": req.session.game.board,
                "iaboard": req.session.iaboard,
                "score": req.session.score,
                "iascore": req.session.iascore,
            };

            // guardarnos la putada
            req.session.iaPathGeneration = 5;
            req.session.consumedDisadvantages.push(1);
            res.send(resjson);
            break;
        case 2: // information penalization - 300 points
            if (req.session.game.score < 200) {
                res.send({"error": 303});
                return;
            }
            req.session.game.score -= 300;
            resjson = {
                "board": req.session.game.board,
                "iaboard": req.session.iaboard,
                "score": req.session.score,
                "iascore": req.session.iascore,
            };

            // guardarnos la putada
            req.session.consumedDisadvantages.push(2);






            // IMPLEMENTAR LA PUTADA // TODO
            // MARTIN AQUI VA EL CODIGO
            // TAMBIEN HAY QUE METERLO EN EL LOAD.js













            res.send(resjson);
            break;
        case 3: // model penalization - 400 points
            if (req.session.game.score < 200) {
                res.send({"error": 303});
                return;
            }
            req.session.game.score -= 400;
            resjson = {
                "board": req.session.game.board,
                "iaboard": req.session.iaboard,
                "score": req.session.score,
                "iascore": req.session.iascore,
            };

            // guardarnos la putada
            req.session.consumedDisadvantages.push(3);



            


            // IMPLEMENTAR LA PUTADA // TODO
            // MARTIN AQUI VA EL CODIGO
            // TAMBIEN HAY QUE METERLO EN EL LOAD.js






            res.send(resjson);
            break;
        default:
            res.send({"error": 304});
            break;
    }
});

router.get('/', (req, res) => {
    res.send("200 AI BACKEND OK");
});



module.exports = router;