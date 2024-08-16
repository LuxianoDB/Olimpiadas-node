const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2');
const app = express();

// Configurar middleware para sesiones
app.use(session({
    secret: 'asd8jklo09jhhk',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Configurar middleware para manejar archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para manejar el cuerpo de las solicitudes POST
app.use(express.urlencoded({ extended: true }));

// Configurar la conexión a la base de datos
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'olimpiadas',
    password: ''
}).promise();

// Middleware para verificar la sesión
function verificarSesion(req, res, next) {
    if (req.session.usuario) {
        next(); // El usuario está autenticado, continuar
    } else {
        res.redirect('/login'); // Redirigir al login si no está autenticado
    }
}

// Ruta para servir el index.html, protegido por sesión
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para servir el formulario de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ruta para manejar el inicio de sesión
app.post('/login', async (req, res) => {
    const { mail, password } = req.body;
    
    // Verificar las credenciales con la base de datos
    const [rows] = await pool.query('SELECT * FROM usuario WHERE Gmail = ? AND Contraseña = ?', [mail, password]);

    if (rows.length > 0) {
        req.session.usuario = mail; // Guardar el usuario en la sesión
        res.redirect('/'); // Redirigir al index después de iniciar sesión
    } else {
        res.send('Usuario o contraseña incorrectos');
    }
});

app.get('/check-session', (req, res) => {
    if (req.session.usuario) {
        res.json({ usuario: req.session.usuario });
    } else {
        res.json({ usuario: 'guest' });
    }
});


// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error al cerrar sesión');
        }
        res.redirect('/login'); // Redirigir al login después de cerrar sesión
    });
});

// Ruta para servir el formulario de registro
app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

// Ruta para manejar el registro de nuevos usuarios
app.post('/registro', async (req, res) => {
    const { username, mail, password } = req.body;

    // Insertar el nuevo usuario en la base de datos
    try {
        await pool.query('INSERT INTO usuario (Nombre, Gmail, Contraseña) VALUES (?, ?, ?)', [username, mail, password]);
        res.redirect('/login'); // Redirigir al login después de registrarse
    } catch (error) {
        console.error(error);
        res.send('Error al registrarse');
    }
});

// Ruta para obtener productos
app.get('/api/productos', async (req, res) => {
    try {
        // Obtener todos los productos de la base de datos
        const [productos] = await pool.query('SELECT nombre_producto, precio, cantidad FROM productos');

        // Enviar los productos como respuesta JSON
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

// Ruta para servir carrito.html
app.get('/carrito.html', verificarSesion, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'carrito.html'));
});

// Ruta para crear un nuevo pedido
app.post('/api/pedidos', async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;

        if (!usuarioId) {
            return res.status(401).send('No estás autenticado');
        }

        // Crear un nuevo pedido para el usuario
        const [result] = await pool.query('INSERT INTO pedidos (id_usuario, is_carrito) VALUES (?, true)', [usuarioId]);

        res.status(201).json({ id_pedido: result.insertId });
    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).send('Error al crear el pedido');
    }
});

// Ruta para obtener o crear el carrito del usuario
app.get('/api/carrito', async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId;

        if (!usuarioId) {
            return res.status(401).send('No estás autenticado');
        }

        // Verificar si el usuario ya tiene un carrito activo
        const [carrito] = await pool.query('SELECT * FROM pedidos WHERE id_usuario = ? AND is_carrito = true', [usuarioId]);

        let id_pedido;
        if (carrito.length === 0) {
            // Si no existe, crear un nuevo pedido como carrito
            const [result] = await pool.query('INSERT INTO pedidos (id_usuario, is_carrito) VALUES (?, true)', [usuarioId]);
            id_pedido = result.insertId;
        } else {
            // Si ya existe, obtener el ID del carrito
            id_pedido = carrito[0].id_pedido;
        }

        res.json({ id_pedido });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).send('Error al obtener el carrito');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
