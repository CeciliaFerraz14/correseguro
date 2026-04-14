<?php
// ========================================
// ENVIAR FORMULARIO + EMAIL DE CONFIRMACIÓN
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
// HELPERS DE SANITIZACIÓN Y VALIDACIÓN
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

function validarFecha(string $fecha): bool {
    $d = DateTime::createFromFormat('Y-m-d', $fecha);
    return $d && $d->format('Y-m-d') === $fecha;
}

function validarCP(string $cp): bool {
    return (bool) preg_match('/^\d{5}$/', $cp);
}

function calcularEdad(string $fechaNac): int {
    $d = DateTime::createFromFormat('Y-m-d', $fechaNac);
    if (!$d) return 0;
    return (int) $d->diff(new DateTime())->y;
}

// ========================================
// VERIFICAR MÉTODO
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
    'tipo_documento'      => cleanStr($_POST['tipo_documento'] ?? '', 20),
    'nif'                 => cleanStr($_POST['nif'] ?? '', 20),
    'sexo'                => cleanStr($_POST['sexo'] ?? '', 20),
    'nombre'              => cleanStr($_POST['nombre'] ?? '', 100),
    'apellido1'           => cleanStr($_POST['apellido1'] ?? '', 100),
    'apellido2'           => cleanStr($_POST['apellido2'] ?? '', 100),
    'fecha_nacimiento'    => cleanStr($_POST['fecha_nacimiento'] ?? '', 10),
    'profesion'           => cleanStr($_POST['profesion'] ?? '', 150),
    'email'               => cleanStr($_POST['email'] ?? '', 150),
    'telefono'            => cleanStr($_POST['telefono'] ?? '', 15),
    'tipo_via'            => cleanStr($_POST['tipo_via'] ?? '', 50),
    'calle'               => cleanStr($_POST['calle'] ?? '', 200),
    'numero'              => cleanStr($_POST['numero'] ?? '', 10),
    'piso'                => cleanStr($_POST['piso'] ?? '', 20),
    'cp'                  => cleanStr($_POST['cp'] ?? '', 5),
    'municipio'           => cleanStr($_POST['municipio'] ?? '', 100),
    'provincia'           => cleanStr($_POST['provincia'] ?? '', 100),
    'beneficiarios'       => cleanStr($_POST['beneficiarios'] ?? '', 50),
    'beneficiarios_texto' => cleanStr($_POST['beneficiarios_texto'] ?? '', 500),
    'frecuencia_pago'     => cleanStr($_POST['frecuencia_pago'] ?? '', 20),
    'tipo_renovacion'     => cleanStr($_POST['tipo_renovacion'] ?? '', 20),
    'iban_pais'           => strtoupper(cleanStr($_POST['iban_pais'] ?? '', 2)),
    'iban_dc'             => cleanStr($_POST['iban_dc'] ?? '', 2),
    'iban_entidad'        => cleanStr($_POST['iban_entidad'] ?? '', 4),
    'iban_sucursal'       => cleanStr($_POST['iban_sucursal'] ?? '', 4),
    'iban_dc_cuenta'      => cleanStr($_POST['iban_dc_cuenta'] ?? '', 2),
    'iban_cuenta'         => cleanStr($_POST['iban_cuenta'] ?? '', 10),
    'influencer'          => cleanStr($_POST['influencer'] ?? '', 50),
];

// ========================================
// VALIDAR CAMPOS
// ========================================
$errores = [];

if (empty($datos['nif']))      $errores[] = 'NIF/NIE requerido';
if (empty($datos['nombre']))   $errores[] = 'Nombre requerido';
if (empty($datos['apellido1'])) $errores[] = 'Primer apellido requerido';

if (!validarEmail($datos['email'])) {
    $errores[] = 'Email no válido';
}

if (!empty($datos['telefono']) && !validarTelefono($datos['telefono'])) {
    $errores[] = 'Teléfono no válido (formato español de 9 dígitos)';
}

if (!empty($datos['fecha_nacimiento'])) {
    if (!validarFecha($datos['fecha_nacimiento'])) {
        $errores[] = 'Fecha de nacimiento no válida';
    } else {
        $edad = calcularEdad($datos['fecha_nacimiento']);
        if ($edad < 14 || $edad > 70) {
            $errores[] = 'La edad debe estar entre 14 y 70 años para contratar este seguro';
        }
    }
}

if (!empty($datos['cp']) && !validarCP($datos['cp'])) {
    $errores[] = 'Código postal no válido (5 dígitos)';
}

if (!empty($errores)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode('. ', $errores)]);
    exit;
}

// ========================================
// DATOS DERIVADOS
// ========================================
$fechaInicio      = date('Y-m-d');
$fechaVencimiento = date('Y-m-d', strtotime('+1 year'));
$iban_completo    = $datos['iban_pais'] . $datos['iban_dc'] . ' '
                  . $datos['iban_entidad'] . ' ' . $datos['iban_sucursal'] . ' '
                  . $datos['iban_dc_cuenta'] . ' ' . $datos['iban_cuenta'];

