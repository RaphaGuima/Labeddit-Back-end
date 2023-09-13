-- Active: 1694567804782@@127.0.0.1@3306

CREATE TABLE
    users(
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT DEFAULT(DATETIME())
    );

INSERT INTO
    users(id, name, email, password, role)
VALUES (
        'u001',
        'Laura',
        'laurinha7@labenu.com',
        'adawd4218435s5s',
        'NORMAL'
    ), (
        'u002',
        'Hubia',
        'hubiahubis@labenu.com',
        'fsafwf54544444sd',
        'NORMAL'
    ), (
        'u003',
        'Gustavo',
        'gustzin999@labenu.com',
        'da5238355d5s8s888',
        'ADMIN'
    ), (
        'u004',
        'Amanda',
        'mandinha@labenu.com',
        '23jdjsodj0023ççf*/',
        'NORMAL'
    );

SELECT * FROM users;

CREATE TABLE
    posts (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        creator_id TEXT NOT NULL,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT(0),
        dislikes INTEGER DEFAULT(0),
        created_at TEXT DEFAULT(DATETIME()),
        updated_at TEXT DEFAULT(DATETIME()),
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
    );

INSERT INTO
    posts(id, creator_id, content)
VALUES ('p001', 'u004', 'Olá!'), (
        'p002',
        'u003',
        'Bom dia!'
    ), (
        'p003',
        'u001',
        'Qual é o seu nome?'
    ), ('p004', 'u002', 'Até mais!');

SELECT * FROM posts;

CREATE TABLE
    comments (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,        
        post_id TEXT NOT NULL,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT(0),
        dislikes INTEGER DEFAULT(0),
        created_at TEXT DEFAULT(DATETIME()),
        updated_at TEXT DEFAULT(DATETIME()),
        creator_id TEXT NOT NULL, 
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE
    likes_dislikes_posts (
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        like INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE (user_id, post_id)
    );

    CREATE TABLE
    likes_dislikes_comments (
        user_id TEXT NOT NULL,
        comment_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        like INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE (user_id, comment_id, post_id)
    );

    SELECT * FROM comments;
    
    INSERT INTO comments (id, post_id, content, creator_id) VALUES
    ('c001', 'p001', 'Eu gosto de jogar video games', 'u001'),
    ('c002', 'p002', 'Eu gostei de treinar musculação', 'u002'), 
    ('c003', 'p004', 'Eu gosto de viajar', 'u002'), 
    ('c004', 'p003', 'Eu gosto de comer bastante', 'u003'), 
    ('c005', 'p002', 'Eu gosto de dormir', 'u004'), 
    ('c006', 'p001', 'Eu gosto de sair de vez em quando', 'u003'); 