const Database = require("better-sqlite3");
const fs = require("fs");

const featuredMovieIds = [32932, 23643, 29915, 30895, 31472, 33411];

fs.copyFileSync("database.sqlite", "database-small.sqlite");
fs.rmSync("database-small.sqlite-wal", { force: true });
fs.rmSync("database-small.sqlite-shm", { force: true });

const db = new Database("database-small.sqlite");
db.pragma("foreign_keys = OFF");

// drop full text search tables
const ftsTables = [
  "fts_movies",
  "fts_movies_data",
  "fts_movies_idx",
  "fts_movies_content",
  "fts_movies_docsize",
  "fts_movies_config",
];
for (const table of ftsTables) {
  db.exec(`DROP TABLE IF EXISTS ${table};`);
}

const featuredCastIds = db
  .prepare(
    `
  SELECT DISTINCT cast_id FROM movie_cast
  WHERE movie_id IN (${featuredMovieIds.map(() => "?").join(",")})
`,
  )
  .all(...featuredMovieIds)
  .map((row) => row.cast_id);

const featuredCastMovieIds = db
  .prepare(
    `
  SELECT DISTINCT movie_id FROM movie_cast
  WHERE cast_id IN (${featuredCastIds.map(() => "?").join(",")})
`,
  )
  .all(...featuredCastIds)
  .map((row) => row.movie_id);

const movieIds = [...new Set([...featuredMovieIds, ...featuredCastMovieIds])];
const castIds = [...new Set([...featuredCastIds])];

db.prepare(
  `
  DELETE FROM movies WHERE id NOT IN (${movieIds.map(() => "?").join(",")})
`,
).run(...movieIds);

db.prepare(
  `
  DELETE FROM cast_members WHERE id NOT IN (${castIds.map(() => "?").join(",")})
`,
).run(...castIds);

db.prepare(
  `
  DELETE FROM movie_cast WHERE movie_id NOT IN (${movieIds.map(() => "?").join(",")})
`,
).run(...movieIds);

db.pragma("foreign_keys = ON");

db.prepare("DELETE FROM favorites").run();

db.exec("VACUUM;");

// Get file sizes
const originalSize = fs.statSync("database.sqlite").size;
const smallSize = fs.statSync("database-small.sqlite").size;
const reduction = (((originalSize - smallSize) / originalSize) * 100).toFixed(
  1,
);

console.log(`Original database: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Small database: ${(smallSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Size reduction: ${reduction}%`);

db.close();
console.log("Small demo database created as database-small.sqlite");
