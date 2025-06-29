const Artist = require('./mongodb/Artist');

const getArtists = async () => {
    try {
        let artists = await Artist.find().populate('area');
        return artists;
    }
    catch (err) {
        throw err;
    }
};

const getArtistsByArea = async (areaId) => {
    try {
        let artists = await Artist.find({ area: areaId }).populate('area').sort({ birthYear: 1 });
        return artists;
    }
    catch (err) {
        throw err;
    }
};

const getArtist = async (artistId) => {
    try {
        let artist = await Artist.findById(artistId).populate('area');
        return artist;
    }
    catch (err) {
        throw err;
    }
};

const createArtist = async (newArtist) => {
    try {
        let artist = new Artist(newArtist);
        artist = await artist.save();
        return artist;
    } catch (err) {
        throw err;
    }
};

const updateArtist = async (artistId, newArtist) => {
    try {
        let artist = await Artist.findByIdAndUpdate(artistId, newArtist, { new: true });
        return artist;
    }
    catch (err) {
        throw err;
    }
};

const likeArtist = async (artistId, userId) => {
    try {
        let artist = await Artist.findById(artistId);
        if (!artist) {
            const error = new Error("Error: Artist not found in database");
            error.status = 404;
            throw error;
        };
        if (artist.likes.includes(userId)) {
            let newLikesArray = artist.likes.filter(id => id !== userId);
            artist.likes = newLikesArray;
        } else {
            artist.likes.push(userId);
        }
        await artist.save();
        return artist;
    }
    catch (err) {
        throw err;
    }
};

const deleteArtist = async (artistId) => {
    try {
        let artist = await Artist.findById(artistId);
        if (artist) {
            await artist.deleteOne();
        }
        return artist;
    }
    catch (err) {
        throw err;
    }
};

module.exports = {
    getArtists,
    getArtist,
    getArtistsByArea,
    createArtist,
    updateArtist,
    likeArtist,
    deleteArtist
};