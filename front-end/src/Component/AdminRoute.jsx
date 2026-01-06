import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { ROLES, isAdmin } from '../constants/roles';

/**
 * AdminRoute - Protects admin routes
 * 
 * Phase 0: Foundation - Uses role constants
 * @see docs/PHASE_0_PLATFORM_SCOPE.md
 */
const AdminRoute = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/" />;
    }

    try {
        const decodedToken = jwtDecode(token);
        const userRoles = decodedToken.roles || [];

        // Phase 0: Use role constants instead of hardcoded strings
        if (isAdmin(userRoles)) {
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