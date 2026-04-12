const plantModel = require('../models/plantModel');
const nurseryModel = require('../models/nurseryModel');

const extractUploadedImages = (req, { promoteFirstExtraAsCover = true } = {}) => {
  const coverFile = req?.files?.image?.[0] || null;

  const extraFiles =
    (Array.isArray(req?.files?.images) ? req.files.images : [])
      .concat(Array.isArray(req?.files?.['images[]']) ? req.files['images[]'] : [])
      .concat(Array.isArray(req?.files?.photos) ? req.files.photos : []);

  let coverUrl = coverFile ? `/uploads/${coverFile.filename}` : null;
  let extraUrls = extraFiles.map((file) => `/uploads/${file.filename}`);

  if (promoteFirstExtraAsCover && !coverUrl && extraUrls.length > 0) {
    coverUrl = extraUrls[0];
    extraUrls = extraUrls.slice(1);
  }

  return { coverUrl, extraUrls };
};

const parseBoolean = (value) => {
  if (value === true) return true;
  if (value === false) return false;
  const str = String(value || '').trim().toLowerCase();
  return str === 'true' || str === '1' || str === 'yes' || str === 'on';
};

const parseStringArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  const str = String(value).trim();
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item)).filter(Boolean);
  } catch {
    // ignore
  }
  return str
    .split(/[,\n]/g)
    .map((item) => item.trim())
    .filter(Boolean);
};

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
    const {
      name,
      price,
      category,
      description,
      short_description,
      request_title,
      request_message
    } = req.body;
    const { coverUrl, extraUrls } = extractUploadedImages(req, {
      promoteFirstExtraAsCover: true
    });
    const image_url = coverUrl || req.body.image_url || null;

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
      description: description ?? short_description,
      request_title,
      request_message,
      image_urls: [image_url, ...extraUrls],
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
    const {
      name,
      price,
      category,
      description,
      short_description,
      request_title,
      request_message
    } = req.body;
    const { coverUrl, extraUrls } = extractUploadedImages(req, {
      promoteFirstExtraAsCover: false
    });

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (description !== undefined || short_description !== undefined) {
      updates.description = description ?? short_description;
    }
    if (request_title !== undefined) updates.request_title = request_title;
    if (request_message !== undefined) updates.request_message = request_message;
    if (coverUrl) updates.image_url = coverUrl;

    const replace = parseBoolean(req.body.replace_images);
    const removeImages = parseStringArray(req.body.remove_images || req.body.remove_image_urls);

    const hasImageUploads = Boolean(coverUrl) || extraUrls.length > 0;
    const hasRemovals = removeImages.length > 0;

    if (Object.keys(updates).length === 0 && !hasImageUploads && !hasRemovals) {
      return res.status(400).json({
        message:
          'Provide at least one field to update (name, price, category, description) or upload images'
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

    let plant = await plantModel.getPlantByIdAndNurseryId(id, nursery.id);

    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    const previousCoverUrl = plant.image_url || null;

    if (Object.keys(updates).length > 0) {
      const updated = await plantModel.updatePlantByIdAndNurseryId(id, nursery.id, updates);
      if (updated) plant = updated;
    }

    if (hasRemovals && !replace) {
      const next =
        (await plantModel.removePlantImagesByIdAndNurseryId(id, nursery.id, removeImages)) ||
        plant;
      plant = next || plant;
    }

    if (hasImageUploads) {
      const coverChanged =
        Boolean(coverUrl) && previousCoverUrl && previousCoverUrl !== coverUrl;
      if (coverChanged && !replace) {
        await plantModel.removePlantImagesByIdAndNurseryId(id, nursery.id, [previousCoverUrl]);
      }

      const coverForReplace = coverUrl || plant.image_url;
      const imageUrls = replace
        ? [coverForReplace, ...extraUrls].filter(Boolean)
        : [coverUrl, ...extraUrls].filter(Boolean);

      const next =
        (await plantModel.updatePlantImagesByIdAndNurseryId(id, nursery.id, {
          image_urls: imageUrls,
          replace
        })) || plant;

      plant = next || plant;
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
    const {
      name,
      price,
      category,
      description,
      short_description,
      request_title,
      request_message
    } = req.body;
    const { coverUrl, extraUrls } = extractUploadedImages(req, {
      promoteFirstExtraAsCover: true
    });
    const image_url = coverUrl || req.body.image_url || null;

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

    let plant = await plantModel.updatePlantByIdAndNurseryId(id, nursery.id, {
      name,
      price,
      category,
      image_url,
      description: description ?? short_description,
      request_title,
      request_message
    });

    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    const hasImageUploads = Boolean(coverUrl) || extraUrls.length > 0;
    if (hasImageUploads) {
      plant =
        (await plantModel.updatePlantImagesByIdAndNurseryId(id, nursery.id, {
          image_urls: [image_url, ...extraUrls],
          replace: true
        })) || plant;
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
