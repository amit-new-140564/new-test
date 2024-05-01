const mongoose = require("mongoose");
require('dotenv').config()


const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log("Connected to mongoose successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = connectToMongo;
