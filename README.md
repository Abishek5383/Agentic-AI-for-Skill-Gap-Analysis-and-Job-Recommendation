# Career Agent AI 🚀

**Career Agent AI** is an intelligent, full-stack application designed to perform personalized skill gap analysis, generate targeted learning roadmaps, and match users with real-world job opportunities based on their resumes.

## ✨ Features

- **Resume Analyzer**: Upload a PDF resume to instantly extract technical skills, soft skills, projects, and experience using Google's Gemini AI. The AI strictly extracts only explicitly mentioned skills to prevent hallucinations.
- **Skill Roadmap Generator**: Automatically generates a completely personalized, structured learning roadmap. It identifies missing skills for your chosen job role and recommends high-quality courses and tutorials (like freeCodeCamp, MDN, etc.) to bridge the gap.
- **Real-Time Job Portal**: Integrates directly with the Adzuna API to fetch real, active job listings that specifically match your exact technical skills. Includes a matchmaking percentage indicator.
- **Cyber-Sleek UI**: A beautiful, modern, dark-themed interface built with React, featuring glassmorphism elements, neon accents, and smooth micro-animations.

## 🛠️ Technology Stack

**Frontend**
- React 18
- React Router DOM
- Vite
- Custom CSS (Cyber-Sleek Design System)

**Backend**
- Python 3.10+
- FastAPI
- MongoDB (via Beanie ODM)
- Google Generative AI (Gemini 2.0 Flash)
- PyPDF2 (for resume text extraction)

## ⚙️ Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Abishek5383/Agentic-AI-for-Skill-Gap-Analysis-and-Job-Recommendation.git
cd Agentic-AI-for-Skill-Gap-Analysis-and-Job-Recommendation
```

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file and add your API keys:
# GEMINI_API_KEY=your_google_gemini_api_key
# MONGODB_URI=your_mongodb_connection_string
# ADZUNA_APP_ID=your_adzuna_app_id
# ADZUNA_API_KEY=your_adzuna_api_key

# Run the FastAPI server
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Run the Vite development server
npm run dev
```

## 🌐 Usage

1. Open your browser and navigate to the frontend URL (usually `http://localhost:5173`).
2. Create an account or log in.
3. Upload your PDF resume in the **Resume Analyzer**.
4. Review your extracted skills and save your profile.
5. Navigate to the **Skill Roadmap** to see your personalized learning path.
6. Check the **Job Portal** to find and apply to real-world jobs matching your acquired skills!

---
*Developed for intelligent career progression.*
