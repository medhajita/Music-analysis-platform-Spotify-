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

## 📸 Showroom

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

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide.
- **Backend**: Node.js, Express.js, MySQL, Dotenv, CORS.
- **Data Science**: Python, Pandas, Matplotlib, Seaborn.
- **Scraping/APIs**: Python scripts, Spotify Web API integrations.

---

## 📁 Repository Blueprint

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

## 🚀 Quick Start

### 1. Database Setup
1. Ensure **MySQL** is running locally.
2. Create a database named `music_analysis_platform_for_spotify`.
3. Import the schema/data from the `mysql/` directory.

### 2. Backend Configuration
Navigate to `Music_analysis_platform/backend`:
1. Create a `.env` file from the provided template.
2. Configure your DB credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=music_analysis_platform_for_spotify
   ```
3. Run `npm install && npm run dev`.

### 3. Frontend Launch
Navigate to `Music_analysis_platform/frontend`:
1. Run `npm install && npm run dev`.
2. Access the dashboard at `http://localhost:5173`.

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
