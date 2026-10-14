const express = require('express');
const Routine = require('../models/Routine');
const Completion = require('../models/Completion');
const requireAuth = require('../middleware/auth');
const { todayString, isValidDate } = require('../utils/helpers');

const router = express.Router();
router.use(requireAuth);

// GET /api/completions - optional ?date= and ?routineId= filters
router.get('/', async (req, res, next) => {
  try {
    const filter = { userId: req.userId };
    if (req.query.date) filter.date = req.query.date;
    if (req.query.routineId) filter.routineId = req.query.routineId;

    const completions = await Completion.find(filter).sort({ date: -1 });
    res.json({ completions });
  } catch (error) {
    next(error);
  }
});

// POST /api/completions - mark a routine as done (full or small) for a day.
// The unique index means a day can only count once, even if the user taps again.
router.post('/', async (req, res, next) => {
  try {
    const { routineId, completionType } = req.body;
    const date = req.body.date || todayString();

    if (!isValidDate(date)) return res.status(400).json({ message: 'Invalid date format' });
    if (!['full', 'small'].includes(completionType)) {
      return res.status(400).json({ message: 'Completion type must be full or small' });
    }

    // Make sure the routine belongs to this user
    const routine = await Routine.findOne({ _id: routineId, userId: req.userId });
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    const completion = await Completion.findOneAndUpdate(
      { userId: req.userId, routineId, date },
      { completionType, completedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ completion });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/completions/:id - undo a completion
router.delete('/:id', async (req, res, next) => {
  try {
    const completion = await Completion.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!completion) return res.status(404).json({ message: 'Completion not found' });

    res.json({ message: 'Completion removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
