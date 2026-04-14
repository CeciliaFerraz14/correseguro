// ========================================
// FORMULARIO MULTI-PASO
// ========================================

let pasoActual = 1;
const totalPasos = 7;

// Navegación entre pasos
function nextStep(paso) {
    if (!validarPaso(paso)) {
        return;
    }
    
    document.querySelector(`.form-step[data-step="${paso}"]`).style.display = 'none';
    
    const siguientePaso = paso + 1;
    document.querySelector(`.form-step[data-step="${siguientePaso}"]`).style.display = 'block';
    
    actualizarProgreso(siguientePaso);
    pasoActual = siguientePaso;
    
    document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
}

function prevStep(paso) {
    document.querySelector(`.form-step[data-step="${paso}"]`).style.display = 'none';
    
    const pasoAnterior = paso - 1;
    document.querySelector(`.form-step[data-step="${pasoAnterior}"]`).style.display = 'block';
    
    actualizarProgreso(pasoAnterior);
    pasoActual = pasoAnterior;
    
    document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
}

function actualizarProgreso(paso) {
    for (let i = 1; i <= totalPasos; i++) {
        const stepElement = document.querySelector(`.progress-step[data-step="${i}"]`);
        
        if (i < paso) {
            stepElement.classList.remove('active');
            stepElement.classList.add('completed');
        } else if (i === paso) {
            stepElement.classList.add('active');
            stepElement.classList.remove('completed');
        } else {
            stepElement.classList.remove('active', 'completed');
        }
    }
}

function validarPaso(paso) {
    const stepElement = document.querySelector(`.form-step[data-step="${paso}"]`);
    const inputsRequeridos = stepElement.querySelectorAll('[required]');

    let valido = true;

    inputsRequeridos.forEach(input => {
        if (input.type === 'checkbox') {
            if (!input.checked) {
                valido = false;
                input.closest('.checkbox-group')?.classList.add('error');
            }
        } else if (!input.value.trim()) {
            valido = false;
            input.style.borderColor = '#DC3545';
        } else {
            input.style.borderColor = '#E5E7EB';
        }
    });

    // Paso 2: comprobar que se haya subido el anverso del DNI
    if (paso === 2) {
        const dniFront = document.getElementById('dni_front');
        if (!dniFront || !dniFront.files || dniFront.files.length === 0) {
            valido = false;
            document.getElementById('upload-area-front')?.classList.add('upload-area--error');
            alert('Debes adjuntar el anverso de tu documento de identidad antes de continuar.');
            return false;
        }
    }

    if (!valido) {
        alert('Por favor, completa todos los campos obligatorios (*) antes de continuar.');
    }

    return valido;
}

// Calcular precio según frecuencia de pago
function calcularPrecioFinal() {
    // El precio ya está en el texto del option
}

// Validación en tiempo real
document.querySelectorAll('input[required], select[required]').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value.trim()) {
            this.style.borderColor = '#28A745';
        }
    });
    
    input.addEventListener('input', function() {
        this.style.borderColor = '#E5E7EB';
    });
});

// Envío del formulario
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('seguroForm');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validar captcha
        const respuesta = parseInt(document.getElementById('captcha-answer')?.value, 10);
        if (isNaN(respuesta) || respuesta !== captchaResult) {
            alert('La respuesta al captcha no es correcta. Inténtalo de nuevo.');
            generarCaptcha();
            document.getElementById('captcha-answer').value = '';
            return;
        }

        const privacidad = document.getElementById('privacidad')?.checked;
        const terminos = document.getElementById('terminos')?.checked;
        const autorizacion = document.getElementById('autorizacion_datos')?.checked;

        if (!privacidad || !terminos || !autorizacion) {
            alert('Debes aceptar la política de privacidad, términos y condiciones, y la autorización de datos.');
            return;
        }
        
        const submitBtn = form.querySelector('.btn-submit');
        const textoOriginal = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        try {
            const formData = new FormData(form);

            // Adjuntar influencer si existe en sessionStorage
            const influencer = sessionStorage.getItem('cs_influencer');
            if (influencer) {
                formData.append('influencer', influencer);
            }

            // Obtener token CSRF antes de enviar
            try {
                const csrfRes = await fetch('php/csrf.php');
                const csrfData = await csrfRes.json();
                formData.append('csrf_token', csrfData.token || '');
            } catch (_) { /* continúa sin token; el servidor lo rechazará */ }

            const response = await fetch('php/enviar-formulario.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.location.href = 'gracias.html';
            } else {
                alert('Error: ' + (data.message || 'Inténtalo de nuevo'));
                submitBtn.disabled = false;
                submitBtn.innerHTML = textoOriginal;
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión. Inténtalo de nuevo.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = textoOriginal;
        }
    });
});

