<?php

namespace App\Constants;

/**
 * User Role Constants
 * 
 * Phase 0: Foundation - Role definitions
 * 
 * TripLink defines exactly three roles:
 * - ROLE_USER: Default role for all registered accounts (travelers)
 * - ROLE_AGENT: Professional role (requires application and admin approval)
 * - ROLE_ADMIN: Platform administrators
 * 
 * @see docs/PHASE_0_PLATFORM_SCOPE.md
 */
final class Roles
{
    /**
     * Default role for all registered users (travelers)
     */
    public const USER = 'ROLE_USER';

    /**
     * Professional agent role
     * 
     * Agents must:
     * - Apply through application process
     * - Be approved by admin
     * - Cannot self-assign
     * 
     * @see docs/PHASE_0_AGENT_FOUNDATIONS.md
     */
    public const AGENT = 'ROLE_AGENT';

    /**
     * Platform administrator role
     */
    public const ADMIN = 'ROLE_ADMIN';

    /**
     * Get all valid roles
     * 
     * @return array<string>
     */
    public static function all(): array
    {
        return [
            self::USER,
            self::AGENT,
            self::ADMIN,
        ];
    }

    /**
     * Check if a role is valid
     * 
     * @param string $role
     * @return bool
     */
    public static function isValid(string $role): bool
    {
        return in_array($role, self::all(), true);
    }

    /**
     * Get role display name
     * 
     * @param string $role
     * @return string
     */
    public static function getDisplayName(string $role): string
    {
        return match ($role) {
            self::USER => 'Traveler',
            self::AGENT => 'Travel Agent',
            self::ADMIN => 'Administrator',
            default => 'Unknown',
        };
    }
}

