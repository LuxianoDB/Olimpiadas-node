// carrito.js

document.addEventListener('DOMContentLoaded', () => {
    const carritoContainer = document.getElementById('carrito-container');

    // Obtener carrito actual
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length > 0) {
        carrito.forEach((producto, index) => {
            const productoDiv = document.createElement('div');
            productoDiv.className = 'producto';

            productoDiv.innerHTML = `
                <h2>${producto.nombre_producto}</h2>
                <p>Precio: $${producto.precio}</p>
                <button data-index="${index}" class="btn-remove">Eliminar</button>
            `;

            carritoContainer.appendChild(productoDiv);
        });

        // Agregar evento de clic para el botón de eliminar
        document.querySelectorAll('.btn-remove').forEach(boton => {
            boton.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                
                // Obtener carrito actual
                const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
                
                // Eliminar el producto del carrito
                carrito.splice(index, 1);
                
                // Guardar el carrito actualizado en localStorage
                localStorage.setItem('carrito', JSON.stringify(carrito));
                
                // Recargar la página para actualizar la vista
                location.reload();
            });
        });
    } else {
        carritoContainer.innerHTML = '<p>No hay productos en tu carrito.</p>';
    }
});
