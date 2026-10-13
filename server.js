
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

app.get('/api/queue', async (req, res) => {
  try {
    const date = req.query.date || new Date().toLocaleDateString('en-CA');

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Date must be in YYYY-MM-DD format'
      });
    }

    const [rows] = await pool.query(`
      SELECT
        qt.token_id,
        qt.token_no,
        DATE_FORMAT(qt.token_date, '%Y-%m-%d') AS token_date,
        qt.queue_status,
        qt.issued_at,
        b.booking_id,
        b.student_id,
        b.slot_id,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
        b.status AS booking_status,
        b.total_amount
      FROM Queue_Token qt
      INNER JOIN Booking b
        ON qt.booking_id = b.booking_id
      WHERE qt.token_date = ?
        AND qt.queue_status IN ('WAITING', 'PREPARING', 'READY')
      ORDER BY qt.token_no ASC
    `, [date]);

    res.json({
      date,
      count: rows.length,
      queue: rows
    });
  } catch (error) {
    console.error('Queue query failed:', error.message);
    res.status(500).json({
      error: 'Unable to load queue'
    });
  }
});


app.get('/api/bookings/:id', async (req, res) => {
  const bookingId = Number(req.params.id);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return res.status(400).json({
      error: 'Booking ID must be a positive integer'
    });
  }

  try {
    const [bookings] = await pool.query(`
      SELECT
        b.booking_id,
        b.student_id,
        b.slot_id,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
        b.status AS booking_status,
        b.total_amount,
        qt.token_no,
        qt.queue_status,
        p.mode AS payment_mode,
        p.amount AS payment_amount,
        p.pay_status AS payment_status
      FROM Booking b
      LEFT JOIN Queue_Token qt
        ON b.booking_id = qt.booking_id
      LEFT JOIN Payment p
        ON b.booking_id = p.booking_id
      WHERE b.booking_id = ?
    `, [bookingId]);

    if (bookings.length === 0) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    const [items] = await pool.query(`
      SELECT
        bi.item_id,
        m.item_name,
        bi.quantity,
        bi.unit_price,
        (bi.quantity * bi.unit_price) AS subtotal
      FROM Booking_Item bi
      INNER JOIN Menu_Item m
        ON bi.item_id = m.item_id
      WHERE bi.booking_id = ?
      ORDER BY bi.item_id
    `, [bookingId]);

    res.json({
      ...bookings[0],
      items
    });
  } catch (error) {
    console.error('Booking lookup failed:', error.message);
    res.status(500).json({
      error: 'Unable to retrieve booking'
    });
  }
});


app.get('/api/slots', async (req, res) => {
  try {
    const date = req.query.date || new Date().toLocaleDateString('en-CA');

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Date must be in YYYY-MM-DD format'
      });
    }

    const [rows] = await pool.query(`
      SELECT
        ts.slot_id,
        TIME_FORMAT(ts.start_time, '%H:%i') AS start_time,
        TIME_FORMAT(ts.end_time, '%H:%i') AS end_time,
        ts.max_orders,
        COUNT(b.booking_id) AS booked_orders,
        GREATEST(
          ts.max_orders - COUNT(b.booking_id),
          0
        ) AS remaining_capacity,
        CASE
          WHEN COUNT(b.booking_id) >= ts.max_orders THEN FALSE
          ELSE TRUE
        END AS is_available
      FROM Time_Slot ts
      LEFT JOIN Booking b
        ON b.slot_id = ts.slot_id
       AND b.booking_date = ?
       AND b.status IN (
         'PLACED',
         'CONFIRMED',
         'PREPARING',
         'READY'
       )
      GROUP BY
        ts.slot_id,
        ts.start_time,
        ts.end_time,
        ts.max_orders
      ORDER BY ts.start_time
    `, [date]);

    res.json({
      date,
      count: rows.length,
      slots: rows
    });
  } catch (error) {
    console.error('Slot query failed:', error.message);
    res.status(500).json({
      error: 'Unable to load pickup slots'
    });
  }
});


const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Night Mess API running at http://localhost:${port}`);
});
