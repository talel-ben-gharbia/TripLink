<?php

namespace App\Service;

/**
 * Service for validating user input data
 */
class ValidationService
{
    /**
     * Validate email address
     *
     * @param string $email Email to validate
     * @return array ['valid' => bool, 'errors' => string[]]
     */
    public function validateEmail(string $email): array
    {
        $errors = [];

        if (empty($email)) {
            $errors[] = 'Email is required';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Please enter a valid email address';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Validate password strength
     *
     * @param string $password Password to validate
     * @return array ['valid' => bool, 'errors' => string[]]
     */
    public function validatePassword(string $password): array
    {
        $errors = [];

        if (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters';
        }

        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }

        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }

        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Validate phone number
     *
     * @param string $phone Phone number to validate
     * @return array ['valid' => bool, 'errors' => string[]]
     */
    public function validatePhone(string $phone): array
    {
        $errors = [];

        if (empty($phone)) {
            $errors[] = 'Phone number is required';
        } elseif (strlen($phone) < 8 || strlen($phone) > 15) {
            $errors[] = 'Phone number must be between 8 and 15 digits';
        } elseif (!preg_match('/^[0-9]+$/', $phone)) {
            $errors[] = 'Phone number must contain only digits';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Validate travel preferences
     *
     * @param array|null $travelStyles Travel styles array
     * @param array|null $interests Interests array
     * @return array ['valid' => bool, 'errors' => string[]]
     */
    public function validateTravelPreferences(?array $travelStyles, ?array $interests): array
    {
        $errors = [];

        if ($travelStyles !== null && !is_array($travelStyles)) {
            $errors[] = 'Travel styles must be an array';
        }

        if ($interests !== null && !is_array($interests)) {
            $errors[] = 'Interests must be an array';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Sanitize input string
     *
     * @param string $input Input to sanitize
     * @return string Sanitized string
     */
    public function sanitizeInput(string $input): string
    {
        return trim(htmlspecialchars(strip_tags($input), ENT_QUOTES, 'UTF-8'));
    }

    /**
     * Validate name (first or last)
     *
     * @param string $name Name to validate
     * @param string $fieldName Field name for error messages
     * @return array ['valid' => bool, 'errors' => string[]]
     */
    public function validateName(string $name, string $fieldName = 'Name'): array
    {
        $errors = [];

        if (empty($name)) {
            $errors[] = "{$fieldName} is required";
        } elseif (strlen($name) < 2) {
            $errors[] = "{$fieldName} must be at least 2 characters";
        } elseif (strlen($name) > 255) {
            $errors[] = "{$fieldName} must be less than 255 characters";
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
}

