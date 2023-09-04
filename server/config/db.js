const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log('mongodb connected to ' + conn.connection.host);
    } catch (error) {
        console.log('mongodb connection error : ' + error.message);
    }
}

module.exports = connectDB;