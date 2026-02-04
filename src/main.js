const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware: Serve static files from the "public" directory
// BEST PRACTICE: Since main.js is in 'src', we use '../public' to go up one level to root, then into public.
app.use(express.static(path.join(__dirname, '../public')));

// Basic route for the home page (fallback)
app.get('/', (req, res) => {
    // Sends the index.html file to the user
    // Again, we navigate out of 'src' (..) and into 'public'
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});