-- Migration: Create songs and tracks tables for MySQL
CREATE TABLE IF NOT EXISTS songs (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist_id VARCHAR(255),
  artist_name VARCHAR(255),
  type VARCHAR(50) NOT NULL, -- 'single', 'album', etc.
  genre VARCHAR(255),
  language VARCHAR(50),
  upc VARCHAR(255),
  cover VARCHAR(255),
  number_of_tracks INT DEFAULT 1,
  is_featured BOOLEAN DEFAULT 0,
  status VARCHAR(50) DEFAULT 'new',
  flag_type VARCHAR(50),
  flag_reason TEXT,
  flagged_at DATETIME,
  flagged_by VARCHAR(255),
  approved_by VARCHAR(255),
  approved_at DATETIME,
  created_by VARCHAR(255),
  managed_by VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (artist_id) REFERENCES artists(id)
);

CREATE TABLE IF NOT EXISTS tracks (
  id VARCHAR(255) PRIMARY KEY,
  song_id VARCHAR(255) NOT NULL,
  track_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  isrc VARCHAR(255),
  mp3 VARCHAR(255) NOT NULL,
  explicit VARCHAR(20) DEFAULT 'no',
  lyrics TEXT,
  lead_vocal VARCHAR(255),
  producer VARCHAR(255),
  writer VARCHAR(255),
  duration INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES songs(id)
);
