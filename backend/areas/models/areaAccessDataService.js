const Area = require('./mongodb/Area');
const Artist = require('../../artists/models/mongodb/Artist');

const getAreas = async () => {
    try {
        const areas = await Area.find();
        return areas;
    } catch (error) {
        console.error("Error in getAreas:", error);
        throw error;
    }
};

const getAreaWithArtistsByName = async (areaNameUrl) => {
    try {
        const areaName = areaNameUrl.replace(/-/g, ' ').toLowerCase();
        const area = await Area.findOne({ name: areaName });
        if (!area) {
            const error = new Error('Area not found');
            error.status = 404;
            throw error;
        }
        // Populate area in artists
        const artists = await Artist.find({ area: area._id }).populate('area').sort({ birthYear: 1 });
        return { area, artists };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAreas,
    getAreaWithArtistsByName
}; 