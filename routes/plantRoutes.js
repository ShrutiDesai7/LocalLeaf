const express = require('express');
const multer = require('multer');
const path = require('path');
const plantController = require('../controllers/plantController');
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

router.get('/mine', requireAuth, requireRole('owner'), plantController.getMyPlants);
router.get('/', plantController.getPlants);
router.post('/', requireAuth, requireRole('owner'), upload.single('image'), plantController.addPlant);
router.put('/:id', requireAuth, requireRole('owner'), upload.single('image'), plantController.replacePlant);
router.patch('/:id', requireAuth, requireRole('owner'), upload.single('image'), plantController.updatePlant);
router.delete('/:id', requireAuth, requireRole('owner'), plantController.deletePlant);

module.exports = router;
