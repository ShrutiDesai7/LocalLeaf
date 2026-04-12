const db = require('./db');

const createUser = async ({ name, phone, password_hash, role }) => {
  const [result] = await db.query(
    `INSERT INTO users (name, phone, password_hash, role)
     VALUES (?, ?, ?, ?)`,
    [name, phone, password_hash, role]
  );

  const [rows] = await db.query(
    'SELECT id, name, phone, role, created_at FROM users WHERE id = ?',
    [result.insertId]
  );

  return rows[0];
};

const findByPhoneWithPassword = async (phone) => {
  const [rows] = await db.query(
    'SELECT id, name, phone, role, password_hash, created_at FROM users WHERE phone = ? LIMIT 1',
    [phone]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await db.query(
    'SELECT id, name, phone, role, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

const updateUserById = async (id, updates = {}) => {
  const allowed = ['name', 'phone'];
  const setParts = [];
  const values = [];

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      setParts.push(`${key} = ?`);
      values.push(String(updates[key]).trim());
    }
  }

  if (setParts.length === 0) {
    return findById(id);
  }

  values.push(id);

  const [result] = await db.query(
    `UPDATE users SET ${setParts.join(', ')} WHERE id = ?`,
    values
  );

  if (result.affectedRows === 0) return null;
  return findById(id);
};

module.exports = {
  createUser,
  findByPhoneWithPassword,
  findById,
  updateUserById
};

