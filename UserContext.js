import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [mealRefreshCounter, setMealRefreshCounter] = useState(0);

  const triggerMealRefresh = () => {
    setMealRefreshCounter((prev) => prev + 1);
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, mealRefreshCounter, setMealRefreshCounter, triggerMealRefresh}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};