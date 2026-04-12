const express = require('express');
const multer = require('multer');
const path = require('path');
const plantController = require('../controllers/plantController');
const reviewController = require('../controllers/reviewController');
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
const uploadImages = upload.fields([
  { name: 'image', maxCount: 1 },
  // Support a few common field names for multi-upload.
  { name: 'images', maxCount: 8 },
  { name: 'images[]', maxCount: 8 },
  { name: 'photos', maxCount: 8 }
]);

router.get('/mine', requireAuth, requireRole('owner'), plantController.getMyPlants);
router.get('/', plantController.getPlants);
router.get('/:id/reviews', reviewController.getPlantReviews);
router.post('/:id/reviews', requireAuth, requireRole('customer'), reviewController.addPlantReview);
router.post('/', requireAuth, requireRole('owner'), uploadImages, plantController.addPlant);
router.put('/:id', requireAuth, requireRole('owner'), uploadImages, plantController.replacePlant);
router.patch('/:id', requireAuth, requireRole('owner'), uploadImages, plantController.updatePlant);
router.delete('/:id', requireAuth, requireRole('owner'), plantController.deletePlant);

module.exports = router;
