-- Create a table to store favourite Pokemon
CREATE TABLE IF NOT EXISTS favourites (
  id SERIAL PRIMARY KEY,
  pokemon_name VARCHAR(100) NOT NULL,
  pokemon_id INTEGER NOT NULL,
  shakespearean_description TEXT,
  original_description TEXT,
  user_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pokemon_id, user_id)
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_favourites_pokemon_id ON favourites(pokemon_id);
