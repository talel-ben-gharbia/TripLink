<?php
/**
 * Router script for PHP built-in server
 * This handles routing for the built-in PHP server
 */

// Serve static files directly
if (php_sapi_name() === 'cli-server') {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $file = __DIR__ . $path;
    
    // If it's a file and exists, serve it
    if (is_file($file)) {
        return false;
    }
}

// Otherwise, route to index.php
require __DIR__ . '/index.php';
