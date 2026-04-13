/**
 * influencer.js
 * Detecta el parámetro ?influencer= en la URL, guarda el valor en sessionStorage
 * y muestra dinámicamente el logo del influencer en todas las páginas.
 *
 * Uso: incluir este script en todas las páginas donde quieras el logo.
 */

(function () {
  var STORAGE_KEY = 'cs_influencer';
  var IMG_BASE_PATH = 'images/logo_influ/logo_';

  // 1. Leer el parámetro de la URL (tiene prioridad sobre sessionStorage)
  var params = new URLSearchParams(window.location.search);
  var influencer = params.get('promo');

  if (influencer) {
    // Sanear el valor: solo letras, números, guiones y guiones bajos
    influencer = influencer.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    if (influencer) {
      sessionStorage.setItem(STORAGE_KEY, influencer);
    }
  } else {
    // Si no hay parámetro en la URL, recuperar de sessionStorage
    influencer = sessionStorage.getItem(STORAGE_KEY);
  }

  if (!influencer) return; // No hay influencer activo → no hacer nada

  // 2. Esperar a que el DOM esté listo
  document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('influencer-badge');
    if (!container) return;

    var img = document.createElement('img');
    img.alt = 'Recomendado por ' + influencer;
    img.src = IMG_BASE_PATH + influencer + '.png';
    img.style.height = '70px';
    img.style.width = 'auto';

    // Si la imagen no existe, ocultar el contenedor silenciosamente
    img.onerror = function () {
      container.style.display = 'none';
    };

    img.onload = function () {
      container.style.display = 'flex';
    };

    container.innerHTML = '';
    container.appendChild(img);
  });
})();
