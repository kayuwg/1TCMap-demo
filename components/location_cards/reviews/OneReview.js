import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { useSelector } from "react-redux";

import { selectUser } from "../../../reducers/userReducer.js";

function OneReview(props) {
  const user = useSelector(selectUser);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [voteDisabled, setVoteDisabled] = useState(false);

  // Initialize reviews
  useEffect(() => {
    console.log(props.review);
    setUpvotes(props.review.upvotes);
    setDownvotes(props.review.downvotes);
  }, [props.review]);

  function vote(upvote) {
    // 1 second buffer time
    setVoteDisabled(true);
    setTimeout(() => setVoteDisabled(false), 1000);
    
    if (user._id === undefined) {
      // debug purpose
      alert("Login to vote!");
      return;
    }
    const requestHeaders = {
      method: "POST",
      headers: {
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({
        upvote: upvote
      })
    };

    // change to user.user_id when done
    fetch(`/api/auth/${user._id}/vote/${props.review._id}`, requestHeaders).then(response => {
      if (!response.ok) {
        return Promise.reject(response.status);
      }
      return response.json();
    }).then(offset => {
      console.log("offset", offset);
      props.updateReviewVotes(props.review._id, offset);
      setUpvotes(upvotes + offset.upvote);
      setDownvotes(downvotes + offset.downvote);
    }).catch(err => {
      console.log(err);
    });
  }

  return (
    <div>
      <div>
        <img src={props.user.imageURL} style={{ height: "100px" }} />
        {props.user.name}
      </div>
      <p> {new Date(props.review.upload_date).toLocaleString()} </p>
      <p>{props.review.review_text}</p>
      <div style={{ alignContent: "right", alignItems: "center" }}>
        <Button disabled={voteDisabled} onClick={() => vote(true)}> +Upvote({upvotes})</Button>
        <Button disabled={voteDisabled} onClick={() => vote(false)}>-Downvote({downvotes})</Button>
      </div>
    </div>
  );
}

export default OneReview;
