import React, { useState, useRef, Suspense } from 'react';
import Scene from './components/Scene';
import { TreeState } from './types';
import { generateChristmasMemory } from './services/geminiService';

const App = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.FORMED);
  
  // Interaction State
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [memory, setMemory] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState("");
  const [loadingMemory, setLoadingMemory] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePointerDown = () => {
      setTreeState(TreeState.FORMED);
  };

  const handlePointerUp = () => {
      setTreeState(TreeState.CHAOS);
  };

  const handlePhotoClick = (id: number) => {
      setSelectedPhotoId(id);
      setMemory(null);
      setUserMessage(""); // Reset message input
  };

  const handleGenerateMemory = async () => {
      if (selectedPhotoId === null) return;
      setLoadingMemory(true);
      const text = await generateChristmasMemory(selectedPhotoId, userMessage);
      setMemory(text);
      setLoadingMemory(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
          const newImageUrls = Array.from(files).map(file => URL.createObjectURL(file));
          // Append new images to existing ones, or replace? replacing feels cleaner for "sets"
          setUploadedImages(prev => [...prev, ...newImageUrls]);
      }
  };

  return (
    <div 
        className="w-full h-screen relative bg-black overflow-hidden select-none font-sans"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
    >
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-10 cursor-pointer">
        <Suspense fallback={<div className="w-full h-full bg-black flex items-center justify-center text-emerald-500 font-serif">Summoning Holiday Magic...</div>}>
            <Scene 
                treeState={treeState} 
                onPhotoClick={handlePhotoClick}
                customTextureUrls={uploadedImages}
            />
        </Suspense>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Header */}
        <header className="flex justify-between items-start">
            <div>
                <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                    Merry Christmas
                </h1>
                <p className="text-emerald-200 mt-2 text-lg font-light tracking-widest opacity-80 uppercase">
                    Interactive Holiday Wishing Tree
                </p>
            </div>

            {/* Upload Button */}
            <div className="pointer-events-auto flex flex-col items-end gap-2">
                <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 px-4 py-2 rounded-lg border border-emerald-500/50 backdrop-blur-md transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v12a2.25 2.25 0 002.25 2.25zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    Upload Photos
                </button>
                {uploadedImages.length > 0 && (
                    <button 
                        onClick={() => setUploadedImages([])}
                        className="text-xs text-emerald-400 hover:text-emerald-200 underline"
                    >
                        Clear Uploads ({uploadedImages.length})
                    </button>
                )}
            </div>
        </header>

        {/* Instructions */}
        <div className="flex justify-center mb-8 pointer-events-auto">
             <div className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full text-white/70 text-sm flex items-center gap-4 shadow-lg shadow-emerald-900/20">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                    Hold to Form Tree
                </span>
                <span className="w-px h-4 bg-white/20"/>
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"/>
                    Release to Scatter
                </span>
                <span className="w-px h-4 bg-white/20"/>
                 <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"/>
                    Click Photo to Wish
                </span>
             </div>
        </div>
      </div>

      {/* Memory/Message Modal */}
      {selectedPhotoId !== null && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300 pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()} // Prevent closing tree
          >
              <div className="bg-gradient-to-b from-[#022c22] to-[#000] border border-amber-500/30 p-8 w-full max-w-md rounded-xl shadow-[0_0_50px_rgba(251,191,36,0.2)] relative">
                  <button 
                    onClick={() => { setSelectedPhotoId(null); setMemory(null); }}
                    className="absolute top-4 right-4 text-emerald-500 hover:text-white transition-colors"
                  >
                      ✕
                  </button>
                  
                  <h3 className="text-2xl font-serif text-amber-400 mb-4 border-b border-white/10 pb-2">
                      {memory ? "✨ A Holiday Memory" : "📷 Capture the Moment"}
                  </h3>

                  {/* Input Form (Only if memory not generated yet) */}
                  {!memory && !loadingMemory && (
                      <div className="space-y-4">
                          <p className="text-emerald-100/80 text-sm">
                              What story lies within this photo? Write it down, and let Christmas magic weave an eternal memory for you.
                          </p>
                          <textarea 
                              className="w-full bg-black/30 border border-emerald-500/30 rounded-lg p-3 text-white placeholder-emerald-700/50 focus:outline-none focus:border-amber-500/50 transition-colors resize-none h-24"
                              placeholder="e.g., This was taken during our ski trip to Hokkaido last year..."
                              value={userMessage}
                              onChange={(e) => setUserMessage(e.target.value)}
                          />
                          <button 
                              onClick={handleGenerateMemory}
                              className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all"
                          >
                              ✨ Generate Memory
                          </button>
                      </div>
                  )}
                  
                  {/* Loading State */}
                  {loadingMemory && (
                      <div className="flex flex-col items-center gap-4 py-8">
                          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-emerald-200/60 text-sm animate-pulse">Listening to the whispers of Christmas elves...</p>
                      </div>
                  )}

                  {/* Result State */}
                  {memory && (
                      <div className="animate-in slide-in-from-bottom-2">
                          <p className="text-lg leading-relaxed text-emerald-50 font-light italic mb-6">
                              "{memory}"
                          </p>
                          <button 
                              onClick={() => { setSelectedPhotoId(null); setMemory(null); }}
                              className="w-full border border-emerald-500/30 hover:bg-emerald-900/30 text-emerald-200 py-2 rounded-lg transition-colors"
                          >
                              Cherish this Memory
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default App;