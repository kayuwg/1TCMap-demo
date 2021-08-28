import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { useSelector } from "react-redux";
import { selectUser } from "../../../reducers/userReducer";
import AddReviewModal from './AddReviewModal.js';
import OneReview from './OneReview.js';

function Reviews(props) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  // local cache of reviews
  const [reviews, setReviews] = useState([]);
  // local cache of reviewers
  const [reviewers, setReviewers] = useState(new Map());
  const user = useSelector(selectUser);

  // Initialize reviews
  useEffect(() => {
    (async () => {
      await updateReviewers(props.reviews);
      setReviews(props.reviews);
    })();
  }, [props.reviews]);

  // update reviewers map
  function updateReviewers(newReviews) {
    const requestHeaders = {
      method: "GET"
    };
    if (!newReviews) return Promise.resolve();
    return Promise.all(
      newReviews
        .filter(review => !reviewers.has(review.user_id))
        .map(review => review.user_id)
        .map(async userId => {
          return fetch(`/api/auth/${userId}/info`, requestHeaders).then(response => {
            if (!response.ok) {
              return Promise.reject(response.status);
            }
            return response.json();
          }).then(user => {
            // update local map, then call set state
            // since object compares equal, no re-renders
            if (user) {
              setReviewers(reviewers.set(userId, {
                name: `${user.first_name} ${user.last_name}`,
                imageURL: user.user_img
              }));
            }
          }).catch(err => {
            console.log(err);
          });
        }));
  }

  function openAddReviewModal() {
    setModalIsOpen(true);
  }

  function closeAddReviewModal() {
    setModalIsOpen(false);
  }

  function submitReview(review, anonymous) {
    const requestHeaders = {
      method: "POST",
      headers: {
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({
        user_id: anonymous ? null : (user._id || null),
        review_text: review,
      })
    };
    fetch(`/api/locations/${props.locationID}/review/add`, requestHeaders).then(response => {
      if (!response.ok) {
        return Promise.reject(response.status);
      }
      return response.json();
    }).then(async newReviews => {
      await updateReviewers(newReviews);
      setReviews(newReviews)
      setModalIsOpen(false);
    }).catch(err => {
      console.log(err);
    });
  }

  function updateReviewVotes(reviewId, offset) {
    const requestHeaders = {
      method: "POST",
      headers: {
        "Content-Type": 'application/json'
      },
      body: JSON.stringify(offset)
    };
    fetch(`/api/locations/${props.locationID}/review/${reviewId}/vote`, requestHeaders).then(response => {
      if (!response.ok) {
        return Promise.reject(response.status);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  return (
    <>
      <h3>Reviews</h3>
      <Button onClick={openAddReviewModal}>+review</Button>
      <AddReviewModal
        visible={modalIsOpen}
        handleClose={closeAddReviewModal}
        handleSubmit={submitReview}
      />
      <div>
        {reviews && reviews.map(review => {
          console.log(review);
          return <OneReview key={review._id}
            review={review}
            user={reviewers.get(review.user_id)}
            updateReviewVotes={updateReviewVotes} />
        })}
      </div>

    </>
  );
}

export default Reviews;
