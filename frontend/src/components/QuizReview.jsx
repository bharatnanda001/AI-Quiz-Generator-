import React from 'react';
import { DownloadCloud, Edit3, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8001/api/v1';

export default function QuizReview({ quizData, documentId }) {
  const handleExport = async (format) => {
    try {
      const response = await axios.post(`${API_BASE}/export/${format}?document_id=${documentId}`, {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Generated_Quiz.${format === 'docx' ? 'docx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (e) {
      alert("Export failed.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Review Generated Quiz</h2>
          <p className="text-txt-variant mt-2">{quizData.length} questions generated.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleExport('pdf')} className="btn-secondary flex items-center gap-2">
            <DownloadCloud className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => handleExport('docx')} className="btn-secondary flex items-center gap-2">
            <DownloadCloud className="w-4 h-4" /> Word
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {quizData.map((q, idx) => (
          <div key={q.id || idx} className="card relative group">
            <div className="absolute right-6 top-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 bg-surface-low rounded-lg hover:bg-primary hover:text-white transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="p-2 bg-surface-low rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="p-2 bg-surface-low rounded-lg hover:bg-primary-dark hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary-fixed text-primary-dark px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide">
                {q.type}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : q.difficulty === 'Hard' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {q.difficulty}
              </span>
            </div>
            
            <div className="content-anchor mb-6">
              <h3 className="text-xl font-bold">{idx + 1}. {q.stem}</h3>
            </div>

            {q.type === 'MCQ' && q.options && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className={`p-4 rounded-xl border-2 ${opt === q.correct_option ? 'border-green-500 bg-green-50' : 'border-surface-container bg-surface-lowest'}`}>
                    <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-surface-low p-4 rounded-xl text-sm space-y-2">
              <p><strong>Correct Answer:</strong> <span className="text-green-700">{q.correct_option}</span></p>
              <p className="text-txt-variant"><strong>Explanation:</strong> {q.answer_explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
