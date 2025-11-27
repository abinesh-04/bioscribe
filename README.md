BioScribe
The Intelligent AI Toolkit for Biotech Students & Researchers.

BioScribe is a full-stack web application that combines the reasoning power of Large Language Models (LLM) with the mathematical precision of Python to automate wet-lab workflows.

Live Demo
Frontend: https://bioscribe-chi.vercel.app/

Backend API: https://bioscribe-backend.onrender.com/

Key Features
1. Protocol Cleaner (SOP Generator)
Problem: Lab notes are often messy, handwritten, or unorganized.

Solution: Uses Google Gemini 2.0 Flash to restructure raw text into professional Standard Operating Procedures (SOPs) with Markdown formatting.

Safety First: Automatically identifies hazardous chemicals and highlights safety warnings.

2. Smart Lab Calculator
Problem: LLMs hallucinate numbers, making them dangerous for lab math.

Solution: Uses Pure Python (deterministic logic) for calculations like Dilutions (C1V1 = C2V2) and Molarity. Zero hallucinations guaranteed.

3. Research Paper Simplifier
Problem: Scientific papers are dense and time-consuming to read.

Solution: Users upload a PDF. The app uses pdfplumber to extract text and AI to generate:

TL;DR Summary

Key Findings

Glossary of complex terms

Methodology explanation for junior students.

Tech Stack
Frontend
Framework: Next.js 14 (React)

Styling: Tailwind CSS + Shadcn/UI

Deployment: Vercel

Backend
Framework: FastAPI (Python)

AI Engine: Google Gemini 2.0 Flash (via google-generativeai)

PDF Processing: pdfplumber

Deployment: Render

Local Installation
Prerequisites: Node.js and Python 3.9+.

1. Clone the Repository
Bash

git clone https://github.com/your-username/bioscribe.git
cd bioscribe
2. Setup Backend
Bash

cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create a .env file for your API Key
echo "GOOGLE_API_KEY=your_actual_api_key_here" > .env

# Run the Server
uvicorn main:app --reload
Backend runs on: http://127.0.0.1:8000

3. Setup Frontend
Open a new terminal window.

Bash

cd frontend
npm install
npm run dev
Frontend runs on: http://localhost:3000

Security & Architecture
API Key Safety: The Google Gemini API Key is stored in environment variables (.env locally, Dashboard secrets in Production). It is never exposed to the client.

CORS: Configured to allow secure communication between the Next.js frontend and FastAPI backend.

Contributing
Contributions are welcome.

Fork the Project

Create your Feature Branch (git checkout -b feature/NewFeature)

Commit your Changes (git commit -m 'Add some NewFeature')

Push to the Branch (git push origin feature/NewFeature)

Open a Pull Request

License
Distributed under the MIT License.
