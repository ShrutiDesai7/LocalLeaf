const db = require('./db');

const createNursery = async ({ owner_user_id, name, address }) => {
  const [result] = await db.query(
    `INSERT INTO nurseries (owner_user_id, name, address)
     VALUES (?, ?, ?)`,
    [owner_user_id, name, address]
  );

  const [rows] = await db.query('SELECT * FROM nurseries WHERE id = ?', [
    result.insertId
  ]);

  return rows[0];
};

const getNurseryByOwnerUserId = async (owner_user_id) => {
  const [rows] = await db.query(
    'SELECT * FROM nurseries WHERE owner_user_id = ? LIMIT 1',
    [owner_user_id]
  );
  return rows[0] || null;
};

const updateNurseryByIdAndOwnerUserId = async (id, owner_user_id, updates) => {
  const allowed = ['name', 'address'];
  const setParts = [];
  const values = [];

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      setParts.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }

  if (setParts.length === 0) {
    return null;
  }

  values.push(id, owner_user_id);

  const [result] = await db.query(
    `UPDATE nurseries
     SET ${setParts.join(', ')}
     WHERE id = ? AND owner_user_id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await db.query('SELECT * FROM nurseries WHERE id = ?', [id]);
  return rows[0] || null;
};

const setSubscriptionStatus = async (id, owner_user_id, status, expiresAt = null) => {
  const [result] = await db.query(
    `UPDATE nurseries
     SET subscription_status = ?,
         subscribed_at = IF(? = 'active', CURRENT_TIMESTAMP, subscribed_at),
         subscription_expires_at = ?
     WHERE id = ? AND owner_user_id = ?`,
    [status, status, expiresAt, id, owner_user_id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await db.query('SELECT * FROM nurseries WHERE id = ?', [id]);
  return rows[0] || null;
};

module.exports = {
  createNursery,
  getNurseryByOwnerUserId,
  updateNurseryByIdAndOwnerUserId,
  setSubscriptionStatus
};
