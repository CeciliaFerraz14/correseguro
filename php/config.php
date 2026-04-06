<?php
/**
 * Carga las variables de entorno desde el archivo .env del proyecto.
 * Llamar este archivo una sola vez al inicio de cada script PHP.
 */
function loadEnv(string $path): void {
    if (!is_readable($path)) {
        return;
    }
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue;
        }
        $pos = strpos($line, '=');
        if ($pos === false) {
            continue;
        }
        $key   = trim(substr($line, 0, $pos));
        $value = trim(substr($line, $pos + 1), " \t\"'");
        if (!isset($_ENV[$key])) {
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

/**
 * Devuelve el valor de una variable de entorno.
 */
function env(string $key, string $default = ''): string {
    $val = $_ENV[$key] ?? getenv($key);
    return ($val !== false && $val !== '') ? (string) $val : $default;
}

loadEnv(dirname(__DIR__) . '/.env');
