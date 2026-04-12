const db = require('./db');

let ensured = false;

async function ensureReviewsTable() {
  if (ensured) return;
  ensured = true;

  await db.query(`
    CREATE TABLE IF NOT EXISTS plant_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      plant_id INT NOT NULL,
      user_id INT NULL,
      customer_name VARCHAR(100) NOT NULL,
      rating TINYINT NOT NULL,
      comment TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_plant_user (plant_id, user_id),
      INDEX idx_plant_reviews_plant (plant_id),
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
}

async function getReviewsByPlantId(plantId, { limit = 20, offset = 0 } = {}) {
  await ensureReviewsTable();

  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const safeOffset = Math.max(0, Number(offset) || 0);

  const [[summary]] = await db.query(
    `SELECT
      COUNT(*) AS total,
      AVG(rating) AS avg_rating
     FROM plant_reviews
     WHERE plant_id = ?`,
    [Number(plantId)]
  );

  const [rows] = await db.query(
    `SELECT id, plant_id, user_id, customer_name, rating, comment, created_at, updated_at
     FROM plant_reviews
     WHERE plant_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT ? OFFSET ?`,
    [Number(plantId), safeLimit, safeOffset]
  );

  return {
    reviews: rows,
    summary: {
      total: Number(summary?.total || 0),
      avg_rating: summary?.avg_rating ? Number(summary.avg_rating) : 0
    }
  };
}

async function upsertReview({
  plant_id,
  user_id,
  customer_name,
  rating,
  comment
}) {
  await ensureReviewsTable();

  await db.query(
    `INSERT INTO plant_reviews (plant_id, user_id, customer_name, rating, comment)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       customer_name = VALUES(customer_name),
       rating = VALUES(rating),
       comment = VALUES(comment),
       updated_at = CURRENT_TIMESTAMP`,
    [
      Number(plant_id),
      user_id ? Number(user_id) : null,
      String(customer_name || '').trim(),
      Number(rating),
      comment ? String(comment).trim() : null
    ]
  );

  const [rows] = await db.query(
    `SELECT id, plant_id, user_id, customer_name, rating, comment, created_at, updated_at
     FROM plant_reviews
     WHERE plant_id = ? AND user_id <=> ?
     ORDER BY id DESC
     LIMIT 1`,
    [Number(plant_id), user_id ? Number(user_id) : null]
  );

  return rows[0] || null;
}

module.exports = {
  getReviewsByPlantId,
  upsertReview
};

