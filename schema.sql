
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS reviews;

CREATE DATABASE capstone2_db;

\c capstone_db;


CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL
);

CREATE TABLE restrooms (
  restroom_id SERIAL PRIMARY KEY,
  restroom_name VARCHAR NOT NULL,
  rr_location VARCHAR NOT NULL
);

CREATE TABLE favorites (
  user_id INTEGER REFERENCES users(user_id),
  restroom_id INTEGER REFERENCES restrooms(restroom_id),
  PRIMARY KEY (user_id, restroom_id)
);

CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  restroom_id INTEGER REFERENCES restrooms(restroom_id),
  review TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
  comment_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  review_id INTEGER REFERENCES reviews(review_id),
  parent_comment_id INTEGER REFERENCES comments(comment_id),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/Users/madorno/Desktop/Springboard/Capsone 2/schema.sql
