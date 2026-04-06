// ========================================
// EVENTOS - BASE DE DATOS LOCAL
// ========================================

const eventosDB = [
    {
        id: 1,
        titulo: 'Maratón de Madrid',
        lugar: 'Madrid, España',
        distancia: '42km | 21km | 10km',
        descripcion: 'Una de las maratones más importantes de España con recorrido urbano pasando por los monumentos más emblemáticos.',
        fecha: '2026-03-15',
        comunidad: 'madrid',
        tipo: 'marathon',
        mes: 3,
        tags: ['Maratón', 'Popular', 'Asfalto']
    },
    {
        id: 2,
        titulo: 'Media Maratón de Barcelona',
        lugar: 'Barcelona, España',
        distancia: '21km | 10km',
        descripcion: 'Recorrido espectacular pasando por las Ramblas, Passeig de Gràcia y la Sagrada Familia.',
        fecha: '2026-03-22',
        comunidad: 'catalunya',
        tipo: 'media',
        mes: 3,
        tags: ['Media Maratón', 'Popular', 'Escénica']
    },
    {
        id: 3,
        titulo: 'Maratón de Valencia',
        lugar: 'Valencia, España',
        distancia: '42km | 21km',
        descripcion: 'Conocida por ser una de las más rápidas del mundo. ¡Ideal para bajar tu marca personal!',
        fecha: '2026-04-05',
        comunidad: 'valencia',
        tipo: 'marathon',
        mes: 4,
        tags: ['Maratón', 'Récord', 'Rápida']
    },
    {
        id: 4,
        titulo: 'Maratón de Sevilla',
        lugar: 'Sevilla, España',
        distancia: '42km | 21km | 10km',
        descripcion: 'Recorrido llano y rápido por el corazón de Sevilla, pasando por la Giralda y el Alcázar.',
        fecha: '2026-04-18',
        comunidad: 'andalucia',
        tipo: 'marathon',
        mes: 4,
        tags: ['Maratón', 'Llana', 'Histórica']
    },
    {
        id: 5,
        titulo: 'San Sebastián Marathon',
        lugar: 'San Sebastián, España',
        distancia: '42km | 21km',
        descripcion: 'Una de las maratones más bonitas de España, junto a la Concha y el Monte Urgull.',
        fecha: '2026-05-10',
        comunidad: 'pais-vasco',
        tipo: 'marathon',
        mes: 5,
        tags: ['Maratón', 'Escénica', 'Costa']
    },
    {
        id: 6,
        titulo: 'Carrera de la Mujer Madrid',
        lugar: 'Madrid, España',
        distancia: '10km | 5km',
        descripcion: 'Evento solidario dedicado a la mujer corredora. Todo lo recaudado va a investigación del cáncer de mama.',
        fecha: '2026-05-25',
        comunidad: 'madrid',
        tipo: 'popular',
        mes: 5,
        tags: ['Popular', 'Solidario', 'Mujer']
    },
    {
        id: 7,
        titulo: 'Media Maratón de Santiago',
        lugar: 'Santiago de Compostela, España',
        distancia: '21km | 10km',
        descripcion: 'Corre por las calles históricas del Camino de Santiago con la Catedral como meta.',
        fecha: '2026-06-14',
        comunidad: 'galicia',
        tipo: 'media',
        mes: 6,
        tags: ['Media Maratón', 'Escénica', 'Histórica']
    },
    {
        id: 8,
        titulo: 'Maratón de Gran Canaria',
        lugar: 'Las Palmas, Gran Canaria',
        distancia: '42km | 21km',
        descripcion: 'Maratón en isla con clima perfecto todo el año. Recorrido junto al mar.',
        fecha: '2026-11-28',
        comunidad: 'canarias',
        tipo: 'marathon',
        mes: 11,
        tags: ['Maratón', 'Isla', 'Clima']
    }
];

// ========================================
// BUSCADOR DE EVENTOS
// ========================================

function buscarEventos(event) {
    event.preventDefault();
    
    const comunidad = document.getElementById('comunidad').value.toLowerCase();
    const distancia = document.getElementById('distancia').value.toLowerCase();
    const mes = document.getElementById('mes').value;
    
    // Filtrar eventos
    let resultados = eventosDB.filter(evento => {
        let coincide = true;
        
        if (comunidad && evento.comunidad !== comunidad) coincide = false;
        if (distancia && !evento.distancia.toLowerCase().includes(distancia)) coincide = false;
        if (mes && evento.mes != mes) coincide = false;
        
        return coincide;
    });
    
    // Mostrar resultados
    mostrarResultados(resultados);
}

