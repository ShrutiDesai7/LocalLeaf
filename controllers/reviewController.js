const db = require('../models/db');
const reviewModel = require('../models/reviewModel');

const getPlantReviews = async (req, res, next) => {
  try {
    const plantId = Number(req.params.id);
    if (!Number.isFinite(plantId)) {
      return res.status(400).json({ message: 'Invalid plant id' });
    }

    const result = await reviewModel.getReviewsByPlantId(plantId, {
      limit: req.query.limit,
      offset: req.query.offset
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const addPlantReview = async (req, res, next) => {
  try {
    const plantId = Number(req.params.id);
    if (!Number.isFinite(plantId)) {
      return res.status(400).json({ message: 'Invalid plant id' });
    }

    const rating = Number(req.body.rating);
    const comment = req.body.comment;

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be a number between 1 and 5' });
    }

    const [[plant]] = await db.query('SELECT id FROM plants WHERE id = ? LIMIT 1', [plantId]);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    const review = await reviewModel.upsertReview({
      plant_id: plantId,
      user_id: req.user?.id || null,
      customer_name: req.user?.name || 'Customer',
      rating,
      comment
    });

    res.status(201).json({ message: 'Review saved', review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlantReviews,
  addPlantReview
};

