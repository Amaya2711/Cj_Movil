import React, { createContext, useState } from 'react';


export const UserContext = createContext({
  cuadrilla: null,
  idusuario: null,
  nombreEmpleado: null,
  ipLocal: null,
  networkType: null,
  setUserData: () => {},
});


export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    cuadrilla: null,
    idusuario: null,
    nombreEmpleado: null,
    ipLocal: null,
    networkType: null,
  });

  return (
    <UserContext.Provider value={{ ...userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};
