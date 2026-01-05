<?php

namespace App\Constants;

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
final class AgentApplicationState
{
    /**
     * User started application but not submitted
     */
    public const DRAFT = 'DRAFT';

    /**
     * Application submitted for review
     */
    public const SUBMITTED = 'SUBMITTED';

    /**
     * Admin is reviewing the application
     */
    public const UNDER_REVIEW = 'UNDER_REVIEW';

    /**
     * Application approved - agent role activated
     */
    public const APPROVED = 'APPROVED';

    /**
     * Application rejected
     */
    public const REJECTED = 'REJECTED';

    /**
     * Agent status suspended (post-approval)
     */
    public const SUSPENDED = 'SUSPENDED';

    /**
     * Agent status revoked (post-approval)
     */
    public const REVOKED = 'REVOKED';

    /**
     * Get all valid states
     * 
     * @return array<string>
     */
    public static function all(): array
    {
        return [
            self::DRAFT,
            self::SUBMITTED,
            self::UNDER_REVIEW,
            self::APPROVED,
            self::REJECTED,
            self::SUSPENDED,
            self::REVOKED,
        ];
    }

    /**
     * Check if a state is valid
     * 
     * @param string $state
     * @return bool
     */
    public static function isValid(string $state): bool
    {
        return in_array($state, self::all(), true);
    }

    /**
     * Get state display name
     * 
     * @param string $state
     * @return string
     */
    public static function getDisplayName(string $state): string
    {
        return match ($state) {
            self::DRAFT => 'Draft',
            self::SUBMITTED => 'Submitted',
            self::UNDER_REVIEW => 'Under Review',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::SUSPENDED => 'Suspended',
            self::REVOKED => 'Revoked',
            default => 'Unknown',
        };
    }

    /**
     * Get allowed transitions from a state
     * 
     * @param string $state
     * @return array<string>
     */
    public static function getAllowedTransitions(string $state): array
    {
        return match ($state) {
            self::DRAFT => [self::SUBMITTED],
            self::SUBMITTED => [self::UNDER_REVIEW],
            self::UNDER_REVIEW => [self::APPROVED, self::REJECTED],
            self::APPROVED => [self::SUSPENDED, self::REVOKED],
            self::SUSPENDED => [self::APPROVED, self::REVOKED],
            self::REJECTED => [self::DRAFT], // Re-apply
            self::REVOKED => [self::DRAFT], // Re-apply
            default => [],
        };
    }

    /**
     * Check if transition is allowed
     * 
     * @param string $fromState
     * @param string $toState
     * @return bool
     */
    public static function isTransitionAllowed(string $fromState, string $toState): bool
    {
        return in_array($toState, self::getAllowedTransitions($fromState), true);
    }
}

