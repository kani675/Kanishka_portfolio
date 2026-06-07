# Kanishka G — Full-Stack Portfolio

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas (cloud)
- **Hosting:** Render (backend) + Netlify (frontend)

---

## Project Structure

```
portfolio/
├── backend/
│   ├── server.js        ← Express API server
│   ├── models.js        ← MongoDB schemas (Project, Contact)
│   ├── package.json
│   └── .env.example     ← Copy this to .env and fill values
└── frontend/
    ├── index.html       ← Main portfolio page
    ├── css/
    │   └── style.css
    └── js/
        └── main.js      ← API calls, photo upload, etc.
```

---

## STEP 1 — Set Up MongoDB Atlas (Free Database)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account → choose **Free Tier (M0)**
3. Create a cluster → choose a region close to India
4. Click **Database Access** → Add New User
   - Username: `kanishka`
   - Password: (generate a strong one, save it)
   - Role: **Atlas Admin**
5. Click **Network Access** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
6. Click **Databases** → Connect → **Drivers**
7. Copy the connection string. It looks like:
   ```
   mongodb+srv://kanishka:<password>@cluster0.xxxxx.mongodb.net/
   ```
8. Replace `<password>` with your actual password

---

## STEP 2 — Run Locally

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env and paste your MongoDB URI
npm install
npm run dev
# Server runs at http://localhost:5000
```

### Frontend
Just open `frontend/index.html` in your browser.
Or use VS Code Live Server extension.

### Test the API
- http://localhost:5000/api/health    → check server
- http://localhost:5000/api/projects  → see projects from DB

---

## STEP 3 — Deploy Backend on Render (Free)

1. Push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial portfolio"
   git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
   git push -u origin main
   ```

2. Go to https://render.com → Sign up with GitHub

3. Click **New** → **Web Service**

4. Connect your GitHub repo → select `portfolio`

5. Fill in settings:
   - **Name:** kanishka-portfolio-api
   - **Root Directory:** backend
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free

6. Add Environment Variables (click "Add Environment Variable"):
   - `MONGODB_URI` = your Atlas connection string
   - `PORT` = 5000
   - `FRONTEND_URL` = https://YOUR-NETLIFY-URL.netlify.app

7. Click **Create Web Service**
   → Render gives you a URL like: `https://kanishka-portfolio-api.onrender.com`

---

## STEP 4 — Deploy Frontend on Netlify (Free)

1. Open `frontend/js/main.js`
2. Update the API_BASE line:
   ```js
   const API_BASE = window.location.hostname === 'localhost'
     ? 'http://localhost:5000/api'
     : 'https://kanishka-portfolio-api.onrender.com/api';  // ← your Render URL
   ```

3. Go to https://netlify.com → Sign up

4. Drag and drop your **frontend** folder into Netlify's deploy area
   → Done! Netlify gives you a URL like: `https://kanishka-portfolio.netlify.app`

5. Go back to Render → update `FRONTEND_URL` env variable with your Netlify URL

---

## STEP 5 — Final Check

Visit your Netlify URL:
- ✅ Green badge "Database Connected" = everything working
- Projects load from MongoDB
- Contact form saves messages to MongoDB
- Click "+ Add Project" to add new projects from the browser

---

## API Endpoints

| Method | URL               | Description              |
|--------|-------------------|--------------------------|
| GET    | /api/health       | Check server is running  |
| GET    | /api/projects     | Get all projects from DB |
| POST   | /api/projects     | Add a new project        |
| DELETE | /api/projects/:id | Delete a project         |
| POST   | /api/contact      | Save contact message     |
| GET    | /api/contact      | View all messages        |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Backend Offline" badge | Make sure `npm run dev` is running locally |
| MongoDB connection error | Check your `.env` URI and Atlas Network Access |
| Projects not loading | Open browser console (F12) and check for errors |
| CORS error | Make sure `FRONTEND_URL` in Render matches your Netlify URL |
