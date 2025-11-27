# backend/main.py
import os
import io
import pdfplumber
import google.generativeai as genai
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv # New import for local security

# --- CONFIGURE SECURITY ---
# Load environment variables from a .env file (for local development)
load_dotenv()

# Get the API key safely from the system
api_key = os.environ.get("GOOGLE_API_KEY")

if not api_key:
    print("⚠️ WARNING: GOOGLE_API_KEY not found in environment variables!")
else:
    genai.configure(api_key=api_key)

# Configure the model (Gemini 2.0 Flash is fast and free)
model = genai.GenerativeModel('models/gemini-2.0-flash')

# --- APP SETUP ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you can change "*" to your Vercel URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class ProtocolRequest(BaseModel):
    text: str

class DilutionRequest(BaseModel):
    c1: float
    v1: float
    c2: float
    v2: float

# --- BASIC ROUTES ---
@app.get("/")
def read_root():
    return {"status": "BioScribe API is running"}

# --- AI ENDPOINTS ---
@app.post("/clean-protocol")
def clean_protocol(req: ProtocolRequest):
    try:
        prompt = f"""
        You are an expert Biotech Lab Manager. 
        Take the following messy lab notes and restructure them into a professional Standard Operating Procedure (SOP).
        
        Output format (Markdown):
        # [Title of Experiment]
        
        ## 📦 Materials
        * List items
        
        ## ⚠️ Safety
        * List hazards (if any)
        
        ## 🧪 Procedure
        1. Step one
        2. Step two
        
        ## 💡 Tips
        * Useful advice based on the context.

        Here are the notes:
        {req.text}
        """

        response = model.generate_content(prompt)
        return {"markdown": response.text}
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/simplify-paper")
async def simplify_paper(file: UploadFile = File(...)):
    try:
        # 1. Read the PDF file
        content = await file.read()
        
        # 2. Extract text using pdfplumber
        text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        
        # 3. Send to Gemini
        prompt = f"""
        You are an expert Research Scientist. Explain the following academic paper to a junior student.
        
        Analyze this text:
        {text[:50000]} 
        
        Output Format (Markdown):
        ## 🎯 Goal
        * What problem is this paper trying to solve? (2 sentences max)
        
        ## 🔬 Methods
        * How did they do it? Simplify the technical terms.
        
        ## 📊 Key Findings
        * Bullet points of the most important results.
        
        ## 🧠 Significance
        * Why does this matter to the biotech field?
        
        ## 📖 Glossary
        * Define 3-5 complex terms used in the paper.
        """
        
        response = model.generate_content(prompt)
        return {"markdown": response.text}

    except Exception as e:
        return {"error": str(e)}

# --- MATH ENDPOINTS ---
@app.post("/calculate/dilution")
def calculate_dilution(data: DilutionRequest):
    # CASE 1: Solve for V1
    if data.v1 == 0:
        if data.c1 == 0: return {"message": "Cannot solve: C1 is also 0"}
        result = (data.c2 * data.v2) / data.c1
        return {"variable": "v1", "result": round(result, 4)}
    
    # CASE 2: Solve for C1
    elif data.c1 == 0:
        if data.v1 == 0: return {"message": "Cannot solve: V1 is also 0"}
        result = (data.c2 * data.v2) / data.v1
        return {"variable": "c1", "result": round(result, 4)}

    # CASE 3: Solve for V2
    elif data.v2 == 0:
        if data.c2 == 0: return {"message": "Cannot solve: C2 is also 0"}
        result = (data.c1 * data.v1) / data.c2
        return {"variable": "v2", "result": round(result, 4)}

    # CASE 4: Solve for C2
    elif data.c2 == 0:
        if data.v2 == 0: return {"message": "Cannot solve: V2 is also 0"}
        result = (data.c1 * data.v1) / data.v2
        return {"variable": "c2", "result": round(result, 4)}
    
    # CASE 5: All filled
    else:
        return {"message": "Please leave exactly one value as 0 to calculate it."}