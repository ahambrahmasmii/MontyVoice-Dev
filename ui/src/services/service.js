import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  "https://tgd5mke0kj.execute-api.us-east-1.amazonaws.com/dev";

// Helper function to get the token from localStorage
const getAccessToken = () => {
  return localStorage.getItem("token");
};

// Helper function to create an axios instance with auth header
const createAuthorizedAxios = () => {
  const token = getAccessToken();
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createPost = async (postData) => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.post("/posts/create", postData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting post:", error);
    throw error;
  }
};

export const fetchUsers = async () => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.get("/users/getall/usernames");
    return response.data;
  } catch (error) {
    console.error("Error fetching user names:", error);
    throw error;
  }
};

export const updatePost = async (postId, postData) => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.put(
      `/posts/update/${postId}`,
      postData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

export const fetchUserProfiles = async (user_id) => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.get(`/users/getuserbyid/${user_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (user_id, formData) => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.put(
      `/users/updateuser/${user_id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const fetchLikeStateService = async (post_id, user_id) => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.get(
      `/like_state/${post_id}/${user_id}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching like state:", error);
    throw error;
  }
};

export const fetchUserProfileService = async (userId) => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.get(`/users/getuserbyid/${userId}`);
    return response;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const fetchRepliesService = async (postId) => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.get(`/replies/getreply/${postId}`);
    return response.data.replies || response.data || [];
  } catch (error) {
    console.error("Error fetching replies:", error);
    throw error;
  }
};

export const likePostService = async (postId, userId) => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.post(`/like/${postId}`, {
      user_id: userId,
      post_id: postId,
      is_liked: true,
    });
    return response.data.likes;
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

export const unlikePostService = async (postId, userId) => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.post(`/unlike/${postId}`, {
      user_id: userId,
      post_id: postId,
    });
    return response.data.likes;
  } catch (error) {
    console.error("Error unliking post:", error);
    throw error;
  }
};

export const postReplyService = async (postId, userId, content) => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const formData = new FormData();
    formData.append("post_id", postId);
    formData.append("user_id", userId);
    formData.append("content", content);
    formData.append("created_at", new Date().toISOString());

    const response = await axiosInstance.post("/replies/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error posting reply:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const handleDeletePostService = async (postId) => {
  if (!window.confirm("Are you sure you want to delete this post?")) {
    return;
  }

  try {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/posts/delete/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json();

    if (response.ok || responseData?.detail === "Post deleted") {
      toast.success("Post successfully deleted.");
      return true;
    } else {
      console.error("Failed to delete post:", response.status, responseData);
      toast.error("Failed to delete the post. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    toast.error("An error occurred while deleting the post. Please try again.");
    return false;
  }
};

export const handleDeleteReplyService = async (
  replyId,
  setReplies,
  setLoading
) => {
  if (!window.confirm("Are you sure you want to delete this reply?")) {
    return;
  }

  setLoading(true);

  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.delete(`/replies/delrep/${replyId}`);

    if (response.status === 200) {
      setReplies((prevReplies) =>
        prevReplies.filter((reply) => reply.reply_id !== replyId)
      );
      toast.success("Reply successfully deleted.");
    } else {
      console.error("Failed to delete reply:", response.status);
      toast.error("Failed to delete the reply. Please try again.");
    }
  } catch (error) {
    console.error("Error deleting reply:", error);
    toast.error(
      "An error occurred while deleting the reply. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

export const signUpService = async (signupData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    });
    const data = await response.json();
    return { response, data };
  } catch (error) {
    throw new Error(`Error signing up: ${error.message}`);
  }
};

export const signInService = async (loginData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });
    const data = await response.json();
    return { response, data };
  } catch (error) {
    throw new Error(`Error signing in: ${error.message}`);
  }
};

export const fetchUserDataService = async (user_id) => {
  if (!user_id) throw new Error("User ID is required");

  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.get(`/users/getuserbyid/${user_id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching user data: ${error.message}`);
  }
};

export const fetchActivitiesService = async (user_id) => {
  if (!user_id) throw new Error("User ID is required");

  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.get(
      `/users/${user_id}/recent-activity`
    );
    return response.data || [];
  } catch (error) {
    throw new Error(`Error fetching activities: ${error.message}`);
  }
};
