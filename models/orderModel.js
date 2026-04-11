const db = require('./db');

const createOrder = async (orderData) => {
  const { plant_id, customer_name, phone, address } = orderData;

  const [result] = await db.query(
    `INSERT INTO orders (plant_id, customer_name, phone, address)
     VALUES (?, ?, ?, ?)`,
    [plant_id, customer_name, phone, address]
  );

  const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [result.insertId]);
  return rows[0];
};

const getAllOrders = async (filters = {}) => {
  const conditions = [];
  const values = [];

  if (filters.nursery_id) {
    conditions.push('p.nursery_id = ?');
    values.push(Number(filters.nursery_id));
  }

  if (filters.phone) {
    conditions.push('o.phone = ?');
    values.push(String(filters.phone).trim());
  }

  if (filters.status) {
    conditions.push('o.status = ?');
    values.push(String(filters.status).trim());
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await db.query(
    `SELECT
      o.id,
      o.plant_id,
      o.customer_name,
      o.phone,
      o.address,
      o.status,
      o.created_at,
      p.name AS plant_name,
      p.price AS plant_price,
      p.image_url AS plant_image_url,
      p.category AS plant_category,
      p.nursery_id,
      n.name AS nursery_name,
      n.address AS nursery_address
    FROM orders o
    LEFT JOIN plants p ON o.plant_id = p.id
    LEFT JOIN nurseries n ON p.nursery_id = n.id
    ${whereClause}
    ORDER BY o.created_at DESC, o.id DESC`,
    values
  );

  return rows;
};

const updateOrderStatus = async (id, status) => {
  const [result] = await db.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
  return rows[0];
};

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus
};
