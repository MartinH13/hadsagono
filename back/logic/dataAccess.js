require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment');

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const boardSchema = new Schema({
  board: [],
  score: Number,
  movecount: Number,
  code: String,
  date: { type: Date, default: Date.now }
});

const boardAISchema = new Schema({
  board: [],
  score: Number,
  movecount: Number,
  code: String,
  ai: {type: Boolean, default: false},
  aiBoard: [{type: [], default: []}],
  aiScore : {type: Number, default: 0},
  date: { type: Date, default: Date.now }
});

const Board = mongoose.model('Board', boardSchema);
const BoardAI = mongoose.model('BoardAI', boardSchema);
const BackupBoard = mongoose.model('BackupBoard', boardSchema);

class DataAccess {

  static async save(board, score, movecount, code) {
    try {
      // Check if the code exists in the db
      const codeExists = await DataAccess.codeExists(code);

      if (codeExists) {
        // If the code exists, update the document
        await TempBoard.updateOne(
          { code: code },
          { $set: { board: board, score: score, movecount: movecount} }
        );
      } else {
        // If the code doesn't exist, insert a new document
        await Board.create({ board, score, movecount, code});
      }
      return 100;
    } catch (error) {
      console.error('Error:', error);
      return 283;
    }
  }

  static async saveAI(board, score, movecount, code, ai, aiBoard, aiScore) {
    try {
      // Check if the code exists in the db
      const codeExists = await DataAccess.codeExists(code);

      if (codeExists) {
        // If the code exists, update the document
        await TempBoard.updateOne(
          { code: code },
          { $set: { board: board, score: score, movecount: movecount, ai: ai, aiBoard: aiBoard, aiScore: aiScore } }
        );
      } else {
        // If the code doesn't exist, insert a new document
        await Board.create({ board, score, movecount, code, ia, aiBoard, aiScore });
      }
      return 100;
    } catch (error) {
      console.error('Error:', error);
      return 283;
    }
  }

  static async load(code) {
    // Check if the code exists in the db
    console.log("Load in dataAccess");
    if (!(await DataAccess.codeExists(code))) return 281;

    let board = await Board.findOne({ code: code });
    let boardAI = await BoardAI.findOne({ code : code });
    if (board && boardAI) {
      console.log("Error: Both board and boardAI found. Purging...");
      DataAccess.purgeCode(code);
      return 282;
    }
    if (board) {
      return board;
    } else if (boardAI) {
      return boardAI;
    }
  }

  static async generateCode() {
    try {
      const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
      const data = await response.json();
      if (Board.exists({ code: data[0] })) {
        return DataAccess.generateCode();
      }
      return data[0];
    } catch (error) {
      console.error('Error:', error);
      return 282;
    }
  }

  // Not for use outside of this class
  static async codeExists(code) {
    try {
      const existsBoard = await Board.exists({ code: code });
      const existsBoardAI = await BoardAI.exists({ code: code });
      return existsBoard || existsBoardAI;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  //Cleanup function. Deletes documents older than 1 month or if there's less than 3 moves
  static async cleanup() {
    try {
      const oneMonthsAgo = moment().subtract(3, 'months').toDate();
      console.log('Board. Deleting documents older than:', oneMonthsAgo);

      let result = await Board.deleteMany({
        $or: [
          { date: { $lt: oneMonthsAgo  } },
          { movecount: { $lt: 3 } }
        ]
      });
      console.log('Deleted:', result.deletedCount);
      console.log('BoardAI. Deleting documents older than:', oneMonthsAgo);

      result = await BoardAI.deleteMany({
        $or: [
          { date: { $lt: oneMonthsAgo  } },
          { movecount: { $lt: 3 } }
        ]
      });
      console.log('Deleted:', result.deletedCount);

    } catch (error) {
      console.error('Error:', error);
    }
  }

  //Backup function. Backs up all documents to a new collection
  static async backup() {
    try {
      const result = await Board.find();
      await BackupBoard.insertMany(result);
      console.log('Backup done');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  //Restore function. Restores all documents from the backup collection
  static async restore(overwrite = false) {
    try {
      const result = await BackupBoard.find();
      if (overwrite)
        await Board.deleteMany();
      await Board.insertMany(result);
      console.log('Restore done');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  static async purgeCode(code) {
    try {
      await Board.deleteMany({ code: code});
      await BoardAI.deleteMany({ code: code});
    } catch (error) {
      console.error('Error:', error);
    }
  }

  //Do not call this function in production
  static async deleteAll() {
    try {
      await Board.deleteMany();
      await BoardAI.deleteMany();
      console.log('Deleted all documents');
    } catch (error) {
      console.error('Error:', error);
    }
  }

}

module.exports = DataAccess;