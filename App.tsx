
import React, { useState, useRef, useEffect } from 'react';
import FireworkEngine, { FireworkEngineHandle } from './FireworkEngine';
import { generateNewYearWish } from './geminiService';
import { WishResponse, FireworkType } from './types';

const UI_STRINGS = {
  en: {
    title: "Lunar Glow 2025",
    subtitle: "Tell Gemini what you hope for this year, and watch the sky transform.",
    placeholder: "e.g. Success in career, peace in family, or just 'Happy New Year!'",
    button: "Ignite My Celebration",
    loading: "Consulting the Stars...",
    reset: "Create New Wish",
    instruction: "Click anywhere to launch fireworks",
    langToggle: "中文",
    typePeony: "Peony",
    typeCross: "Cross",
    typeMeteor: "Meteor",
    typeRandom: "Random"
  },
  zh: {
    title: "2025 辰光烟火",
    subtitle: "告诉 Gemini 你的新年愿望，点亮璀璨夜空。",
    placeholder: "例如：事业有成、家人平安，或者简单的“新年快乐！”",
    button: "开启盛典",
    loading: "星辰占卜中...",
    reset: "重写愿望",
    instruction: "点击屏幕发射烟花",
    langToggle: "English",
    typePeony: "牡丹",
    typeCross: "十字",
    typeMeteor: "流星",
    typeRandom: "随机"
  }
};

const App: React.FC = () => {
  const engineRef = useRef<FireworkEngineHandle>(null);
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [wish, setWish] = useState<WishResponse | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [selectedType, setSelectedType] = useState<FireworkType>('random');

  const t = UI_STRINGS[lang];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !showForm) {
        engineRef.current?.launch();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [loading, showForm]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    const result = await generateNewYearWish(`${userInput} (Reply in ${lang === 'zh' ? 'Chinese' : 'English'})`);
    setWish(result);
    setLoading(false);
    setShowForm(false);

    // Initial burst
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        engineRef.current?.launch(
          Math.random() * window.innerWidth,
          Math.random() * (window.innerHeight * 0.4) + 100,
          result.colors,
          selectedType === 'random' ? (['peony', 'cross', 'meteor'][i % 3] as FireworkType) : selectedType
        );
      }, i * 250);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (showForm) return;
    engineRef.current?.launch(e.clientX, e.clientY, wish?.colors, selectedType);
  };

  const toggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLang(lang === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="relative min-h-screen w-full text-white font-sans overflow-hidden bg-black select-none" onClick={handleCanvasClick}>
      <FireworkEngine ref={engineRef} colors={wish?.colors} />

      {/* Language Toggle */}
      <button 
        onClick={toggleLanguage}
        className="fixed top-6 right-6 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-sm transition-all pointer-events-auto"
      >
        {t.langToggle}
      </button>

      {/* Main UI */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 pointer-events-none">
        
        {wish && !showForm && (
          <div className="max-w-2xl text-center mb-12 animate-fade-in pointer-events-auto bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-sm uppercase tracking-widest text-yellow-500 mb-2 font-bold">{wish.theme}</h2>
            <p className="text-2xl md:text-4xl font-light leading-relaxed text-white drop-shadow-lg">
              {wish.message}
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowForm(true); }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-sm transition-all"
              >
                {t.reset}
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="w-full max-w-md pointer-events-auto animate-slide-up">
             <div className="bg-black/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20 shadow-2xl">
              <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-yellow-200 via-red-400 to-pink-500 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-gray-400 text-center text-sm mb-6">
                {t.subtitle}
              </p>
              
              <form onSubmit={handleGenerate} className="space-y-4">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={t.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all h-32 resize-none"
                />

                {/* Firework Type Selector */}
                <div className="flex justify-between gap-2">
                  {(['peony', 'cross', 'meteor', 'random'] as FireworkType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`flex-1 py-2 text-[10px] uppercase tracking-tighter rounded-lg border transition-all ${
                        selectedType === type 
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {t[`type${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof t]}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 rounded-2xl font-bold shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? t.loading : t.button}
                </button>
              </form>
            </div>
          </div>
        )}

        {!showForm && (
          <div className="fixed bottom-10 text-gray-400 text-xs tracking-widest uppercase opacity-60">
            {t.instruction}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;
