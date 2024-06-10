const express = require('express');
const router = express.Router();
const subdomainController = require('../controllers/subdomainController');

router.post('/buscar', subdomainController.buscarSubdominios);

module.exports = router;
