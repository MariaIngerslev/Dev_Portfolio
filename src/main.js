require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;

async function start() {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('MONGODB_URI environment variable is not set');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
}

start();
