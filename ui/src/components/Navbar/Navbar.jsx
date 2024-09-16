import React, { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import Editprofile from "../Editprofile/Editprofile.jsx";
import { TabNav, Flex, Avatar, Box, Text, DropdownMenu } from "@radix-ui/themes";
import axios from "axios";
import {fetchUserDataService} from "../../services/service.js";
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentPostType } from '../../store/postSlice.js';

const Navbar = ({ onLogout, onPostTypeClick }) => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState(() => {
    return localStorage.getItem('activeComponent') || "cheers";
  });
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user_id = useSelector((state) => state.user.user_id);
  const dispatch = useDispatch();
  const toggleProfile = () => {
    setProfileOpen(!isProfileOpen);
  };

  const handlePostTypeClick = (postType) => {
    onPostTypeClick(postType);
    setActiveComponent(postType);
    dispatch(setCurrentPostType(postType));
    localStorage.setItem('activeComponent', postType);
  };

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
    // Set active component from localStorage on initial render
    const savedComponent = localStorage.getItem('activeComponent');
    if (savedComponent) {
      handlePostTypeClick(savedComponent);
    } else {
      handlePostTypeClick("cheers");
    }
  }, [user_id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!userData) return <div>No user data available</div>;

  const getUserInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "";
  };

  return (
    <>
      <nav className={styles.navbar}>
        {/* <div className={styles["navbar-logo"]}>MontyVoice</div> */}
         
        <div className={styles["navbar-logo"]}>
          <span style={{ color: 'rgb(37, 99, 235)' }}>Monty</span>
          <span style={{ color: 'orange' }}>Voice</span>
        </div>
 
         
        <TabNav.Root size="2" className={styles["navbar-buttons"]} color="indigo">
          <TabNav.Link
            href="#"
            className={styles["navbar-button"]}
            active={activeComponent === "cheers"}
            onClick={() => handlePostTypeClick("cheers")}
          >
            Honorwall
          </TabNav.Link>
          <TabNav.Link
            href="#"
            className={styles["navbar-button"]}
            active={activeComponent === "feedback"}
            onClick={() => handlePostTypeClick("feedback")}
          >
            Feedback
          </TabNav.Link>
          <TabNav.Link
            href="#"
            className={styles["navbar-button"]}
            active={activeComponent === "suggestion"}
            onClick={() => handlePostTypeClick("suggestion")}
          >
            Suggestion
          </TabNav.Link>
        </TabNav.Root>
        <Flex gap="3" align="center">
          <Avatar
            size="3"
            src={userData.display_pic}
            radius="full"
            fallback={getUserInitial(userData.user_name)}
          />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Flex align="center" gap="3" style={{ cursor: 'pointer' }}>
                <Box>
                  <Text as="div" size="2" color="indigo">
                    {userData.user_name}
                  </Text>
                  <Text as="div" size="2" color="gray">
                    {userData.role}
                  </Text>
                </Box>
                <DropdownMenu.TriggerIcon color="gray" />
              </Flex>
              
            </DropdownMenu.Trigger>
            <DropdownMenu.Content 
              variant="solid" 
              color="indigo" 
              className={`Dropdown ${styles.customDropdownContent}`}
            >
              <DropdownMenu.Item 
                onClick={toggleProfile}
                className={styles.customDropdownItem}
              >
                My Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                onClick={onLogout}
                className={styles.customDropdownItem}
              >
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </nav>

      {isProfileOpen && (
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <span className={styles.close} onClick={toggleProfile}>
              &times;
            </span>
            <Editprofile />
          </div>
        </div>
      )}

      {/* Render components based on active tab */}
      {activeComponent === "cheers" && <div></div>}
      {activeComponent === "feedback" && <div></div>}
      {activeComponent === "suggestion" && <div></div>}
    </>
  );
};

export default Navbar;






 






 



 

 


