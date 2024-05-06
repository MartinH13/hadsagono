let express = require('express');
let router = express.Router();
let Board = require('./board.js');
let db = require('./dataAccess.js');
let Groq = require("groq-sdk");
const groq = new Groq({
    apiKey: process.env.GROQ_KEY1
});

router.get('/', (req, res) => {
    main();
    res.send("200 OK");
});

async function main() {
    const chatCompletion = await getGroqChatCompletion();
    // Print the completion returned by the LLM.
    process.stdout.write(chatCompletion.choices[0]?.message?.content || "");
}
async function getGroqChatCompletion() {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: "You are playing Daily Hexa Puzzle. You have to connect a minimum of 3 elements of the same value. You are restricted to adjacent elements. This is the board: [ [16, 2, 16, 2, 16], [8, 2, 2, 2, 8], [8, 4, 16, 4, 8], [4, 16, 4, 16, 4], [4, 4, 4, 4, 4], [16, -1, 8, -1, 16], ] This is your movement matrix, you can only move in these directions: { '0,0': [ [ 0, 1 ], [ 1, 0 ] ], '0,1': [ [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, -1 ], [ 1, -1 ] ], '0,2': [ [ 0, 1 ], [ 1, 0 ], [ 0, -1 ] ], '0,3': [ [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, -1 ], [ 1, -1 ] ], '0,4': [ [ 1, 0 ], [ 0, -1 ] ], '1,0': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] ], '1,1': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '1,2': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '1,3': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '1,4': [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '2,0': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] ], '2,1': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '2,2': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '2,3': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '2,4': [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '3,0': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] ], '3,1': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '3,2': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '3,3': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '3,4': [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '4,0': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ] ], '4,1': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '4,2': [ [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '4,3': [ [ -1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ], '4,4': [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ -1, -1 ] ], '5,0': [ [ -1, 0 ], [ -1, 1 ] ], '5,1': [], '5,2': [ [ -1, 0 ], [ -1, 1 ], [ -1, -1 ] ], '5,3': [], '5,4': [ [ -1, 0 ], [ -1, -1 ] ] } Say you want to start at [2,0] and want to move [1,0] (south), you would now have to check on the matrix for [3,0] because that is your current position. Return your answer in the following format: {[[a,b],[x1,y1],[x2,y2],...]} Where [a,b] is the starting coordinate and the following are the movements on the matrix. Your answer should only contain the previous format, nothing else."
            }
        ],
        model: "llama3-70b-8192"
    });
}


module.exports = router;