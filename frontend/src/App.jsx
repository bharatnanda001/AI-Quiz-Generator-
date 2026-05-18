import React, { useState } from 'react';
import UploadDashboard from './components/UploadDashboard';
import QuizReview from './components/QuizReview';
import { BookOpen } from 'lucide-react';

export default function App() {
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [role, setRole] = useState('Student');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-surface-lowest shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-primary-dark">QuizAI</h1>
          </div>
          {quizData && (
            <button 
              onClick={() => { setQuizData(null); setCurrentDocumentId(null); }}
              className="text-sm font-medium text-txt-variant hover:text-txt"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        {!quizData ? (
          <UploadDashboard 
            onDocumentUploaded={setCurrentDocumentId} 
            documentId={currentDocumentId}
            onQuizGenerated={setQuizData}
            role={role}
            setRole={setRole}
          />
        ) : (
          <QuizReview 
            quizData={quizData} 
            documentId={currentDocumentId} 
            role={role}
          />
        )}
      </main>
    </div>
  );
}
