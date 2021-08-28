import React, { useState } from "react";

import GenericModal from "../../reusable/GenericModal.js";
import { Button } from "antd";

function AddReviewModal(props) {
  let [reviewContent, setReviewContent] = useState("");

  return (
    <>
      <GenericModal
        title={<h5>Write a Review</h5>}
        visible={props.visible}
        handleClose={props.handleClose}
        children={
          <input
            onChange={(e) => setReviewContent(e.target.value)}
            type="text"
          />
        }
        footer={
          <>
            <Button onClick={() => props.handleSubmit(reviewContent, true)}>Anonymous</Button>
            <Button onClick={() => props.handleSubmit(reviewContent, false)}>Post</Button>
          </>
        }
      />
    </>
  );
}

export default AddReviewModal;
