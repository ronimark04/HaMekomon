const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
// const Area = require("..areas/models/mongodb/Area");
const Area = require("../areas/models/mongodb/Area");
const Artist = require("../artists/models/mongodb/Artist");

async function seedDatabase() {
    const areaCount = await Area.countDocuments();
    const artistCount = await Artist.countDocuments();

    if (areaCount > 0 || artistCount > 0) {
        console.log("Database already seeded. Skipping.");
        return;
    }

    // Load area data
    const areasPath = path.join(__dirname, "areas.json");
    const areasData = JSON.parse(fs.readFileSync(areasPath, "utf-8"));

    // Seed areas
    const insertedAreas = await Area.insertMany(areasData);
    console.log(`Seeded ${insertedAreas.length} areas.`);

    // Create a map of lowercase area names to ObjectIds
    const areaMap = new Map(
        insertedAreas.map(area => [area.name.toLowerCase(), area._id])
    );

    // Load artist data
    const artistsPath = path.join(__dirname, "artists.json");
    const rawArtists = JSON.parse(fs.readFileSync(artistsPath, "utf-8"));

    // Replace area name string with corresponding ObjectId
    let missingAreaCount = 0;
    const artistsToInsert = rawArtists.map(artist => {
        const areaName = (artist.area || '').toLowerCase().trim();
        const areaId = areaMap.get(areaName);

        if (!areaId) {
            console.warn(`No area found for: '${artist.area}' (artist: ${artist.name.eng || artist.name.heb})`);
            missingAreaCount++;
        }

        return {
            ...artist,
            area: areaId || null
        };
    });

    // Seed artists
    const insertedArtists = await Artist.insertMany(artistsToInsert);
    console.log(`Seeded ${insertedArtists.length} artists.`);
    if (missingAreaCount > 0) {
        console.log(`${missingAreaCount} artists had missing area references.`);
    }
}

module.exports = seedDatabase;
