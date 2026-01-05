/**
 * User Role Constants
 * 
 * Phase 0: Foundation - Role definitions for frontend
 * 
 * TripLink defines exactly three roles:
 * - ROLE_USER: Default role for all registered accounts (travelers)
 * - ROLE_AGENT: Professional role (requires application and admin approval)
 * - ROLE_ADMIN: Platform administrators
 * 
 * @see docs/PHASE_0_PLATFORM_SCOPE.md
 */

export const ROLES = {
  USER: 'ROLE_USER',
  AGENT: 'ROLE_AGENT',
  ADMIN: 'ROLE_ADMIN',
};

/**
 * Get role display name
 * 
 * @param {string} role - Role constant
 * @returns {string} Display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.USER]: 'Traveler',
    [ROLES.AGENT]: 'Travel Agent',
    [ROLES.ADMIN]: 'Administrator',
  };
  
  return roleNames[role] || 'Unknown';
};

/**
 * Check if user has a specific role
 * 
 * @param {string[]} userRoles - User's roles array
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export const hasRole = (userRoles, role) => {
  return userRoles && userRoles.includes(role);
};

/**
 * Check if user is admin
 * 
 * @param {string[]} userRoles - User's roles array
 * @returns {boolean}
 */
export const isAdmin = (userRoles) => {
  return hasRole(userRoles, ROLES.ADMIN);
};

/**
 * Check if user is agent
 * 
 * Phase 0: Foundation - Helper for future agent system
 * 
 * @param {string[]} userRoles - User's roles array
 * @returns {boolean}
 */
export const isAgent = (userRoles) => {
  return hasRole(userRoles, ROLES.AGENT);
};

/**
 * Check if user is agent or admin
 * 
 * @param {string[]} userRoles - User's roles array
 * @returns {boolean}
 */
export const isAgentOrAdmin = (userRoles) => {
  return isAgent(userRoles) || isAdmin(userRoles);
};

/**
 * Check if user is regular user (not agent or admin)
 * 
 * @param {string[]} userRoles - User's roles array
 * @returns {boolean}
 */
export const isRegularUser = (userRoles) => {
  return !isAgentOrAdmin(userRoles);
};

