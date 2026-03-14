const express = require('express');
const app = express();
const port = 80;
const gameRoutes = require('./routes/game');
const { createDatabase } = require('./logic/databaseManagement.js');

// Create the database and tables if they dont exist
createDatabase();

// Static html and js files will be served from the public directory, as that's common practice
app.use(express.static('public'));

// Middleware to parse JSON request bodies
app.use(express.json());

// Use game routes from routes/game.js
app.use('/api/game', gameRoutes);

// Endpoint for testing connectivity
app.get('/api/ping', (req, res) => {
    res.send('Pong');
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
