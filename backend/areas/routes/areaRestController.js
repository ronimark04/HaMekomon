const express = require('express');
const router = express.Router();
const { getAreas, getAreaWithArtistsByName } = require('../models/areaAccessDataService');
const { handleError } = require('../../utils/handleErrors');

// get all areas
router.get("/", async (req, res) => {
    try {
        const areas = await getAreas();
        res.status(200).send(areas);
    } catch (error) {
        console.error("Error fetching areas:", error);
        handleError(res, error.status || 500, error.message);
    }
});

// get area by name
router.get('/area/:areaNameUrl', async (req, res) => {
    try {
        const { areaNameUrl } = req.params;
        const data = await getAreaWithArtistsByName(areaNameUrl);
        res.status(200).send(data);
    } catch (error) {
        handleError(res, error.status || 500, error.message);
    }
});

module.exports = router;