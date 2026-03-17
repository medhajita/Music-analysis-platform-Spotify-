import React, { useState } from 'react';
import { Mail, Send, X, CheckCircle } from 'lucide-react';

const SuggestionForm = ({ artistName, onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate suggestion submission
    setTimeout(() => {
      setSubmitted(true);
      setTimeout(onClose, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-500">
          <X className="w-6 h-6" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="inline-block p-4 bg-emerald-500/20 rounded-full border border-emerald-500/30">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold">Suggestion envoyée !</h2>
            <p className="text-slate-400">Merci de nous aider à enrichir la plateforme.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-block p-4 bg-purple-500/10 rounded-full border border-purple-500/20 mb-4">
                <Send className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold">Suggérer un Artiste</h2>
              <p className="text-slate-400 mt-2">Nous ajouterons "{artistName}" à notre cycle d'analyse prioritaire.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Votre Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-start gap-4">
                <Mail className="w-5 h-5 text-slate-500 mt-1" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  En envoyant cette suggestion, vous serez notifié dès que l'artiste sera disponible avec toutes ses données analytiques.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-black text-lg transition-all shadow-lg shadow-purple-500/20"
              >
                Envoyer la suggestion
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionForm;
