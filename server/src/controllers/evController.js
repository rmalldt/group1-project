const Ev = require('../models/evModel');

async function getAll(req, res) {
  try {
    const result = await Ev.getAll();
    if (!result.data) {
      throw new Error(result.message);
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function getAllByBrand(req, res) {
  const brand = req.params.brand;

  try {
    const result = await Ev.getAllByBrand(brand);
    if (!result.data) {
      throw new Error(result.message);
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function getEvByModel(req, res) {
  const model = req.params.model;

  try {
    const result = await Ev.getEvByModel(model);
    if (!result.data) {
      throw new Error(result.message);
    }

    res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

module.exports = { getAll, getAllByBrand, getEvByModel };