// ========================================
// CONFIGURACIÓN SMTP COMPARTIDA
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

$email_interno_ok = false;

// ========================================
// PROCESAR ARCHIVOS DNI ADJUNTOS
// ========================================
$archivos_dni = [];
$tipos_permitidos = ['image/jpeg', 'image/png', 'application/pdf'];
$max_size = 5 * 1024 * 1024; // 5 MB

foreach (['dni_front' => 'DNI_anverso', 'dni_back' => 'DNI_reverso'] as $campo => $etiqueta) {
    if (!isset($_FILES[$campo]) || $_FILES[$campo]['error'] === UPLOAD_ERR_NO_FILE) {
        continue;
    }
    if ($_FILES[$campo]['error'] !== UPLOAD_ERR_OK) {
        continue;
    }
    if ($_FILES[$campo]['size'] > $max_size) {
        continue;
    }
    $tipo_real = mime_content_type($_FILES[$campo]['tmp_name']);
    if (!in_array($tipo_real, $tipos_permitidos, true)) {
        continue;
    }
    $ext = pathinfo($_FILES[$campo]['name'], PATHINFO_EXTENSION);
    $ext = preg_replace('/[^a-zA-Z0-9]/', '', $ext);
    $archivos_dni[] = [
        'tmp'      => $_FILES[$campo]['tmp_name'],
        'nombre'   => $etiqueta . '_' . preg_replace('/[^A-Za-z0-9_\-]/', '', $datos['nif']) . '.' . $ext,
    ];
}

