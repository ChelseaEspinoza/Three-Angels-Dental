const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

const dbConfig = {
  host: process.env.DB_HOST || 'database',
  user: process.env.DB_USER || 'dental_user',
  password: process.env.DB_PASSWORD || 'dental_password',
  database: process.env.DB_NAME || 'dental_db'
};

function handleDisconnect() {
  const db = mysql.createConnection(dbConfig);

  db.connect(err => {
    if (err) {
      console.error('Error al conectar a la base de datos, reintentando en 5 segundos...', err);
      setTimeout(handleDisconnect, 5000);
    } else {
      console.log('Conectado exitosamente a la base de datos MySQL');
    }
  });

  db.on('error', err => {
    console.error('Error en la base de datos:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

app.get('/', (req, res) => {
  res.send('API de Three Angels Dental funcionando correctamente');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});