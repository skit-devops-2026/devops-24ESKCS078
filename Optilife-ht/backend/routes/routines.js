const express = require('express');
const Routine = require('../models/Routine');
const Completion = require('../models/Completion');
const requireAuth = require('../middleware/auth');
const { validateRoutineInput } = require('../utils/helpers');

const router = express.Router();
router.use(requireAuth);

// GET /api/routines - all routines for the logged-in user
router.get('/', async (req, res, next) => {
  try {
    const routines = await Routine.find({ userId: req.userId }).sort({ createdAt: 1 });
    res.json({ routines });
  } catch (error) {
    next(error);
  }
});

// POST /api/routines - create a routine
router.post('/', async (req, res, next) => {
  try {
    const { error, data } = validateRoutineInput(req.body);
    if (error) return res.status(400).json({ message: error });

    const routine = await Routine.create({ ...data, userId: req.userId });
    res.status(201).json({ routine });
  } catch (error) {
    next(error);
  }
});

// PUT /api/routines/:id - edit a routine (also used for pause/activate)
router.put('/:id', async (req, res, next) => {
  try {
    const { error, data } = validateRoutineInput(req.body);
    if (error) return res.status(400).json({ message: error });

    // Filtering by userId means users can never change another user's routine
    const routine = await Routine.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      data,
      { new: true, runValidators: true }
    );
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    res.json({ routine });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routines/:id - delete a routine and its completion history
router.delete('/:id', async (req, res, next) => {
  try {
    const routine = await Routine.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    await Completion.deleteMany({ routineId: req.params.id, userId: req.userId });
    res.json({ message: 'Routine deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
