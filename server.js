const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'quotes.db');

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files like index.html

// Initialize database
const db = new sqlite3.Database(DB_PATH);
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        feeling TEXT NOT NULL
    )`);

    // Insert initial quotes if table is empty (categorized for moods, expanded with NVC unmet needs)
    db.get("SELECT COUNT(*) as count FROM quotes", (err, row) => {
        if (row.count === 0) {
            const initialQuotes = [
                // Sad/Depression (existing)
                { text: "Please remember that you’re capable, brave and loved – even when it feels like you’re not.", author: "Unknown", feeling: "sad" },
                { text: "Perhaps the butterfly is proof that you can go through a great deal of darkness yet become something beautiful again.", author: "Unknown", feeling: "sad" },
                { text: "Never, ever, ever, ever, ever give up on yourself. As long as you keep on fighting, then you can beat your depression.", author: "Unknown", feeling: "sad" },
                { text: "Just because you’re going through a rough patch, it doesn’t mean you always will be. Recovery is possible. We promise you.", author: "Unknown", feeling: "sad" },
                { text: "In case no one told you today: you are beautiful. You are loved. You are needed. You are alive for a reason. You are stronger than you think, and if you keep on fighting, then you’re going to get through this.", author: "Unknown", feeling: "sad" },
                
                // Anxious (existing)
                { text: "As long as you are breathing, there is more right with you than wrong with you, no matter what is wrong.", author: "Jon Kabat-Zinn", feeling: "anxious" },
                { text: "Your calm mind is the ultimate weapon against your challenges. So relax.", author: "Bryant McGill", feeling: "anxious" },
                { text: "Trust yourself. You’ve survived a lot, and you’ll survive whatever is coming.", author: "Robert Tew", feeling: "anxious" },
                { text: "Smile, breathe and go slowly.", author: "Thich Nhat Hanh", feeling: "anxious" },
                { text: "Nothing diminishes anxiety faster than action.", author: "Walter Anderson", feeling: "anxious" },
                
                // Stressed (existing)
                { text: "The time to relax is when you don’t have time for it.", author: "Sydney J. Harris", feeling: "stressed" },
                { text: "One of the best pieces of advice I ever got was from a horse master. He told me to go slow to go fast. I think that applies to everything in life. We live as though there aren’t enough hours in the day, but if we do each thing calmly and carefully, we will get it done quicker and with much less stress.", author: "Viggo Mortensen", feeling: "stressed" },
                { text: "Much of the stress that people feel doesn’t come from having too much to do. It comes from not finishing what they’ve started.", author: "David Allen", feeling: "stressed" },
                { text: "In times of great stress or adversity, it’s always best to keep busy, to plow your anger and your energy into something positive.", author: "Lee Iacocca", feeling: "stressed" },
                { text: "Doing something that is productive is a great way to alleviate emotional stress. Get your mind doing something that is productive.", author: "Ziggy Marley", feeling: "stressed" },
                
                // Unmotivated (existing)
                { text: "If you can dream it, you can do it.", author: "Walt Disney", feeling: "unmotivated" },
                { text: "Keep your eyes on the stars, and your feet on the ground.", author: "Theodore Roosevelt", feeling: "unmotivated" },
                { text: "You’ve got to get up every morning with determination if you’re going to go to bed with satisfaction.", author: "George Lorimer", feeling: "unmotivated" },
                { text: "Success is not final; failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill", feeling: "unmotivated" },
                { text: "It’s not whether you get knocked down. It’s whether you get up.", author: "Vince Lombardi", feeling: "unmotivated" },

                // New from NVC Unmet Needs: Anger (aggravated, resentful)
                { text: "It's okay to feel aggravated; let's find a way to express it that honors your needs.", author: "Unknown", feeling: "aggravated" },
                { text: "Your aggravation is a signal something important is unmet; together, we can work toward understanding.", author: "Unknown", feeling: "aggravated" },
                { text: "Let's take a moment to breathe; your feelings are valid, and we can find a path forward.", author: "Unknown", feeling: "aggravated" },
                { text: "I see your frustration, and I'm here to help you feel heard and supported.", author: "Unknown", feeling: "aggravated" },
                { text: "Aggravation can be a teacher; let's explore what it’s telling us about your needs.", author: "Unknown", feeling: "aggravated" },
                { text: "Resentment is like drinking poison and waiting for the other person to die. Let it go.", author: "Nelson Mandela", feeling: "resentful" },
                { text: "Holding resentment blocks your path to peace; release it to make room for joy.", author: "Unknown", feeling: "resentful" },
                { text: "Your resentment is valid, but freedom comes from forgiving—for your sake.", author: "Unknown", feeling: "resentful" },
                { text: "Turn resentment into resolve; what need can we meet to heal this?", author: "Unknown", feeling: "resentful" },
                { text: "Resentment fades when we honor our own needs first.", author: "Unknown", feeling: "resentful" },

                // New: Aversion (appalled)
                { text: "Feeling appalled is natural; let's find a way to create space for what feels right for you.", author: "Unknown", feeling: "appalled" },
                { text: "Your discomfort matters; I'm here to help you navigate through it with care.", author: "Unknown", feeling: "appalled" },
                { text: "It's okay to feel aversion; together, we can seek a resolution that aligns with your needs.", author: "Unknown", feeling: "appalled" },
                { text: "Let's acknowledge what appalls you; we can work toward a place of ease together.", author: "Unknown", feeling: "appalled" },
                { text: "Your feelings of dislike are valid; let's explore how we can address what's underneath.", author: "Unknown", feeling: "appalled" },

                // New: Confusion (confused)
                { text: "Feeling confused is okay; I'm here to help you find clarity and support your needs.", author: "Unknown", feeling: "confused" },
                { text: "Your mixed feelings are a sign of depth; let's untangle them together.", author: "Unknown", feeling: "confused" },
                { text: "It's natural to feel confused; let's explore what you need to feel more grounded.", author: "Unknown", feeling: "confused" },
                { text: "I'm here to listen as we navigate your confusion toward understanding.", author: "Unknown", feeling: "confused" },
                { text: "Let's take it step by step; your need for clarity is important, and we'll find it together.", author: "Unknown", feeling: "confused" },

                // New: Disconnection (apathetic)
                { text: "Feeling apathetic is okay; I'm here to help you reconnect with what matters to you.", author: "Unknown", feeling: "apathetic" },
                { text: "Your sense of numbness is valid; let's find ways to rekindle your sense of engagement.", author: "Unknown", feeling: "apathetic" },
                { text: "It's okay to feel apathetic; together, we can explore what you need to feel closer.", author: "Unknown", feeling: "apathetic" },
                { text: "I'm here to support you through disconnection; let's discover what sparks joy for you.", author: "Unknown", feeling: "apathetic" },
                { text: "Feeling apathetic is a sign to pause; let's find a way to meet your needs with care.", author: "Unknown", feeling: "apathetic" },

                // New: Disquiet (agitated)
                { text: "Feeling agitated is natural; I'm here to help you find calm and address your needs.", author: "Unknown", feeling: "agitated" },
                { text: "Your restlessness matters; let's work together to create a sense of peace.", author: "Unknown", feeling: "agitated" },
                { text: "It's okay to feel agitated; I'm here to support you through this and find resolution.", author: "Unknown", feeling: "agitated" },
                { text: "Your discomfort is a call for care; let's explore what you need to feel secure.", author: "Unknown", feeling: "agitated" },
                { text: "Feeling agitated is a sign to reach out; together, we can find a way forward.", author: "Unknown", feeling: "agitated" },

                // New: Embarrassment (ashamed)
                { text: "Feeling ashamed is human; I'm here to help you feel accepted and understood.", author: "Unknown", feeling: "ashamed" },
                { text: "Your self-consciousness is valid; let's find ways to embrace your worth together.", author: "Unknown", feeling: "ashamed" },
                { text: "It's okay to feel ashamed; together, we can rebuild your sense of belonging.", author: "Unknown", feeling: "ashamed" },
                { text: "I'm here to remind you of your inherent value, no matter what.", author: "Unknown", feeling: "ashamed" },
                { text: "Shame fades when we meet our need for compassion—starting with yourself.", author: "Unknown", feeling: "ashamed" },

                // New: Fatigue (exhausted)
                { text: "Feeling exhausted is a signal to rest; honor your need for renewal.", author: "Unknown", feeling: "exhausted" },
                { text: "You're not weak for being tired; let's find small steps to recharge.", author: "Unknown", feeling: "exhausted" },
                { text: "Exhaustion passes with self-care; what small need can we meet right now?", author: "Unknown", feeling: "exhausted" },
                { text: "Rest is not laziness—it's essential for your well-being.", author: "Unknown", feeling: "exhausted" },
                { text: "You're stronger than you feel in this moment; a break will reveal that.", author: "Unknown", feeling: "exhausted" }
            ];
            const stmt = db.prepare("INSERT INTO quotes (text, author, feeling) VALUES (?, ?, ?)");
            initialQuotes.forEach(quote => stmt.run(quote.text, quote.author, quote.feeling));
            stmt.finalize();
        }
    });
});

// API Routes (existing)
app.get('/quotes/random', (req, res) => {
    db.get("SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1", (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(row);
        }
    });
});

app.get('/quotes/by-feeling', (req, res) => {
    const feeling = req.query.feeling;
    if (!feeling) {
        return res.status(400).json({ error: 'Feeling parameter is required' });
    }
    db.get("SELECT * FROM quotes WHERE feeling = ? ORDER BY RANDOM() LIMIT 1", [feeling], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'No quotes found for this feeling' });
        } else {
            res.json(row);
        }
    });
});

app.post('/quotes', (req, res) => {
    const { text, author, feeling } = req.body;
    if (!text || !feeling) {
        return res.status(400).json({ error: 'Text and feeling are required' });
    }
    const finalAuthor = author || 'Unknown';
    db.run("INSERT INTO quotes (text, author, feeling) VALUES (?, ?, ?)", [text, finalAuthor, feeling], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, message: 'Quote added successfully' });
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
