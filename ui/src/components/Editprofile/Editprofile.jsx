// import React, { useState, useEffect } from "react";
// import "./editprofile.css"; // Import CSS file
// import { useUser } from "../../UserContext";
// import axios from "axios";
// import { IconButton, Button } from "@radix-ui/themes";
 

// const Editprofile = () => {
//   const { user_id } = useUser();
//   const [isEditing, setIsEditing] = useState(false);
//   const [name, setName] = useState(" ");
//   const [email, setEmail] = useState(" ");
//   const [phoneNumber, setPhoneNumber] = useState(" ");
//   const [role, setRole] = useState(" ");
//   const [displayPic, setDisplayPic] = useState(" ");
//   const [selectedFile, setSelectedFile] = useState(null);

//   const fetchUserProfile = async () => {
//     try {
//       const response = await axios.get(
//         `https://zhhwpfhay9.execute-api.us-east-1.amazonaws.com/dev/users/getuserbyid/${user_id}`
//       );
//       const data = response.data;
//       setName(data.user_name);
//       setEmail(data.user_email);
//       setPhoneNumber(data.phone_number);
//       setRole(data.role);
//       setDisplayPic(data.display_pic);
//     } catch (error) {
//       console.error("Error fetching user profile:", error);
//     }
//   };

//   useEffect(() => {
//     fetchUserProfile();
//   }, [user_id]);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setDisplayPic(URL.createObjectURL(file));
//       setSelectedFile(file);
//     }
//   };

//   const handleSave = async () => {
//     setIsEditing(false);
//     // Save updated information logic
//     try {
//       const formData = new FormData();
//       formData.append("user_name", name);
//       formData.append("user_email", email);
//       formData.append("phone_number", phoneNumber);
//       formData.append("role", role);
//       if (selectedFile) {
//         formData.append("display_pic", selectedFile);
//       }
//       console.log("formData", formData);

//       const response = await axios.put(
//         `https://zhhwpfhay9.execute-api.us-east-1.amazonaws.com/dev/users/updateuser/${user_id}`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       console.log("Profile updated successfully");
//       console.log(response.data);
//       if (response.data.display_pic) {
//         setDisplayPic(response.data.display_pic);
//       }
//       setSelectedFile(null);

//       // Refresh the user data after update
//       fetchUserProfile();
//     } catch (error) {
//       console.error("Error updating profile:", error);
//     }
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setSelectedFile(null);
//     fetchUserProfile();
//     // Optionally reset the state to original values
//   };

//   return (
//     <div className="profile-card">
//       <div className="profile-pic">
//         <img src={displayPic} alt="" />
//         {isEditing && (
//           <>
//             <input
//               type="file"
//               id="file-input"
//               onChange={handleImageChange}
//               accept="image/*"
//               style={{ display: "none" }}
//             />

//               <label htmlFor="file-input" className="file-input-label"
//               >
//                 +
//               </label>
//             {/* <Tooltip.Provider>
//               <Tooltip.Root>
//                 <Tooltip.Trigger asChild>
//                   <IconButton
                     
//                     radius="half"
//                     className="file-input-label"
//                     onClick={() => document.getElementById('file-input').click()}
//                   >
//                     <PlusIcon />
//                   </IconButton>
//                 </Tooltip.Trigger> */}
//                   {/* </Tooltip.Root>
//             </Tooltip.Provider> */}
//           </>
//         )}
//       </div>
//       <div className="profile-info">
//         <div className="info-item">
//           <label>Name:</label>
//           {isEditing ? (
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//           ) : (
//             <span>{name}</span>
//           )}
//         </div>
//         <div className="info-item">
//           <label>Email:</label>
//           {isEditing ? (
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           ) : (
//             <span>{email}</span>
//           )}
//         </div>
//         <div className="info-item">
//           <label>Phone Number:</label>
//           {isEditing ? (
//             <input
//               type="tel"
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//             />
//           ) : (
//             <span>{phoneNumber}</span>
//           )}
//         </div>
//         <div className="info-item">
//           <label>Role:</label>
//           {isEditing ? (
//             <input
//               type="text"
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//             />
//           ) : (
//             <span>{role}</span>
//           )}
//         </div>
//       </div>
//       <div className="profile-actions">
//         {isEditing ? (
//           <>
//             <Button
//               color="indigo"
//               variant="soft"
//               onClick={handleSave}
//               type="button" // Use "button" instead of "submit" for non-form buttons
//             >
//               Save
//             </Button>
//             <Button
//               color="gray"
//               variant="soft"
//               onClick={handleCancel}
//               type="button" // Use "button" instead of "submit" for non-form buttons
//             >
//               Cancel
//             </Button>
//           </>
//         ) : (
//           <Button
//             color="indigo"
//             variant="soft"
//             onClick={() => setIsEditing(true)}
//             type="button"
//           >
//             Edit Profile
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Editprofile;

import React, { useState, useEffect } from "react";
import "./editprofile.css"; // Import CSS file
import { useSelector } from 'react-redux';
import { IconButton, Button } from "@radix-ui/themes";
import {updateUserProfile, fetchUserProfiles} from "../../services/service.js";

const Editprofile = () => {
  const user_id = useSelector((state) => state.user.user_id);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [displayPic, setDisplayPic] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const data = await fetchUserProfiles(user_id);
      setName(data.user_name || "");
      setEmail(data.user_email || "");
      setPhoneNumber(data.phone_number || "");
      setRole(data.role || "");
      setDisplayPic(data.display_pic || "");
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user_id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDisplayPic(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  const handleSave = async () => {
    setIsEditing(false);
    // Save updated information logic
    try {
      const formData = new FormData();
      formData.append("user_name", name);
      formData.append("user_email", email);
      formData.append("phone_number", phoneNumber);
      formData.append("role", role);
      if (selectedFile) {
        formData.append("display_pic", selectedFile);
      }
      console.log("formData", formData);

      const response = await updateUserProfile(user_id, formData);
      console.log("Profile updated successfully");
      console.log(response.data);
      if (response.data.display_pic) {
        setDisplayPic(response.data.display_pic);
      }
      setSelectedFile(null);

      // Refresh the user data after update
      fetchUserProfile();
      // Close modal and reload page
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    fetchUserProfile();
    // Optionally reset the state to original values
  };

  return (
    <div className="profile-card">
      <div className="profile-pic">
        <img src={displayPic} alt="" />
        {isEditing && (
          <>
            <input
              type="file"
              id="file-input"
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: "none" }}
            />

            <label htmlFor="file-input" className="file-input-label">
              +
            </label>
          </>
        )}
      </div>
      <div className="profile-info">
        <div className="info-item">
          <label>Name:</label>
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            <span>{name}</span>
          )}
        </div>
        <div className="info-item">
          <label>Email:</label>
          {isEditing ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : (
            <span>{email}</span>
          )}
        </div>
        <div className="info-item">
          <label>Phone Number:</label>
          {isEditing ? (
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          ) : (
            <span>{phoneNumber}</span>
          )}
        </div>
        <div className="info-item">
          <label>Role:</label>
          {isEditing ? (
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          ) : (
            <span>{role}</span>
          )}
        </div>
      </div>
      <div className="profile-actions">
        {isEditing ? (
          <>
            <Button
              color="indigo"
              variant="soft"
              onClick={handleSave}
              type="button" // Use "button" instead of "submit" for non-form buttons
            >
              Save
            </Button>
            <Button
              color="gray"
              variant="soft"
              onClick={handleCancel}
              type="button" // Use "button" instead of "submit" for non-form buttons
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            color="indigo"
            variant="soft"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
};

export default Editprofile;
