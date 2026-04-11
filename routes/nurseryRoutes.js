const express = require('express');
const multer = require('multer');
const path = require('path');

const nurseryController = require('../controllers/nurseryController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-z0-9._-]/gi, '_');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`);
  }
});

const upload = multer({ storage });

router.use(requireAuth, requireRole('owner'));

router.get('/me', nurseryController.getMyNursery);
router.patch('/me', nurseryController.updateMyNursery);
router.post('/subscribe', nurseryController.subscribe);

router.get('/documents', nurseryController.listMyDocuments);
router.post('/documents', upload.single('document'), nurseryController.uploadDocument);
router.delete('/documents/:id', nurseryController.deleteDocument);

module.exports = router;

