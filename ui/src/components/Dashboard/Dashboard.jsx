import React, { useState, useEffect, useRef, useCallback } from "react";
import {useSelector} from 'react-redux';
import Feedpost from "../../components/Feedpost/Feedpost.jsx";
import PostComposer from "../../components/PostComposer/PostComposer";
import RecentActivityCard from "../../components/RecentActivityCard/RecentActivityCard";
import Navbar from "../../components/Navbar/Navbar";
import Usercard from "../../components/Usercard/Usercard";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = ({ onLogout }) => {
  const [posts, setPosts] = useState([]);
  const { user_id, user_email } = useSelector((state) => state.user);
  const [currentPostType, setCurrentPostType] = useState(() => {
    return localStorage.getItem('activeComponent') || "cheers";
  });
  const [userNames, setUserNames] = useState([]);
  const [showNoPostsMessage, setShowNoPostsMessage] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const getAccessToken = () => {
    return localStorage.getItem("token");
  };

  const createAuthorizedAxios = () => {
    const token = getAccessToken();
    return axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const observer = useRef();
  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const postTypeEndpoints = {
    cheers: `https://tgd5mke0kj.execute-api.us-east-1.amazonaws.com/dev/posts/cheers/${user_id}`,
    feedback: `https://tgd5mke0kj.execute-api.us-east-1.amazonaws.com/dev/posts/feedback/${user_id}`,
    suggestion: `https://tgd5mke0kj.execute-api.us-east-1.amazonaws.com/dev/posts/suggestion/${user_id}`,
  };

  useEffect(() => {
    if (user_id) {
      fetchPosts(currentPostType, page);
    }
  }, [currentPostType, user_id, page]);

  const fetchPosts = (postType, pageNum) => {
    setLoading(true);
    const endpoint = postTypeEndpoints[postType];
    if (!endpoint) {
      console.error(`No endpoint defined for post type: ${postType}`);
      setLoading(false);
      return;
    }

    const authorizedAxios = createAuthorizedAxios();
    authorizedAxios.get(`${endpoint}?page=${pageNum}`)
      .then((response) => {
        setPosts(prevPosts => {
          if (pageNum === 1) {
            return response.data;
          } else {
            return [...prevPosts, ...response.data];
          }
        });
        setShowNoPostsMessage(response.data.length === 0 && pageNum === 1);
        setHasMore(response.data.length === 10); // Assuming 10 posts per page
        setLoading(false);
      })
      .catch((error) => {
        console.error(`Error fetching ${postType} posts:`, error);
        setLoading(false);
      });
  };

  const fetchUserNames = () => {
    const authorizedAxios = createAuthorizedAxios();
    authorizedAxios.get(`https://tgd5mke0kj.execute-api.us-east-1.amazonaws.com/dev/users/getall/usernames`)
      .then((response) => {
        setUserNames(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user names:", error);
      });
  };

  useEffect(() => {
    fetchUserNames();
  }, []);

  const handlePostTypeClick = (postType) => {
    setCurrentPostType(postType);
    setPage(1);
    setPosts([]);
    setHasMore(true);
    localStorage.setItem('activeComponent', postType);
  };

  const handlePostCreated = () => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts(currentPostType, 1);
  };

  return (
    <div className="dashboard">
      <div className="navbar">
        <Navbar onLogout={onLogout} onPostTypeClick={handlePostTypeClick} />
      </div>
      <div className="content">
        <div className="column left-column">
          <div className="usercard-wrapper">
            <Usercard userEmail={user_email} />
          </div>
        </div>
        <div className="column middle-column">
          <div className="post-composer">
            <PostComposer onPostCreated={handlePostCreated} currentPostType={currentPostType} />
          </div>
          {showNoPostsMessage && (
            <div className="no-posts-message">
              No posts available. Be the first to create one!
            </div>
          )}
          <div className="feedpost">
            {posts.map((post, index) => {
              if (posts.length === index + 1) {
                return <div ref={lastPostElementRef} key={post.post_id}><Feedpost post={post} /></div>;
              } else {
                return <Feedpost key={post.post_id} post={post} />;
              }
            })}
          </div>
          {loading && <div className="loading">Loading...</div>}
        </div>
        <div className="column right-column">
          <div className="recentcard">
            <RecentActivityCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;