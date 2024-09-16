// import React, { useState, useEffect } from "react";
// import "./EditPost.css";
// import { FaPaperclip, FaTimes } from "react-icons/fa";
// import { useUser } from "../../UserContext";
// import { Button, Flex } from "@radix-ui/themes";
// import {toast,Toaster} from 'react-hot-toast';
// import axios from "axios";

// const EditPost = ({ initialData = {}, onClose }) => {
//   const { user_id } = useUser(); // Access user from UserContext
//   const [postType, setPostType] = useState(initialData.postType || "");
//   const [title, setTitle] = useState(initialData.title || "");
//   const [description, setDescription] = useState(initialData.description || "");
//   const [attachments, setAttachments] = useState([]);
//   const [selectedPerson, setSelectedPerson] = useState(initialData.person || "");
//   const [loading, setLoading] = useState(false);


//   const postTypes = ["Cheers", "Feedback", "Suggestion"];
//   const people = ["John Doe", "aniruddh", "Bob Johnson"]; // Replace with your actual data

//   useEffect(() => {
//     console.log("Initial data:", initialData);
//   }, [initialData]);

//   const handleAttachmentChange = (event) => {
//     setAttachments([...attachments, ...event.target.files]);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setLoading(true);

//     const formData = new FormData();
//     formData.append("post_type", postType);
//     formData.append("title", title);
//     formData.append("description", description);
//     // formData.append("person", selectedPerson);
//     formData.append("user_id", user_id);
//     // formData.append("poster_id", initialData.poster_id);
//     // formData.append("postee_id", initialData.postee_id);

//     attachments.forEach((attachment) => {
//       formData.append("attachments", attachment);
//     });

//     try {
//       const response = await axios.put(
//         `https://zhhwpfhay9.execute-api.us-east-1.amazonaws.com/dev/posts/update/${initialData.post_id}`,
//         formData,
//          {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       console.log(response.data)
//       if (response.data) {
//         console.log("Post submitted successfully.")
//         toast.success("Post submitted successfully.");
//         setTitle("");
//         setDescription("");
//         setPostType("");
//         setSelectedPerson("");
//         setAttachments([]);

//         // Close the modal after 1 second
//         setTimeout(() => {
//           onClose();
//         }, 2000);
//       } else {
//         const errorData = await response.data;
//         toast.error(errorData.detail || "Failed to submit post.");
//       }
//     } catch (error) {
//       console.error("Error submitting post:", error);
//       toast.error("An error occurred while submitting the post.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div><Toaster/>
//     <div className="modalOverlay">
//       <div className="root">
//         <div className="header">
//           <h2>Edit Post</h2>
//           <FaTimes className="closeIcon" onClick={onClose} />
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="flexRow">
//             <div className="formControl">
//               <label className="formControlLabel" htmlFor="postType">Post Type</label>
//               <select
//                 id="postType"
//                 value={postType}
//                 onChange={(e) => setPostType(e.target.value)}
//               >
//                 <option value="">Select type</option>
//                 {postTypes.map((type) => (
//                   <option key={type} value={type}>
//                     {type}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="formControl">
//               {/* Uncomment and update this block with actual data if needed */}
//               {/* <label htmlFor="person">Person</label>
//               <select
//                 id="person"
//                 value={selectedPerson}
//                 onChange={(e) => setSelectedPerson(e.target.value)}
//               >
//                 <option value="">Select person</option>
//                 {people.map((person) => (
//                   <option key={person} value={person}>
//                     {person}
//                   </option>
//                 ))}
//               </select> */}
//             </div>
//           </div>
//           <div className="formControl">
//             <label htmlFor="title">Title</label>
//             <input
//               type="text"
//               id="title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//             />
//           </div>
//           <div className="formControl">
//             <label htmlFor="description">Description</label>
//             <textarea
//               id="description"
//               className="textArea"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             />
//           </div>
//           <div className="formControlAttach">
//               <input
//                 accept="image/*,video/*,application/pdf"
//                 id="attachment"
//                 multiple
//                 type="file"
//                 className="fileInput"
//                 onChange={handleAttachmentChange}
//               />
//               <label htmlFor="attachment" className="attachLabel">
//                 <FaPaperclip size={20} className="attachIcon"/>
//                 <span className="attachText">Attach files</span>
//               </label>
//           </div>
//           <div className="Buttons">
//             <div className="samebutton">
//               <Flex gap="3">
//                 <Button
//                   color="indigo"
//                   variant="soft"
//                   type="submit"
//                   disabled={loading}
//                 >
//                   {loading ? "Saving..." : initialData.post_id ? "Save Changes" : "Submit"}
//                 </Button>
//               </Flex>
//             </div>
//             <div className="samebutton">
//               <Flex gap="3">
//                 <Button
//                   color="indigo"
//                   variant="soft"
//                   type="button"
//                   onClick={onClose}
//                 >
//                   Cancel
//                 </Button>
//               </Flex>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   </div>
//   );
// };

