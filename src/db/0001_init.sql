-- better-auth tables
CREATE TABLE IF NOT EXISTS user (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image         TEXT,
  createdAt     INTEGER NOT NULL,
  updatedAt     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
  id        TEXT PRIMARY KEY,
  expiresAt INTEGER NOT NULL,
  token     TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId    TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id                    TEXT PRIMARY KEY,
  accountId             TEXT NOT NULL,
  providerId            TEXT NOT NULL,
  userId                TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accessToken           TEXT,
  refreshToken          TEXT,
  idToken               TEXT,
  accessTokenExpiresAt  INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope                 TEXT,
  password              TEXT,
  createdAt             INTEGER NOT NULL,
  updatedAt             INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS verification (
  id         TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value      TEXT NOT NULL,
  expiresAt  INTEGER NOT NULL,
  createdAt  INTEGER,
  updatedAt  INTEGER
);

-- Business listings
CREATE TABLE IF NOT EXISTS businesses (
  id        TEXT PRIMARY KEY,
  userId    TEXT REFERENCES user(id) ON DELETE SET NULL,
  name      TEXT NOT NULL,
  category  TEXT NOT NULL,
  phone     TEXT,
  email     TEXT,
  address   TEXT,
  website   TEXT,
  facebook  TEXT,
  imageUrl  TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- Seed the six existing demo listings (userId NULL = admin-owned)
INSERT OR IGNORE INTO businesses (id, userId, name, category, phone, email, address, website, facebook, imageUrl, createdAt, updatedAt) VALUES
  ('biz_1', NULL, 'Ardmore Coffee House',  'Food & Drink',     '(580) 555-0142', 'hello@ardmorecoffee.com',    '123 W Main St, Ardmore, OK 73401',      'https://ardmorecoffee.com',          'https://facebook.com/ardmorecoffee',        NULL, 1748476800, 1748476800),
  ('biz_2', NULL, 'Carter County Hardware','Home & Garden',    '(580) 555-0198', NULL,                         '456 Broadway St, Ardmore, OK 73401',    'https://cartercountyhardware.com',   NULL,                                        NULL, 1748476800, 1748476800),
  ('biz_3', NULL, 'Salon 73',              'Health & Beauty',  '(580) 555-0167', 'appointments@salon73ok.com', '789 Commerce St, Ardmore, OK 73401',    NULL,                                 'https://facebook.com/salon73ardmore',       NULL, 1748476800, 1748476800),
  ('biz_4', NULL, 'Ardmore Auto & Tire',   'Automotive',       '(580) 555-0134', NULL,                         '1001 N Washington St, Ardmore, OK 73401','https://ardmoreauto.com',            NULL,                                        NULL, 1748476800, 1748476800),
  ('biz_5', NULL, 'Prairie Wind Realty',   'Real Estate',      '(580) 555-0156', 'info@prairiewindrealty.com', NULL,                                    'https://prairiewindrealty.com',      'https://facebook.com/prairiewindrealty',    NULL, 1748476800, 1748476800),
  ('biz_6', NULL, 'Magnolia Boutique',     'Retail & Shopping','(580) 555-0189', 'shop@magnoliaboutique.com',  '321 E Main St, Ardmore, OK 73401',      NULL,                                 'https://facebook.com/magnoliaboutiqueok',   NULL, 1748476800, 1748476800);
