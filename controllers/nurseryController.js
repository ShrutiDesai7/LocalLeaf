const path = require('path');
const fs = require('fs/promises');

const nurseryModel = require('../models/nurseryModel');
const nurseryDocumentModel = require('../models/nurseryDocumentModel');

const getMyNursery = async (req, res, next) => {
  try {
    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);

    if (!nursery) {
      return res.status(404).json({ message: 'Nursery profile not found' });
    }

    res.status(200).json({ nursery });
  } catch (error) {
    next(error);
  }
};

const updateMyNursery = async (req, res, next) => {
  try {
    const { name, address } = req.body;
    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);

    if (!nursery) {
      return res.status(404).json({ message: 'Nursery profile not found' });
    }

    const updated = await nurseryModel.updateNurseryByIdAndOwnerUserId(
      nursery.id,
      req.user.id,
      { name, address }
    );

    if (!updated) {
      return res.status(400).json({
        message: 'Provide at least one field to update: name, address'
      });
    }

    res.status(200).json({ message: 'Nursery updated', nursery: updated });
  } catch (error) {
    next(error);
  }
};

const subscribe = async (req, res, next) => {
  try {
    const { months = 1 } = req.body;
    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);

    if (!nursery) {
      return res.status(404).json({ message: 'Nursery profile not found' });
    }

    const monthCount = Math.max(1, Math.min(24, Number(months) || 1));
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + monthCount);

    const updated = await nurseryModel.setSubscriptionStatus(
      nursery.id,
      req.user.id,
      'active',
      expiresAt
    );

    res.status(200).json({
      message: 'Subscription active',
      nursery: updated
    });
  } catch (error) {
    next(error);
  }
};

const listMyDocuments = async (req, res, next) => {
  try {
    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);

    if (!nursery) {
      return res.status(404).json({ message: 'Nursery profile not found' });
    }

    const documents = await nurseryDocumentModel.listByNurseryId(nursery.id);
    res.status(200).json({ documents });
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    const { doc_type } = req.body;

    if (!doc_type) {
      return res.status(400).json({ message: 'doc_type is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'document file is required' });
    }

    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);

    if (!nursery) {
      return res.status(404).json({ message: 'Nursery profile not found' });
    }

    const document = await nurseryDocumentModel.createDocument({
      nursery_id: nursery.id,
      doc_type: String(doc_type).trim(),
      original_name: req.file.originalname,
      stored_name: req.file.filename,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size
    });

    res.status(201).json({
      message: 'Document uploaded',
      document
    });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);

    if (!nursery) {
      return res.status(404).json({ message: 'Nursery profile not found' });
    }

    const doc = await nurseryDocumentModel.getByIdAndNurseryId(id, nursery.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const deleted = await nurseryDocumentModel.deleteByIdAndNurseryId(id, nursery.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(process.cwd(), 'uploads', doc.stored_name);
    await fs.unlink(filePath).catch(() => null);

    res.status(200).json({ message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNursery,
  updateMyNursery,
  subscribe,
  listMyDocuments,
  uploadDocument,
  deleteDocument
};

