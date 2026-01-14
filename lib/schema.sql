-- Create a table to store favourite Pokemon
CREATE TABLE IF NOT EXISTS favourites (
  id SERIAL PRIMARY KEY,
  pokemon_name VARCHAR(100) NOT NULL,
  pokemon_id INTEGER NOT NULL CHECK (pokemon_id > 0),
  shakespearean_description TEXT CHECK (length(shakespearean_description) <= 5000),
  original_description TEXT CHECK (length(original_description) <= 5000),
  user_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pokemon_id, user_id)
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_favourites_pokemon_id ON favourites(pokemon_id);
