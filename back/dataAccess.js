require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment');

//const mongoURI = process.env.MONGO_URI;
const mongoURI = "***REMOVED***"

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const boardSchema = new Schema({
  board: [],
  score: Number,
  movecount: Number,
  date: { type: Date, default: Date.now },
  code: String,
});

const backupBoardSchema = new Schema({
  board: [],
  score: Number,
  movecount: Number,
  date: { type: Date, default: Date.now },
  code: String,
});

const Board = mongoose.model('Board', boardSchema);
const BackupBoard = mongoose.model('BackupBoard', backupBoardSchema);

class DataAccess {
  static async save(board, score, movecount, code) {
    try {
      // Check if the code exists in the db
      console.log("Checking if code exists: " + code);
      const codeExists = await DataAccess.codeExists(code);
      console.log("Code exists: " + codeExists);

      if (codeExists) {
        // If the code exists, update the document
        await Board.updateOne(
          { code: code },
          { $set: { board: board, score: score, movecount: movecount } }
        );
        console.log("Updated board with code: " + code);
      } else {
        // If the code doesn't exist, insert a new document
        await Board.create({ board, score, movecount, code });
        console.log("Inserted board with code: " + code);
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

    // If it exists, return the board and score
    return await Board.findOne({ code: code });
  }

  static async generateCode() {
    try {
      console.log("New code");
      const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
      const data = await response.json();
      console.log("Generated code:" + data);
      return data[0];
    } catch (error) {
      console.error('Error:', error);
      return 282;
    }
  }

  // Not for use outside of this class
  static async codeExists(code) {
    try {
      return await Board.exists({ code: code });
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  //Cleanup function. Deletes documents older than 3 days or if there's less than 3 moves
  static async cleanup() {
    try {
      const threeMonthsAgo = moment().subtract(3, 'days').toDate();
      console.log('Deleting documents older than:', threeMonthsAgo);

      const result = await Board.deleteMany({
        $or: [
          { date: { $lt: threeMonthsAgo } }
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

  //Do not call this function in production
  static async deleteAll() {
    try {
      await Board.deleteMany();
      console.log('Deleted all documents');
    } catch (error) {
      console.error('Error:', error);
    }
  }

}

module.exports = DataAccess;