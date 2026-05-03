// ============================================
// DATOS - Servicios con secciones
// ============================================
const servicios = {
    marcaPersonal: {
        titulo: "Marca Personal",
        opciones: [
            {
                nombre: "Branding Personal",
                subServicios: [
                    { nombre: "Logo personal", precio: 80000 },
                    { nombre: "Bio y branding personal", precio: 50000 },
                    { nombre: "Foto de perfil profesional", precio: 30000 }
                ]
            },
            {
                nombre: "Gestión de Redes",
                subServicios: [
                    { nombre: "Gestión Instagram", precio: 40000 },
                    { nombre: "Creación de contenido", precio: 35000 }
                ]
            }
        ]
    },
    marcaEmpresarial: {
        titulo: "Marca Empresarial",
        opciones: [
            {
                nombre: "Branding",
                subServicios: [
                    { nombre: "Logo y marca desde cero", precio: 150000 },
                    { nombre: "Rebranding", precio: 120000 },
                    { nombre: "Identidad en redes", precio: 80000 },
                    { nombre: "Estrategia de marca", precio: 100000 },
                    { nombre: "Tienda Nube", precio: 200000 }
                ]
            },
            {
                nombre: "Community Manager",
                subServicios: [
                    { nombre: "Gestión de redes sociales", precio: 50000 },
                    { nombre: "Creación de contenido", precio: 45000 },
                    { nombre: "Analítica de redes", precio: 30000 }
                ]
            },
            {
                nombre: "Edición Audiovisual",
                subServicios: [
                    { nombre: "Video promocional", precio: 80000 },
                    { nombre: "Edición de evento", precio: 60000 },
                    { nombre: "Motion graphics", precio: 100000 }
                ]
            }
        ]
    },
    evento: {
        titulo: "Evento",
        opciones: [
            {
                nombre: "Cobertura",
                subServicios: [
                    { nombre: "Fotografía del evento", precio: 100000 },
                    { nombre: "Video cobertura", precio: 150000 },
                    { nombre: "Live streaming", precio: 80000 }
                ]
            },
            {
                nombre: "Producción",
                subServicios: [
                    { nombre: "Sonido e iluminación", precio: 120000 },
                    { nombre: "Estructura y escenario", precio: 200000 }
                ]
            }
        ]
    },
    otro: {
        titulo: "Otro",
        opciones: [
            {
                nombre: "Custom",
                subServicios: [
                    { nombre: "Consultoría personalizada", precio: 50000 },
                ]
            }
        ]
    }
};

let total = 0;
let seleccionados = [];

function mostrarCategoria(categoria) {
    const lista = document.getElementById('lista-servicios');
    const titulo = document.getElementById('titulo-categoria');
    const formulario = document.getElementById('formulario-servicios');

    titulo.textContent = servicios[categoria].titulo;

    total = 0;
    seleccionados = [];
    document.getElementById('total-precio').textContent = '0';
    document.getElementById('lista-seleccionados').innerHTML =
        '<li class="list-group-item text-muted">No hay servicios seleccionados</li>';

    // Crear cards por cada sección
    let html = '';
    servicios[categoria].opciones.forEach(function (seccion) {
        html += `
        <div class="card mb-3">
            <div class="card-header bg-dark text-white">${seccion.nombre}</div>
            <div class="card-body">
                <div class="row g-2">
        `;

        seccion.subServicios.forEach(function (servicio, indice) {
            html += `
            <div class="col-12 col-md-6">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" 
                           id="serv-${indice}"
                           value="${servicio.precio}"
                           data-nombre="${servicio.nombre}"
                           onchange="actualizarPrecio(this)">
                    <label class="form-check-label" for="serv-${indice}">
                        ${servicio.nombre}
                    </label>
                    <span class="float-end">$${servicio.precio.toLocaleString()}</span>
                </div>
            </div>
            `;
        });
        html += `
                </div>
            </div>
        </div>
        `;
    });

    lista.innerHTML = html;
    formulario.style.display = 'block';
    formulario.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// ACTUALIZAR PRECIO CUANDO MARCAS O DESMARCAS
// ============================================
function actualizarPrecio(checkbox) {
    const precio = parseInt(checkbox.value);
    const nombre = checkbox.dataset.nombre;

    if (checkbox.checked) {
        // Agregar al total
        total = total + precio;
        seleccionados.push(nombre + ' - $' + precio.toLocaleString());
    } else {
        // Restar del total
        total = total - precio;
        const indice = seleccionados.indexOf(nombre + ' - $' + precio.toLocaleString());
        if (indice > -1) {
            seleccionados.splice(indice, 1);
        }
    }

    document.getElementById('total-precio').textContent = total.toLocaleString();

    // Actualizar lista
    const lista = document.getElementById('lista-seleccionados');
    if (seleccionados.length === 0) {
        lista.innerHTML = '<li class="list-group-item text-muted">No hay servicios seleccionados</li>';
    } else {
        lista.innerHTML = '';
        seleccionados.forEach(function (item) {
            lista.innerHTML += '<li class="list-group-item">' + item + '</li>';
        });
    }
}

function mostrarGaleria(tipo) {
    const galeriaContenedor = document.getElementById('galeriaServicios');
    if (!galeriaContenedor) return;

    galeriaContenedor.style.display = 'block';

    ['branding', 'edicion', 'community'].forEach(function (categoria) {
        const seccion = document.getElementById('galeria' + categoria.charAt(0).toUpperCase() + categoria.slice(1));
        if (seccion) {
            seccion.style.display = categoria === tipo ? 'block' : 'none';
        }
    });
}

function abrirImagen(src, alt) {
    const overlay = document.getElementById('overlayImagen');
    const imagen = document.getElementById('overlayImagenContenido');
    if (!overlay || !imagen) return;
    imagen.src = src;
    imagen.alt = alt || '';
    overlay.style.display = 'flex';
}

function cerrarOverlayImagen(event) {
    if (event.target.id === 'overlayImagen') {
        event.currentTarget.style.display = 'none';
        document.getElementById('overlayImagenContenido').src = '';
    }
}
