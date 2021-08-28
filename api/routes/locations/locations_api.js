/* Only handlers/routers used in the Reviews component are shown */ 

const express = require('express');
const router = express.Router();
const reviewRouter = require('./review_api.js');

router.use("/:locId/review", reviewRouter);

module.exports = router;
