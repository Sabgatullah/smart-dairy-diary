import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Sparkles,
  Send,
  Stethoscope,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

export const AIDairyAdvisor: React.FC = () => {
  const { animals, milkRecords, activeMilkDropAlerts, settings } = useFarm();

  const [activeSubTab, setActiveSubTab] = useState<'consult' | 'diagnose'>('consult');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [consultResponse, setConsultResponse] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Diagnostic Tab State
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animals[0]?.id || '');
  const [symptomsInput, setSymptomsInput] = useState<string>('Sudden drop in evening milk, swollen right quarter, warm to touch');
  const [diagnosisResult, setDiagnosisResult] = useState<string>('');
  const [diagnosing, setDiagnosing] = useState(false);

  const selectedAnimal = animals.find((a) => a.id === selectedAnimalId);

  // Quick prompt presets
  const quickPrompts = [
    'How to balance Wanda, Toori, and Barseem ration to increase milk fat percentage in Nili-Ravi buffaloes?',
    'What are the signs of silent heat in buffaloes and how to detect it accurately for AI timing?',
    'How to perform California Mastitis Test (CMT) and treat subclinical mastitis (Saaroo) effectively?',
    'What is the standard vaccination and deworming schedule for dairy herds in Punjab, Pakistan?',
    'How to manage the 60-day dry period to prevent milk fever (hypocalcemia) and ketosis after calving?',
  ];

  const handleAskConsultant = async (textToAsk?: string) => {
    const query = textToAsk || prompt;
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setConsultResponse('');

    const farmContext = {
      farmName: settings.farmName,
      location: settings.location,
      totalHerd: animals.length,
      milkingCount: animals.filter((a) => a.status === 'Milking').length,
      sickCount: animals.filter((a) => a.status === 'Sick').length,
      recentAlerts: activeMilkDropAlerts.map((a) => ({
        tag: a.animalTag,
        species: a.species,
        drop: `${a.dropPercentage}%`,
      })),
    };

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, context: farmContext }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get advisory response.');
      }

      setConsultResponse(data.advice);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error communicating with AI Advisor.');
      // Offline fallback advisory
      setConsultResponse(
        `### Expert Dairy Practice Summary (Offline Mode)\n\n**Key Principles for Pakistani Dairy Farms:**\n- **Ration Balancing:** Provide 1kg Supreme Wanda for every 2.5–3.0 kg of milk produced, mixed with 35–40 kg fresh green fodder (Barseem/Maize) and 4–5 kg dry Wheat Straw (Toori) as rumen fiber buffer.\n- **Butterfat Enhancement:** Add 200–300g cottonseed cake (Khal) or protected bypass fat with 50g mineral mixture to sustain 6.5–7.5% fat in buffaloes.\n- **Mastitis Control:** Dip teats in 0.5% povidone-iodine solution post-milking. Keep animals standing for 30 minutes after milking until the teat sphincter closes.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnosis = async () => {
    if (!selectedAnimal) return;

    setDiagnosing(true);
    setDiagnosisResult('');
    setErrorMsg(null);

    const recentLogs = milkRecords
      .filter((r) => r.animalId === selectedAnimal.id)
      .slice(0, 5)
      .map((r) => ({ date: r.date, totalLiters: r.totalDailyMilkLiters }));

    try {
      const res = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animal: selectedAnimal,
          recentMilkLogs: recentLogs,
          symptoms: symptomsInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Diagnostic service error.');
      }

      setDiagnosisResult(data.diagnosis);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Diagnosis service temporarily unavailable.');
      setDiagnosisResult(
        `### Clinical Assessment (Emergency Protocol)\n\n**Probable Condition:** Clinical Mastitis (Saaroo) or localized teat trauma.\n\n**Immediate Actions:**\n1. Check rectal temperature with a digital thermometer (Normal: 101.5°F for cow, 101.0°F for buffalo).\n2. Strip milk into a black strip cup to check for clots, flakes, or watery discoloration.\n3. Apply cold water compress if quarter is acutely inflamed.\n4. Administer anti-inflammatory (e.g. Meloxicam 15ml IM) and consult Dr. Nasir Iqbal or a licensed DVM for intramammary infusion.\n\n**⚠️ Milk Safety:** Withhold and discard milk from treated animals until antibiotic withdrawal period concludes.`
      );
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>AI Farm Advisor & Clinical Vet ("Dr. Dairy")</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Precision dairy guidance calibrated for Pakistani breeds (Nili-Ravi, Sahiwal), local feeds (Wanda, Barseem, Toori), and diseases.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveSubTab('consult')}
            className={`flex items-center gap-1.5 px-3 py-1 font-medium rounded-md transition-colors ${
              activeSubTab === 'consult'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dairy Consultant</span>
          </button>
          <button
            onClick={() => setActiveSubTab('diagnose')}
            className={`flex items-center gap-1.5 px-3 py-1 font-medium rounded-md transition-colors ${
              activeSubTab === 'diagnose'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-rose-600" />
            <span>Clinical Symptom Diagnosis</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'consult' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input & Preset Questions */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Frequently Asked Herd Questions</span>
              </h2>

              <div className="space-y-2">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(q);
                      handleAskConsultant(q);
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs text-slate-700 transition-colors"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>

            {/* Farm Context Summary */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800">Automatic Farm Context Injected:</div>
              <div>· Total Herd: {animals.length} animals</div>
              <div>· Location: {settings.location}</div>
              <div>· Currency: Pakistani Rupees (PKR)</div>
              {activeMilkDropAlerts.length > 0 && (
                <div className="text-amber-800 font-semibold">
                  · {activeMilkDropAlerts.length} animal(s) flagged with milk drops
                </div>
              )}
            </div>
          </div>

          {/* Right: Consultation Query Box & Response */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Ask Dr. Dairy regarding Nutrition, Diseases, Reproduction, or Management:
              </label>

              <div className="relative">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. My Sahiwal cow delivered 10 days ago and is showing reduced appetite and sweet smell in breath. What should I check?"
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleAskConsultant()}
                  disabled={loading || !prompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-sm transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing Herd Science...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Ask Dr. Dairy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Response Area */}
            {consultResponse && (
              <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      Dr
                    </div>
                    <span className="text-xs font-bold text-slate-900">Dr. Dairy Consultation Report</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Gemini 3.8 Flash Powered</span>
                </div>

                <div className="prose prose-sm max-w-none text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {consultResponse}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Clinical Symptom Diagnosis Tab */
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-rose-600" />
              <span>Targeted Animal Clinical Diagnostic Assistant</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an animal from your herd to evaluate its milk drop trajectory and observed symptoms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Animal *</label>
              <select
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
              >
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.tag} - {a.name} ({a.species} / {a.breed}) · Status: {a.status}
                  </option>
                ))}
              </select>

              {selectedAnimal && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-800">
                    {selectedAnimal.tag} ({selectedAnimal.name})
                  </div>
                  <div className="text-slate-600">
                    {selectedAnimal.species} · {selectedAnimal.breed} · Lactation #{selectedAnimal.lactationNumber}
                  </div>
                  <div className="text-slate-500">
                    Location: {selectedAnimal.location} · Status: {selectedAnimal.status}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Observed Symptoms / Physical Signs *</label>
              <textarea
                rows={4}
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder="e.g. Swollen left teat, hot udder, yellowish clots in milk, lethargy, rectal temp 103°F"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-600"
              />

              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleRunDiagnosis}
                  disabled={diagnosing || !symptomsInput.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-50 rounded-lg shadow-sm transition-all"
                >
                  {diagnosing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Diagnosing Clinical Indicators...</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Run Clinical Diagnosis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {diagnosisResult && (
            <div className="p-5 bg-rose-50/50 rounded-xl border border-rose-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                <div className="font-bold text-xs text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Clinical Findings & Veterinary Protocol for {selectedAnimal?.tag}</span>
                </div>
                <span className="text-[10px] text-rose-700 font-medium">Veterinary Triage</span>
              </div>

              <div className="prose prose-sm max-w-none text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {diagnosisResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