// ========================================
// MOSTRAR RESULTADOS
// ========================================

function mostrarResultados(resultados) {
    const mensajeInicial = document.getElementById('mensaje-inicial');
    const eventosGrid = document.getElementById('eventos-resultados');
    const eventosCta = document.getElementById('eventos-cta');
    
    // Ocultar mensaje inicial
    if (mensajeInicial) {
        mensajeInicial.style.display = 'none';
    }
    
    // Si no hay resultados
    if (resultados.length === 0) {
        eventosGrid.style.display = 'block';
        eventosGrid.innerHTML = `
            <div class="mensaje-inicial" style="display: block; max-width: 100%;">
                <i class="fas fa-inbox"></i>
                <h3>No se encontraron eventos</h3>
                <p>Prueba con otros filtros o busca en otro mes</p>
                <button class="btn-primary" onclick="limpiarBusqueda()" style="margin-top: 20px;">
                    <i class="fas fa-undo"></i> Limpiar búsqueda
                </button>
            </div>
        `;
        if (eventosCta) eventosCta.style.display = 'none';
        return;
    }
    
    // Mostrar grid
    eventosGrid.style.display = 'grid';
    if (eventosCta) eventosCta.style.display = 'block';
    
    // Generar HTML de los eventos
    let html = `
        <div class="eventos-resultados-header">
            <h3>${resultados.length} evento${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''}</h3>
            <span class="eventos-count">${resultados.length} resultados</span>
        </div>
    `;
    
    resultados.forEach(evento => {
        const fecha = new Date(evento.fecha);
        const dia = fecha.getDate();
        const mesNombre = fecha.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
        const año = fecha.getFullYear();
        
        // Determinar clase del tag principal
        let tagClass = 'tag';
        if (evento.tipo === 'media') tagClass = 'tag popular';
        else if (evento.tipo === 'popular') tagClass = 'tag solidario';
        
        html += `
            <div class="evento-card" data-comunidad="${evento.comunidad}" data-distancia="${evento.tipo}">
                <div class="evento-fecha">
                    <span class="dia">${dia}</span>
                    <span class="mes">${mesNombre}</span>
                    <span class="año">${año}</span>
                </div>
                <div class="evento-info">
                    <h3>${evento.titulo}</h3>
                    <p class="evento-lugar"><i class="fas fa-map-marker-alt"></i> ${evento.lugar}</p>
                    <p class="evento-distancia"><i class="fas fa-route"></i> ${evento.distancia}</p>
                    <p class="evento-desc">${evento.descripcion}</p>
                    <div class="evento-tags">
                        ${evento.tags.map(tag => `<span class="${tagClass}">${tag}</span>`).join('')}
                    </div>
                    <a href="#" class="evento-btn">Más información</a>
                </div>
            </div>
        `;
    });
    
    eventosGrid.innerHTML = html;
    
    // Scroll suave a los resultados
    eventosGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========================================
// LIMPIAR BÚSQUEDA
// ========================================

function limpiarBusqueda() {
    // Resetear formulario
    const form = document.querySelector('.buscador-grid');
    if (form) form.reset();
    
    // Mostrar mensaje inicial
    const mensajeInicial = document.getElementById('mensaje-inicial');
    const eventosGrid = document.getElementById('eventos-resultados');
    const eventosCta = document.getElementById('eventos-cta');
    
    if (mensajeInicial) mensajeInicial.style.display = 'block';
    if (eventosGrid) {
        eventosGrid.style.display = 'none';
        eventosGrid.innerHTML = '';
    }
    if (eventosCta) eventosCta.style.display = 'none';
    
    // Scroll al buscador
    const buscador = document.querySelector('.eventos-buscador');
    if (buscador) buscador.scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// FILTROS RÁPIDOS
// ========================================

function filtrarEventos(filtro) {
    // Actualizar botones activos
    const botones = document.querySelectorAll('.filtro-btn');
    botones.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(filtro)) {
            btn.classList.add('active');
        }
    });
    
    // Filtrar eventos
    let resultados = eventosDB;
    
    if (filtro !== 'todos') {
        if (['madrid', 'catalunya', 'valencia', 'andalucia', 'pais-vasco', 'galicia', 'canarias'].includes(filtro)) {
            resultados = eventosDB.filter(e => e.comunidad === filtro);
        } else if (['42k', '21k', '10k', '5k', 'trail'].includes(filtro)) {
            resultados = eventosDB.filter(e => e.distancia.toLowerCase().includes(filtro));
        }
    }
    
    mostrarResultados(resultados);
}

