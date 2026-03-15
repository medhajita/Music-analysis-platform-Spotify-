# Music Analysis Platform

A full-stack music analytics web application with a Spotify-inspired dark theme, built with React and Node.js.

## Features

- **Dashboard**: Real-time music analytics with interactive charts
- **Songs**: Browse and search top streamed songs
- **Albums**: Explore popular albums with detailed statistics
- **Spotify Dark Theme**: Authentic Spotify-inspired UI design
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React 18 + Vite
- React Router v6
- Tailwind CSS
- Recharts (for data visualization)
- Axios (for API calls)
- react-countup (for animated counters)
- react-intersection-observer (for scroll animations)
- framer-motion (for smooth animations)

### Backend
- Node.js + Express.js
- MySQL database
- CORS support
- Environment configuration

## Project Structure

```
Music-analysis-platform-Spotify-/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx        # Main App component
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── tailwind.config.js
├── server/                # Express backend
│   ├── index.js           # Server entry point
│   └── package.json
├── .env.example           # Environment variables template
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL server
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Music-analysis-platform-Spotify-
```

### 2. Database Setup
1. Create a MySQL database named `music-analysis-platform-spotify`
2. Import your CSV data files into the database:
   - `most_streamed_songs.csv`
   - `most_streamed_albums.csv`

### 3. Environment Configuration
Copy the environment template and configure your database credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual database credentials:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=music-analysis-platform-spotify
PORT=5000
LAST_FM_API_KEY=your_last_fm_api_key
```

### 4. Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd ../client
npm install
```

### 5. Run the Application

#### Start the Backend Server
```bash
cd server
npm run dev
```
The backend will run on `http://localhost:5000`

#### Start the Frontend Development Server
```bash
cd client
npm run dev
```
The frontend will run on `http://localhost:5173`

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check
- `GET /api/songs` - Get most streamed songs
- `GET /api/albums` - Get most streamed albums

## Theme Colors

The application uses Spotify's official color palette:

- **Background**: `#121212`
- **Cards**: `#1E1E1E`
- **Accent Green**: `#1DB954`
- **Text**: `#FFFFFF`
- **Secondary Text**: `#B3B3B3`
- **Hover**: `#282828`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
