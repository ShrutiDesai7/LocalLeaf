const db = require('./db');

const getAllPlants = async (filters = {}) => {
  const { 
    category, 
    search, 
    nursery_id, 
    page = 1, 
    limit = 12 
  } = filters;
  const offset = (Number(page) - 1) * Number(limit);
  const conditions = [];
  const values = [];

  if (category && category !== 'All') {
    conditions.push('p.category = ?');
    values.push(category);
  }

  if (search) {
    conditions.push('(p.name LIKE ? OR p.category LIKE ? OR n.name LIKE ?)');
    values.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (nursery_id) {
    conditions.push('p.nursery_id = ?');
    values.push(Number(nursery_id));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `SELECT COUNT(*) as total FROM plants p ${whereClause}`;
  const countValues = values.slice(); // copy for count

  const [[{ total }]] = await db.query(countQuery, countValues);

  const [rows] = await db.query(
    `SELECT
      p.*,
      n.name AS nursery_name,
      n.address AS nursery_address
    FROM plants p
    LEFT JOIN nurseries n ON p.nursery_id = n.id
    ${whereClause}
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?`,
    [...values, Number(limit), offset]
  );

  return { 
    plants: rows, 
    pagination: { 
      page: Number(page), 
      limit: Number(limit), 
      total: Number(total),
      totalPages: Math.ceil(Number(total) / Number(limit))
    }
  };
};

const getPlantsByNurseryId = async (nurseryId, page = 1, limit = 12) => {
  const offset = (Number(page) - 1) * Number(limit);
  
  const [[{ total }]] = await db.query(
    'SELECT COUNT(*) as total FROM plants WHERE nursery_id = ?',
    [nurseryId]
  );

  const [rows] = await db.query(
    'SELECT * FROM plants WHERE nursery_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
    [nurseryId, Number(limit), offset]
  );

  return { 
    plants: rows, 
    pagination: { 
      page: Number(page), 
      limit: Number(limit), 
      total: Number(total),
      totalPages: Math.ceil(Number(total) / Number(limit))
    }
  };
};

const createPlant = async (plantData) => {
  const { name, price, category, image_url, nursery_id } = plantData;

  const [result] = await db.query(
    `INSERT INTO plants (name, price, category, image_url, nursery_id)
     VALUES (?, ?, ?, ?, ?)`,
    [name, price, category, image_url, nursery_id]
  );

  const [rows] = await db.query('SELECT * FROM plants WHERE id = ?', [result.insertId]);
  return rows[0];
};

module.exports = {
  getAllPlants,
  getPlantsByNurseryId,
  createPlant,
  updatePlantByIdAndNurseryId: async (id, nurseryId, updates) => {
    const allowed = ['name', 'price', 'category', 'image_url'];
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

    values.push(id, nurseryId);

    const [result] = await db.query(
      `UPDATE plants
       SET ${setParts.join(', ')}
       WHERE id = ? AND nursery_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return null;
    }

    const [rows] = await db.query('SELECT * FROM plants WHERE id = ?', [id]);
    return rows[0] || null;
  },
  deletePlantByIdAndNurseryId: async (id, nurseryId) => {
    const [result] = await db.query(
      'DELETE FROM plants WHERE id = ? AND nursery_id = ?',
      [id, nurseryId]
    );

    return result.affectedRows > 0;
  }
};
