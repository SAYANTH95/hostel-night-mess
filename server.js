
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS database_connected');
    res.json({ status: 'ok', database: rows[0].database_connected === 1 });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ status: 'error', database: false });
  }
});

app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        m.item_id,
        m.item_name,
        m.category,
        m.price,
        m.is_veg,
        s.qty_remaining
      FROM Menu_Item m
      LEFT JOIN Daily_Stock s
        ON s.item_id = m.item_id
       AND s.stock_date = CURDATE()
      WHERE m.is_available = TRUE
      ORDER BY m.category, m.item_name
    `);

    res.json(rows);
  } catch (error) {
    console.error('Menu query failed:', error.message);
    res.status(500).json({ error: 'Unable to load menu' });
  }
});


app.post('/api/bookings', async (req, res) => {
  const {
    student_id,
    slot_id,
    booking_date,
    items,
    payment_mode
  } = req.body;

  if (
    !Number.isInteger(student_id) || student_id <= 0 ||
    !Number.isInteger(slot_id) || slot_id <= 0 ||
    typeof booking_date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(booking_date) ||
    !Array.isArray(items) || items.length === 0 ||
    !['UPI', 'COUNTER'].includes(payment_mode)
  ) {
    return res.status(400).json({
      error: 'Invalid booking details'
    });
  }

  if (items.some(item =>
    !Number.isInteger(item.item_id) || item.item_id <= 0 ||
    !Number.isInteger(item.quantity) || item.quantity <= 0
  )) {
    return res.status(400).json({
      error: 'Each item needs a positive item ID and quantity'
    });
  }

  try {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.query(
        `CALL PlaceBooking(?, ?, ?, ?, ?, @booking_id, @token_no)`,
        [
          student_id,
          slot_id,
          booking_date,
          JSON.stringify(items),
          payment_mode
        ]
      );

      const [outputs] = await connection.query(
        'SELECT @booking_id AS booking_id, @token_no AS token_no'
      );

      return res.status(201).json({
        message: 'Booking created successfully',
        booking_id: outputs[0].booking_id,
        token_no: outputs[0].token_no
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Booking failed:', error.message);

    if (error.sqlState === '45000') {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Unable to create booking'
    });
  }
});


const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Night Mess API running at http://localhost:${port}`);
});
