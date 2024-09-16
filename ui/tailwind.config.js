/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/App.jsx",
    "./src/components/login-signup/Login.jsx",
    "./src/components/Feedpost/Feedpost.jsx",
    "./src/components/Editprofile/Editprofile.jsx"

  ],
  theme: {
    extend: {backgroundImage: {
      'Backgnd': "url('../public/Backgnd.jpg')",
    }},
  },
  plugins: [],
};
