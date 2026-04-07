CREATE DATABASE lms;
USE lms;

-- =========================
-- 1. USERS TABLE
-- =========================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    sap_id VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student'
);

-- =========================
-- 2. BOOKS TABLE
-- =========================
CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100),
    category VARCHAR(100),
    available_quantity INT DEFAULT 1
);

-- =========================
-- 3. TRANSACTIONS TABLE
-- =========================
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    
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

CREATE INDEX idx_user ON transactions(user_id);
CREATE INDEX idx_book ON transactions(book_id);

INSERT INTO users (sap_id, name, email, password, role)
VALUES 
('SAP001', 'Admin User', 'admin@gmail.com', '1234', 'admin'),
('SAP002', 'Student User', 'student@gmail.com', '1234', 'student');

INSERT INTO books (title, author, category, available_quantity)
VALUES
('DBMS', 'Korth', 'Education', 5),
('Java', 'James Gosling', 'Programming', 3),
('Operating System', 'Galvin', 'Education', 1),
('React JS', 'Meta', 'Programming', 2);

ALTER TABLE books
ADD CONSTRAINT unique_book UNIQUE (title, author);

SELECT * FROM books;

ALTER TABLE transactions 
ADD COLUMN status VARCHAR(20) DEFAULT 'borrowed';

UPDATE transactions 
SET status = 'borrowed' 
WHERE status IS NULL;

ALTER TABLE transactions 
MODIFY status VARCHAR(20) DEFAULT 'borrowed';

ALTER TABLE transactions
ADD COLUMN return_date DATE NULL;