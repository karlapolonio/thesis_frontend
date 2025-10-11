import { createContext, useContext, useState } from "react";
import Constants from "expo-constants";

const { API_KEY, BACKEND_URL } = Constants.expoConfig.extra;

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [mealRefreshCounter, setMealRefreshCounter] = useState(0);

  const triggerMealRefresh = () => {
    setMealRefreshCounter((prev) => prev + 1);
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, mealRefreshCounter, setMealRefreshCounter, 
                                    triggerMealRefresh, API_KEY, BACKEND_URL}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};