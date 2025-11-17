const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = {};

const isValid = (username) => {
    return users[username] !== undefined;
};

const authenticatedUser = (username, password) => {
    return users[username] && users[username].password === password;
};


//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Missing fields
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if user exists
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Create JWT payload
    let accessToken = jwt.sign(
        { username: username },
        "access",
        { expiresIn: "1h" }
    );

    // Store JWT in session
    req.session.authorization = {
        accessToken: accessToken,
        username: username
    };

    return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;

    // User must be logged in
    if (!req.session.authorization || !req.session.authorization.username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    const username = req.session.authorization.username;

    // Book must exist
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // If no review provided
    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    // Add or update review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added or modified successfully",
        reviews: books[isbn].reviews
    });
});
// DELETE a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    // Check login status
    if (!username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    // Check book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check review exists for this user
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review by this user for this book" });
    }

    // Delete the review
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
