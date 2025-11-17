const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if user already exists
    if (users[username]) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Register user
    users[username] = { password: password };

    return res.status(200).json({ message: "User registered successfully" });
});


// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        let booksJSON = await new Promise((resolve, reject) => {
            resolve(books);
        });
        res.status(200).send(JSON.stringify(booksJSON, null, 2));
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;

        const book = await new Promise((resolve, reject) => {
            resolve(books[isbn]);
        });

        if (book) {
            return res.status(200).json(book);
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
});


  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;

        const results = await new Promise((resolve, reject) => {
            let matches = [];
            for (let key in books) {
                if (books[key].author === author) {
                    matches.push(books[key]);
                }
            }
            resolve(matches);
        });

        if (results.length > 0) {
            return res.status(200).json(results);
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;

        const results = await new Promise((resolve, reject) => {
            let matches = [];
            for (let key in books) {
                if (books[key].title === title) {
                    matches.push(books[key]);
                }
            }
            resolve(matches);
        });

        if (results.length > 0) {
            return res.status(200).json(results);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});


module.exports.general = public_users;
