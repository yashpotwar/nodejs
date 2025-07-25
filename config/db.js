const sql = require('mssql');

const config = {
  user: 'Ecommerce_DB', // 🔁 Your SQL login username
  password: 'Ecommerceha34@3jn', // 🔁 Your SQL login password
  server: 'N1NWPLSK12SQL-v01.shr.prod.ams1.secureserver.net', // 🔁 eg: 192.168.1.100 or sql.yourdomain.com
  database: 'Ecommerce_DB',
  port: 1433,
  options: {
    encrypt: false, // 🔁 false if self-signed cert
    trustServerCertificate: true
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = { sql, pool, poolConnect };
