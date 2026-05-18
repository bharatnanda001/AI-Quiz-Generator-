import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Sparkles, GraduationCap, Presentation } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8001/api/v1';

export default function UploadDashboard({ onDocumentUploaded, documentId, onQuizGenerated, role, setRole }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState({
    difficulty: 'Medium',
    num_questions: 5,
    types: { MCQ: true, TF: true, ShortAnswer: true }
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData);
      onDocumentUploaded(res.data.document_id);
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!documentId) return;
    setIsGenerating(true);
    
    const selectedTypes = Object.entries(config.types)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => type);

    try {
      const res = await axios.post(`${API_BASE}/generate`, {
        document_id: documentId,
        difficulty: config.difficulty,
        question_types: selectedTypes,
        num_questions: parseInt(config.num_questions)
      });
      
      const questions = res.data.questions;
      if (!questions || questions.length === 0) {
        alert('AI generated 0 valid questions for this content. Try a different difficulty or upload a more detailed document.');
      } else {
        onQuizGenerated(questions);
      }
    } catch (err) {
      console.error(err);
      alert('Generation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-display font-bold">Turn Presentations into Practice</h2>
        <p className="text-txt-variant text-lg">Upload your lecture slides and instantly generate comprehensive quizzes powered by AI.</p>
      </div>

      <div className="card text-center relative border-2 border-dashed border-outline-variant hover:border-primary transition-colors cursor-pointer group">
        <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.pptx" />
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="font-medium text-lg">Extracting text...</p>
            </>
          ) : documentId ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="font-medium text-lg text-green-700">Document Uploaded Successfully</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-medium text-lg">Click or drag presentation file</p>
                <p className="text-sm text-txt-variant mt-1">Supports PPTX and PDF (up to 50MB)</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`card space-y-6 transition-opacity ${!documentId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <h3 className="text-xl font-bold border-b pb-4">Quiz Settings</h3>

        <div className="space-y-4">
          <label className="font-semibold block text-base text-txt">Select Your Role</label>
          <div className="grid grid-cols-2 gap-4">
            {/* Student Card */}
            <button
              type="button"
              onClick={() => setRole('Student')}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${
                role === 'Student'
                  ? 'border-primary bg-primary-fixed/20 shadow-md scale-[1.01]'
                  : 'border-surface-container bg-white/40 hover:border-primary/50 hover:bg-white/60'
              }`}
            >
              <div className={`p-3 rounded-full mb-2 ${role === 'Student' ? 'bg-primary text-white scale-110' : 'bg-surface-low text-txt-variant group-hover:scale-105'} transition-all`}>
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className={`font-bold ${role === 'Student' ? 'text-primary' : 'text-txt-variant'}`}>Student</span>
              <span className="text-xs text-txt-variant mt-1 text-center max-w-[180px]">Test your knowledge with practice questions.</span>
            </button>

            {/* Teacher Card */}
            <button
              type="button"
              onClick={() => setRole('Teacher')}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${
                role === 'Teacher'
                  ? 'border-primary bg-primary-fixed/20 shadow-md scale-[1.01]'
                  : 'border-surface-container bg-white/40 hover:border-primary/50 hover:bg-white/60'
              }`}
            >
              <div className={`p-3 rounded-full mb-2 ${role === 'Teacher' ? 'bg-primary text-white scale-110' : 'bg-surface-low text-txt-variant group-hover:scale-105'} transition-all`}>
                <Presentation className="w-6 h-6" />
              </div>
              <span className={`font-bold ${role === 'Teacher' ? 'text-primary' : 'text-txt-variant'}`}>Teacher</span>
              <span className="text-xs text-txt-variant mt-1 text-center max-w-[180px]">Generate question sheets & separate answer keys.</span>
            </button>
          </div>
        </div>

        <div className="border-t border-dashed border-surface-dim my-6"></div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="font-medium block">Difficulty Level</label>
            <select 
              value={config.difficulty}
              onChange={(e) => setConfig({...config, difficulty: e.target.value})}
              className="input-field cursor-pointer"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="font-medium block">Number of Questions</label>
            <input 
              type="number" 
              min="1" max="25"
              value={config.num_questions}
              onChange={(e) => setConfig({...config, num_questions: e.target.value})}
              className="input-field"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-medium block">Question Types</label>
          <div className="flex gap-6">
            {['MCQ', 'TF', 'ShortAnswer'].map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.types[type]}
                  onChange={(e) => setConfig({
                    ...config, 
                    types: {...config.types, [type]: e.target.checked}
                  })}
                  className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary" 
                />
                <span>{type === 'TF' ? 'True/False' : type === 'ShortAnswer' ? 'Short Answer' : 'Multiple Choice'}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={!documentId || isGenerating}
          className="btn-primary w-full py-4 text-lg mt-8 flex justify-center items-center gap-2"
        >
          {isGenerating ? <Loader2 className="animate-spin w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>
      </div>
    </div>
  );
}
