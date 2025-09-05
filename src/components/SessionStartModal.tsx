import React, { useState } from 'react';

interface SessionStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (questionCount: number, difficulty?: string) => void;
  onCancel?: () => void;
}

export const SessionStartModal = ({ isOpen, onClose, onStart, onCancel }: SessionStartModalProps) => {
  const [selectedQuestions, setSelectedQuestions] = useState(10);
  
  if (!isOpen) return null;

  const handleStartPractice = () => {
    console.log(`Starting practice with ${selectedQuestions} questions`);
    onStart(selectedQuestions);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Start Practice Session</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:rotate-90"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Choose number of questions</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* 10 Questions Option */}
            <button
              onClick={() => setSelectedQuestions(10)}
              className={`rounded-2xl p-6 border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                selectedQuestions === 10 
                  ? 'border-indigo-600 bg-indigo-50 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="text-4xl font-bold text-indigo-600 mb-2">10</div>
              <div className="text-base font-semibold text-gray-700">Questions</div>
              <div className="text-sm text-gray-500 mt-1">Quick session</div>
            </button>

            {/* 20 Questions Option */}
            <button
              onClick={() => setSelectedQuestions(20)}
              className={`rounded-2xl p-6 border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                selectedQuestions === 20 
                  ? 'border-indigo-600 bg-indigo-50 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="text-4xl font-bold text-indigo-600 mb-2">20</div>
              <div className="text-base font-semibold text-gray-700">Questions</div>
              <div className="text-sm text-gray-500 mt-1">Full session</div>
            </button>
          </div>

          {/* Info Section */}
          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl mb-8">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-indigo-700">
              Personalized questions based on your progress
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onCancel || onClose}
              className="flex-1 py-4 px-8 text-indigo-600 font-semibold hover:bg-gray-100 rounded-full transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-2 border-indigo-200"
            >
              Cancel
            </button>
            <button
              onClick={handleStartPractice}
              className="flex-1 py-4 px-8 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 rounded-full transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
            >
              Start Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};