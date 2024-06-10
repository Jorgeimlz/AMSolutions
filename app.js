const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();

// Establecer EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir archivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Middleware para parsear el cuerpo de las solicitudes HTTP
app.use(bodyParser.urlencoded({ extended: true }));

// Lista negra simulada de IPs
const listaNegraIPs = [
    "104.16.241.118",
    "76.76.21.142",
    "172.66.41.24"
];

// Función para evaluar el riesgo de un subdominio
function evaluarRiesgo(subdominio) {
    let riesgo = 1;  // Riesgo mínimo por defecto

    if (listaNegraIPs.includes(subdominio.ip)) {
        riesgo += 4;
    }

    if (subdominio.cloudflare) {
        riesgo -= 2;
    }

    riesgo = Math.max(riesgo, 1);
    const nivelesDeRiesgo = ['Muy Baja', 'Baja', 'Media', 'Media-Alta', 'Alta', 'Muy Alta'];
    return nivelesDeRiesgo[Math.min(riesgo, nivelesDeRiesgo.length - 1)];
}

// Ruta principal - Mostrar formulario
app.get('/', (req, res) => {
    res.render('index');
});

// Ruta para buscar subdominios
app.post('/buscar', async (req, res) => {
    const dominio = req.body.dominio;
    const url = `https://subdomain-finder3.p.rapidapi.com/v1/subdomain-finder/?domain=${dominio}`;

    try {
        const respuesta = await axios.get(url, {
            headers: {
                'x-rapidapi-key': process.env.API_KEY,
                'x-rapidapi-host': 'subdomain-finder3.p.rapidapi.com'
            }
        });

        const subdominios = respuesta.data.subdomains.map(sub => ({
            ...sub,
            riesgo: evaluarRiesgo(sub)
        }));

        res.render('resultados', { subdominios, dominio });
    } catch (error) {
        console.error('Error al buscar subdominios:', error);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para buscar correos electrónicos de un dominio usando Hunter.io
app.post('/buscar-correos', async (req, res) => {
    const dominio = req.body.dominio;
    const url = `https://api.hunter.io/v2/domain-search?domain=${dominio}&api_key=${process.env.HUNTER_API_KEY}`;

    try {
        const respuesta = await axios.get(url);
        const datosCorreo = respuesta.data.data;

        res.render('correos_resultados', { datosCorreo, dominio });
    } catch (error) {
        console.error('Error al buscar correos electrónicos:', error);
        res.status(500).send('Error en el servidor');
    }
});

// Función para buscar enlaces de redes sociales
async function obtenerEnlacesSociales(query) {
    const options = {
        method: 'GET',
        url: 'https://social-links-search.p.rapidapi.com/search-social-links',
        params: {
            query: query,
            social_networks: 'facebook,tiktok,instagram,snapchat,twitter,youtube,linkedin,github,pinterest'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'social-links-search.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        return response.data.data;
    } catch (error) {
        console.error('Error al buscar enlaces de redes sociales:', error);
        throw error;
    }
}

// Ruta para buscar enlaces de redes sociales
app.post('/buscar-enlaces-sociales', async (req, res) => {
    const query = req.body.query;

    try {
        const enlacesSociales = await obtenerEnlacesSociales(query);
        res.render('enlaces_sociales_resultados', { enlacesSociales, query });
    } catch (error) {
        console.error('Error al buscar enlaces de redes sociales:', error);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para mostrar detalles del riesgo
app.get('/riesgo/:nivel/:dominio', (req, res) => {
    const nivel = req.params.nivel;
    const dominio = req.params.dominio;
    res.render('detalle_riesgo', { nivel: nivel, dominio: dominio });
});

// Ruta para volver a la búsqueda con el dominio anterior
app.get('/buscar', (req, res) => {
    const dominio = req.query.dominio;
    if (dominio) {
        const url = `https://subdomain-finder3.p.rapidapi.com/v1/subdomain-finder/?domain=${dominio}`;

        axios.get(url, {
            headers: {
                'x-rapidapi-key': process.env.API_KEY,
                'x-rapidapi-host': 'subdomain-finder3.p.rapidapi.com'
            }
        })
        .then(response => {
            const subdominios = response.data.subdomains.map(sub => ({
                ...sub,
                riesgo: evaluarRiesgo(sub)
            }));
            res.render('resultados', { subdominios, dominio });
        })
        .catch(error => {
            console.error('Error al buscar subdominios:', error);
            res.status(500).send('Error en el servidor');
        });
    } else {
        res.redirect('/');
    }
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
