-- Artists table
CREATE TABLE artists (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  artist_name VARCHAR(255),
  display_name VARCHAR(255),
  slug VARCHAR(255),
  bio TEXT,
  city VARCHAR(255),
  country VARCHAR(255),
  birthday DATE,
  gender ENUM('male','female','other','prefer_not_to_say'),
  genre VARCHAR(255),
  contact VARCHAR(255),
  legal_id VARCHAR(255),
  contract VARCHAR(255),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME,
  record_label VARCHAR(255)
);

-- Artist Profiles table
CREATE TABLE artist_profiles (
  id VARCHAR(255) PRIMARY KEY,
  picture VARCHAR(255),
  thumbnails JSON,
  gallery JSON,
  media_platform JSON,
  social_media JSON,
  fan_news JSON,
  is_public BOOLEAN DEFAULT 0,
  is_verified BOOLEAN DEFAULT 0,
  total_songs VARCHAR(255),
  total_plays VARCHAR(255),
  total_followers VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  artist_id VARCHAR(255),
  press TEXT,
  is_featured BOOLEAN DEFAULT 0
);

-- Session table
CREATE TABLE session (
  id VARCHAR(255) PRIMARY KEY,
  expires_at DATETIME,
  token VARCHAR(255) UNIQUE,
  created_at DATETIME,
  updated_at DATETIME,
  ip_address VARCHAR(255),
  user_agent VARCHAR(255),
  user_id VARCHAR(255),
  impersonated_by VARCHAR(255)
);

-- User Profiles table
CREATE TABLE user_profiles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  username VARCHAR(255),
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  bio TEXT,
  language VARCHAR(255),
  platform VARCHAR(255),
  socials JSON,
  preferences JSON,
  metadata JSON,
  created_at DATETIME,
  updated_at DATETIME,
  selected_artist_id VARCHAR(255)
);

-- User Verification table
CREATE TABLE user_verification (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  status ENUM('updating','submitted','processing','flagged','rejected','suspended','verified'),
  submitted_at DATETIME,
  processed_at DATETIME,
  verified_at DATETIME,
  remark TEXT,
  rejection_reason TEXT,
  flag_reason TEXT,
  reviewed_by VARCHAR(255),
  government_id_url VARCHAR(255),
  signature_url VARCHAR(255),
  completion_percentage VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE verification (
  id VARCHAR(255) PRIMARY KEY,
  identifier VARCHAR(255),
  value TEXT,
  expires_at DATETIME,
  created_at DATETIME,
  updated_at DATETIME,
  type VARCHAR(255)
);

-- Songs table
CREATE TABLE songs (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist_id VARCHAR(255),
  album VARCHAR(255),
  genre VARCHAR(255),
  release_date DATE,
  number_of_tracks INT DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME,
  flagged_by VARCHAR(255),
  approved_by VARCHAR(255),
  created_by VARCHAR(255),
  managed_by VARCHAR(255),
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL,
  FOREIGN KEY (flagged_by) REFERENCES user_profiles(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES user_profiles(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL,
  FOREIGN KEY (managed_by) REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Tracks table
CREATE TABLE tracks (
  id VARCHAR(255) PRIMARY KEY,
  song_id VARCHAR(255) NOT NULL,
  track_number INT NOT NULL,
  track_name VARCHAR(255) NOT NULL,
  duration INT,
  file_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES uploads(id) ON DELETE SET NULL
);

-- Uploads table (for file management)
CREATE TABLE uploads (
  id VARCHAR(255) PRIMARY KEY,
  file_path VARCHAR(512) NOT NULL,
  file_type VARCHAR(128),
  file_size BIGINT,
  uploaded_by VARCHAR(255),
  uploaded_at DATETIME,
  linked_table VARCHAR(255), -- e.g., 'songs', 'tracks', etc.
  linked_id VARCHAR(255),    -- id of the record in the linked table
  is_active BOOLEAN DEFAULT 1, -- set to 0 when file is deleted or record is deleted
  FOREIGN KEY (uploaded_by) REFERENCES user_profiles(id) ON DELETE SET NULL
);
