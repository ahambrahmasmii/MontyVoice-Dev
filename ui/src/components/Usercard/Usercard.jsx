import React, { useState, useEffect } from "react";
import "./Usercard.css";
import { useSelector } from 'react-redux';
import { fetchUserDataService } from "../../services/service.js";

const UserCard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user_id = useSelector((state) => state.user.user_id);

  const fetchUserData = async () => {
    if (!user_id) return;
      setLoading(true);
      try {
        const data = await fetchUserDataService(user_id);
        setUserData(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchUserData();
  }, [user_id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!userData) return <div>No user data available</div>;

  return (
    <div className="card-container">
      {userData.display_pic ? (
        <img
          src={userData.display_pic}
          alt={`${userData.name}'s profile`}
          className="user-dp"
        />
      ) : (
        <div className="default-profile">
          <p>No profile picture uploaded</p>
        </div>
      )}
      <div className="user-info">
        <h2 className="user-name">{userData.user_name}</h2>
        <p className="user-role">{userData.role}</p>
      </div>
    </div>
  );
};

export default UserCard;

