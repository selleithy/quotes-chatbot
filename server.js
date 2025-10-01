const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'quotes.db');

// Middleware
app.use(express.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
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

    // Insert initial quotes if table is empty (categorized for moods)
    db.get("SELECT COUNT(*) as count FROM quotes", (err, row) => {
        if (row.count === 0) {
            const initialQuotes = [
                // Sad/Depression
                { text: "Please remember that you’re capable, brave and loved – even when it feels like you’re not.", author: "Unknown", feeling: "sad" },
                { text: "Perhaps the butterfly is proof that you can go through a great deal of darkness yet become something beautiful again.", author: "Unknown", feeling: "sad" },
                { text: "Never, ever, ever, ever, ever give up on yourself. As long as you keep on fighting, then you can beat your depression.", author: "Unknown", feeling: "sad" },
                { text: "Just because you’re going through a rough patch, it doesn’t mean you always will be. Recovery is possible. We promise you.", author: "Unknown", feeling: "sad" },
                { text: "In case no one told you today: you are beautiful. You are loved. You are needed. You are alive for a reason. You are stronger than you think, and if you keep on fighting, then you’re going to get through this.", author: "Unknown", feeling: "sad" },
                
                // Anxious
                { text: "As long as you are breathing, there is more right with you than wrong with you, no matter what is wrong.", author: "Jon Kabat-Zinn", feeling: "anxious" },
                { text: "Your calm mind is the ultimate weapon against your challenges. So relax.", author: "Bryant McGill", feeling: "anxious" },
                { text: "Trust yourself. You’ve survived a lot, and you’ll survive whatever is coming.", author: "Robert Tew", feeling: "anxious" },
                { text: "Smile, breathe and go slowly.", author: "Thich Nhat Hanh", feeling: "anxious" },
                { text: "Nothing diminishes anxiety faster than action.", author: "Walter Anderson", feeling: "anxious" },
                
                // Stressed
                { text: "The time to relax is when you don’t have time for it.", author: "Sydney J. Harris", feeling: "stressed" },
                { text: "One of the best pieces of advice I ever got was from a horse master. He told me to go slow to go fast. I think that applies to everything in life. We live as though there aren’t enough hours in the day, but if we do each thing calmly and carefully, we will get it done quicker and with much less stress.", author: "Viggo Mortensen", feeling: "stressed" },
                { text: "Much of the stress that people feel doesn’t come from having too much to do. It comes from not finishing what they’ve started.", author: "David Allen", feeling: "stressed" },
                { text: "In times of great stress or adversity, it’s always best to keep busy, to plow your anger and your energy into something positive.", author: "Lee Iacocca", feeling: "stressed" },
                { text: "Doing something that is productive is a great way to alleviate emotional stress. Get your mind doing something that is productive.", author: "Ziggy Marley", feeling: "stressed" },
                
                // Unmotivated
                { text: "If you can dream it, you can do it.", author: "Walt Disney", feeling: "unmotivated" },
                { text: "Keep your eyes on the stars, and your feet on the ground.", author: "Theodore Roosevelt", feeling: "unmotivated" },
                { text: "You’ve got to get up every morning with determination if you’re going to go to bed with satisfaction.", author: "George Lorimer", feeling: "unmotivated" },
                { text: "Success is not final; failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill", feeling: "unmotivated" },
                { text: "It’s not whether you get knocked down. It’s whether you get up.", author: "Vince Lombardi", feeling: "unmotivated" }
            ];
            const stmt = db.prepare("INSERT INTO quotes (text, author, feeling) VALUES (?, ?, ?)");
            initialQuotes.forEach(quote => stmt.run(quote.text, quote.author, quote.feeling));
            stmt.finalize();
        }
    });
});

// API Routes
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
