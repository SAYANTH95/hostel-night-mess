# Hostel Night Mess Food Booking and Queue Management System

A web-based application designed to simplify hostel night-mess operations through online food booking, inventory management, pickup-slot allocation, and queue tracking.

## Features

### Student Portal
- Browse available food items, prices, and stock quantities.
- Add food items to a cart and calculate the order total.
- Select a booking date and available pickup slot.
- Choose a payment method (UPI or payment at the counter).
- Confirm bookings and receive a booking ID and queue token.
- Retrieve booking details and track order status.

### Staff and Queue Management
- View active queue tokens for a selected date.
- Update order status through the preparation workflow.
- Track completed and collected orders.
- Prevent invalid queue-status transitions.

### Database Management
- Store student, hostel, menu, inventory, booking, payment, and queue information.
- Validate inventory before confirming bookings.
- Manage pickup-slot capacity.
- Generate daily queue tokens.
- Use database transactions to maintain booking and inventory consistency.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL 8.x |
| Database Management | MySQL Workbench |
| Database Driver | mysql2 |
| Environment Configuration | dotenv |
| API Testing | Postman |
| Version Control | Git and GitHub |

## Project Structure

```text
hostel-night-mess/
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── procedures.sql
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server.js
├── package.json
├── package-lock.json
├── .env                 # Create locally
└── README.md
```

## Prerequisites

Install the following before running the application:

- [Node.js LTS](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/downloads)
- [MySQL Server 8.x](https://dev.mysql.com/downloads/installer/)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/SAYANTH95/hostel-night-mess.git
cd hostel-night-mess
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the database

Open MySQL Workbench, connect to your local MySQL server, and execute the SQL files in this order:

1. `database/schema.sql`
2. `database/seed.sql`
3. `database/procedures.sql`

The schema and stored procedure scripts use the database name `night_mess`.

**Important:** Review `schema.sql` before running it against an existing database, because it contains `DROP TABLE` statements that can delete existing tables and their data.

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=night_mess
```

Replace `your_mysql_password` with the password configured for your local MySQL account.

Do not commit `.env` or real database credentials to GitHub.

### 5. Start the application

After the project has a configured start script in `package.json`, run:

```bash
npm start
```

The server is configured to listen on port `3000` by default.

Open the following URL in your browser:

http://localhost:3000

**Current setup note:** The `package.json` currently needs a `start` script before the command above will work. Add `"start": "node server.js"` under `scripts`, preserving any existing scripts.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check database connectivity |
| GET | `/api/menu` | Retrieve available menu items |
| GET | `/api/slots?date=YYYY-MM-DD` | Retrieve pickup-slot availability |
| POST | `/api/bookings` | Create a food booking |
| GET | `/api/bookings/:id` | Retrieve booking details |
| GET | `/api/queue?date=YYYY-MM-DD` | View active queue tokens |
| GET | `/api/queue/completed?date=YYYY-MM-DD` | View completed orders |
| PATCH | `/api/queue/:tokenId/status` | Advance a queue token's status |

Use Postman to test the API endpoints.

## Order Workflow

```text
Browse Menu
    ↓
Select Food Items
    ↓
Choose Pickup Slot
    ↓
Confirm Booking
    ↓
Generate Booking ID and Queue Token
    ↓
Waiting → Preparing → Ready → Collected
```

Bookings depend on valid student records, available stock, and pickup-slot capacity.

## Development Status

The repository contains the student booking interface, Express backend APIs, MySQL schema and sample data, booking procedure, and queue-status functionality.

The application still requires local configuration and end-to-end testing. Features such as authentication, verified online UPI payments, and production deployment should not be considered complete unless implemented and tested separately.

## Future Enhancements

- Student and staff authentication with role-based authorization.
- Administrative menu and inventory management.
- Verified online payment integration.
- Booking cancellation and refund handling.
- Automated testing and improved error logging.
- Deployment to a shared server.

## Contributors

Developed as a Database Systems project focused on practical applications of relational database design, SQL transactions, stored procedures, and web-based information systems.

## License

This project is intended for academic use. A formal open-source license can be added if required.