// ========================================
// EMAIL INTERNO - TODOS LOS DATOS
// ========================================
try {
    $mail = crearMailer();
    $mail->addAddress(env('MAIL_TO_INTERNAL', 'soporteit@belsue.es'), 'CorreSeguro Gestión');
    $mail->addReplyTo($datos['email'], $datos['nombre']);

    $mail->isHTML(true);
    $influencerTag = $datos['influencer'] ? ' [' . strtoupper(htmlspecialchars($datos['influencer'])) . ']' : '';
    $mail->Subject = 'Nueva contratación - ' . htmlspecialchars($datos['nombre']) . ' ' . htmlspecialchars($datos['apellido1']) . ' (' . htmlspecialchars($datos['nif']) . ')' . $influencerTag;
    $mail->Body = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
            .header { background: linear-gradient(135deg, #8A0C3C, #5A0828); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 25px; background: #f9f9f9; }
            h4 { color: #8A0C3C; margin: 20px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
            td { padding: 9px 14px; border-bottom: 1px solid #eee; font-size: 0.93rem; }
            td:first-child { font-weight: bold; color: #555; width: 38%; }
            .footer { text-align: center; padding: 15px; color: #999; font-size: 11px; }
        </style>
    </head>
    <body>
    <div class="container">
        <div class="header">
            <h2>Nueva Contratación de Seguro Runner</h2>
            <p>Recibida el ' . date('d/m/Y \a \l\a\s H:i') . '</p>
        </div>
        <div class="content">
            <h4>Datos personales</h4>
            <table>
                <tr><td>Tipo documento</td><td>' . htmlspecialchars($datos['tipo_documento']) . '</td></tr>
                <tr><td>Número documento</td><td>' . htmlspecialchars($datos['nif']) . '</td></tr>
                <tr><td>Sexo</td><td>' . htmlspecialchars($datos['sexo']) . '</td></tr>
                <tr><td>Nombre</td><td>' . htmlspecialchars($datos['nombre']) . ' ' . htmlspecialchars($datos['apellido1']) . ' ' . htmlspecialchars($datos['apellido2']) . '</td></tr>
                <tr><td>Fecha nacimiento</td><td>' . htmlspecialchars($datos['fecha_nacimiento']) . '</td></tr>
                <tr><td>Profesión</td><td>' . htmlspecialchars($datos['profesion']) . '</td></tr>
            </table>
            <h4>Contacto</h4>
            <table>
                <tr><td>Email</td><td>' . htmlspecialchars($datos['email']) . '</td></tr>
                <tr><td>Teléfono</td><td>' . htmlspecialchars($datos['telefono']) . '</td></tr>
            </table>
            <h4>Dirección</h4>
            <table>
                <tr><td>Tipo de vía</td><td>' . htmlspecialchars($datos['tipo_via']) . '</td></tr>
                <tr><td>Calle</td><td>' . htmlspecialchars($datos['calle']) . ', ' . htmlspecialchars($datos['numero']) . ($datos['piso'] ? ' - ' . htmlspecialchars($datos['piso']) : '') . '</td></tr>
                <tr><td>Municipio</td><td>' . htmlspecialchars($datos['municipio']) . ' (' . htmlspecialchars($datos['cp']) . ')</td></tr>
                <tr><td>Provincia</td><td>' . htmlspecialchars($datos['provincia']) . '</td></tr>
            </table>
            <h4>Beneficiarios</h4>
            <table>
                <tr><td>Opción</td><td>' . htmlspecialchars($datos['beneficiarios']) . '</td></tr>
                <tr><td>Detalle</td><td>' . htmlspecialchars($datos['beneficiarios_texto'] ?: '—') . '</td></tr>
            </table>
            <h4>Póliza</h4>
            <table>
                <tr><td>Producto</td><td>ACCIDENTES_DEPORTIVOS</td></tr>
                <tr><td>Prima</td><td>59,90 €</td></tr>
                <tr><td>Frecuencia pago</td><td>' . htmlspecialchars($datos['frecuencia_pago']) . '</td></tr>
                <tr><td>Tipo renovación</td><td>' . htmlspecialchars($datos['tipo_renovacion']) . '</td></tr>
                <tr><td>Fecha inicio</td><td>' . $fechaInicio . '</td></tr>
                <tr><td>Fecha vencimiento</td><td>' . $fechaVencimiento . '</td></tr>
            </table>
            <h4>Datos bancarios</h4>
            <table>
                <tr><td>IBAN</td><td>' . htmlspecialchars($iban_completo) . '</td></tr>
            </table>
        </div>
        <div class="footer">
            <p>CorreSeguro · Este email contiene todos los datos necesarios para procesar la póliza</p>
        </div>
    </div>
    </body>
    </html>
    ';
    $mail->AltBody = 'Nueva contratación de ' . $datos['nombre'] . ' ' . $datos['apellido1'] . ' - NIF: ' . $datos['nif'];

    foreach ($archivos_dni as $archivo) {
        $mail->addAttachment($archivo['tmp'], $archivo['nombre']);
    }

    $mail->send();
    $email_interno_ok = true;

} catch (Exception $e) {
    error_log('Error email interno contratación: ' . (isset($mail) ? $mail->ErrorInfo : $e->getMessage()));
}

// ========================================
// EMAIL DE CONFIRMACIÓN AL CLIENTE
// ========================================
try {
    $mail2 = crearMailer();
    $mail2->addAddress($datos['email'], $datos['nombre']);
    $mail2->addReplyTo(env('MAIL_TO_INTERNAL', 'soporteit@belsue.es'), 'CorreSeguro Soporte');

    $mail2->isHTML(true);
    $mail2->Subject = 'Confirmación de Solicitud - CorreSeguro Runner';
    $mail2->Body = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
            .header { background: linear-gradient(135deg, #8A0C3C, #5A0828); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: #f9f9f9; }
            .data-box { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #8A0C3C; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>¡Solicitud Recibida!</h1>
                <p>Gracias por confiar en CorreSeguro</p>
            </div>
            <div class="content">
                <p>Hola <strong>' . htmlspecialchars($datos['nombre']) . '</strong>,</p>
                <p>Hemos recibido correctamente tu solicitud de seguro para runners.</p>
                <div class="data-box">
                    <h3>Resumen de tu solicitud:</h3>
                    <p><strong>Nombre:</strong> ' . htmlspecialchars($datos['nombre']) . ' ' . htmlspecialchars($datos['apellido1']) . '</p>
                    <p><strong>Email:</strong> ' . htmlspecialchars($datos['email']) . '</p>
                    <p><strong>Teléfono:</strong> ' . htmlspecialchars($datos['telefono']) . '</p>
                    <p><strong>NIF:</strong> ' . htmlspecialchars($datos['nif']) . '</p>
                </div>
                <p><strong>Próximos pasos:</strong></p>
                <ol>
                    <li>Revisaremos tus datos (menos de 24h laborables)</li>
                    <li>Te enviaremos la póliza definitiva a este email</li>
                    <li>Podrás descargar tu certificado desde nuestra web</li>
                </ol>
                <p style="margin-top: 30px;">
                    <strong>¿Tienes dudas?</strong><br>
                    soporteit@belsue.es | 976 221 423
                </p>
            </div>
            <div class="footer">
                <p>CorreSeguro - Seguro especializado para runners</p>
                <p>Este email fue generado automáticamente</p>
            </div>
        </div>
    </body>
    </html>
    ';
    $mail2->AltBody = 'Hola ' . $datos['nombre'] . ', hemos recibido tu solicitud de seguro runner. Te contactaremos en menos de 24 horas. Gracias por confiar en CorreSeguro.';

    $mail2->send();

} catch (Exception $e) {
    error_log('Error email confirmación cliente: ' . (isset($mail2) ? $mail2->ErrorInfo : $e->getMessage()));
}

// ========================================
// RESPUESTA FINAL
// ========================================
if ($email_interno_ok) {
    echo json_encode([
        'success'  => true,
        'message'  => 'Solicitud enviada correctamente',
        'redirect' => 'gracias.html',
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'No se pudo enviar la solicitud. Por favor, inténtalo de nuevo o contacta con nosotros en soporteit@belsue.es']);
}
