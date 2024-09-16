import React, { useState, useEffect } from "react";
import "./Feedpost.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisH,
  faEdit,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import EditPost from "../EditPost/EditPost";
import { useSelector } from 'react-redux';
import { faHeart as faHeartEmpty} from "@fortawesome/free-regular-svg-icons";
import { faComments } from "@fortawesome/free-regular-svg-icons"; 
import { faHeart as faHeartFilled } from "@fortawesome/free-solid-svg-icons";
import { Flex, Button,DropdownMenu } from "@radix-ui/themes";
import { toast, Toaster } from 'react-hot-toast';
import {fetchLikeStateService, fetchUserProfileService, fetchRepliesService, likePostService, unlikePostService,postReplyService,handleDeletePostService, handleDeleteReplyService } from "../../services/service.js"
 

const Feedpost = ({ post }) => {
  const user_id = useSelector((state) => state.user.user_id);
  const [showOptions, setShowOptions] = useState(false);
  const [showReplyField, setShowReplyField] = useState(false);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [likes, setLikes] = useState(post.likes || 0);
  const [comments, setComments] = useState(post.comments || 0);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});

  useEffect(() => {
    if (showReplyField) {
      fetchReplies();
    }
  }, [showReplyField]);

  useEffect(() => {
    fetchLikeState();
  }, [post.post_id, user_id]);

  const fetchLikeState = async () => {
    try {
      const response = await fetchLikeStateService(post.post_id, user_id);
      setIsLiked(response.data.is_liked);
    } catch (error) {
      console.error("Error fetching like state:", error);
    }
  }

  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetchUserProfileService(user_id);
      const data = response.data;
      return data.display_pic;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };
  const fetchAllUserProfiles = async (replies) => {
    const profiles = {};
    for (const reply of replies) {
      if (!profiles[reply.user_id]) {
        profiles[reply.user_id] = await fetchUserProfile(reply.user_id);
      }
    }
    setUserProfiles(profiles);
  };

  const fetchReplies = async () => {
    setLoading(true);
    try {
      const fetchedReplies = await fetchRepliesService(post.post_id);
      setReplies(fetchedReplies);
      await fetchAllUserProfiles(fetchedReplies);
    } catch (error) {
      console.error("Error fetching replies:", error);
      toast.error("Failed to fetch replies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async () => {
    try {
      const updatedLikes = await likePostService(post.post_id, user_id);
      setLikes(updatedLikes);
      setIsLiked(true);
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like the post. Please try again.");
    }
  };

  const handleUnlikePost = async () => {
    try {
      const updatedLikes = await unlikePostService(post.post_id, user_id);
      setLikes(updatedLikes);
      setIsLiked(false);
    } catch (error) {
      console.error("Error unliking post:", error);
      toast.error("Failed to unlike the post. Please try again.");
    }
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const toggleReplyField = () => {
    setShowReplyField(!showReplyField);
    if (!showReplyField) {
      fetchReplies();
    }
  };

  const handleReplyChange = (e) => {
    setNewReply(e.target.value);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
  
    if (!newReply.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
  
    const formData = new FormData();
    formData.append('post_id', post.post_id);
    formData.append('user_id', user_id);
    formData.append('content', newReply.trim());
    formData.append('created_at', new Date().toISOString()); // Add current time
  
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
  
    try {
      const response = await postReplyService(post.post_id, user_id, newReply.trim());

      if (response) {
        toast.success("Reply posted successfully");
        setNewReply("");
        fetchReplies(); // Refresh replies after posting
      } else {
        toast.error("Failed to post reply");
      }
    } catch (error) {
      toast.error(`An error occurred while posting the reply: ${error.response ? error.response.data.detail : error.message}`);
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
    setShowOptions(false);
  };

  const handleDeletePost = async () => {
    const success = await handleDeletePostService(post.post_id);
    if (success) {
      window.location.reload();
    }
  };


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
    <div className="feed-post max-w-4xl mt-3 p-6  border rounded-md duration-300  ">
      <div className="post-header flex items-center">
        <img
          src={post.poster_dp || "https://via.placeholder.com/40"}
          alt={post.author?.name || "Author"}
          className="author-avatar w-10 h-10 rounded-full mr-3"
        />
        <div className="author-info ml-4">
          <h3 className="author-name text-sm">
            <b>{post.poster_name}</b>{" "}
            <span className="posted-about">posted about </span>
            <a href="#" className="subject-link">
              <b className="posteename text-sm">{post.postee_name}</b>
            </a>
          </h3>
          <p className="post-time text-gray-400 text-sm">Posted {formatDateTime(post.created_at)}</p>
        </div>

        {post.poster_id === user_id && (
          <div className="options-menu ml-auto">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="flex items-center px-4 py-2 w-full text-left"
                  onClick={toggleOptions}
                >
                  <FontAwesomeIcon icon={faEllipsisH} className="options-icon cursor-pointer" />
                </button>
              </DropdownMenu.Trigger>
              {showOptions && (
                <DropdownMenu.Content size="2">
                  <DropdownMenu.Item onSelect={handleEditClick}>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faEdit} className="mr-2" />
                      <span>Edit</span>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item onSelect={handleDeletePost}>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                      <span>Delete</span>
                    </div>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              )}
            </DropdownMenu.Root>
          </div>
        )}

        
      </div>
      <div className="post-content mt-4">
        <p className="text-lg font-semibold">{post.title}</p>
        <p className="mt-2" dangerouslySetInnerHTML={{ __html: post.description.replace(/\n/g, "<br />") }}></p>
      </div>
      {post.post_pic && (
        <div className="post-image  w-50 h-50 mt-4 ml-40">
          <img src={post.post_pic} alt="Post" className="w-60 h-100 rounded-md post_img" />
        </div>
      )}
      <div className="interaction-buttons flex items-center justify-start mt-4 text-l">
        <button
          className="like-button flex items-center text-blue-500 hover:text-blue-700 mr-4"
          onClick={isLiked ? handleUnlikePost : handleLikePost}
        >
          <FontAwesomeIcon  icon={isLiked ? faHeartFilled : faHeartEmpty} className="mr-1" />
          <span className="ml-1">{likes}</span>
        </button>

        <button
          className="comment-button flex items-center text-gray-500 hover:text-gray-700 mr-4"
          onClick={toggleReplyField}
        >
          <FontAwesomeIcon icon={faComments} className="mr-1" />
          <span>{replies.length}</span>
        </button>
      </div>
      {showReplyField && (
        <>
        <div className="reply-divider"></div>
         <div className="reply-section mt-4">
          <form onSubmit={handleReplySubmit} className="reply-form">
            <input
              type="text"
              value={newReply}
              onChange={handleReplyChange}
              placeholder="Write a reply..."
              className="reply-input border border-gray-300 rounded-md p-2 w-full"
            />
            <div type="submit" className="submit-reply-button p-2 rounded-md hover:bg-100">
            <Flex gap="3">
              <Button
                color="indigo"
                variant="solid"
                type="submit"
                 
              >
                Post
              </Button>
            </Flex>
            </div>
          </form>
          <div className="replies-list mt-4">
            {loading ? (
              <p> </p>
            ) : (
              replies.map((reply, index) => (
                <div key={index} className="reply-item flex items-center mb-2">
                  <img 
                    src={userProfiles[reply.user_id] || "https://via.placeholder.com/30"} 
                    alt={reply.replier_name} 
                    className="reply-avatar w-8 h-8 rounded-full mr-2" 
                  />
                  <div className="reply-content bg-gray-100 p-2 rounded-md w-full flex justify-between items-center">
                    <div className="reply-text">
                      <span className="reply-author font-bold">{reply.replier_name}</span>: {reply.content}
                    </div>
                    <button onClick={() => handleDeleteReplyService(reply.reply_id, setReplies, setLoading)} className="delete-reply-button text-gray-500 hover:text-red-700 ml-4">
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                </div>
              ))
            )} 
          </div>
         </div>
        </>
      )}
      {isEditModalOpen && (
        <EditPost
          initialData={{
            postType: post.post_type,
            title: post.title,
            description: post.description,
            person: post.person,
            post_id: post.post_id,
            poster_id: post.poster_id,
            postee_id: post.postee_id,
          }}
          onClose={() => {
            setIsEditModalOpen(false);
            window.location.reload();
          }}
          onSubmit={(updatedPost) => {
            // Handle the updated post
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Feedpost; 
