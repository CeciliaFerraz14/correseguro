// ========================================
// FORMULARIO DE CONTACTO - ORGANIZADORES
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactoForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar formulario
        if (!validarFormularioContacto()) {
            return;
        }
        
        // Cambiar estado del botón
        const submitBtn = form.querySelector('.btn-submit-org');
        const textoOriginal = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        try {
            const formData = new FormData(form);

            // Obtener token CSRF antes de enviar
            try {
                const csrfRes = await fetch('php/csrf.php');
                const csrfData = await csrfRes.json();
                formData.append('csrf_token', csrfData.token || '');
            } catch (_) { /* continúa sin token; el servidor lo rechazará */ }

            const response = await fetch('php/contacto-organizadores.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Éxito: Mostrar mensaje y redirigir
                alert('✅ ¡Solicitud enviada correctamente!\n\nNos pondremos en contacto contigo en menos de 24 horas.');
                form.reset();
                
                // Opcional: Redirigir a página de gracias
                // window.location.href = 'gracias-contacto.html';
            } else {
                alert('❌ Error: ' + (data.message || 'Inténtalo de nuevo'));
                submitBtn.disabled = false;
                submitBtn.innerHTML = textoOriginal;
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión. Inténtalo de nuevo.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = textoOriginal;
        }
    });
});

// Validación del formulario
function validarFormularioContacto() {
    const telefono = document.getElementById('telefono_org').value;
    const email = document.getElementById('email_org').value;
    
    // Validar teléfono (9 dígitos)
    const regexTelefono = /^[6789]\d{8}$/;
    if (!regexTelefono.test(telefono)) {
        alert('Por favor, introduce un teléfono válido (9 dígitos)');
        return false;
    }
    
    // Validar email
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
        alert('Por favor, introduce un email válido');
        return false;
    }
    
    return true;
}