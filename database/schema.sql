CREATE DATABASE lms;
USE lms;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    sap_id VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student'
);

CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100),
    category VARCHAR(100),
    available_quantity INT DEFAULT 1
);

CREATE TABLE records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    
    user_id INT,
    book_id INT,
    
    borrow_date DATE,
    due_date DATE,
    return_date DATE,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
        
    FOREIGN KEY (book_id) REFERENCES books(book_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_user ON records(user_id);
CREATE INDEX idx_book ON records(book_id);

INSERT INTO users (sap_id, name, email, password, role)
VALUES 
('SAP001', 'Admin User', 'admin@gmail.com', '1234', 'admin'),
('SAP0000', 'Student User', 'student@gmail.com', '1234', 'student'),
('SAP00001', 'Student 1', 'student1@gmail.com', '1234', 'student'),
('SAP00002', 'Student 2', 'student2@gmail.com', '1234', 'student');

INSERT INTO books (title, author, category, available_quantity)
VALUES
('DBMS', 'Korth', 'Education', 5),
('Java', 'James Gosling', 'Programming', 3),
('Operating System', 'Galvin', 'Education', 1),
('React JS', 'Meta', 'Programming', 2);


SET SQL_SAFE_UPDATES = 0;

ALTER TABLE books
ADD CONSTRAINT unique_book UNIQUE (title, author);

ALTER TABLE records 
ADD COLUMN status VARCHAR(20) DEFAULT 'borrowed';

UPDATE records 
SET status = 'borrowed' 
WHERE status IS NULL;

ALTER TABLE records 
MODIFY status VARCHAR(20) DEFAULT 'borrowed';

ALTER TABLE records
ADD COLUMN return_date DATE NULL;

ALTER TABLE records
ADD UNIQUE unique_request (user_id, book_id, status);


SELECT * FROM books;
SELECT * FROM users;
SELECT * FROM records;
TRUNCATE records;