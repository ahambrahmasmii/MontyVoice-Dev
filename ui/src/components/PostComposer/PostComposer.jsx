import React, { useState } from "react";
import "./PostComposer.css"; // For styling
import Createpost from "../Createpost/Createpost"; // Import your CreatePost component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PostIcon from "./createpostimage.png"
import { Button } from "@radix-ui/themes";

const PostComposer = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const toggleCreatePost = () => {
    setIsCreatingPost(!isCreatingPost);
  };

  const handleClose = () => {
    setIsCreatingPost(false);
  };

  return (
    <div className="post-composer-container">
      <div className="post-input">
        {isCreatingPost ? (
          <Createpost onClose={handleClose} />
        ) : (
          <div className="input-and-button" onClick={toggleCreatePost}>
            <div className="input-container">
              <img src={PostIcon} alt="Create Post Icon" className="input-icon" />
              <input
                placeholder=" "
                readOnly
                className="input-field"
              />
              <label className="animated-placeholder">Click here to share your thoughts...</label>
            </div>
            {/* <Button
              color="navyblue"
              variant="soft"
              highContrast
              onClick={toggleCreatePost}
              className="create-button"
            >
              Create
            </Button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostComposer;



