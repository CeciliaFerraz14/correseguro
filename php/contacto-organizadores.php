<?php
// ========================================
// CONTACTO ORGANIZADORES - ENVÍO DE EMAIL
// ========================================

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';
require 'config.php';
require 'csrf.php';

error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

// ========================================
// HELPERS
// ========================================
function cleanStr(string $value, int $maxLen = 200): string {
    return mb_substr(trim(strip_tags($value)), 0, $maxLen, 'UTF-8');
}

function validarEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validarTelefono(string $tel): bool {
    return (bool) preg_match('/^[6789]\d{8}$/', $tel);
}

// ========================================
// VERIFICAR MÉTODO Y DATOS POST
// ========================================
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_POST)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Solicitud no válida']);
    exit;
}

// ========================================
// VERIFICAR CSRF
// ========================================
$csrfToken = cleanStr($_POST['csrf_token'] ?? '', 128);
if (!csrfVerify($csrfToken)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Token de seguridad inválido. Recarga la página e inténtalo de nuevo.']);
    exit;
}

// ========================================
// RECOGER Y SANITIZAR DATOS
// ========================================
$datos = [
    'nombre'       => cleanStr($_POST['nombre'] ?? '', 100),
    'email'        => cleanStr($_POST['email'] ?? '', 150),
    'telefono'     => cleanStr($_POST['telefono'] ?? '', 15),
    'empresa'      => cleanStr($_POST['empresa'] ?? '', 150),
    'tipo_evento'  => cleanStr($_POST['tipo_evento'] ?? '', 100),
    'fecha_evento' => cleanStr($_POST['fecha_evento'] ?? '', 10),
    'participantes'=> cleanStr($_POST['participantes'] ?? '', 20),
    'mensaje'      => cleanStr($_POST['mensaje'] ?? '', 1000),
];

// ========================================
// VALIDAR CAMPOS
// ========================================
$errores = [];

if (empty($datos['nombre']))     $errores[] = 'Nombre requerido';
if (empty($datos['tipo_evento'])) $errores[] = 'Tipo de evento requerido';

if (!validarEmail($datos['email'])) {
    $errores[] = 'Email no válido';
}

if (!empty($datos['telefono']) && !validarTelefono($datos['telefono'])) {
    $errores[] = 'Teléfono no válido (formato español de 9 dígitos)';
}

if (!empty($errores)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode('. ', $errores)]);
    exit;
}

// ========================================
// CONFIGURACIÓN SMTP
// ========================================
function crearMailer(): PHPMailer {
    $m = new PHPMailer(true);
    $m->isSMTP();
    $m->Host       = env('MAIL_HOST', 'smtp.gmail.com');
    $m->SMTPAuth   = true;
    $m->Username   = env('MAIL_USERNAME');
    $m->Password   = env('MAIL_PASSWORD');
    $m->SMTPSecure = env('MAIL_SECURE', 'tls');
    $m->Port       = (int) env('MAIL_PORT', '587');
    $m->CharSet    = 'UTF-8';
    $m->Encoding   = 'base64';
    $m->setFrom(env('MAIL_FROM'), env('MAIL_FROM_NAME', 'CorreSeguro'));
    return $m;
}

$email_enviado = false;

