"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const [activeTool, setActiveTool] = useState("calculator"); 
  
  // --- CALCULATOR STATE ---
  const [values, setValues] = useState({ c1: 0, v1: 0, c2: 0, v2: 0 });
  const [calcResult, setCalcResult] = useState<string | null>(null);

  // --- PROTOCOL CLEANER STATE ---
  const [rawNotes, setRawNotes] = useState("");
  const [cleanProtocol, setCleanProtocol] = useState("");

  // --- PAPER SIMPLIFIER STATE ---
  const [file, setFile] = useState<File | null>(null);
  const [paperAnalysis, setPaperAnalysis] = useState("");

  const [loading, setLoading] = useState(false);

  // --- HANDLERS ---
  const handleCalcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handleCalculate = async () => {
    try {
        const res = await fetch("https://bioscribe-backend.onrender.com/calculate/dilution", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
        });
        const data = await res.json();
        setCalcResult(data.result ? `Result: ${data.result} ${data.variable}` : "Error: Check inputs");
    } catch (e) {
        setCalcResult("Backend not connected");
    }
  };

  const handleClean = async () => {
    setLoading(true);
    setCleanProtocol("");
    try {
        const res = await fetch("https://bioscribe-backend.onrender.com/clean-protocol", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: rawNotes }),
        });
        const data = await res.json();
        setCleanProtocol(data.markdown || data.error);
    } catch (e) {
        alert("Backend connection failed.");
    }
    setLoading(false);
  };

  const handlePaperUpload = async () => {
    if (!file) return alert("Please select a PDF first!");
    setLoading(true);
    setPaperAnalysis("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://bioscribe-backend.onrender.com/simplify-paper", {
        method: "POST", 
        body: formData, // Browser sets Content-Type to multipart/form-data automatically
      });
      const data = await res.json();
      setPaperAnalysis(data.markdown || data.error);
    } catch (e) {
      alert("Error uploading file. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-8">
      
      {/* --- BRAND HEADER --- */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center gap-3">
            <span className="text-5xl">🧬</span>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            Bio<span className="text-teal-600">Scribe</span>
            </h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2">
            BETA
            </span>
        </div>
        <p className="text-slate-500 mt-2 text-lg font-medium">
            Your intelligent wet-lab companion.
        </p>
      </div>
      
      {/* --- NAVIGATION TABS --- */}
      <div className="flex space-x-2 mb-8 bg-white p-1 rounded-lg border shadow-sm">
        <Button 
            variant={activeTool === "calculator" ? "default" : "ghost"} 
            onClick={() => setActiveTool("calculator")}
            className={activeTool === "calculator" ? "bg-teal-600 shadow-sm" : "text-slate-600 hover:text-teal-600"}
        >
            🧮 Lab Math
        </Button>
        <Button 
            variant={activeTool === "protocol" ? "default" : "ghost"} 
            onClick={() => setActiveTool("protocol")}
            className={activeTool === "protocol" ? "bg-teal-600 shadow-sm" : "text-slate-600 hover:text-teal-600"}
        >
            📝 SOP Generator
        </Button>
        <Button 
            variant={activeTool === "paper" ? "default" : "ghost"} 
            onClick={() => setActiveTool("paper")}
            className={activeTool === "paper" ? "bg-teal-600 shadow-sm" : "text-slate-600 hover:text-teal-600"}
        >
            🧠 Paper Decoder
        </Button>
      </div>

      {/* --- FEATURE 1: CALCULATOR --- */}
      {activeTool === "calculator" && (
        <Card className="w-full max-w-md shadow-xl border-t-4 border-teal-600 animate-in fade-in zoom-in-95 duration-300">
           <CardHeader>
               <CardTitle className="flex items-center gap-2">
                   🧮 <span className="text-slate-700">Dilution Calculator</span>
               </CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-500 text-xs uppercase font-bold">Initial Conc (C1)</Label>
                    <Input name="c1" type="number" placeholder="0" onChange={handleCalcChange} className="bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-500 text-xs uppercase font-bold">Initial Vol (V1)</Label>
                    <Input name="v1" type="number" placeholder="0" onChange={handleCalcChange} className="bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-500 text-xs uppercase font-bold">Final Conc (C2)</Label>
                    <Input name="c2" type="number" placeholder="0" onChange={handleCalcChange} className="bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-500 text-xs uppercase font-bold">Final Vol (V2)</Label>
                    <Input name="v2" type="number" placeholder="0" onChange={handleCalcChange} className="bg-slate-50 border-slate-200" />
                </div>
              </div>
              
              <div className="text-xs text-slate-400 text-center italic">
                * Leave exactly one field as 0 to calculate it
              </div>

              <Button onClick={handleCalculate} className="w-full bg-teal-600 hover:bg-teal-700 font-bold text-lg h-12">
                Calculate
              </Button>
              
              {calcResult && (
                <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg text-center text-teal-900 font-bold text-lg animate-pulse">
                  {calcResult}
                </div>
              )}
           </CardContent>
        </Card>
      )}

      {/* --- FEATURE 2: PROTOCOL CLEANER --- */}
      {activeTool === "protocol" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-lg h-[600px] flex flex-col border-slate-200">
            <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-slate-700">📝 Raw Notes</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 flex flex-col gap-4">
              <Textarea 
                placeholder="Paste your messy lab notes here..." 
                className="flex-1 resize-none bg-slate-50 border-slate-200 focus:ring-teal-500 text-base" 
                onChange={(e) => setRawNotes(e.target.value)} 
              />
              <Button onClick={handleClean} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg">
                {loading ? "Sterilizing Protocol..." : "✨ Clean Protocol"}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg h-[600px] flex flex-col border-slate-200 bg-white">
            <CardHeader className="bg-white border-b">
                <CardTitle className="text-teal-700">✨ Professional SOP</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-8 overflow-auto prose prose-slate max-w-none">
              {cleanProtocol ? (
                <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                    {cleanProtocol}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <span className="text-4xl mb-4">🧬</span>
                    <p>Processed protocol will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- FEATURE 3: PAPER SIMPLIFIER --- */}
      {activeTool === "paper" && (
        <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-300">
          <Card className="shadow-lg mb-6 border-t-4 border-teal-600">
            <CardHeader>
                <CardTitle>Upload Research Paper (PDF)</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 items-center flex-col md:flex-row">
              <Input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="cursor-pointer file:bg-slate-100 file:text-slate-700 file:border-0 file:rounded-md file:px-2 file:mr-4 hover:file:bg-slate-200"
              />
              <Button onClick={handlePaperUpload} disabled={loading} className="bg-teal-600 hover:bg-teal-700 w-full md:w-auto min-w-[150px]">
                {loading ? "Analyzing..." : "Analyze PDF"}
              </Button>
            </CardContent>
          </Card>

          {paperAnalysis && (
            <Card className="shadow-xl border-0 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <CardHeader className="bg-teal-50 border-b border-teal-100">
                <CardTitle className="text-teal-800">🤖 AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-8 prose prose-slate max-w-none bg-white rounded-b-xl">
                 <div className="whitespace-pre-wrap leading-relaxed">{paperAnalysis}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}