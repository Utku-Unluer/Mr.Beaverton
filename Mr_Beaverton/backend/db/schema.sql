-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LengoDB')
BEGIN
    CREATE DATABASE LengoDB;
END
GO

USE LengoDB;
GO

-- Create Users table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        email NVARCHAR(100) NOT NULL UNIQUE,
        password NVARCHAR(100) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT GETDATE(),
        lastActive DATETIME NOT NULL DEFAULT GETDATE(),
        streak INT NOT NULL DEFAULT 0
    );
END
GO

-- Create WordLists table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WordLists')
BEGIN
    CREATE TABLE WordLists (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500),
        context NVARCHAR(500),
        createdAt DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
END
GO

-- Create Words table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Words')
BEGIN
    CREATE TABLE Words (
        id INT IDENTITY(1,1) PRIMARY KEY,
        listId INT NOT NULL,
        value NVARCHAR(100) NOT NULL,
        meaning NVARCHAR(500) NOT NULL,
        context NVARCHAR(500),
        createdAt DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (listId) REFERENCES WordLists(id) ON DELETE CASCADE
    );
END
GO

-- Create Progress table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Progress')
BEGIN
    CREATE TABLE Progress (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        wordId INT NOT NULL,
        mastery INT NOT NULL DEFAULT 0,
        lastPracticed DATETIME NOT NULL DEFAULT GETDATE(),
        timesCorrect INT NOT NULL DEFAULT 0,
        timesIncorrect INT NOT NULL DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (wordId) REFERENCES Words(id) ON DELETE CASCADE,
        CONSTRAINT UQ_UserWord UNIQUE (userId, wordId)
    );
END
GO

-- Create stored procedure to get word count for a list
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'GetWordCount')
BEGIN
    EXEC('
    CREATE PROCEDURE GetWordCount
        @listId INT
    AS
    BEGIN
        SELECT COUNT(*) AS wordCount
        FROM Words
        WHERE listId = @listId
    END
    ');
END
GO

-- Insert sample user if none exists
IF NOT EXISTS (SELECT * FROM Users WHERE email = 'test@example.com')
BEGIN
    INSERT INTO Users (username, email, password, name)
    VALUES ('test', 'test@example.com', 'test123', 'Test User');
END
GO

-- Insert sample word lists if none exists
IF NOT EXISTS (SELECT * FROM WordLists WHERE name = 'Temel İngilizce')
BEGIN
    DECLARE @userId INT;
    SELECT @userId = id FROM Users WHERE email = 'test@example.com';
    
    INSERT INTO WordLists (userId, name, description)
    VALUES (@userId, 'Temel İngilizce', 'Günlük hayatta kullanılan temel İngilizce kelimeler');
    
    INSERT INTO WordLists (userId, name, description)
    VALUES (@userId, 'İş İngilizcesi', 'İş hayatında kullanılan İngilizce terimler');
END
GO

-- Insert sample words if none exists
IF NOT EXISTS (SELECT * FROM Words WHERE value = 'apple')
BEGIN
    DECLARE @listId INT;
    SELECT @listId = id FROM WordLists WHERE name = 'Temel İngilizce';
    
    INSERT INTO Words (listId, value, meaning)
    VALUES (@listId, 'apple', 'elma');
    
    INSERT INTO Words (listId, value, meaning)
    VALUES (@listId, 'book', 'kitap');
    
    INSERT INTO Words (listId, value, meaning)
    VALUES (@listId, 'computer', 'bilgisayar');
    
    INSERT INTO Words (listId, value, meaning)
    VALUES (@listId, 'house', 'ev');
    
    INSERT INTO Words (listId, value, meaning)
    VALUES (@listId, 'car', 'araba');
END
GO
