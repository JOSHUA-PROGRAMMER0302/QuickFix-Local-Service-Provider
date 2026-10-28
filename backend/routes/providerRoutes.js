const express = require('express');
const router = express.Router();
const ServiceProvider = require('../models/ServiceProvider');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { providerValidation, providerUpdateValidation } = require('../middleware/validators');

// ─── GET /api/providers ───────────────────────────────────────────────────────
// Protected for both Admin and Normal User
// Query params: search, category, area, availability
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, area, availability } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (area) {
      filter.area = { $regex: area, $options: 'i' };
    }

    if (availability !== undefined && availability !== '') {
      filter.availability = availability === 'true';
    }

    const providers = await ServiceProvider.find(filter).sort({ createdAt: -1 });
    res.json({ count: providers.length, providers });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ message: 'Server error fetching providers.' });
  }
});

// ─── GET /api/providers/:id ───────────────────────────────────────────────────
// Protected for both Admin and Normal User
router.get('/:id', protect, async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found.' });
    }
    res.json({ provider });
  } catch (error) {
    console.error('Get provider by id error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Service provider not found (invalid ID).' });
    }
    res.status(500).json({ message: 'Server error fetching provider.' });
  }
});

// ─── POST /api/providers ──────────────────────────────────────────────────────
// Admin only: create new service provider
router.post('/', protect, adminOnly, providerValidation, async (req, res) => {
  try {
    const {
      name,
      category,
      email,
      phone,
      area,
      city,
      experienceYears,
      visitCharge,
      availability,
      verified,
      rating,
      skills,
      description,
    } = req.body;

    // Parse skills: accept both array and comma-separated string
    const parsedSkills =
      Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const provider = await ServiceProvider.create({
      name,
      category,
      email,
      phone,
      area,
      city: city || 'Chennai',
      experienceYears: experienceYears || 0,
      visitCharge: visitCharge || 0,
      availability: availability !== undefined ? availability : true,
      verified: verified !== undefined ? verified : true,
      rating: rating || 4.5,
      skills: parsedSkills,
      description,
    });

    res.status(201).json({ message: 'Service provider created successfully.', provider });
  } catch (error) {
    console.error('Create provider error:', error);
    res.status(500).json({ message: 'Server error creating provider.' });
  }
});

// ─── PUT /api/providers/:id ───────────────────────────────────────────────────
// Admin only: update provider
router.put('/:id', protect, adminOnly, providerUpdateValidation, async (req, res) => {
  try {
    const updates = { ...req.body };

    // Parse skills if provided as comma-separated string
    if (updates.skills && typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found.' });
    }

    res.json({ message: 'Service provider updated successfully.', provider });
  } catch (error) {
    console.error('Update provider error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Service provider not found (invalid ID).' });
    }
    res.status(500).json({ message: 'Server error updating provider.' });
  }
});

// ─── DELETE /api/providers/:id ────────────────────────────────────────────────
// Admin only: delete provider
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndDelete(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found.' });
    }
    res.json({ message: `Service provider "${provider.name}" deleted successfully.` });
  } catch (error) {
    console.error('Delete provider error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Service provider not found (invalid ID).' });
    }
    res.status(500).json({ message: 'Server error deleting provider.' });
  }
});

module.exports = router;
