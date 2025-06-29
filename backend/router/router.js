const express = require('express');
const router = express.Router();
const userRouterController = require("../users/routes/userRestControllers");
const artistRouterController = require("../artists/routes/artistRestController");
const commentRouterController = require("../comments/routes/commentRestController");
const areaRouterController = require("../areas/routes/areaRestController");
const artistVoteRouterController = require("../votes/routes/artistVoteRestController");
const commentVoteRouterController = require("../votes/routes/commentVoteRestController");
const contactRestController = require('../contact/routes/contactRestController');

const { handleError } = require('../utils/handleErrors');

router.use("/users", userRouterController);
router.use("/artists", artistRouterController);
router.use("/comments", commentRouterController);
router.use("/areas", areaRouterController);
router.use("/artist-votes", artistVoteRouterController);
router.use("/comment-votes", commentVoteRouterController);
router.use("/contact", contactRestController);


router.use((req, res) => {
    handleError(res, 404, "Error: Path Not found");
})

module.exports = router;
