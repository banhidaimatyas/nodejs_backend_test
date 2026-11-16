require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const mongoString = process.env.DATABASE_URL;
const port = process.env.PORT || 3000;

mongoose.connect(mongoString).catch((error) => {
    console.log(error);
});

const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error);
});

database.once('connected', () => {
    console.log('Database Connected');
});

const app = express();
const routes = require('./routes');

app.use(express.json());
app.use('/api', routes);

app.listen(port, () => {
    console.log(`Server Started at ${port}`);
});
