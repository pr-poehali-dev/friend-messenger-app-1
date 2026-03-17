
CREATE TABLE t_p58878170_friend_messenger_app.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar VARCHAR(10) DEFAULT '',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p58878170_friend_messenger_app.chats (
  id SERIAL PRIMARY KEY,
  is_group BOOLEAN DEFAULT FALSE,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p58878170_friend_messenger_app.chat_members (
  chat_id INT REFERENCES t_p58878170_friend_messenger_app.chats(id),
  user_id INT REFERENCES t_p58878170_friend_messenger_app.users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE t_p58878170_friend_messenger_app.messages (
  id SERIAL PRIMARY KEY,
  chat_id INT REFERENCES t_p58878170_friend_messenger_app.chats(id),
  sender_id INT REFERENCES t_p58878170_friend_messenger_app.users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);
