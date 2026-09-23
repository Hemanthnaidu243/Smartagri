import React, { useState } from 'react';
import { BookOpen, Search, Filter, Clock, CheckCircle2, ChevronRight, X, Sparkles } from 'lucide-react';
import { Language, KnowledgeArticle } from '../types';
import { translations } from '../i18n/translations';
import { knowledgeArticles } from '../data/knowledgeBase';

interface KnowledgeCenterProps {
  language: Language;
}

export const KnowledgeCenter: React.FC<KnowledgeCenterProps> = ({ language }) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);

  const categories = [
    { id: 'all', label: t.knowledge.allCategories },
    { id: 'disease', label: t.knowledge.categories.disease },
    { id: 'organic', label: t.knowledge.categories.organic },
    { id: 'soil', label: t.knowledge.categories.soil },
    { id: 'water', label: t.knowledge.categories.water },
    { id: 'fertilizer', label: t.knowledge.categories.fertilizer },
    { id: 'sustainability', label: t.knowledge.categories.sustainability },
  ];

  const filteredArticles = knowledgeArticles.filter((article) => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const title = (language === 'te' ? article.titleTelugu : article.title).toLowerCase();
    const summary = (language === 'te' ? article.summaryTelugu : article.summary).toLowerCase();
    const matchesSearch = !query || title.includes(query) || summary.includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Scientific Field Extension Library</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.knowledge.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
          {t.knowledge.subtitle}
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.knowledge.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        {/* Category Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  {t.knowledge.categories[article.category]}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime}</span>
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {language === 'te' ? article.titleTelugu : article.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'te' ? article.summaryTelugu : article.summary}
              </p>

              {/* Bullet Takeaways */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {t.knowledge.keyTakeaways}
                </span>
                <ul className="space-y-1">
                  {(language === 'te' ? article.keyTakeawaysTelugu : article.keyTakeaways).slice(0, 2).map((takeaway, idx) => (
                    <li key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setActiveArticle(article)}
              className="mt-5 w-full py-2 px-3 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>{t.knowledge.readArticle}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Full Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  {t.knowledge.categories[activeArticle.category]}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {language === 'te' ? activeArticle.titleTelugu : activeArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {language === 'te' ? activeArticle.summaryTelugu : activeArticle.summary}
              </p>
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {t.knowledge.keyTakeaways}
                </span>
                <ul className="space-y-2">
                  {(language === 'te' ? activeArticle.keyTakeawaysTelugu : activeArticle.keyTakeaways).map((tkw, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{tkw}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Field Protocol Details:</h4>
                <p>{language === 'te' ? activeArticle.detailsTelugu : activeArticle.details}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Close Field Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
