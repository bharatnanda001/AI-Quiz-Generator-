import React, { useState } from 'react';
import { DownloadCloud, Edit3, Trash2, RefreshCw, FileText, ExternalLink, Loader2, Award, Eye, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8001/api/v1';

export default function QuizReview({ quizData, documentId, role }) {
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [formLinks, setFormLinks] = useState(null);

  // Teacher role state
  const [activeTab, setActiveTab] = useState('question'); // 'question' | 'answer'

  // Student role state
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleExport = async (format) => {
    try {
      const response = await axios.post(`${API_BASE}/export/${format}?document_id=${documentId}&role=${role}`, {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Generated_Quiz_${role}.${format === 'docx' ? 'docx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (e) {
      alert("Export failed.");
    }
  };

  const handleGoogleFormExport = async () => {
    setIsCreatingForm(true);
    try {
      const response = await axios.post(`${API_BASE}/export/google-forms?document_id=${documentId}`);
      setFormLinks(response.data);
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to create Google Form. Make sure credentials.json is present in the backend folder.");
    } finally {
      setIsCreatingForm(false);
    }
  };

  // Student quiz grading
  const handleStudentSubmit = () => {
    let tempScore = 0;
    let gradedCount = 0;

    quizData.forEach((q) => {
      if (q.type === 'MCQ' || q.type === 'TF') {
        gradedCount++;
        const userAns = userAnswers[q.id];
        if (userAns && userAns.trim().toLowerCase() === q.correct_option.trim().toLowerCase()) {
          tempScore++;
        }
      }
    });

    setScore(tempScore);
    setIsSubmitted(true);
    // Smooth scroll to top of container
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetake = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const getGradedTotal = () => {
    return quizData.filter(q => q.type === 'MCQ' || q.type === 'TF').length;
  };

  return (
    <div className="space-y-8">
      {/* Header section with title and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-6 gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary-fixed rounded-full">
            {role} Mode
          </span>
          <h2 className="text-3xl font-display font-bold mt-2">
            {role === 'Student' ? 'Interactive Student Practice' : 'Review Generated Quiz'}
          </h2>
          <p className="text-txt-variant mt-1">
            {quizData.length} questions generated from slides.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleExport('pdf')} className="btn-secondary flex items-center gap-2">
            <DownloadCloud className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={() => handleExport('docx')} className="btn-secondary flex items-center gap-2">
            <DownloadCloud className="w-4 h-4" /> Export Word
          </button>
          
          {role === 'Teacher' && (
            <button onClick={handleGoogleFormExport} disabled={isCreatingForm} className="btn-primary flex items-center gap-2">
              {isCreatingForm ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {isCreatingForm ? 'Creating Form...' : 'Google Form'}
            </button>
          )}
        </div>
      </div>

      {/* Google Form Link Panel */}
      {role === 'Teacher' && formLinks && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-green-800 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Google Form Created Successfully!
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 mt-3">
             <a href={formLinks.responderUri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-700 font-medium hover:underline">
                <ExternalLink className="w-4 h-4" /> Send to Students (Test Link)
             </a>
             <a href={formLinks.editUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-700 font-medium hover:underline">
                <Edit3 className="w-4 h-4" /> View Responses / Edit (Teacher Link)
             </a>
          </div>
        </div>
      )}

      {/* Teacher Segmented Tab Control */}
      {role === 'Teacher' && (
        <div className="flex p-1 bg-surface-low rounded-xl max-w-md shadow-inner border border-surface-container">
          <button
            onClick={() => setActiveTab('question')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'question'
                ? 'bg-white text-primary shadow-sm'
                : 'text-txt-variant hover:text-txt'
            }`}
          >
            <Eye className="w-4 h-4" />
            Question Sheet
          </button>
          <button
            onClick={() => setActiveTab('answer')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'answer'
                ? 'bg-white text-primary shadow-sm'
                : 'text-txt-variant hover:text-txt'
            }`}
          >
            <Award className="w-4 h-4" />
            Answer Key & Explanations
          </button>
        </div>
      )}

      {/* Student Score Dashboard Card */}
      {role === 'Student' && isSubmitted && (
        <div className="card bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              Practice Quiz Submitted!
            </h3>
            <p className="text-txt-variant text-base">
              You scored <span className="font-bold text-primary">{score}</span> out of{' '}
              <span className="font-bold text-txt">{getGradedTotal()}</span> correct in the objective section.
            </p>
            <p className="text-sm text-txt-variant">
              Review your detailed solutions, incorrect selections, and short answer guidelines below.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-primary flex flex-col items-center justify-center bg-white shadow-inner">
              <span className="text-3xl font-extrabold text-primary">
                {Math.round((score / (getGradedTotal() || 1)) * 100)}%
              </span>
            </div>
            <button
              onClick={handleRetake}
              className="btn-secondary flex items-center gap-2 py-3 border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary transition-all font-semibold"
            >
              <RefreshCw className="w-4 h-4" /> Retake Practice
            </button>
          </div>
        </div>
      )}

      {/* Questions list rendering */}
      <div className="space-y-6">
        {quizData.map((q, idx) => {
          const isGradedType = q.type === 'MCQ' || q.type === 'TF';
          const studentAns = userAnswers[q.id];
          const isCorrect = studentAns && studentAns.trim().toLowerCase() === q.correct_option.trim().toLowerCase();

          // Decide what options to show and how to highlight them
          return (
            <div key={q.id || idx} className="card relative group border border-white/50">
              {/* Question metadata badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary-fixed text-primary-dark px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide">
                  {q.type === 'TF' ? 'True/False' : q.type === 'ShortAnswer' ? 'Short Answer' : 'Multiple Choice'}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : q.difficulty === 'Hard' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {q.difficulty}
                </span>

                {/* Score indicators for Student (after submission) */}
                {role === 'Student' && isSubmitted && isGradedType && (
                  <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-red-600" />}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>

              {/* Question stem */}
              <div className="content-anchor mb-6">
                <h3 className="text-xl font-bold">{idx + 1}. {q.stem}</h3>
              </div>

              {/* Option Rendering based on roles and question types */}

              {/* Multiple Choice Options */}
              {q.type === 'MCQ' && q.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {q.options.map((opt, oIdx) => {
                    const optionChar = String.fromCharCode(65 + oIdx);
                    
                    // Style states
                    let borderClass = 'border-surface-container bg-surface-lowest/50';
                    let interactiveClass = '';

                    if (role === 'Student') {
                      if (!isSubmitted) {
                        borderClass = studentAns === opt
                          ? 'border-primary bg-primary-fixed/20 shadow-md scale-[1.01]'
                          : 'border-surface-container bg-white/40 hover:border-primary/30 hover:bg-white/60';
                        interactiveClass = 'cursor-pointer';
                      } else {
                        // Post-submission styling
                        const isStudentChoice = studentAns === opt;
                        const isCorrectOption = opt.trim().toLowerCase() === q.correct_option.trim().toLowerCase();

                        if (isStudentChoice) {
                          borderClass = isCorrect
                            ? 'border-green-500 bg-green-50/50 text-green-950 font-medium'
                            : 'border-red-500 bg-red-50/50 text-red-950';
                        } else if (isCorrectOption) {
                          borderClass = 'border-green-500 bg-green-50/50 text-green-950 font-medium border-dashed';
                        } else {
                          borderClass = 'border-surface-container bg-white/30 opacity-70';
                        }
                      }
                    } else {
                      // Teacher Mode
                      if (activeTab === 'answer') {
                        const isCorrectOption = opt.trim().toLowerCase() === q.correct_option.trim().toLowerCase();
                        borderClass = isCorrectOption
                          ? 'border-green-500 bg-green-50/50 text-green-950 font-medium'
                          : 'border-surface-container bg-white/30 opacity-70';
                      } else {
                        // Question sheet is clean
                        borderClass = 'border-surface-container bg-white/50';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={role !== 'Student' || isSubmitted}
                        onClick={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                        className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${borderClass} ${interactiveClass}`}
                      >
                        <span className="font-extrabold text-primary-dark w-6 h-6 rounded-full bg-surface-low border border-surface-container flex items-center justify-center shrink-0">
                          {optionChar}
                        </span> 
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True/False Buttons */}
              {q.type === 'TF' && (
                <div className="flex gap-4 mb-6 max-w-sm">
                  {['True', 'False'].map((val) => {
                    let borderClass = 'border-surface-container bg-surface-lowest/50';
                    let interactiveClass = '';

                    if (role === 'Student') {
                      if (!isSubmitted) {
                        borderClass = studentAns === val
                          ? 'border-primary bg-primary-fixed/20 shadow-md scale-[1.01]'
                          : 'border-surface-container bg-white/40 hover:border-primary/30 hover:bg-white/60';
                        interactiveClass = 'cursor-pointer';
                      } else {
                        const isStudentChoice = studentAns === val;
                        const isCorrectOption = val.trim().toLowerCase() === q.correct_option.trim().toLowerCase();

                        if (isStudentChoice) {
                          borderClass = isCorrect
                            ? 'border-green-500 bg-green-50/50 text-green-950 font-medium'
                            : 'border-red-500 bg-red-50/50 text-red-950';
                        } else if (isCorrectOption) {
                          borderClass = 'border-green-500 bg-green-50/50 text-green-950 font-medium border-dashed';
                        } else {
                          borderClass = 'border-surface-container bg-white/30 opacity-70';
                        }
                      }
                    } else {
                      // Teacher Mode
                      if (activeTab === 'answer') {
                        const isCorrectOption = val.trim().toLowerCase() === q.correct_option.trim().toLowerCase();
                        borderClass = isCorrectOption
                          ? 'border-green-500 bg-green-50/50 text-green-950 font-medium'
                          : 'border-surface-container bg-white/30 opacity-70';
                      } else {
                        borderClass = 'border-surface-container bg-white/50';
                      }
                    }

                    return (
                      <button
                        key={val}
                        disabled={role !== 'Student' || isSubmitted}
                        onClick={() => setUserAnswers({ ...userAnswers, [q.id]: val })}
                        className={`flex-1 py-3 px-5 rounded-xl border-2 text-center transition-all font-semibold ${borderClass} ${interactiveClass}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Answer Input Field */}
              {q.type === 'ShortAnswer' && (
                <div className="mb-6">
                  {role === 'Student' ? (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-txt-variant block">Write Your Answer:</label>
                      <textarea
                        disabled={isSubmitted}
                        value={studentAns || ''}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                        placeholder="Type your response here..."
                        className="w-full px-4 py-3 bg-white/50 border border-surface-container rounded-xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all outline-none text-txt text-sm min-h-[80px]"
                      />
                    </div>
                  ) : (
                    // Teacher Mode shows a clear, stylized underline answer area
                    <div className="h-10 border-b-2 border-dashed border-surface-dim max-w-lg mb-2"></div>
                  )}
                </div>
              )}

              {/* Display Solution Card when visible (Student after submission OR Teacher in Answer tab) */}
              {((role === 'Student' && isSubmitted) || (role === 'Teacher' && activeTab === 'answer')) && (
                <div className="bg-surface-low p-5 rounded-2xl text-sm space-y-3 border border-surface-container/60 shadow-inner mt-4">
                  <div>
                    <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded mr-2">
                      Key Solution
                    </span>
                    <strong className="text-txt">Correct Option / Response:</strong>
                    <p className="text-green-700 font-bold mt-1 text-base bg-white/80 p-2.5 rounded-lg border border-surface-container inline-block min-w-[120px] text-center">
                      {q.correct_option}
                    </p>
                  </div>
                  <div>
                    <strong className="text-txt">Slide Explanation:</strong>
                    <p className="text-txt-variant leading-relaxed mt-1 bg-white/80 p-3 rounded-lg border border-surface-container">
                      {q.answer_explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Student Submit Button (Visible only to students before submission) */}
      {role === 'Student' && !isSubmitted && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleStudentSubmit}
            className="btn-primary w-full md:w-auto md:px-12 py-4 text-lg shadow-lg flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            Submit Answers & Grade
          </button>
        </div>
      )}
    </div>
  );
}
