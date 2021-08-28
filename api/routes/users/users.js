/* Only handlers/routers used in the Reviews component are shown */ 

const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;


const anonymousUser = {
  _id: null,
  googleId: null,
  first_name: "Anonymous",
  last_name: "Crabster",
  email: "a@example.com",
  user_img: "https://images-1tc.s3.us-east-2.amazonaws.com/1tc_circle.png",
  up_down_votes_reviews: Array(0)
};

router.post("/:userId/vote/:reviewId", (req, res, next) => {
  req.app.locals.db_connection.collection("users")
    .findOne({ _id: ObjectId(req.params.userId) })
    .catch(err => {
      return next(err);
    })
    .then(user => {
      if (!user) return res.json({ upvote: 0, downvote: 0 });
      let reviewList = user.up_down_votes_reviews;
      let idx = reviewList.findIndex(record => record.review_id.toString() === String(req.params.reviewId));
      let filter, update, offset;
      filter = { _id: ObjectId(req.params.userId) };
      if (idx === -1) {
        // add upvote/downvote
        update = { $push: { up_down_votes_reviews: { review_id: ObjectId(req.params.reviewId), upvote: req.body.upvote } } };
        offset = { upvote: req.body.upvote ? 1 : 0, downvote: req.body.upvote ? 0 : 1 };
      } else {
        if (req.body.upvote === reviewList[idx].upvote) {
          // cancel upvote/downvote
          update = { $pull: { up_down_votes_reviews: { review_id: ObjectId(req.params.reviewId) } } };
          offset = { upvote: req.body.upvote ? -1 : 0, downvote: req.body.upvote ? 0 : -1 };
        } else {
          // change upvote to downvote, or downvote to upvote
          filter = { _id: ObjectId(req.params.userId), "up_down_votes_reviews.review_id": ObjectId(req.params.reviewId) };
          update = { $set: { "up_down_votes_reviews.$.upvote": req.body.upvote } };
          offset = { upvote: req.body.upvote ? 1 : -1, downvote: req.body.upvote ? -1 : 1 };
        }
      }
      req.app.locals.db_connection.collection("users")
        .findOneAndUpdate(
          filter,
          update
        )
        .then(() => {
          return res.json(offset);
        });
    })
    .catch(err => {
      console.log("update failed. Error:");
      console.log(err);
      return next(err);
    })
})

router.get("/:userId/info", (req, res) => {
  if (req.params.userId === "null") {
    return res.json(anonymousUser);
  }
  req.app.locals.db_connection.collection("users")
    .findOne({ _id: ObjectId(req.params.userId) })
    .catch(err => {
      return next(err);
    })
    .then(user => {
      return res.json(user);
    });
});

module.exports = router;
