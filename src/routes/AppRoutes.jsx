import React from 'react'
import Login from '../pages/Login';
import Home from '../pages/Home';
import UploadFiles from '../pages/UploadFiles';

const AppRoutes = {
    authRoutes: [
        { path: '/login', element: <Login /> },
    ],
    mainRoutes: [
        { path: '/', element: <Home /> },
        { path: '/upload-files', element: <UploadFiles /> },

    ],
};

export default AppRoutes
