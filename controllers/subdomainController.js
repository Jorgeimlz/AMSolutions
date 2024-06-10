const axios = require('axios');
const API_KEY = process.env.API_KEY;

exports.buscarSubdominios = async (req, res) => {
  const dominio = req.body.dominio;
  const url = `https://subdomain-finder3.p.rapidapi.com/v1/subdomain-finder/?domain=${dominio}`;

  try {
    const respuesta = await axios.get(url, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'subdomain-finder3.p.rapidapi.com'
      }
    });
    res.render('resultados', { subdominios: respuesta.data.subdomains });
  } catch (error) {
    console.error('Error al buscar subdominios:', error);
    res.status(500).send('Error en el servidor');
  }
};