// Función para cerrar modal
function cerrarModal() {
    document.getElementById('modalConfirmacion')?.classList.remove('show');
}
// ========================================
// MOSTRAR/OCULTAR BENEFICIARIOS PERSONALIZADOS
// ========================================

function toggleBeneficiarios() {
    const radioDefecto = document.getElementById('benef_defecto');
    const radioPersonalizado = document.getElementById('benef_personalizado');
    const cajaPersonalizada = document.getElementById('beneficiarios-personalizados-box');
    const textareaBeneficiarios = document.getElementById('beneficiarios_texto');
    
    if (radioPersonalizado.checked) {
        // Mostrar cuadro de texto
        cajaPersonalizada.style.display = 'block';
        textareaBeneficiarios.required = true;  // Hacerlo obligatorio
        
        // Animación de entrada
        cajaPersonalizada.style.opacity = '0';
        cajaPersonalizada.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            cajaPersonalizada.style.transition = 'all 0.3s ease';
            cajaPersonalizada.style.opacity = '1';
            cajaPersonalizada.style.transform = 'translateY(0)';
        }, 10);
        
        // Focus en el textarea
        setTimeout(() => {
            textareaBeneficiarios.focus();
        }, 300);
        
    } else {
        // Ocultar cuadro de texto
        cajaPersonalizada.style.display = 'none';
        textareaBeneficiarios.required = false;  // No obligatorio
        textareaBeneficiarios.value = '';  // Limpiar valor
    }
}

// Escuchar cambios en los radio buttons de beneficiarios
document.querySelectorAll('input[name="beneficiarios"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
        var box = document.getElementById('beneficiarios-personalizados-box');
        if (this.value === 'PERSONALIZADO') {
            box.style.display = 'block';
        } else {
            box.style.display = 'none';
        }
    });
});

// ========================================
// CAPTCHA MATEMÁTICO
// ========================================
let captchaResult = 0;

function generarCaptcha() {
    const ops = ['+', '-', 'x'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, result;

    if (op === '+') {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        result = a + b;
    } else if (op === '-') {
        a = Math.floor(Math.random() * 10) + 5;
        b = Math.floor(Math.random() * 5) + 1;
        result = a - b;
    } else {
        a = Math.floor(Math.random() * 5) + 1;
        b = Math.floor(Math.random() * 5) + 1;
        result = a * b;
    }

    captchaResult = result;
    const el = document.getElementById('captcha-question');
    if (el) el.textContent = a + ' ' + op + ' ' + b;
}

document.addEventListener('DOMContentLoaded', function () {
    generarCaptcha();

    // Mostrar nombre del archivo seleccionado y validar tamaño/tipo
    ['front', 'back'].forEach(function (side) {
        const input = document.getElementById('dni_' + side);
        const label = document.getElementById('filename-' + side);
        if (!input || !label) return;

        input.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;

            const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
            const maxSize = 5 * 1024 * 1024; // 5 MB

            if (!allowed.includes(file.type)) {
                alert('Formato no permitido. Usa JPG, PNG o PDF.');
                this.value = '';
                label.textContent = 'Ningún archivo seleccionado';
                return;
            }
            if (file.size > maxSize) {
                alert('El archivo supera el límite de 5 MB.');
                this.value = '';
                label.textContent = 'Ningún archivo seleccionado';
                return;
            }

            label.textContent = file.name;
            const area = input.closest('.upload-area');
            area.classList.add('upload-area--ok');
            area.classList.remove('upload-area--error');
        });

        // Drag & drop
        const area = input.closest('.upload-area');
        area.addEventListener('dragover', function (e) {
            e.preventDefault();
            area.classList.add('upload-area--drag');
        });
        area.addEventListener('dragleave', function () {
            area.classList.remove('upload-area--drag');
        });
        area.addEventListener('drop', function (e) {
            e.preventDefault();
            area.classList.remove('upload-area--drag');
            if (e.dataTransfer.files.length) {
                input.files = e.dataTransfer.files;
                input.dispatchEvent(new Event('change'));
            }
        });
    });
});