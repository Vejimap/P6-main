// Imports
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const sauceCtrl = require('../controllers/sauce');


// Routes
router.get('/', auth, sauceCtrl.displayAllSauces);

router.post('/', auth, multer, sauceCtrl.createSauce);

router.put('/:id', auth, multer, sauceCtrl.modifySauce);

router.delete('/:id', auth, sauceCtrl.deleteSauce);

router.get('/:id', auth, sauceCtrl.displaySingleSauce);


router.post('/:id/like', auth, sauceCtrl.likeSauces);

// Export routes
module.exports = router;