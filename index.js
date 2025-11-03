const express = require('express');
const app = express();
const port = 80;

// Static html and js files will be served from the public directory, as that's common practice
app.use(express.static('public'));

// Endpoint for testing connectivity
app.get('/api/ping', (req, res) => {
  res.send('Pong');
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
