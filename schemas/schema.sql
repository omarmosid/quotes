DROP TABLE IF EXISTS quotes;
CREATE TABLE IF NOT EXISTS quotes (
  id integer,
  text text NOT NULL,
  author text NOT NULL,
  source text NOT NULL,
  link text NOT NULL,
  theme text NOT NULL
);
