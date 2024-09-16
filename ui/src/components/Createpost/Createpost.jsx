import React, { useState, useEffect } from "react";
import "./Createpost.css";
import { useSelector, useDispatch } from 'react-redux';
import { addPost } from '../../store/postSlice.js';
import "./Createpost.css";
import { FaPaperclip } from "react-icons/fa";
import { Button, Flex, TextArea, Spinner } from "@radix-ui/themes";
import { toast, Toaster } from 'react-hot-toast';
import { createPost, fetchUsers } from '../../services/service.js';

const Createpost = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user_id } = useSelector((state) => state.user);
  const currentPostType = useSelector((state) => state.posts.currentPostType);

  const [postType, setPostType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [userNames, setUserNames] = useState([]);
  const [filteredUserNames, setFilteredUserNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(""); // New state for image preview
  const [unsavedChanges, setUnsavedChanges] = useState(false); // Track unsaved changes

  const postTypes = ["Cheers", "Feedback", "Suggestion"];

  useEffect(() => {
    fetchUserNames().catch(error => {
      console.error("Failed to fetch user names:", error);
      setUserNames([]); // Set to empty array in case of error
    });
  }, []);

  useEffect(() => {
    // Check for unsaved changes when form state changes
    setUnsavedChanges(
      postType || title || description || attachments.length || selectedPerson || imagePreview
    );
  }, [postType, title, description, attachments, selectedPerson, imagePreview]);

  const handleAttachmentChange = (event) => {
    const file = event.target.files[0];
    setAttachments(file);

    // Generate a preview for the selected file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchUserNames = async () => {
    try {
      const response = await fetchUsers()
      if (Array.isArray(response)) {
        setUserNames(response);
      } else {
        console.error("Unexpected API response format");
        setUserNames([]);
      }
    } catch (error) {
      console.error("Error fetching user names:", error);
      setUserNames([]);
    }
  };

  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
    setFilteredUserNames([]);
  };

  const handlePersonChange = (event) => {
    const inputValue = event.target.value;
    setSelectedPerson(inputValue);
  
    if (inputValue && Array.isArray(userNames)) {
      const filtered = userNames.filter((user) =>
        user.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredUserNames(filtered);
    } else {
      setFilteredUserNames([]);
    }
  };

  const handleClose = () => {
    if (unsavedChanges) {
      const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close?");
      if (confirmClose) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Activate spinner

    const formData = new FormData();
    formData.append("post_type", postType);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("person", selectedPerson);
    formData.append("user_id", user_id);

    if (attachments) {
      formData.append("attachments", attachments);
    }

    try {
      const response = await createPost(formData);
      console.log(response);
      if (response) {
        console.log("Post submitted successfully.");
        toast.success("Post submitted successfully.");
        dispatch(addPost(response));
        
        setTitle("");
        setDescription("");
        setPostType("");
        setSelectedPerson("");
        setAttachments(null); // Adjusted to null
        setImagePreview(""); // Clear image preview

        // Close the modal after 1 second
        setTimeout(() => {
          onClose();
          refreshPage(); // Call the new refresh function
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setLoading(false); // Deactivate spinner
    }
  };

  return (
    <div>
      <Toaster />
      <div className="modalOverlay">
        <div className="root">
          <img
            src="/cross-button.png"
            alt="Close"
            className="closeButton"
            onClick={handleClose} // Update to use handleClose
          />
          <h2>Create a Post</h2>
          <div className="divider"></div>
          <form onSubmit={handleSubmit}>
            <div className="flexRow">
              <div className="formControl">
                <label htmlFor="postType">Post Type</label>
                <select
                  id="postType"
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                >
                  <option value="">Select type</option>
                  {postTypes.map((type) => (
                    <option key={type} value={type.toLowerCase()}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="formControl">
                <label htmlFor="person">Person</label>
                <input
                  id="person"
                  value={selectedPerson}
                  onChange={handlePersonChange}
                  placeholder="Type to search"
                />
                {filteredUserNames.length > 0 && (
                  <ul className="dropdown">
                    {filteredUserNames.map((person) => (
                      <li key={person} onClick={() => handleSelectPerson(person)}>
                        {person}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flexRow">
              <div className="formControl">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="formControl">
                <div className="attachContainer">
                  <label htmlFor="attachment" className="attachLabel">
                    <FaPaperclip size={15} />
                  </label>
                  <span className="attachText">Attach Image</span>
                  <input
                    accept="image/*,video/*,application/pdf"
                    id="attachment"
                    multiple
                    type="file"
                    className="fileInput"
                    onChange={handleAttachmentChange}
                  />
                </div>
                {/* Display image preview */}
                {imagePreview && (
                  <div className="imagePreview w-15 h-15">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            </div>

            <div className="formControl">
              <label htmlFor="description">Description</label>
              <TextArea
                placeholder=""
                id="description"
                className="textArea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="submitButtonContainer">
              <Flex gap="3">
                <Button
                  color="indigo"
                  variant="soft"
                  type="submit"
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? <Spinner loading /> : "Submit"}
                </Button>
              </Flex>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Createpost;