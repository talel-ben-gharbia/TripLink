/**
 * Agent Application State Constants
 * 
 * Phase 0: Foundation - Agent application lifecycle states
 * 
 * These states define the lifecycle of an agent application from draft to approval/rejection.
 * 
 * State Machine:
 * - Draft → Submitted → Under Review → Approved / Rejected
 * - Approved → Suspended / Revoked
 * - Rejected / Revoked → Draft (re-apply)
 * 
 * @see docs/PHASE_0_AGENT_FOUNDATIONS.md
 */

export const AGENT_APPLICATION_STATE = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  REVOKED: 'REVOKED',
};

/**
 * Get state display name
 * 
 * @param {string} state - State constant
 * @returns {string} Display name
 */
export const getStateDisplayName = (state) => {
  const stateNames = {
    [AGENT_APPLICATION_STATE.DRAFT]: 'Draft',
    [AGENT_APPLICATION_STATE.SUBMITTED]: 'Submitted',
    [AGENT_APPLICATION_STATE.UNDER_REVIEW]: 'Under Review',
    [AGENT_APPLICATION_STATE.APPROVED]: 'Approved',
    [AGENT_APPLICATION_STATE.REJECTED]: 'Rejected',
    [AGENT_APPLICATION_STATE.SUSPENDED]: 'Suspended',
    [AGENT_APPLICATION_STATE.REVOKED]: 'Revoked',
  };
  
  return stateNames[state] || 'Unknown';
};

/**
 * Get state color for UI display
 * 
 * @param {string} state - State constant
 * @returns {string} Color class or hex
 */
export const getStateColor = (state) => {
  const stateColors = {
    [AGENT_APPLICATION_STATE.DRAFT]: 'gray',
    [AGENT_APPLICATION_STATE.SUBMITTED]: 'blue',
    [AGENT_APPLICATION_STATE.UNDER_REVIEW]: 'yellow',
    [AGENT_APPLICATION_STATE.APPROVED]: 'green',
    [AGENT_APPLICATION_STATE.REJECTED]: 'red',
    [AGENT_APPLICATION_STATE.SUSPENDED]: 'orange',
    [AGENT_APPLICATION_STATE.REVOKED]: 'red',
  };
  
  return stateColors[state] || 'gray';
};

/**
 * Check if state allows re-application
 * 
 * @param {string} state - State constant
 * @returns {boolean}
 */
export const canReapply = (state) => {
  return state === AGENT_APPLICATION_STATE.REJECTED || 
         state === AGENT_APPLICATION_STATE.REVOKED;
};

/**
 * Check if state is final (no further transitions)
 * 
 * @param {string} state - State constant
 * @returns {boolean}
 */
export const isFinalState = (state) => {
  return state === AGENT_APPLICATION_STATE.APPROVED ||
         state === AGENT_APPLICATION_STATE.REJECTED ||
         state === AGENT_APPLICATION_STATE.REVOKED;
};

