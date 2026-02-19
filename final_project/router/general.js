const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve) => {
                resolve(books);
            });
        };

        const allBooks = await getBooks();
        res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error fetching book list" });
    }
});

// Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    const getBookByISBN = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }
    });

    getBookByISBN
        .then((book) => res.send(JSON.stringify(book, null, 4)))
        .catch((err) => res.status(404).json({message: err}));
});

// Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const getBooksByAuthor = new Promise((resolve) => {
            const filtered = Object.keys(books)
                .filter(isbn => books[isbn].author === author)
                .reduce((acc, isbn) => ({ ...acc, [isbn]: books[isbn] }), {});
            resolve(filtered);
        });

        const result = await getBooksByAuthor;
        if (Object.keys(result).length > 0) {
            res.send(JSON.stringify(result, null, 4));
        } else {
            res.status(404).json({message: "Books by this author not found"});
        }
    } catch (err) {
        res.status(500).json({message: "Server error"});
    }
});

// Get all books based on title using Promises
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    const findByTitle = new Promise((resolve, reject) => {
        const filtered = Object.keys(books)
            .filter(isbn => books[isbn].title === title)
            .reduce((acc, isbn) => ({ ...acc, [isbn]: books[isbn] }), {});
        
        if (Object.keys(filtered).length > 0) {
            resolve(filtered);
        } else {
            reject("Books with this title not found");
        }
    });

    findByTitle
        .then((data) => res.send(JSON.stringify(data, null, 4)))
        .catch((err) => res.status(404).json({message: err}));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        res.send(JSON.stringify(book.reviews, null, 4));
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
