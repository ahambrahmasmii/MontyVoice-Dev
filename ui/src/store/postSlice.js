import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
  currentPostType: "cheers",
};

export const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex(
        (post) => post.post_id === action.payload.post_id
      );
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    setCurrentPostType: (state, action) => {
      state.currentPostType = action.payload;
    },
  },
});

export const { setPosts, addPost, updatePost, setCurrentPostType } =
  postSlice.actions;

export default postSlice.reducer;
