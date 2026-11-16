const express = require('express');
const {
    createItem,
    getManySide,
    getManySideById,
    updateManySide,
    deleteManySide
} = require('./controllers');

const router = express.Router();

router.post('/new', createItem);
router.get('/manyside', getManySide);
router.get('/manyside/:id', getManySideById);
router.patch('/manyside/:id', updateManySide);
router.delete('/manyside/:id', deleteManySide);

module.exports = router;