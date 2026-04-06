// ========================================
// CÓDIGOS POSTALES DE ESPAÑA
// ========================================

let codigosPostalesData = null;

async function cargarCodigosPostales() {
    try {
        const response = await fetch('codigos-postales.json');
        codigosPostalesData = await response.json();
        console.log('✅ Base de datos de códigos postales cargada');
    } catch (error) {
        console.error('❌ Error cargando códigos postales:', error);
    }
}

function buscarPorCP(cp) {
    if (!codigosPostalesData) return null;

    const cpLimpio = cp.replace(/\s/g, '').trim();
    if (cpLimpio.length !== 5 || !/^\d{5}$/.test(cpLimpio)) return null;

    const codigoProvincia = cpLimpio.substring(0, 2);
    const datos = codigosPostalesData[codigoProvincia];

    if (!datos) return null;

    return { provincia: datos.provincia };
}

document.addEventListener('DOMContentLoaded', async function () {
    await cargarCodigosPostales();

    const cpInput = document.getElementById('cp');
    if (!cpInput) return;

    cpInput.addEventListener('input', function () {
        // Solo permitir dígitos y limitar a 5 caracteres
        this.value = this.value.replace(/\D/g, '').substring(0, 5);

        if (this.value.length === 5) {
            const resultado = buscarPorCP(this.value);
            if (resultado) {
                const selectProvincia = document.getElementById('provincia');
                if (selectProvincia) selectProvincia.value = resultado.provincia;
            }
        }
    });
});
