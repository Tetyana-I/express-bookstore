process.env.NODE_ENV = "test"

const request = require('supertest');
const db = require("../db");
const Book = require("../models/book");
const app = require('../app');


beforeEach(async function () {
  testBook = await Book.create({
    "isbn": "0691161518",
    "amazon_url": "http://a.co/eobPtX2",
    "author": "Matthew Lane",
    "language": "english",
    "pages": 264,
    "publisher": "Princeton University Press",
    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    "year": 2017
  });
});

afterEach(async () => {
  await db.query("DELETE FROM books")
})

afterAll(async () => {
  await db.end()
})


describe("GET / => {books: [book, ...]}", function() {
  test("Returns a single book", async () => {
    const res = await request(app).get('/books');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ books: [{
      "isbn": "0691161518",
      "amazon_url": "http://a.co/eobPtX2",
      "author": "Matthew Lane",
      "language": "english",
      "pages": 264,
      "publisher": "Princeton University Press",
      "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      "year": 2017
    }]})
  })
})

describe("GET /[id]  => {book: book}", function() {
  test("Returns a correct book", async () => {
    const res = await request(app).get('/books/0691161518');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ book: {
      "isbn": "0691161518",
      "amazon_url": "http://a.co/eobPtX2",
      "author": "Matthew Lane",
      "language": "english",
      "pages": 264,
      "publisher": "Princeton University Press",
      "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      "year": 2017
    }})
  })

  test("Incorrect isbn returns 404 ", async () => {
    const res = await request(app).get('/books/0691161518abracadabra');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual(expect.objectContaining({"message": "There is no book with an isbn '0691161518abracadabra"}))
  })
})

describe("POST /   bookData => {book: newBook}", function() {
  test("Returns a created book", async () => {
    const res = await request(app).post('/books').send({
      "isbn": "0132350884",
      "amazon_url": "http://a.co/eobPtX2",
      "author": "Robert C. Martin",
      "language": "english",
      "pages": 400,
      "publisher": "University Press",
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "year": 2018
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ book: {
      "isbn": "0132350884",
      "amazon_url": "http://a.co/eobPtX2",
      "author": "Robert C. Martin",
      "language": "english",
      "pages": 400,
      "publisher": "University Press",
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "year": 2018
    }})
  })

  test("Returns 400 if year data is incorrect", async () => {
    const res = await request(app).post('/books').send({
      "isbn": "0132350899",
      "amazon_url": "http://a.co/eobPtX2",
      "author": "Robert C. Martin",
      "language": "english",
      "pages": 400,
      "publisher": "Press",
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "year": 2023
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({"message": ["instance.year must be less than or equal to 2021"]}))
  })

  test("Returns 400 and 2 error messages if pages data is incorrect and publisher is missing", async () => {
    const res = await request(app).post('/books').send({
      "isbn": "0132350899",
      "amazon_url": "http://a.co/eobPtX2",
      "author": "Robert C. Martin",
      "language": "english",
      "pages": -400,
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "year": 2019
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({"message":
     ["instance requires property \"publisher\"", "instance.pages must be greater than or equal to 1"]}))
  })
})


describe("PUT /[isbn]   bookData => {book: updatedBook}", function() {
  test("Returns an updated book", async () => {
    const res = await request(app).put('/books/0691161518').send({
        "isbn": "0691161518",
        "amazon_url": "http://a.co/eobPtX2",
        "author": "Robert C. Martin",
        "language": "english",
        "pages": 400,
        "publisher": "University Press",
        "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
        "year": 2018
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ book: {
      "isbn": "0691161518",
      "amazon_url": "http://a.co/eobPtX2",
      "author": "Robert C. Martin",
      "language": "english",
      "pages": 400,
      "publisher": "University Press",
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "year": 2018
    }})
  })

  test("isbn is read only", async () => {
    const res = await request(app).put('/books/0691161518').send({
        "isbn": "7777777777",
        "amazon_url": "http://a.co/eobPtX2",
        "author": "Robert C. Martin",
        "language": "english",
        "pages": 400,
        "publisher": "University Press",
        "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
        "year": 2018
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ book: {
      "isbn": "0691161518",
      "amazon_url": "http://a.co/eobPtX2",
      "author": "Robert C. Martin",
      "language": "english",
      "pages": 400,
      "publisher": "University Press",
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "year": 2018
    }})
  })

  // test("Pages data is not required", async () => {
  //   const res = await request(app).put('/books/0691161518').send({
  //       "isbn": "0691161518",
  //       "amazon_url": "http://a.co/eobPtX2",
  //       "author": "Robert C. Martin",
  //       "language": "english",
  //       "publisher": "University Press",
  //       "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
  //       "year": 2018
  //     });
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toEqual({ book: {
  //     "isbn": "0691161518",
  //     "amazon_url": "http://a.co/eobPtX2",
  //     "author": "Robert C. Martin",
  //     "language": "english",
  //     "pages": 264,
  //     "publisher": "University Press",
  //     "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
  //     "year": 2018
  //   }})
  // })
})

describe("DELETE /[isbn]   => {message: 'Book deleted'}", function() {
  test("Delete a book", async () => {
    const res = await request(app).delete('/books/0691161518');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({message: "Book deleted" })
  }) 
  
  test("Incorrect isbn returns 404 ", async () => {
    const res = await request(app).delete('/books/0691161518abracadabra');
    expect(res.statusCode).toBe(404);
  })
})



