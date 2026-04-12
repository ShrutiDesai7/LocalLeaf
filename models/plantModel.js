const db = require('./db');

let plantColumnsCache = null;
let plantImagesSchemaCache = null;

const parseImageUrlsText = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const str = String(value).trim();
  if (!str) return [];

  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }

  return str
    .split(/[,\n]/g)
    .map((item) => item.trim())
    .filter(Boolean);
};

const getPlantColumns = async () => {
  if (plantColumnsCache) return plantColumnsCache;
  const [rows] = await db.query('SHOW COLUMNS FROM plants');
  plantColumnsCache = new Set(rows.map((row) => row.Field));
  return plantColumnsCache;
};

const getPlantImagesSchema = async () => {
  if (plantImagesSchemaCache) return plantImagesSchemaCache;

  const schema = {
    hasTable: false,
    hasSortOrder: false,
    hasId: false,
    hasUnique: false
  };

  try {
    const [tables] = await db.query("SHOW TABLES LIKE 'plant_images'");
    schema.hasTable = tables.length > 0;
    if (!schema.hasTable) {
      plantImagesSchemaCache = schema;
      return schema;
    }

    const [columns] = await db.query('SHOW COLUMNS FROM plant_images');
    const cols = new Set(columns.map((row) => row.Field));
    schema.hasSortOrder = cols.has('sort_order');
    schema.hasId = cols.has('id');
  } catch {
    schema.hasTable = false;
  }

  plantImagesSchemaCache = schema;
  return schema;
};

const normalizeImageUrls = (input) => {
  const urls = Array.isArray(input) ? input : [];
  const seen = new Set();

  return urls
    .map((value) => (value ? String(value).trim() : ''))
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
};

const attachPlantImages = async (plants) => {
  if (!Array.isArray(plants) || plants.length === 0) return plants;

  const plantIds = plants.map((plant) => plant.id).filter(Boolean);
  if (plantIds.length === 0) return plants;

  let imageRows = [];
  try {
    const schema = await getPlantImagesSchema();
    if (schema.hasTable) {
      if (schema.hasSortOrder) {
        const [rows] = await db.query(
          `SELECT plant_id, image_url, sort_order
           FROM plant_images
           WHERE plant_id IN (?)
           ORDER BY plant_id ASC, sort_order ASC, image_url ASC`,
          [plantIds]
        );
        imageRows = rows;
      } else if (schema.hasId) {
        const [rows] = await db.query(
          `SELECT plant_id, image_url
           FROM plant_images
           WHERE plant_id IN (?)
           ORDER BY plant_id ASC, id ASC`,
          [plantIds]
        );
        imageRows = rows;
      } else {
        const [rows] = await db.query(
          `SELECT plant_id, image_url
           FROM plant_images
           WHERE plant_id IN (?)`,
          [plantIds]
        );
        imageRows = rows;
      }
    }
  } catch {
    // `plant_images` may not exist yet in older DBs.
    imageRows = [];
  }

  const grouped = new Map();
  for (const row of imageRows) {
    if (!grouped.has(row.plant_id)) grouped.set(row.plant_id, []);
    grouped.get(row.plant_id).push(row.image_url);
  }

  for (const plant of plants) {
    const fromTable = grouped.get(plant.id) || [];
    const fallbackCover = plant.image_url ? [plant.image_url] : [];
    const fromColumn = parseImageUrlsText(plant.image_urls);
    plant.image_urls = normalizeImageUrls([...fallbackCover, ...fromColumn, ...fromTable]);
  }

  return plants;
};

const replacePlantImages = async (plantId, imageUrls) => {
  const urls = normalizeImageUrls(imageUrls);
  const schema = await getPlantImagesSchema();
  if (!schema.hasTable) return;

  await db.query('DELETE FROM plant_images WHERE plant_id = ?', [plantId]);

  if (urls.length === 0) return;

  const columns = schema.hasSortOrder
    ? ['plant_id', 'image_url', 'sort_order']
    : ['plant_id', 'image_url'];

  const values = [];
  const placeholders = urls
    .map((url, index) => {
      values.push(plantId, url);
      if (schema.hasSortOrder) values.push(index);
      return schema.hasSortOrder ? '(?, ?, ?)' : '(?, ?)';
    })
    .join(', ');

  await db.query(
    `INSERT INTO plant_images (${columns.join(', ')}) VALUES ${placeholders}`,
    values
  );
};

