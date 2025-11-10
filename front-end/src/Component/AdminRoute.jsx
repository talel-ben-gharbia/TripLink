import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const AdminRoute = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/" />;
    }

    try {
        const decodedToken = jwtDecode(token);
        const userRoles = decodedToken.roles || [];

        if (userRoles.includes('ROLE_ADMIN')) {
            return <Outlet />;
        } else {
            return <Navigate to="/" />;
        }
    } catch (error) {
        console.error("Invalid token:", error);
        return <Navigate to="/" />;
    }
};

export default AdminRoute;