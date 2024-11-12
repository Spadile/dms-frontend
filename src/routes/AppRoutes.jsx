import React from 'react'
import Login from '../pages/Login';
import Home from '../pages/Home';

const AppRoutes = {
    authRoutes: [
        { path: '/login', element: <Login /> },
    ],
    mainRoutes: [
        { path: '/', element: <Home /> },
    ],
};

export default AppRoutes
