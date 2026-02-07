const express = require('express');
const path = require('path');
const { validateUrls } = require('./urlvalidator');
const app = express();
const PORT = 3000;

// In-memory database for comments
const commentsDB = [];

// Middleware: Serve static files from the "public" directory
// BEST PRACTICE: Since main.js is in 'src', we use '../public' to go up one level to root, then into public.
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Basic route for the home page (fallback)
app.get('/', (req, res) => {
    // Sends the index.html file to the user
    // Again, we navigate out of 'src' (..) and into 'public'
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// API endpoint for URL validation
app.post('/api/validate-urls', (req, res) => {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({
            error: "Request body must include a non-empty 'urls' array."
        });
    }

    const results = validateUrls(urls);
    const allSafe = results.every((r) => r.safe);

    res.json({ allSafe, results });
});

// Helper: extract URLs from text
function extractUrls(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.match(urlPattern) || [];
}

// API endpoint for posting comments
app.post('/api/comments', (req, res) => {
    const { author, text, email, subscribe } = req.body;

    if (!author || !text) {
        return res.status(400).json({ error: 'Navn og kommentar er påkrævet.' });
    }

    // Check URLs in the comment text
    const foundUrls = extractUrls(text);
    if (foundUrls.length > 0) {
        const results = validateUrls(foundUrls);
        const allSafe = results.every((r) => r.safe);
        if (!allSafe) {
            const unsafeUrls = results.filter((r) => !r.safe).map((r) => r.url);
            return res.status(400).json({
                error: `Kommentaren indeholder usikre links: ${unsafeUrls.join(', ')}`,
                unsafeUrls
            });
        }
    }

    const comment = {
        id: commentsDB.length + 1,
        author,
        text,
        date: new Date().toISOString()
    };

    if (subscribe && email) {
        comment.email = email;
        console.log("📧 SENDING MAIL TO: " + email);
    }

    commentsDB.push(comment);

    res.status(201).json(comment);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});