-- Creat database
CREATE DATABASE IF NOT EXISTS finance_tracker;
USE finance_tracker;

-- Usrs table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INT NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Transactons table
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(255),
  source VARCHAR(255),
  frequency VARCHAR(255),
  date DATE NOT NULL,
  description TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Budjets table
CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  deadline DATE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);