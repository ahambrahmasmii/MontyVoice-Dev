// src/redux/slices/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user_id: null,
  user_email: "",
  usertoken: "",
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user_id = action.payload.user_id;
      state.user_email = action.payload.user_email;
      state.usertoken = action.payload.usertoken;
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      state.user_id = null;
      state.user_email = "";
      state.usertoken = "";
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
