const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // set to true if want to save only fields that's in schema to DB
        mongoose.set('strictQuery', true);
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }catch(error){
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDB;

