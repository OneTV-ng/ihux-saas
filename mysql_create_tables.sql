-- User table
CREATE TABLE user (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  gender ENUM('male','female','other','prefer_not_to_say'),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT 0,
  image VARCHAR(255),
  thumbnail VARCHAR(255),
  profile_picture VARCHAR(255),
  header_background VARCHAR(255),
  phone VARCHAR(255),
  whatsapp VARCHAR(255),
  date_of_birth DATE,
  address VARCHAR(255),
  record_label VARCHAR(255),
  social_media JSON,
  bank_details JSON,
  settings JSON,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  role ENUM('guest','new','member','artist','band','studio','choir','group','community','label','editor','manager','admin','sadmin') NOT NULL DEFAULT 'new',
  api_class ENUM('5','10','20','50') NOT NULL DEFAULT '5',
  banned BOOLEAN NOT NULL DEFAULT 0,
  ban_reason VARCHAR(255),
  ban_expires DATETIME
);

-- Account table
CREATE TABLE account (
  id VARCHAR(255) PRIMARY KEY,
  account_id VARCHAR(255) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  access_token VARCHAR(255),
  refresh_token VARCHAR(255),
  id_token VARCHAR(255),
  access_token_expires_at DATETIME,
  refresh_token_expires_at DATETIME,
  scope VARCHAR(255),
  password VARCHAR(255),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
