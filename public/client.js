// --- DOM Elements ---

// Views
const viewHome = document.getElementById('view-home');
const viewPost = document.getElementById('view-post');

// Buttons
const btnHome = document.getElementById('btn-home');
const btnBack = document.getElementById('back-btn');
const btnReadMore = document.querySelector('.read-more-btn');

// --- Feedback Helper ---
const FEEDBACK_CLASSES = ['feedback-loading', 'feedback-success', 'feedback-warning', 'feedback-error'];

function setFeedback(message, state) {
    feedbackMessage.textContent = message;
    feedbackMessage.classList.remove(...FEEDBACK_CLASSES);
    if (state) {
        feedbackMessage.classList.add(`feedback-${state}`);
    }
}


// --- Navigation Functions ---

function goHome() {
    viewHome.style.display = 'block';
    viewPost.style.display = 'none';
}

function goToPost() {
    viewHome.style.display = 'none';
    viewPost.style.display = 'block';
}

// --- Event Listeners ---

btnHome.addEventListener('click', () => {
    goHome();
});

btnBack.addEventListener('click', () => {
    goHome();
});
if (btnReadMore) {
    btnReadMore.addEventListener('click', () => {
        goToPost();
    });
}

// --- Helper Function: Find URL'er (Regex) ---
function extractUrls(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.match(urlPattern) || [];
}

// --- Form Handling ---

const commentForm = document.getElementById('comment-form');
const feedbackMessage = document.getElementById('feedback-message');

if (commentForm) {
    commentForm.addEventListener('submit', async (event) => {
        // 1. PREVENT DEFAULT: Stop the browser from reloading the page
        event.preventDefault();

        // 2. Get values from the input fields
        const author = document.getElementById('comment-author').value;
        const text = document.getElementById('comment-text').value;

        //3. Use out Helper Function to extract URLs from the text
        const foundUrls = extractUrls(text);

        console.log("Sender forespørgsel for:", author);

        // 4. Provide feedback to the user (UX)
        setFeedback("Analyserer din kommentar hos serveren...", "loading");

       // 5. URL validation (placeholder for now)
        if (foundUrls.length > 0) {
            // SCENARIO 1: There are URLs in the comment
            setFeedback(`⚠️ Hov! Jeg fandt ${foundUrls.length} link(s). De skal lige sikkerhedstjekkes hos serveren...`, "warning");

            try {
                const response = await fetch('/api/validate-urls', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ urls: foundUrls })
                });

                if (!response.ok) {
                    throw new Error(`Server svarede med status ${response.status}`);
                }

                const data = await response.json();

                if (data.allSafe) {
                    setFeedback("✓ Alle links er sikre! Din kommentar er publiceret.", "success");
                    commentForm.reset();
                } else {
                    const unsafeUrls = data.results
                        .filter((r) => !r.safe)
                        .map((r) => r.url);
                    setFeedback(`Advarsel! ${unsafeUrls.length} link(s) blev markeret som usikre: ${unsafeUrls.join(', ')}`, "error");
                }
            } catch (error) {
                setFeedback("Fejl: Kunne ikke kontakte serveren. Prøv igen senere.", "error");
                console.error("Validation fetch error:", error);
            }
        } else {
            // SCENARIO 2: No URLs found, just a regular comment
            setTimeout(() => {
                setFeedback("✓ Tak for din kommentar! Den er nu synlig for alle.", "success");
                commentForm.reset();
            }, 1000);
        }
    });
}