const appendPlantImages = async (plantId, imageUrls) => {
  const urls = normalizeImageUrls(imageUrls);
  if (urls.length === 0) return;

  const schema = await getPlantImagesSchema();
  if (!schema.hasTable) return;

  // avoid duplicates even if DB doesn't have a UNIQUE constraint
  let filtered = urls;
  try {
    const [existing] = await db.query(
      'SELECT image_url FROM plant_images WHERE plant_id = ?',
      [plantId]
    );
    const existingSet = new Set(existing.map((row) => row.image_url));
    filtered = urls.filter((url) => !existingSet.has(url));
  } catch {
    filtered = urls;
  }

  if (filtered.length === 0) return;

  if (schema.hasSortOrder) {
    const [[{ maxSort }]] = await db.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS maxSort FROM plant_images WHERE plant_id = ?',
      [plantId]
    );
    const start = Number(maxSort) + 1;

    const values = [];
    const placeholders = filtered
      .map((url, index) => {
        values.push(plantId, url, start + index);
        return '(?, ?, ?)';
      })
      .join(', ');

    await db.query(
      `INSERT INTO plant_images (plant_id, image_url, sort_order) VALUES ${placeholders}`,
      values
    );
  } else {
    const values = [];
    const placeholders = filtered
      .map((url) => {
        values.push(plantId, url);
        return '(?, ?)';
      })
      .join(', ');

    await db.query(
      `INSERT INTO plant_images (plant_id, image_url) VALUES ${placeholders}`,
      values
    );
  }
};

const syncImageUrlsColumn = async (plantId, urls) => {
  try {
    const columns = await getPlantColumns();
    if (!columns.has('image_urls')) return;
    await db.query('UPDATE plants SET image_urls = ? WHERE id = ?', [
      JSON.stringify(normalizeImageUrls(urls)),
      plantId
    ]);
  } catch {
    // ignore
  }
};

const removePlantImages = async (plantId, imageUrls) => {
  const urls = normalizeImageUrls(imageUrls);
  if (urls.length === 0) return;

  const schema = await getPlantImagesSchema();
  if (schema.hasTable) {
    await db.query('DELETE FROM plant_images WHERE plant_id = ? AND image_url IN (?)', [
      plantId,
      urls
    ]);

    const [[plantRow]] = await db.query('SELECT image_url, image_urls FROM plants WHERE id = ?', [
      plantId
    ]);
    const cover = plantRow?.image_url ? [plantRow.image_url] : [];
    const fromColumn = parseImageUrlsText(plantRow?.image_urls).filter(
      (value) => value && !urls.includes(value)
    );

    const [rows] = await db.query('SELECT image_url FROM plant_images WHERE plant_id = ?', [
      plantId
    ]);
    const fromTable = rows.map((row) => row.image_url);

    await syncImageUrlsColumn(plantId, normalizeImageUrls([...cover, ...fromColumn, ...fromTable]));
    return;
  }

  const columns = await getPlantColumns();
  if (!columns.has('image_urls')) return;

  const [rows] = await db.query('SELECT image_urls FROM plants WHERE id = ?', [plantId]);
  const current = parseImageUrlsText(rows?.[0]?.image_urls);
  const filtered = normalizeImageUrls(current.filter((value) => !urls.includes(value)));
  await syncImageUrlsColumn(plantId, filtered);
};

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

  await attachPlantImages(rows);

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

  await attachPlantImages(rows);

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
  const {
    name,
    price,
    category,
    image_url,
    nursery_id,
    description,
    short_description,
    request_title,
    request_message,
    image_urls
  } = plantData;

  const columns = await getPlantColumns();
  const insertColumns = ['name', 'price', 'category', 'image_url', 'nursery_id'];
  const insertValues = [name, price, category, image_url, nursery_id];

  const resolvedDescription = description ?? short_description;
  if (resolvedDescription !== undefined) {
    if (columns.has('description')) {
      insertColumns.splice(insertColumns.length - 1, 0, 'description');
      insertValues.splice(insertValues.length - 1, 0, resolvedDescription || null);
    } else if (columns.has('short_description')) {
      insertColumns.splice(insertColumns.length - 1, 0, 'short_description');
      insertValues.splice(insertValues.length - 1, 0, resolvedDescription || null);
    }
  }

  if (request_title !== undefined && columns.has('request_title')) {
    insertColumns.splice(insertColumns.length - 1, 0, 'request_title');
    insertValues.splice(insertValues.length - 1, 0, request_title || null);
  }

  if (request_message !== undefined && columns.has('request_message')) {
    insertColumns.splice(insertColumns.length - 1, 0, 'request_message');
    insertValues.splice(insertValues.length - 1, 0, request_message || null);
  }

  if (columns.has('image_urls')) {
    const cover = image_url ? [image_url] : [];
    const allUrls = normalizeImageUrls([...(cover || []), ...(image_urls || [])]);
    insertColumns.splice(insertColumns.length - 1, 0, 'image_urls');
    insertValues.splice(insertValues.length - 1, 0, JSON.stringify(allUrls));
  }

  const placeholders = insertColumns.map(() => '?').join(', ');
  const [result] = await db.query(
    `INSERT INTO plants (${insertColumns.join(', ')}) VALUES (${placeholders})`,
    insertValues
  );

  const [rows] = await db.query('SELECT * FROM plants WHERE id = ?', [result.insertId]);
  const plant = rows[0];

  const cover = plant?.image_url ? [plant.image_url] : [];
  const allUrls = normalizeImageUrls([...(cover || []), ...(image_urls || [])]);

  try {
    if (allUrls.length > 0) {
      await appendPlantImages(plant.id, allUrls);
      await syncImageUrlsColumn(plant.id, allUrls);
    }
  } catch {
    // ignore if `plant_images` table doesn't exist yet
  }

  await attachPlantImages([plant]);
  return plant;
};

