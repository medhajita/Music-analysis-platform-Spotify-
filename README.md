# 🎵 Spotify Music Analysis Platform

A comprehensive, full-stack ecosystem for music data engineering and interactive visualization. This platform combines a sleek web dashboard with a robust data pipeline and Python-based analytical suites.

---

## ✨ Features

### 📊 Interactive Web Dashboard
- **Real-time KPI Cards**: Monitor global streaming trends and key performance metrics.
- **Dynamic Charts**: Interactive Recharts for analyzing artist performance and listener demographics.
- **Geographic Insights**: Choropleth maps visualizing music popularity across different countries.
- **Global Search**: Instantly find any artist, album, or track in the system.

### ⚙️ Data Engineering Pipeline
- **Automated Scraping**: Custom scripts to gather raw music data from various sources.
- **API Enrichment**: Filling missing information (metadata, popularity) using the Spotify API.
- **Data Refining**: Multi-stage cleaning and merging processes to ensure data integrity.
- **Relational Storage**: Optimized MySQL schema for complex relational queries.

### 📈 Python Analytics Suite
- **Static Reporting**: Generate high-quality PNG charts for genre distribution and artist trends.
- **Data Exploration**: Histograms and performance charts for deep-dive analysis.

---

## 📸 Screenshots

| Dashboard | Artists Analysis |
| :---: | :---: |
| ![Dashboard](./screenshots/dashboard.png) | ![Artists](./screenshots/artists.png) |

| Albums Explorer | Global Markets |
| :---: | :---: |
| ![Albums](./screenshots/albums.png) | ![Countries](./screenshots/countries.png) |

| Songs Analytics |
| :---: |
| ![Songs](./screenshots/songs.png) |

---

## 🛠️ Tech Stack

### Frontend
- **React 18 + Vite** (Fast development and optimized builds)
- **Tailwind CSS** (Modern, responsive styling)
- **Recharts** (Interactive data visualization)
- **Framer Motion** (Smooth UI transitions and animations)
- **Lucide React** (Beautiful, consistent iconography)

### Backend
- **Node.js + Express.js** (Robust API layer)
- **MySQL** (Relational database for complex queries)
- **CORS & Dotenv** (Security and environment configuration)

### Data Science & Engineering
- **Python, Pandas, Matplotlib, Seaborn**
- **Spotify Web API integrations**

---

## 📁 Project Structure

```text
Music-analysis-platform-Spotify-/
├── Music_analysis_platform/
│   ├── backend/             # Node.js + Express API
│   └── frontend/            # React + Vite Application
├── Data/                    # Raw and processed datasets (CSV/SQL)
├── Scripts/                 # The Data Pipeline
│   ├── Scraping/            # Data collection
│   ├── Filling_missing_info # API integration
│   ├── Cleaning/            # Data normalization
│   └── Merge/               # Combining datasets
├── Visualization_Python/    # Python-based analytical charts
├── mysql/                   # Database export and schemas
└── screenshots/             # Visual documentation
```

---

## 🚀 Setup & Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Music-analysis-platform-Spotify-
```

### 2. Database Configuration

#### Prerequisites
- **MySQL 8.0+** installed and running on your machine.
- A MySQL client ([MySQL Workbench](https://dev.mysql.com/downloads/workbench/), phpMyAdmin, or CLI).
- **Python 3** with the following packages: `pandas`, `sqlalchemy`, `pymysql`, `python-dotenv`.

#### Step 1 — Create the database & tables
Open `Scripts/Database/setup_database.sql` in **MySQL Workbench** (or any SQL client) and execute it. This will create the database and all 4 tables:
```
Scripts/Database/setup_database.sql
```

#### Step 2 — Import the data
Run the Python import script to populate the tables from the CSV files:
```bash
cd Scripts/Database
pip install pandas sqlalchemy pymysql python-dotenv
python import_csv_to_mysql.py
```
> **Note:** The script reads your database credentials from `Music_analysis_platform/backend/.env` (see step 3). Make sure the `.env` file is configured before running the import.

### 3. Environment Setup

Each part of the application has its own `.env` file. Copy the provided `.env.example` templates and fill in your values.

#### Backend (`Music_analysis_platform/backend/.env`)
```bash
cp Music_analysis_platform/backend/.env.example Music_analysis_platform/backend/.env
```
Then edit the `.env` file with your MySQL credentials:
```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user          # ← replace with your MySQL username (e.g. root)
DB_PASSWORD=your_mysql_password   # ← replace with your MySQL password
DB_NAME=music_analysis_platform_for_spotify

# Comma-separated list of allowed frontend origins
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (`Music_analysis_platform/frontend/.env`)
```bash
cp Music_analysis_platform/frontend/.env.example Music_analysis_platform/frontend/.env
```
The default values should work for local development:
```env
# Backend API base URL used by axios
VITE_API_BASE_URL=http://localhost:5000/api
```
> **Note:** If you change the backend `PORT`, update `VITE_API_BASE_URL` accordingly.

### 4. Running the Application

#### Start the Backend
```bash
cd Music_analysis_platform/backend
npm install
npm run dev
```

#### Start the Frontend
```bash
cd Music_analysis_platform/frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173/`.

---

## 📊 Running Python Visualizations
To generate static charts, navigate to `Visualization_Python/`:
```bash
pip install pandas matplotlib seaborn
python artist_performance_charts.py
```

---

## 📄 License
This project is licensed under the **ISC License**.
