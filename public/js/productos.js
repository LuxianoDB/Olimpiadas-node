// productos.js

document.addEventListener('DOMContentLoaded', () => {
    // Datos de ejemplo de productos
    const productos = [
        { Id_Productos: 1, nombre_producto: 'Zapatillas Adidas', precio: 345 },
        { Id_Productos: 2, nombre_producto: 'Camisa Nike', precio: 250 }
    ];

    const productosLista = document.getElementById('productos-lista');

    productos.forEach(producto => {
        const productoItem = document.createElement('li');
        productoItem.className = 'producto-item';

        productoItem.innerHTML = `
            <h2>${producto.nombre_producto}</h2>
            <p>Precio: $${producto.precio}</p>
            <button data-id="${producto.Id_Productos}" class="btn-add">Añadir al carrito</button>
        `;

        productosLista.appendChild(productoItem);
    });

    document.querySelectorAll('.btn-add').forEach(boton => {
        boton.addEventListener('click', (event) => {
            const productoId = event.target.getAttribute('data-id');
            const producto = productos.find(p => p.Id_Productos == productoId);
            
            // Obtener carrito actual o inicializarlo
            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            
            // Añadir el producto al carrito
            carrito.push(producto);
            
            // Guardar el carrito en localStorage
            localStorage.setItem('carrito', JSON.stringify(carrito));
            
            alert('Producto añadido al carrito');
        });
    });
});
