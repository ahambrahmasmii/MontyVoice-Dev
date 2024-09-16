import React, { useState } from "react";
import CreatePost from "../Createpost/Createpost.jsx";
import "./Feedback.css"; // Create corresponding CSS file for styling

const Feedbacks = () => {
  const [posts, setPosts] = useState([]);

  const handlePostSubmit = (newPost) => {
    setPosts([...posts, newPost]);
  };

  return (
    <div className="feedbacks-container">
      <CreatePost onPostSubmit={handlePostSubmit} existingPosts={posts} />
    </div>
  );
};

export default Feedbacks;
