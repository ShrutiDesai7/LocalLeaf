const plantModel = require('../models/plantModel');
const nurseryModel = require('../models/nurseryModel');

const getPlants = async (req, res, next) => {
  try {
    const result = await plantModel.getAllPlants(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getMyPlants = async (req, res, next) => {
  try {
    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);

    if (!nursery) {
      return res.status(400).json({ message: 'Owner has no nursery profile.' });
    }

    const result = await plantModel.getPlantsByNurseryId(nursery.id);
    res.status(200).json(result.plants);
  } catch (error) {
    next(error);
  }
};

const addPlant = async (req, res, next) => {
  try {
    const { name, price, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        message: 'name, price, and category are required'
      });
    }

    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);

    if (!nursery) {
      return res.status(400).json({
        message: 'Owner has no nursery profile. Register as owner with nursery details.'
      });
    }

    if (nursery.subscription_status !== 'active') {
      return res.status(403).json({
        message: 'Subscription required. Please subscribe to manage plants.'
      });
    }

    const plant = await plantModel.createPlant({
      name,
      price,
      category,
      image_url,
      nursery_id: nursery.id
    });

    res.status(201).json({
      message: 'Plant added successfully',
      plant
    });
  } catch (error) {
    next(error);
  }
};

const updatePlant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (req.file) updates.image_url = `/uploads/${req.file.filename}`;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'Provide at least one field to update (name, price, category) or image file'
      });
    }

    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);

    if (!nursery) {
      return res.status(400).json({
        message: 'Owner has no nursery profile.'
      });
    }

    if (nursery.subscription_status !== 'active') {
      return res.status(403).json({
        message: 'Subscription required. Please subscribe to manage plants.'
      });
    }

    const plant = await plantModel.updatePlantByIdAndNurseryId(
      id,
      nursery.id,
      updates
    );

    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    res.status(200).json({
      message: 'Plant updated successfully',
      plant
    });
  } catch (error) {
    next(error);
  }
};

const replacePlant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        message: 'name, price, and category are required'
      });
    }

    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);

    if (!nursery) {
      return res.status(400).json({ message: 'Owner has no nursery profile.' });
    }

    if (nursery.subscription_status !== 'active') {
      return res.status(403).json({
        message: 'Subscription required. Please subscribe to manage plants.'
      });
    }

    const plant = await plantModel.updatePlantByIdAndNurseryId(id, nursery.id, {
      name,
      price,
      category,
      image_url
    });

    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    res.status(200).json({
      message: 'Plant replaced successfully',
      plant
    });
  } catch (error) {
    next(error);
  }
};

const deletePlant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);

    if (!nursery) {
      return res.status(400).json({
        message: 'Owner has no nursery profile.'
      });
    }

    if (nursery.subscription_status !== 'active') {
      return res.status(403).json({
        message: 'Subscription required. Please subscribe to manage plants.'
      });
    }

    const deleted = await plantModel.deletePlantByIdAndNurseryId(id, nursery.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    res.status(200).json({ message: 'Plant deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlants,
  getMyPlants,
  addPlant,
  replacePlant,
  updatePlant,
  deletePlant
};
