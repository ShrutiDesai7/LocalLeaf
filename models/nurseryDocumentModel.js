const db = require('./db');

const createDocument = async (doc) => {
  const {
    nursery_id,
    doc_type,
    original_name,
    stored_name,
    mime_type,
    size_bytes
  } = doc;

  const [result] = await db.query(
    `INSERT INTO nursery_documents
      (nursery_id, doc_type, original_name, stored_name, mime_type, size_bytes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nursery_id, doc_type, original_name, stored_name, mime_type, size_bytes]
  );

  const [rows] = await db.query('SELECT * FROM nursery_documents WHERE id = ?', [
    result.insertId
  ]);

  return rows[0];
};

const listByNurseryId = async (nursery_id) => {
  const [rows] = await db.query(
    'SELECT * FROM nursery_documents WHERE nursery_id = ? ORDER BY uploaded_at DESC, id DESC',
    [nursery_id]
  );
  return rows;
};

const getByIdAndNurseryId = async (id, nursery_id) => {
  const [rows] = await db.query(
    'SELECT * FROM nursery_documents WHERE id = ? AND nursery_id = ? LIMIT 1',
    [id, nursery_id]
  );
  return rows[0] || null;
};

const deleteByIdAndNurseryId = async (id, nursery_id) => {
  const [result] = await db.query(
    'DELETE FROM nursery_documents WHERE id = ? AND nursery_id = ?',
    [id, nursery_id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  createDocument,
  listByNurseryId,
  getByIdAndNurseryId,
  deleteByIdAndNurseryId
};

