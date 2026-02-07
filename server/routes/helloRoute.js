const router = require('express').Router();
const { getHello } = require('../controllers/helloController');

router.route('/').get(getHello);

module.exports = router;
