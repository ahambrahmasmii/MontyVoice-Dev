import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RecentActivityCard.css"; // Import CSS for styling
import { useSelector } from 'react-redux';
import {fetchActivitiesService} from "../../services/service.js";

const RecentActivityCard = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user_id = useSelector((state) => state.user.user_id);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await fetchActivitiesService(user_id);
        setActivities(data);
    } catch (err) {
        console.error(err);
        setError("Failed to load activities");
    } finally {
        setLoading(false);
    }
    };

    if (user_id) {
      fetchActivities();
    }
  }, [user_id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const formatDateTime = (dateTimeString) => {
    const now = new Date();
    const pastDate = new Date(dateTimeString);
    const diffInMilliseconds = now - pastDate;
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      return pastDate.toLocaleDateString(undefined, options);
    }
  };

  return (
    <div className="recent-activity-card">
      <h3 id="heading"><b>Your Recent Activity</b></h3>
      <ul className="activity-list">
        {activities.map((activity, index) => (
          <li key={index} className="activity-item">
            {/* <div className="activity-type">
              {activity.activity_type === "post" && (
                <span className="activity-badge post-badge">Post</span>
              )}
              {activity.activity_type === "reply" && (
                <span className="activity-badge comment-badge">Reply</span>
              )}
            </div> */}
            <div className="activity-details">
              <p className="activity-action">
                {activity.activity_type === "post"
                  ? "You made a new post:"
                  : "You replied to a post:"}
              </p>
              <p className="post-title">{activity.title}</p>
              <p className="timestamp">{formatDateTime(activity.created_at)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivityCard;
