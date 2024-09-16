// ShowFeedbacks.jsx
import React from "react";
import "./Showfeedbacks.css"; // Add CSS as needed

const ShowFeedbacks = () => {
  // Sample feedback data
  const feedbacks = [
    { id: 1, user: "John Doe", message: "Great job on the project!" },
    { id: 2, user: "Jane Smith", message: "Thank you for your assistance." },
    // Add more feedback data as needed
  ];

  return (
    <div className="feedbackContainer">
      <h2>Feedbacks</h2>
      <ul>
        {feedbacks.map(feedback => (
          <li key={feedback.id}>
            <p><strong>{feedback.user}</strong>: {feedback.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShowFeedbacks;