try {
    // Email a la empresa
    $mail = crearMailer();
    $mail->addAddress(env('MAIL_TO_INTERNAL', 'soporteit@belsue.es'), 'CorreSeguro Organizadores');
    $mail->addReplyTo($datos['email'], $datos['nombre']);

    $mail->isHTML(true);
    $mail->Subject = '📋 Nueva solicitud de organizador - ' . htmlspecialchars($datos['nombre']);
    $mail->Body = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
            .header { background: linear-gradient(135deg, #8A0C3C, #5A0828); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 25px; background: #f9f9f9; }
            .data-table { width: 100%; border-collapse: collapse; margin: 15px 0; background: white; border-radius: 8px; overflow: hidden; }
            .data-table td { padding: 10px 15px; border-bottom: 1px solid #eee; }
            .data-table td:first-child { font-weight: bold; color: #8A0C3C; width: 40%; }
            .mensaje-box { background: white; padding: 15px; border-left: 4px solid #8A0C3C; border-radius: 5px; margin-top: 15px; }
            .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🏃 Nueva Solicitud de Organizador</h2>
                <p>Recibida el ' . date('d/m/Y H:i') . '</p>
            </div>
            <div class="content">
                <table class="data-table">
                    <tr><td>Nombre</td><td>' . htmlspecialchars($datos['nombre']) . '</td></tr>
                    <tr><td>Email</td><td>' . htmlspecialchars($datos['email']) . '</td></tr>
                    <tr><td>Teléfono</td><td>' . htmlspecialchars($datos['telefono']) . '</td></tr>
                    <tr><td>Organización</td><td>' . htmlspecialchars($datos['empresa'] ?: '—') . '</td></tr>
                    <tr><td>Tipo de evento</td><td>' . htmlspecialchars($datos['tipo_evento']) . '</td></tr>
                    <tr><td>Fecha del evento</td><td>' . htmlspecialchars($datos['fecha_evento'] ?: '—') . '</td></tr>
                    <tr><td>Participantes</td><td>' . htmlspecialchars($datos['participantes'] ?: '—') . '</td></tr>
                </table>
                ' . (!empty($datos['mensaje']) ? '
                <div class="mensaje-box">
                    <strong>Mensaje:</strong><br>
                    ' . nl2br(htmlspecialchars($datos['mensaje'])) . '
                </div>' : '') . '
            </div>
            <div class="footer">
                <p>CorreSeguro - Panel de gestión de solicitudes</p>
            </div>
        </div>
    </body>
    </html>
    ';
    $mail->AltBody = "Nueva solicitud de organizador\n\nNombre: {$datos['nombre']}\nEmail: {$datos['email']}\nTeléfono: {$datos['telefono']}\nOrganización: {$datos['empresa']}\nEvento: {$datos['tipo_evento']}\nFecha: {$datos['fecha_evento']}\nParticipantes: {$datos['participantes']}\nMensaje: {$datos['mensaje']}";

    $mail->send();

    // Email de confirmación al organizador
    $mail2 = crearMailer();
    $mail2->addAddress($datos['email'], $datos['nombre']);
    $mail2->addReplyTo(env('MAIL_TO_INTERNAL', 'soporteit@belsue.es'), 'CorreSeguro Soporte');

    $mail2->isHTML(true);
    $mail2->Subject = '✅ Solicitud recibida - CorreSeguro Organizadores';
    $mail2->Body = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
            .header { background: linear-gradient(135deg, #8A0C3C, #5A0828); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏃 ¡Solicitud Recibida!</h1>
                <p>Gracias por contactar con CorreSeguro</p>
            </div>
            <div class="content">
                <p>Hola <strong>' . htmlspecialchars($datos['nombre']) . '</strong>,</p>
                <p>Hemos recibido tu solicitud de información para el evento <strong>' . htmlspecialchars($datos['tipo_evento']) . '</strong>.</p>
                <p>Nuestro equipo especializado en seguros para eventos deportivos se pondrá en contacto contigo en <strong>menos de 24 horas laborables</strong>.</p>
                <p style="margin-top: 25px;">
                    <strong>¿Necesitas atención urgente?</strong><br>
                    📞 976 221 423 &nbsp;|&nbsp; 📧 soporteit@belsue.es
                </p>
            </div>
            <div class="footer">
                <p>CorreSeguro - Seguro especializado para eventos deportivos</p>
                <p>Este email fue generado automáticamente</p>
            </div>
        </div>
    </body>
    </html>
    ';
    $mail2->AltBody = "Hola {$datos['nombre']}, hemos recibido tu solicitud para el evento {$datos['tipo_evento']}. Te contactaremos en menos de 24 horas. Gracias por confiar en CorreSeguro.";
    $mail2->send();

    $email_enviado = true;

} catch (Exception $e) {
    error_log('Error email organizador: ' . (isset($mail) ? $mail->ErrorInfo : $e->getMessage()));
}

// ========================================
// RESPUESTA FINAL
// ========================================
if ($email_enviado) {
    echo json_encode(['success' => true, 'message' => 'Solicitud enviada correctamente']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al enviar la solicitud. Por favor, inténtalo de nuevo o contacta directamente en soporteit@belsue.es']);
}
