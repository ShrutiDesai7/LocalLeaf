const db = require('./db');

let orderColumnsCache = null;
let schemaEnsured = false;

const ensureOrdersSchema = async () => {
  if (schemaEnsured) return;
  schemaEnsured = true;

  const [rows] = await db.query('SHOW COLUMNS FROM orders');
  const columns = new Set(rows.map((row) => row.Field));

  if (!columns.has('payment_mode')) {
    await db.query(
      "ALTER TABLE orders ADD COLUMN payment_mode VARCHAR(30) NOT NULL DEFAULT 'pay_on_delivery'"
    );
    orderColumnsCache = null;
  }
};

const getOrderColumns = async () => {
  await ensureOrdersSchema();
  if (orderColumnsCache) return orderColumnsCache;
  const [rows] = await db.query('SHOW COLUMNS FROM orders');
  orderColumnsCache = new Set(rows.map((row) => row.Field));
  return orderColumnsCache;
};

const createOrder = async (orderData) => {
  const columns = await getOrderColumns();
  const { plant_id, customer_name, phone, address, payment_mode } = orderData;

  const insertColumns = ['plant_id', 'customer_name', 'phone', 'address'];
  const insertValues = [plant_id, customer_name, phone, address];

  if (columns.has('payment_mode')) {
    insertColumns.push('payment_mode');
    insertValues.push(payment_mode || 'pay_on_delivery');
  }

  const placeholders = insertColumns.map(() => '?').join(', ');
  const [result] = await db.query(
    `INSERT INTO orders (${insertColumns.join(', ')})
     VALUES (${placeholders})`,
    insertValues
  );

  const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [result.insertId]);
  return rows[0];
};

const getAllOrders = async (filters = {}) => {
  const columns = await getOrderColumns();
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

  const extraSelect = [];
  if (columns.has('delivery_eta')) extraSelect.push('o.delivery_eta');
  if (columns.has('delivery_partner_name')) extraSelect.push('o.delivery_partner_name');
  if (columns.has('delivery_partner_phone')) extraSelect.push('o.delivery_partner_phone');
  if (columns.has('payment_mode')) extraSelect.push('o.payment_mode');

  const [rows] = await db.query(
    `SELECT
      o.id,
      o.plant_id,
      o.customer_name,
      o.phone,
      o.address,
      o.status,
      o.created_at,
      ${extraSelect.length ? `${extraSelect.join(', ')},` : ''}
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

const updateOrderStatusByIdAndNurseryId = async (id, nurseryId, payload = {}) => {
  const columns = await getOrderColumns();
  const setParts = ['o.status = ?'];
  const values = [payload.status];

  if (payload.status === 'accepted') {
    if (columns.has('delivery_eta')) {
      setParts.push('o.delivery_eta = ?');
      values.push(payload.delivery_eta || null);
    }

    if (columns.has('delivery_partner_name')) {
      setParts.push('o.delivery_partner_name = ?');
      values.push(payload.delivery_partner_name || null);
    }

    if (columns.has('delivery_partner_phone')) {
      setParts.push('o.delivery_partner_phone = ?');
      values.push(payload.delivery_partner_phone || null);
    }
  } else {
    // reset delivery info on reject if columns exist
    if (columns.has('delivery_eta')) setParts.push('o.delivery_eta = NULL');
    if (columns.has('delivery_partner_name')) setParts.push('o.delivery_partner_name = NULL');
    if (columns.has('delivery_partner_phone')) setParts.push('o.delivery_partner_phone = NULL');
  }

  values.push(Number(id), Number(nurseryId));

  const [result] = await db.query(
    `UPDATE orders o
     JOIN plants p ON o.plant_id = p.id
     SET ${setParts.join(', ')}
     WHERE o.id = ? AND p.nursery_id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
  return rows[0];
};

const updateOrdersPhone = async (oldPhone, newPhone) => {
  const [result] = await db.query('UPDATE orders SET phone = ? WHERE phone = ?', [
    newPhone,
    oldPhone
  ]);
  return result.affectedRows || 0;
};

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatusByIdAndNurseryId,
  updateOrdersPhone
};