module.exports = {
  getAllPlants,
  getPlantsByNurseryId,
  createPlant,
  getPlantByIdAndNurseryId: async (id, nurseryId) => {
    const [rows] = await db.query(
      'SELECT * FROM plants WHERE id = ? AND nursery_id = ?',
      [id, nurseryId]
    );
    const plant = rows[0] || null;
    if (!plant) return null;
    await attachPlantImages([plant]);
    return plant;
  },
  updatePlantByIdAndNurseryId: async (id, nurseryId, updates) => {
    const columns = await getPlantColumns();
    const allowed = ['name', 'price', 'category', 'image_url'];

    if (columns.has('description') || columns.has('short_description')) {
      allowed.push('description', 'short_description');
    }

    if (columns.has('request_title')) allowed.push('request_title');
    if (columns.has('request_message')) allowed.push('request_message');
    if (columns.has('image_urls')) allowed.push('image_urls');

    const setParts = [];
    const values = [];

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        if (key === 'short_description' && !columns.has('short_description') && columns.has('description')) {
          setParts.push('description = ?');
          values.push(updates[key]);
          continue;
        }

        if (key === 'description' && !columns.has('description') && columns.has('short_description')) {
          setParts.push('short_description = ?');
          values.push(updates[key]);
          continue;
        }

        if (!columns.has(key)) continue;

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
    const plant = rows[0] || null;
    if (!plant) return null;
    await attachPlantImages([plant]);
    return plant;
  },
  updatePlantImagesByIdAndNurseryId: async (
    id,
    nurseryId,
    { image_urls = [], replace = false } = {}
  ) => {
    const plant = await module.exports.getPlantByIdAndNurseryId(id, nurseryId);
    if (!plant) return null;

    const urls = normalizeImageUrls(image_urls);
    if (urls.length === 0) return plant;

    try {
      if (replace) {
        await replacePlantImages(id, urls);
      } else {
        await appendPlantImages(id, urls);
      }
    } catch {
      return plant;
    }

    const next = await module.exports.getPlantByIdAndNurseryId(id, nurseryId);
    await syncImageUrlsColumn(id, next?.image_urls || []);
    return next;
  },
  removePlantImagesByIdAndNurseryId: async (id, nurseryId, imageUrls = []) => {
    const plant = await module.exports.getPlantByIdAndNurseryId(id, nurseryId);
    if (!plant) return null;

    try {
      await removePlantImages(id, imageUrls);
    } catch {
      return plant;
    }

    const next = await module.exports.getPlantByIdAndNurseryId(id, nurseryId);
    await syncImageUrlsColumn(id, next?.image_urls || []);
    return next;
  },
  deletePlantByIdAndNurseryId: async (id, nurseryId) => {
    const [result] = await db.query(
      'DELETE FROM plants WHERE id = ? AND nursery_id = ?',
      [id, nurseryId]
    );

    return result.affectedRows > 0;
  }
};
