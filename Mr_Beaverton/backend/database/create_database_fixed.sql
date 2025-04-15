-- Veritabanını oluştur (eğer yoksa)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LengoDB')
BEGIN
    CREATE DATABASE LengoDB;
END
GO

USE LengoDB;
GO

-- Kullanıcılar tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        email NVARCHAR(100) NOT NULL UNIQUE,
        password NVARCHAR(100) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        streak INT DEFAULT 0,
        lastActive DATETIME DEFAULT GETDATE()
    );
END
GO

-- Kelime Listeleri tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WordLists')
BEGIN
    CREATE TABLE WordLists (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(500) NULL,
        context NVARCHAR(100) NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
END
GO

-- Kelimeler tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Words')
BEGIN
    CREATE TABLE Words (
        id INT IDENTITY(1,1) PRIMARY KEY,
        listId INT NOT NULL,
        value NVARCHAR(100) NOT NULL,
        meaning NVARCHAR(500) NOT NULL,
        context NVARCHAR(500) NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (listId) REFERENCES WordLists(id) ON DELETE CASCADE
    );
END
GO

-- Kelime sayısını getiren stored procedure
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

-- Örnek kullanıcılar
IF NOT EXISTS (SELECT * FROM Users WHERE email = 'test@example.com')
BEGIN
    INSERT INTO Users (username, email, password, name)
    VALUES ('test', 'test@example.com', 'test123', 'Test User');
END
GO

IF NOT EXISTS (SELECT * FROM Users WHERE email = 'ahmet@example.com')
BEGIN
    INSERT INTO Users (username, email, password, name)
    VALUES ('ahmet', 'ahmet@example.com', 'ahmet123', 'Ahmet Yılmaz');
END
GO

-- Örnek listeler - Test kullanıcısı için
DECLARE @testUserId INT = (SELECT id FROM Users WHERE email = 'test@example.com');

IF NOT EXISTS (SELECT * FROM WordLists WHERE name = 'Temel İngilizce' AND userId = @testUserId)
BEGIN
    INSERT INTO WordLists (userId, name, description)
    VALUES (@testUserId, 'Temel İngilizce', 'Günlük hayatta kullanılan temel İngilizce kelimeler');
END
GO

DECLARE @testUserId INT = (SELECT id FROM Users WHERE email = 'test@example.com');

IF NOT EXISTS (SELECT * FROM WordLists WHERE name = 'İş İngilizcesi' AND userId = @testUserId)
BEGIN
    INSERT INTO WordLists (userId, name, description)
    VALUES (@testUserId, 'İş İngilizcesi', 'İş hayatında kullanılan İngilizce terimler');
END
GO

-- Örnek listeler - Ahmet kullanıcısı için
DECLARE @ahmetUserId INT = (SELECT id FROM Users WHERE email = 'ahmet@example.com');

IF NOT EXISTS (SELECT * FROM WordLists WHERE name = 'Seyahat İngilizcesi' AND userId = @ahmetUserId)
BEGIN
    INSERT INTO WordLists (userId, name, description, context)
    VALUES (@ahmetUserId, 'Seyahat İngilizcesi', 'Seyahat ederken kullanılabilecek İngilizce kelimeler', 'Tatil');
END
GO

DECLARE @ahmetUserId INT = (SELECT id FROM Users WHERE email = 'ahmet@example.com');

IF NOT EXISTS (SELECT * FROM WordLists WHERE name = 'Teknoloji Terimleri' AND userId = @ahmetUserId)
BEGIN
    INSERT INTO WordLists (userId, name, description, context)
    VALUES (@ahmetUserId, 'Teknoloji Terimleri', 'Bilgisayar ve teknoloji ile ilgili İngilizce terimler', 'Teknoloji');
END
GO

-- Örnek kelimeler - Temel İngilizce listesi için
DECLARE @testUserId INT = (SELECT id FROM Users WHERE email = 'test@example.com');
DECLARE @temelIngilizceId INT = (SELECT id FROM WordLists WHERE name = 'Temel İngilizce' AND userId = @testUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'apple' AND listId = @temelIngilizceId)
BEGIN
    INSERT INTO Words (listId, value, meaning)
    VALUES (@temelIngilizceId, 'apple', 'elma');
END
GO

DECLARE @testUserId INT = (SELECT id FROM Users WHERE email = 'test@example.com');
DECLARE @temelIngilizceId INT = (SELECT id FROM WordLists WHERE name = 'Temel İngilizce' AND userId = @testUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'book' AND listId = @temelIngilizceId)
BEGIN
    INSERT INTO Words (listId, value, meaning)
    VALUES (@temelIngilizceId, 'book', 'kitap');
END
GO

DECLARE @testUserId INT = (SELECT id FROM Users WHERE email = 'test@example.com');
DECLARE @temelIngilizceId INT = (SELECT id FROM WordLists WHERE name = 'Temel İngilizce' AND userId = @testUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'computer' AND listId = @temelIngilizceId)
BEGIN
    INSERT INTO Words (listId, value, meaning)
    VALUES (@temelIngilizceId, 'computer', 'bilgisayar');
END
GO

DECLARE @testUserId INT = (SELECT id FROM Users WHERE email = 'test@example.com');
DECLARE @temelIngilizceId INT = (SELECT id FROM WordLists WHERE name = 'Temel İngilizce' AND userId = @testUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'house' AND listId = @temelIngilizceId)
BEGIN
    INSERT INTO Words (listId, value, meaning)
    VALUES (@temelIngilizceId, 'house', 'ev');
END
GO

DECLARE @testUserId INT = (SELECT id FROM Users WHERE email = 'test@example.com');
DECLARE @temelIngilizceId INT = (SELECT id FROM WordLists WHERE name = 'Temel İngilizce' AND userId = @testUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'car' AND listId = @temelIngilizceId)
BEGIN
    INSERT INTO Words (listId, value, meaning)
    VALUES (@temelIngilizceId, 'car', 'araba');
END
GO

-- Örnek kelimeler - Seyahat İngilizcesi listesi için
DECLARE @ahmetUserId INT = (SELECT id FROM Users WHERE email = 'ahmet@example.com');
DECLARE @seyahatIngilizceId INT = (SELECT id FROM WordLists WHERE name = 'Seyahat İngilizcesi' AND userId = @ahmetUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'airport' AND listId = @seyahatIngilizceId)
BEGIN
    INSERT INTO Words (listId, value, meaning, context)
    VALUES (@seyahatIngilizceId, 'airport', 'havaalanı', 'We need to be at the airport two hours before the flight.');
END
GO

DECLARE @ahmetUserId INT = (SELECT id FROM Users WHERE email = 'ahmet@example.com');
DECLARE @seyahatIngilizceId INT = (SELECT id FROM WordLists WHERE name = 'Seyahat İngilizcesi' AND userId = @ahmetUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'passport' AND listId = @seyahatIngilizceId)
BEGIN
    INSERT INTO Words (listId, value, meaning, context)
    VALUES (@seyahatIngilizceId, 'passport', 'pasaport', 'Don''t forget to bring your passport.');
END
GO

DECLARE @ahmetUserId INT = (SELECT id FROM Users WHERE email = 'ahmet@example.com');
DECLARE @seyahatIngilizceId INT = (SELECT id FROM WordLists WHERE name = 'Seyahat İngilizcesi' AND userId = @ahmetUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'hotel' AND listId = @seyahatIngilizceId)
BEGIN
    INSERT INTO Words (listId, value, meaning, context)
    VALUES (@seyahatIngilizceId, 'hotel', 'otel', 'We''re staying at a five-star hotel.');
END
GO

DECLARE @ahmetUserId INT = (SELECT id FROM Users WHERE email = 'ahmet@example.com');
DECLARE @seyahatIngilizceId INT = (SELECT id FROM WordLists WHERE name = 'Seyahat İngilizcesi' AND userId = @ahmetUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'ticket' AND listId = @seyahatIngilizceId)
BEGIN
    INSERT INTO Words (listId, value, meaning, context)
    VALUES (@seyahatIngilizceId, 'ticket', 'bilet', 'I bought a round-trip ticket.');
END
GO

DECLARE @ahmetUserId INT = (SELECT id FROM Users WHERE email = 'ahmet@example.com');
DECLARE @seyahatIngilizceId INT = (SELECT id FROM WordLists WHERE name = 'Seyahat İngilizcesi' AND userId = @ahmetUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'luggage' AND listId = @seyahatIngilizceId)
BEGIN
    INSERT INTO Words (listId, value, meaning, context)
    VALUES (@seyahatIngilizceId, 'luggage', 'bagaj', 'My luggage was lost during the flight.');
END
GO

-- Örnek kelimeler - Teknoloji Terimleri listesi için
DECLARE @ahmetUserId INT = (SELECT id FROM Users WHERE email = 'ahmet@example.com');
DECLARE @teknolojiTerimleriId INT = (SELECT id FROM WordLists WHERE name = 'Teknoloji Terimleri' AND userId = @ahmetUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'software' AND listId = @teknolojiTerimleriId)
BEGIN
    INSERT INTO Words (listId, value, meaning, context)
    VALUES (@teknolojiTerimleriId, 'software', 'yazılım', 'This software helps you edit photos.');
END
GO

DECLARE @ahmetUserId INT = (SELECT id FROM Users WHERE email = 'ahmet@example.com');
DECLARE @teknolojiTerimleriId INT = (SELECT id FROM WordLists WHERE name = 'Teknoloji Terimleri' AND userId = @ahmetUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'hardware' AND listId = @teknolojiTerimleriId)
BEGIN
    INSERT INTO Words (listId, value, meaning, context)
    VALUES (@teknolojiTerimleriId, 'hardware', 'donanım', 'The hardware of this computer is outdated.');
END
GO

DECLARE @ahmetUserId INT = (SELECT id FROM Users WHERE email = 'ahmet@example.com');
DECLARE @teknolojiTerimleriId INT = (SELECT id FROM WordLists WHERE name = 'Teknoloji Terimleri' AND userId = @ahmetUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'database' AND listId = @teknolojiTerimleriId)
BEGIN
    INSERT INTO Words (listId, value, meaning, context)
    VALUES (@teknolojiTerimleriId, 'database', 'veritabanı', 'All customer information is stored in the database.');
END
GO

DECLARE @ahmetUserId INT = (SELECT id FROM Users WHERE email = 'ahmet@example.com');
DECLARE @teknolojiTerimleriId INT = (SELECT id FROM WordLists WHERE name = 'Teknoloji Terimleri' AND userId = @ahmetUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'algorithm' AND listId = @teknolojiTerimleriId)
BEGIN
    INSERT INTO Words (listId, value, meaning, context)
    VALUES (@teknolojiTerimleriId, 'algorithm', 'algoritma', 'The search algorithm was improved.');
END
GO

DECLARE @ahmetUserId INT = (SELECT id FROM Users WHERE email = 'ahmet@example.com');
DECLARE @teknolojiTerimleriId INT = (SELECT id FROM WordLists WHERE name = 'Teknoloji Terimleri' AND userId = @ahmetUserId);

IF NOT EXISTS (SELECT * FROM Words WHERE value = 'encryption' AND listId = @teknolojiTerimleriId)
BEGIN
    INSERT INTO Words (listId, value, meaning, context)
    VALUES (@teknolojiTerimleriId, 'encryption', 'şifreleme', 'Encryption protects your data from hackers.');
END
GO

PRINT 'Veritabanı ve tablolar başarıyla oluşturuldu.';