// ========================================
// CARGAR MÁS EVENTOS
// ========================================

function cargarMasEventos() {
    alert('🚧 Funcionalidad en desarrollo: Se conectarán con la base de datos del admin panel');
}

// ========================================
// SUSCRIBIR NEWSLETTER
// ========================================

function suscribirNewsletter(event) {
    event.preventDefault();
    const email = event.target.querySelector('input').value;
    alert(`✅ ¡Gracias por suscribirte!\n\nEnviaremos el calendario de eventos a: ${email}`);
    event.target.reset();
}

// ========================================
// FULLCALENDAR
// ========================================

function inicializarCalendario() {
    const calendarEl = document.getElementById('calendar');
    
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'es',
            firstDay: 1,  // Lunes primero
            
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listMonth'
            },
            buttonText: {
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                list: 'Lista'
            },
            
            // Eventos con título limpio (sin emoji)
            events: eventosDB.map(evento => ({
                title: evento.titulo,
                start: evento.fecha,
                url: '#',
                extendedProps: {
                    lugar: evento.lugar,
                    distancia: evento.distancia,
                    comunidad: evento.comunidad,
                    tipo: evento.tipo,
                    mes: evento.mes
                }
            })),
            
            // Personalizar el renderizado del evento con icono
            eventDidMount: function(info) {
                const titleEl = info.el.querySelector('.fc-event-title');
                if (titleEl) {
                    titleEl.innerHTML = '<i class="fas fa-flag-checkered"></i> ' + info.event.title;
                }
            },
            
            // Click en evento → Mostrar en el buscador
            eventClick: function(info) {
                info.jsEvent.preventDefault();
                
                const eventoData = info.event.extendedProps;
                
                // Actualizar los selects del buscador
                const selectComunidad = document.getElementById('comunidad');
                const selectDistancia = document.getElementById('distancia');
                const selectMes = document.getElementById('mes');
                
                if (selectComunidad && eventoData.comunidad) {
                    selectComunidad.value = eventoData.comunidad;
                }
                
                if (selectMes && eventoData.mes) {
                    selectMes.value = eventoData.mes;
                }
                
                // Si es tipo específico, actualizar distancia
                if (selectDistancia && eventoData.tipo) {
                    if (eventoData.tipo === 'marathon') selectDistancia.value = '42k';
                    else if (eventoData.tipo === 'media') selectDistancia.value = '21k';
                    else if (eventoData.tipo === 'popular') selectDistancia.value = '10k';
                }
                
                // Filtrar y mostrar resultados
                const comunidad = selectComunidad ? selectComunidad.value.toLowerCase() : '';
                const distancia = selectDistancia ? selectDistancia.value.toLowerCase() : '';
                const mes = selectMes ? selectMes.value : '';
                
                // Filtrar eventos
                let resultados = eventosDB.filter(evento => {
                    let coincide = true;
                    
                    if (comunidad && evento.comunidad !== comunidad) coincide = false;
                    if (distancia && !evento.distancia.toLowerCase().includes(distancia)) coincide = false;
                    if (mes && evento.mes != mes) coincide = false;
                    
                    return coincide;
                });
                
                // Mostrar resultados
                mostrarResultados(resultados);
                
                // Actualizar botones de filtros rápidos
                const botones = document.querySelectorAll('.filtro-btn');
                botones.forEach(btn => btn.classList.remove('active'));
                
                // Resaltar el botón de la comunidad si existe
                if (eventoData.comunidad) {
                    const btnComunidad = Array.from(botones).find(btn => 
                        btn.getAttribute('onclick').includes(eventoData.comunidad)
                    );
                    if (btnComunidad) btnComunidad.classList.add('active');
                }
                
                console.log('🏁 Evento seleccionado:', info.event.title);
            }
        });
        
        calendar.render();
        console.log('✅ Calendario FullCalendar inicializado');
    }
}
// ========================================
// INICIALIZAR
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de eventos inicializada');
    inicializarCalendario();
});