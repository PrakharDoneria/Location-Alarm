# Location Alarm

**Location Alarm** is a web application that allows users to mark their destination on a map and receive an alert 30 minutes before reaching it.

## Features

- Select and mark destinations using an interactive map interface.
- Receive timely notifications when approaching your destination.
- User-friendly UI built with modern web technologies.

## Tech Stack

### Frontend
- **React** for building user interfaces.
- **Leaflet** and **React-Leaflet** for map integration and location selection.
- **TailwindCSS** for styling.

### Backend
- **Express.js** as the web server framework.
- **Drizzle ORM** for database interactions.
- **PostgreSQL** as the database.

### Others
- **TypeScript** for type-safe development.
- **Radix UI** components for UI elements.
- **Zod** for schema validation.

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/PrakharDoneria/Location-Alarm.git
   cd Location-Alarm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file and provide the necessary environment variables such as database connection details, API keys, etc.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

6. Run the production server:
   ```bash
   npm start
   ```

## Scripts

- **`npm run dev`**: Start the development server.
- **`npm run build`**: Build the project for production.
- **`npm start`**: Start the production server.
- **`npm run check`**: Run TypeScript type checks.
- **`npm run db:push`**: Push database schema using Drizzle ORM.

## License

This project is licensed under the MIT License.
