const mongoose = require("mongoose");
const { URL } = require("../../../helpers/mongodb/mongooseValidators");

const artistSchema = new mongoose.Schema({
    name: {
        heb: { type: String, required: true },
        eng: { type: String, required: true }
    },
    birthYear: {
        type: Number,
        default: null,
        validate: [
            {
                validator: function (v) {
                    // Only validate if isBand is false
                    if (this.isBand === false) {
                        return v !== null && /^\d{4}$/.test(v);
                    }
                    return true;
                },
                message: props => `${props.value} is not a valid 4-digit year!` //if isBand is false, birthYear is required
            },
            {
                validator: function (v) {
                    // If isBand is false, birthYear is required
                    if (this.isBand === false) {
                        return v !== null;
                    }
                    return true;
                },
                message: "birthYear is required for solo artists."
            }
        ]
    },
    location: {
        heb: { type: String, required: true },
        eng: { type: String, required: true }
    },
    area: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
        default: null
    },
    image: {
        url: { type: String, required: true },
        alt: { type: String, required: true }
    },
    wiki: {
        heb: { type: String, default: null },
        eng: { type: String, default: null }
    },
    embedUrl: URL,
    spotifyId: { type: String, required: true },
    isBand: {
        type: Boolean,
        required: true
    },
    yearRange: {
        first: {
            type: Number,
            default: null,
            validate: {
                validator: function (v) {
                    // If isBand is true, yearRange.first is required
                    if (this.isBand === true) {
                        return v !== null;
                    }
                    return true;
                },
                message: "yearRange.first is required for bands."
            }
        },
        last: {
            type: Number,
            default: null,
            validate: {
                validator: function (v) {
                    // If isBand is true, yearRange.last is required
                    if (this.isBand === true) {
                        return v !== null;
                    }
                    return true;
                },
                message: "yearRange.last is required for bands."
            }
        }
    },
    bornElsewhere: {
        eng: { type: String, default: null },
        heb: { type: String, default: null }
    },
    gender: {
        type: String,
        enum: ['m', 'f'],
        validate: {
            validator: function (v) {
                // Gender is required when bornElsewhere is not null for hebrew gendered text reasons
                if (this.bornElsewhere && (this.bornElsewhere.eng || this.bornElsewhere.heb)) {
                    return v !== null && v !== undefined;
                }
                return true; // If bornElsewhere is null, gender is optional
            },
            message: "Gender is required when bornElsewhere is provided."
        }
    },
    summary: {
        heb: { type: String, default: null },
        eng: { type: String, default: null }
    },
    rate: {
        // Rate will determine the size of the artist avatar in AreaPage
        type: Number,
        default: 3,
        validate: {
            validator: function (v) {
                return v >= 1 && v <= 4;
            },
            message: "Rate must be between 1 and 4"
        }
    }
}, { timestamps: true });

artistSchema.pre("remove", async function (next) {
    const ArtistVote = mongoose.model("ArtistVote");
    const Comment = mongoose.model("Comment");

    await ArtistVote.deleteMany({ artist: this._id });
    await Comment.deleteMany({ artist: this._id });

    next();
});

artistSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    const ArtistVote = mongoose.model("ArtistVote");
    const Comment = mongoose.model("Comment");

    await ArtistVote.deleteMany({ artist: this._id });
    await Comment.deleteMany({ artist: this._id });

    next();
});

const Artist = mongoose.model("Artist", artistSchema);
module.exports = Artist;
