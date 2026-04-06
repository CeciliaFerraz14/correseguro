<?php
/**
 * Gestión de tokens CSRF (Cross-Site Request Forgery).
 * - csrfGenerate(): obtiene/crea el token de sesión actual.
 * - csrfVerify($token): comprueba el token de forma segura (timing-safe).
 *
 * Si se llama directamente via AJAX, devuelve el token como JSON.
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function csrfGenerate(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrfVerify(string $token): bool {
    return !empty($token)
        && !empty($_SESSION['csrf_token'])
        && hash_equals($_SESSION['csrf_token'], $token);
}

// Endpoint AJAX: devuelve el token (GET /php/csrf.php)
if (realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    echo json_encode(['token' => csrfGenerate()]);
    exit;
}
