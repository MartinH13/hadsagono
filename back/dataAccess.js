//import env
require('dotenv').config();
let mongojs = require('mongojs');
const mongoURI = process.env.MONGO_URI;
const db = mongojs(mongoURI, ['boards']);

class DataAccess{

    static async save(board, score, movecount, code) {
        try {
          // Check if the code exists in the db
          console.log("Checking if code exists: " + code);
          const codeExists = await DataAccess.codeExists(code);
          console.log("Code exists: " + codeExists)
      
          if (codeExists) {
            // If the code exists, update the document
            await db.collection('boards').updateOne(
              { code: code },
              { $set: { board: board, score: score, movecount: movecount } }
            );
            console.log("Updated board with code: " + code);
          } else {
            // If the code doesn't exist, insert a new document
            await db.collection('boards').insertOne({
              board: board,
              score: score,
              movecount: movecount,
              code: code
            });
            console.log("Inserted board with code: " + code);
          }
      
          return 100;
        } catch (error) {
          console.error('Error:', error);
          return 283;
        }
      }

    static load(code){
        //Check if the code exists in the db
        if(!DataAccess.codeExists(code))
            return 281;

        //If it exists, return the board and score
        return db.boards.findOne({ code: code })[1];
    }

    static async generateCode() {
        try {
          const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
          const data = await response.json();
          console.log("Generated code:" + data);
          return data;

          //La función recursiva está dando problemas
          /*
          // Recursive call if the code already exists
          if (this.codeExists(data)) {
            return DataAccess.generateCode();
          } else {
            return data;
          }
          */
        } catch (error) {
          console.error('Error:', error);
          return 282;
        }
    }


    // Not for use outside of this class
    static async codeExists(code) {
        try {
            //Supposedly this is outdated, but the mongodb version we are using
            //is old, so this is probably the solution
            //For futureproofing, use 'count_documents', when using Mongo 4.0.3 or above
            return (await db.boards.find({'code': { "$in": code}}).count() > 0)
  
        } catch (error) {
        console.error('Error:', error);
        throw error;
        }
    }

}

module.exports = DataAccess;