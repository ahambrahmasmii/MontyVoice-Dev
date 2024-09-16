import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice.js";
import postReducer from "./postSlice.js";

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
  },
});
