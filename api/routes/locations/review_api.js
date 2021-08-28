const express = require('express');
const router = express.Router({ mergeParams: true });
const ObjectId = require('mongodb').ObjectID;

/* location id is req.params.locId */

const requiredFields = ["user_id", "review_text"];

router.get("/", (req, res, next) => {
  req.app.locals.db_connection.collection("locations")
    .findOne({ _id: ObjectID(req.params.locId) })
    .populate('reviews')
    .catch(err => {
      return next(err);
    })
    .then(location => {
      return res.json(location.reviews);
    });
});

// Add review
router.post("/add", (req, res, next) => {
  try {
  let query = req.body;
  for (let key of requiredFields) {
    if (!query.hasOwnProperty(key)) {
      return res.json({ "error": `required key ${key} was not found in the request` });
    }
  }
  let newReview = {
    _id: new ObjectId(),
    user_id: query.user_id === null ? null : ObjectId(query.user_id),
    review_text: query.review_text,
    upload_date: Date.now(),
    upvotes: 0,
    downvotes: 0
  };
  req.app.locals.db_connection.collection("locations")
    .findOneAndUpdate(
      { _id: ObjectId(req.params.locId) },
      { $push: { reviews: newReview } },
      { returnOriginal: false })
    .catch(err => {
      console.log("update failed. Error:");
      console.log(err);
      return next(err);
    })
    .then(newLocation => {
      console.log("update should be successful");
      console.log(newLocation.value);
      return res.json(newLocation.value.reviews);
    });
  } catch (e) { console.log(e) }
})

// Update review votes
router.post("/:reviewId/vote/", (req, res, next) => {
  req.app.locals.db_connection.collection("locations")
    .findOneAndUpdate(
      { _id: ObjectId(req.params.locId), "reviews._id": ObjectId(req.params.reviewId) },
      { $inc: { "reviews.$.upvotes": req.body.upvote, "reviews.$.downvotes": req.body.downvote } }
    )
    .then(() => {
      res.sendStatus(200);
    })
    .catch(err => {
      console.log("update failed. Error:");
      console.log(err);
      return next(err);
    })
})

module.exports = router;