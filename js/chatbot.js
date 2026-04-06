// ========================================
// CHATBOT CORRESEGURO - BASE DE CONOCIMIENTO
// ========================================

const botKnowledge = {
    // Preguntas sobre coberturas
    'cobertura': 'Nuestro seguro incluye: ✅ Fallecimiento por accidente hasta 60.000€ ✅ Invalidez absoluta/parcial hasta 60.000€ ✅ Asistencia sanitaria hasta 9.000€ ✅ Rehabilitación y fisioterapia ✅ Reembolso de inscripciones por lesión (hasta 150€/carrera)',
    'qué cubre': 'Nuestro seguro incluye: ✅ Fallecimiento por accidente hasta 60.000€ ✅ Invalidez absoluta/parcial hasta 60.000€ ✅ Asistencia sanitaria hasta 9.000€ ✅ Rehabilitación y fisioterapia ✅ Reembolso de inscripciones por lesión (hasta 150€/carrera)',
    'cubre': 'Cubrimos accidentes durante entrenamientos y carreras populares de running, trail, canicross y carreras de obstáculos. Incluye asistencia médica en centros concertados y fisioterapia. ⚠️ Las lesiones en competiciones oficiales de federaciones deportivas no tienen cobertura de asistencia sanitaria.',

    // Preguntas sobre precio
    'precio': '💰 El precio es de 59,90€/año (pago único anual). Incluye todas las coberturas: fallecimiento, invalidez, asistencia sanitaria y reembolso de inscripciones. ¡Sin letra pequeña!',
    'cuánto cuesta': '💰 El precio es de 59,90€/año (pago único anual). Incluye todas las coberturas: fallecimiento, invalidez, asistencia sanitaria y reembolso de inscripciones. ¡Sin letra pequeña!',
    'coste': '💰 El precio es de 59,90€/año (pago único anual). Incluye todas las coberturas: fallecimiento, invalidez, asistencia sanitaria y reembolso de inscripciones. ¡Sin letra pequeña!',

    // Preguntas sobre competiciones
    'competiciones': '⚠️ Importante: cubrimos carreras POPULARES y entrenamientos. Las competiciones y campeonatos oficiales organizados por Federaciones deportivas están excluidos de la cobertura de asistencia sanitaria (aunque sí aplica fallecimiento e invalidez).',
    'maratón': '🏃 Cubrimos maratones y medias maratones POPULARES, trail running, canicross y carreras de obstáculos. Recuerda que las competiciones oficiales de federaciones están excluidas de la asistencia sanitaria.',
    'carreras': '🏃 Cubrimos carreras populares, maratones, trail, canicross y carreras de obstáculos. Las competiciones federadas oficiales no tienen cobertura de asistencia sanitaria.',

    // Preguntas sobre contratación
    'contratar': 'Es muy fácil: 1️⃣ Rellena el formulario en esta web 2️⃣ Recibirás un email de confirmación 3️⃣ Te enviaremos la póliza en menos de 24h laborables',
    'cómo contratar': 'Es muy fácil: 1️⃣ Rellena el formulario en esta web 2️⃣ Recibirás un email de confirmación 3️⃣ Te enviaremos la póliza en menos de 24h laborables',
    'formulario': 'El formulario está justo en esta página. Baja hasta la sección "Contratar" y rellena tus datos. ¡Solo te tomará 2 minutos! 📝',

    // Preguntas sobre la empresa
    'empresa': 'CorreSeguro es una iniciativa de Belsué Mediación de Seguros SL, especializados en seguros deportivos. El seguro se emite a través de SURNE Mutua de Seguros y Reaseguros a Prima Fija.',
    'quién sois': 'CorreSeguro es una iniciativa de Belsué Mediación de Seguros SL, especializados en seguros deportivos. El seguro se emite a través de SURNE Mutua de Seguros y Reaseguros a Prima Fija.',
    'belsue': 'CorreSeguro es una iniciativa de Belsué Mediación de Seguros SL, especializados en seguros deportivos. El seguro se emite a través de SURNE Mutua de Seguros y Reaseguros a Prima Fija.',

    // Preguntas sobre contacto
    'contacto': 'Puedes contactarnos por: 📧 soporteit@belsue.es 📞 976 221 423 (Belsué) | En caso de siniestro llama a ASESMED: 92 640 64 41 (24h)',
    'teléfono': 'Puedes llamarnos al 976 221 423 (oficina Belsué). Para asistencia médica urgente por accidente: ASESMED 92 640 64 41 (24 horas).',
    'email': 'Puedes escribirnos a soporteit@belsue.es. Te responderemos en menos de 24 horas laborables.',

    // Saludos
    'hola': '¡Hola! 👋 ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre coberturas, precio, actividades cubiertas o cómo contratar.',
    'buenos días': '¡Buenos días! ☀️ ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre coberturas, precio, actividades cubiertas o cómo contratar.',
    'buenas tardes': '¡Buenas tardes! 🌅 ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre coberturas, precio, actividades cubiertas o cómo contratar.',
    'gracias': '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?',

    // Default (cuando no entiende)
    'default': 'Gracias por tu pregunta. Para información específica, puedes contactarnos: 📧 soporteit@belsue.es 📞 976 221 423 | O rellena el formulario y te contactaremos pronto.'
};

// ========================================
// FUNCIONES DEL CHATBOT
// ========================================

// Abrir/Cerrar chat
function toggleChat() {
    const chatWindow = document.getElementById('chatbot-window');
    const chatBtn = document.getElementById('chatbot-btn');
    
    chatWindow.classList.toggle('show');
    
    if (chatWindow.classList.contains('show')) {
        chatBtn.style.display = 'none';
        setTimeout(() => document.getElementById('chatbot-input').focus(), 300);
    } else {
        chatBtn.style.display = 'flex';
    }
}

// Enviar mensaje
async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();

    if (message === '') return;

    // Añadir mensaje del usuario
    addMessage(message, 'user');
    input.value = '';

    // Mostrar indicador de "escribiendo..."
    showTypingIndicator();

    // Obtener respuesta de Groq IA
    const response = await getBotResponse(message);
    hideTypingIndicator();
    addMessage(response, 'bot');
}

// Escapar HTML para prevenir XSS
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Añadir mensaje al chat
function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    // Escapar el contenido y convertir saltos de línea en <br> de forma segura
    const safeText = escapeHtml(text).replace(/\n/g, '<br>');

    messageDiv.innerHTML = `
        <div class="message-content">${safeText}</div>
        <div class="message-time">${time}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Obtener respuesta del bot via Groq IA
async function getBotResponse(userMessage) {
    try {
        const response = await fetch('php/chatbot-groq.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();

        if (data.error) {
            return data.error;
        }

        return data.reply;
    } catch (error) {
        return 'Lo siento, ha ocurrido un error. Por favor, contacta con nosotros en soporteit@belsue.es 📧';
    }
}

// Enviar pregunta frecuente
function sendQuickQuestion(question) {
    document.getElementById('chatbot-input').value = question;
    sendMessage();
}

// Manejar tecla Enter
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Mostrar indicador de escribiendo
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Ocultar indicador de escribiendo
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// ========================================
// INICIALIZAR CHATBOT
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Chatbot CorreSeguro inicializado');
});