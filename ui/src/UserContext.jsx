import React from "react";

const UserContext = React.createContext({ user_id: null, user_email: "", usertoken: "" });

export const UserProvider = UserContext.Provider;
export const useUser = () => React.useContext(UserContext);
