# QuizNova Professional V1

A redesigned React + Node/Express + MongoDB online quiz platform based on the uploaded project.

## Included in V1
- Professional dark QuizNova visual system
- Responsive student dashboard
- Subject selection for Java, Python, C Programming, DBMS and Aptitude
- Category question banks wired into the quiz page
- Timed quiz with progress and question navigation
- Submit confirmation modal
- Result screen with score summary
- Existing leaderboard API integration
- Leaderboard UI
- JWT token attached automatically to API requests
- Fixed Linux case-sensitive backend imports

## Run

### Backend
```bash
cd backend
npm install
copy .env.example .env
# edit .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

If your frontend API is not on `http://localhost:5000/api`, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```