// export default EditPost;

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { updatePost as updatePostAction } from '../../store/postSlice.js';
import "./EditPost.css";
import { FaPaperclip, FaTimes } from "react-icons/fa";
import { Button, Flex } from "@radix-ui/themes";
import { toast, Toaster } from 'react-hot-toast';
import { updatePost } from "../../services/service.js";

const EditPost = ({ initialData = {}, onClose }) => {
  const dispatch = useDispatch();
  const { user_id } = useSelector((state) => state.user);
  const [postType, setPostType] = useState(initialData.postType || "");
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [attachments, setAttachments] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(initialData.person || "");
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]); // New state for image previews

  const postTypes = ["Cheers", "Feedback", "Suggestion"];
  const people = ["John Doe", "aniruddh", "Bob Johnson"]; // Replace with your actual data

  useEffect(() => {
    console.log("Initial data:", initialData);
    // Generate previews for existing attachments if any
    if (initialData.attachments && initialData.attachments.length > 0) {
      const previews = initialData.attachments.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  }, [initialData]);

  const handleAttachmentChange = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(files);

    // Generate previews for the selected files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("post_type", postType);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("user_id", user_id);

    attachments.forEach((attachment) => {
      formData.append("attachments", attachment);
    });

    try {
      const data = await updatePost(initialData.post_id, formData);

      if (data) {
        console.log("Post updated successfully.");
        toast.success("Post updated successfully.");
        dispatch(updatePostAction(data));
        setTitle("");
        setDescription("");
        setPostType("");
        setSelectedPerson("");
        setAttachments([]);
        setImagePreviews([]);

        // Close the modal after 1 second
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error(data.detail || "Failed to update post.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster />
      <div className="modalOverlay">
        <div className="root">
          <div className="header">
            <h2>Edit Post</h2>
            <FaTimes className="closeIcon" onClick={onClose} />
          </div>
          <div className="divider"></div>
          <form onSubmit={handleSubmit}>
            <div className="flexRow">
              <div className="formControl">
                <label className="formControlLabel" htmlFor="postType">Post Type</label>
                <select
                  id="postType"
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                >
                  <option value="">Select type</option>
                  {postTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="formControl">
                {/* Uncomment and update this block with actual data if needed */}
                {/* <label htmlFor="person">Person</label>
                <select
                  id="person"
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                >
                  <option value="">Select person</option>
                  {people.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select> */}
              </div>
            </div>
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
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="textArea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="formControlAttach">
              <input
                accept="image/*,video/*,application/pdf"
                id="attachment"
                multiple
                type="file"
                className="fileInput"
                onChange={handleAttachmentChange}
              />
              <label htmlFor="attachment" className="attachLabel">
                <FaPaperclip size={20} className="attachIcon"/>
                <span className="attachText">Attach Image</span>
              </label>
              {/* Display image previews */}
              {imagePreviews.length > 0 && (
                <div className="imagePreviews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="imagePreview w-15">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="Buttons">
              <div className="samebutton">
                <Flex gap="3">
                  <Button
                    color="indigo"
                    variant="soft"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : initialData.post_id ? "Save Changes" : "Submit"}
                  </Button>
                </Flex>
              </div>
              <div className="samebutton">
                <Flex gap="3">
                  <Button
                    color="indigo"
                    variant="soft"
                    type="button"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </Flex>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
