import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Image as ImageIcon, MapPin, User, Info, Loader2, X, Camera, Terminal, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeImage } from './services/gemini';

interface AnalysisResult {
  text: string;
  imageUrl: string;
}

const BG_GIF = "https://s13.gifyu.com/images/bq0OJ.gif";

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'jp', name: 'Japanese', native: '日本語' },
  { code: 'cn', name: 'Chinese', native: '简体中文' },
  { code: 'ua', name: 'Ukrainian', native: 'Українська' },
  { code: 'be', name: 'Belarusian', native: 'Беларуская' },
  { code: 'kz', name: 'Kazakh', native: 'Қазақша' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'vn', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
];

const TRANSLATIONS: Record<string, any> = {
  en: {
    title: "Hack the Location",
    scan_prompt: "> Scan image for biological and geographical data...",
    upload_tip: "Upload Target Image",
    drop_tip: "Dragging allowed | Png, Jpg supported",
    select_btn: "[Select_Source]",
    execute_btn: "EXECUTE_ANALYSIS",
    injecting: "INJECTING_PAYLOAD...",
    awaiting: "Awaiting Input",
    ready_msg: "Ready to accept data stream. Connection secure. Encryption active.",
    scanning: "SCANNING...",
    github: "github",
    donate: "donate",
    dev_node: "[ ACCESS_DEVELOPER_NODE ]",
    geo_tracker: "GEO_TRACKER",
    bio_scanner: "BIO_SCANNER",
    debug_info: "DEBUG_INFO",
    step1: "Accessing image buffer...",
    step2: "Decrypting geographical metadata...",
    step3: "Cross-referencing bio-data index...",
    step4: "Neural network processing...",
    selector_title: "Select Language // Выбор Языка",
    selector_init: "[ INITIALIZING_NEURAL_INTERFACE_LANGUAGE ]",
    selector_ready: "System ready. Waiting for user interaction...",
    copyright: "© 2026 ALL_RIGHTS_RESERVED",
    enc_status: "Secure encryption active // connection: established",
    os_version: "GEOLENS_OS v1.0",
    terminal_log: "Terminal_Output.log"
  },
  ru: {
    title: "Взлом Локации",
    scan_prompt: "> Сканирование изображения на био- и гео-данные...",
    upload_tip: "Загрузить Цель",
    drop_tip: "Перетаскивание разрешено | Png, Jpg поддерживаются",
    select_btn: "[Выбрать_Источник]",
    execute_btn: "НАЧАТЬ_АНАЛИЗ",
    injecting: "ВПРЫСК_ПОЛЕЗНОЙ_НАГРУЗКИ...",
    awaiting: "Ожидание Ввода",
    ready_msg: "Готов к приему потока данных. Соединение защищено. Шифрование активно.",
    scanning: "СКАНИРОВАНИЕ...",
    github: "гитхаб",
    donate: "донат",
    dev_node: "[ УЗЕЛ_РАЗРАБОТЧИКА ]",
    geo_tracker: "ГЕО_ТРЕКЕР",
    bio_scanner: "БИО_СКАНЕР",
    debug_info: "ОТЛАДКА",
    step1: "Доступ к буферу изображения...",
    step2: "Расшифровка геоданных...",
    step3: "Сверка биометрических индексов...",
    step4: "Нейронная обработка...",
    selector_title: "Выбор Языка // Select Language",
    selector_init: "[ ИНИЦИАЛИЗАЦИЯ ЯЗЫКОВОГО ИНТЕРФЕЙСА ]",
    selector_ready: "Система готова. Ожидание взаимодействия...",
    copyright: "© 2026 ВСЕ_ПРАВА_ЗАЩИЩЕНЫ",
    enc_status: "Шифрование активно // соединение: установлено",
    os_version: "ГЕОЛИНЗА_ОС v1.0",
    terminal_log: "Вывод_Терминала.log"
  },
  jp: {
    title: "位置探索ハック",
    scan_prompt: "> 生体データおよび地理データをスキャン中...",
    upload_tip: "画像をアップロード",
    drop_tip: "ドラッグ可 | Png, Jpg 対応",
    select_btn: "[ソース選択]",
    execute_btn: "解析開始",
    injecting: "注入中...",
    awaiting: "入力待ち",
    ready_msg: "データ準備完了。接続保護中。",
    scanning: "スキャン中...",
    github: "github",
    donate: "寄付",
    dev_node: "[ 開発者ノード ]",
    os_version: "GEOLENS_OS v1.0",
    terminal_log: "Terminal_Log.log",
    geo_tracker: "位置追跡",
    bio_scanner: "生体スキャナー",
    debug_info: "デバッグ",
    step1: "バッファにアクセス...",
    step2: "メタデータを解読...",
    step3: "インデックスを照合...",
    step4: "処理中...",
    selector_title: "言語選択",
    selector_init: "[ インターフェース初期化 ]",
    selector_ready: "準備完了。",
    copyright: "© 2026 全著作権所有",
    enc_status: "暗号化有効"
  },
  cn: {
    title: "定位破解",
    scan_prompt: "> 正在扫描生物和地理数据...",
    upload_tip: "上传目标",
    drop_tip: "支持拖放 | Png, Jpg",
    select_btn: "[选择数据源]",
    execute_btn: "执行分析",
    injecting: "正在注入...",
    awaiting: "等待输入",
    ready_msg: "就绪。连接已加密。",
    scanning: "扫描中...",
    github: "github",
    donate: "捐赠",
    dev_node: "[ 开发者节点 ]",
    os_version: "GEOLENS_OS v1.0",
    terminal_log: "Terminal_Log.log",
    geo_tracker: "定位追踪",
    bio_scanner: "生物识别",
    debug_info: "调试信息",
    step1: "访问图像...",
    step2: "解密元数据...",
    step3: "引用索引...",
    step4: "处理中...",
    selector_title: "选择语言",
    selector_init: "[ 初始化接口 ]",
    selector_ready: "系统就绪。",
    copyright: "© 2026 版权所有",
    enc_status: "加密连接已建立"
  },
  ua: {
    title: "Злам Локації",
    scan_prompt: "> Сканування зображення на біо- та гео-дані...",
    upload_tip: "Завантажити Ціль",
    drop_tip: "Перетягування дозволено | Png, Jpg підтримуються",
    select_btn: "[Обрати_Джерело]",
    execute_btn: "ПОЧАТИ_АНАЛІЗ",
    injecting: "ІН'ЄКЦІЯ_ПЕЙЛОАДУ...",
    awaiting: "Очікування Вводу",
    ready_msg: "Готовій до прийому потоку даних. З'єднання захищене. Шифрування активне.",
    scanning: "СКАНУВАННЯ...",
    github: "гітхаб",
    donate: "донат",
    dev_node: "[ ВУЗОЛ_РОЗРОБНИКА ]",
    geo_tracker: "ГЕО_ТРЕКЕР",
    bio_scanner: "БІО_СКАНЕР",
    debug_info: "ВІДЛАДКА",
    step1: "Доступ до буфера зображення...",
    step2: "Розшифровка геоданих...",
    step3: "Звірка біометричних індексів...",
    step4: "Нейронна обробка...",
    selector_title: "Вибір Мови // Select Language",
    selector_init: "[ ІНІЦІАЛІЗАЦІЯ МОВНОГО ІНТЕРФЕЙСУ ]",
    selector_ready: "Система готова. Очікування взаємодії...",
    copyright: "© 2026 ВСІ_ПРАВА_ЗАХИЩЕНІ",
    enc_status: "Шифрування активне // з'єднання: встановлено",
    os_version: "ГЕОЛІНЗА_ОС v1.0",
    terminal_log: "Вивід_Терміналу.log"
  },
  be: {
    title: "Узлом Лакацыі",
    scan_prompt: "> Сканаванне выявы на бія- і геа-даныя...",
    upload_tip: "Загрузіць Мэту",
    drop_tip: "Перацягванне дазволена | Png, Jpg падтрымліваюцца",
    select_btn: "[Выбраць_Крыніцу]",
    execute_btn: "ПАЧАЦЬ_АНАЛІЗ",
    injecting: "ІН'ЕКЦЫЯ_ПЭЙЛОАДА...",
    awaiting: "Чаканне Уводу",
    ready_msg: "Гатовы да прыёму патоку даных. Злучэнне абаронена. Шифраванне актыўнае.",
    scanning: "СКАНАВАННЕ...",
    github: "гітхаб",
    donate: "донат",
    dev_node: "[ ВУЗАЛ_РАСПРАЦОЎШЧЫКА ]",
    geo_tracker: "ГЕА_ТРЭКЕР",
    bio_scanner: "БІЯ_СКАНЕР",
    debug_info: "АДЛАДКА",
    step1: "Доступ да буфера выявы...",
    step2: "Расшыфроўка геаданых...",
    step3: "Зверка біяметрычных індэксаў...",
    step4: "Нейронная апрацоўка...",
    selector_title: "Выбар Мовы",
    selector_init: "[ ІНІЦЫЯЛІЗАЦЫЯ ]",
    selector_ready: "Сістэма гатовая.",
    copyright: "© 2026 УСЕ_ПРАВЫ_АБАРОНЕНЫ",
    enc_status: "Шыфраванне актыўнае",
    os_version: "ГЕАЛІНЗА_ОС v1.0",
    terminal_log: "Вывад_Тэрмінала.log"
  },
  kz: {
    title: "Орынды бұзу",
    scan_prompt: "> Кескінді био және геодезиялық деректерге сканерлеу...",
    upload_tip: "Нысанды жүктеу",
    drop_tip: "Сүйреп апаруға рұқсат | Png, Jpg арқылы",
    select_btn: "[Көзді таңдау]",
    execute_btn: "АНАЛИЗДІ БАСТАУ",
    injecting: "ЕНГІЗУ...",
    awaiting: "Күту",
    ready_msg: "Дайын. Байланыс қауіпсіз. Шифрлау белсенді.",
    scanning: "СКАНЕРЛЕУ...",
    github: "github",
    donate: "донат",
    dev_node: "[ ӘЗІРЛЕУШІ ]",
    geo_tracker: "ГЕО ТРЕКЕР",
    bio_scanner: "БИО СКАНЕР",
    debug_info: "ТҮЗЕТУ",
    step1: "Кіру...",
    step2: "Шифрын шешу...",
    step3: "Салыстыру...",
    step4: "Өңдеу...",
    selector_title: "Тілді таңдау",
    selector_init: "[ БАСТАУ ]",
    selector_ready: "Дайын.",
    copyright: "© 2026 БАРЛЫҚ ҚҰҚЫҚТАР ҚОРҒАЛҒАН",
    enc_status: "Шифрлау белсенді",
    os_version: "ГЕОЛИНЗА_ОС v1.0",
    terminal_log: "Terminal_Шығысы.log"
  }
};

function LanguageSelector({ onSelect }: { onSelect: (lang: typeof LANGUAGES[0]) => void }) {
  const t_static = (key: string) => {
    return TRANSLATIONS['ru'][key] || TRANSLATIONS['en'][key];
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
      <div className="relative w-full max-w-4xl max-h-[80vh] bg-black border-2 border-green-500 p-8 overflow-y-auto shadow-[0_0_50px_rgba(34,197,94,0.3)]">
        <div className="text-center mb-10 space-y-4">
          <Terminal className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
          <h2 className="text-4xl font-black uppercase tracking-[0.2em] text-white underline decoration-green-500/50 decoration-wavy">{t_static('selector_title')}</h2>
          <p className="text-green-500/50 uppercase text-[10px] tracking-widest animate-pulse font-bold">{t_static('selector_init')}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang)}
              className="flex flex-col items-center justify-center p-4 border border-green-500/20 bg-green-500/5 hover:bg-green-500 hover:text-black transition-all group scale-100 hover:scale-105"
            >
              <span className="text-xs font-black uppercase mb-1 tracking-tighter group-hover:text-black">{lang.name}</span>
              <span className="text-[10px] opacity-70 group-hover:text-black font-mono">{lang.native}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FallingParticles() {
  const [particles, setParticles] = useState<{ id: number; left: number; duration: number; delay: number; size: number }[]>([]);
  useEffect(() => {
    setParticles(Array.from({ length: 15 }).map((_, i) => ({
      id: i, left: Math.random() * 100, duration: 8 + Math.random() * 12, delay: Math.random() * 5, size: 40 + Math.random() * 60
    })));
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.img
          key={p.id} src={BG_GIF} alt="Particle" referrerPolicy="no-referrer"
          initial={{ y: -150, opacity: 0 }}
          animate={{ y: ['0vh', '110vh'], opacity: [0, 1, 1, 0], rotate: [0, 360] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', left: `${p.left}%`, width: `${p.size}px`, height: 'auto' }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<typeof LANGUAGES[0] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: string) => {
    const lang = selectedLang?.code || 'en';
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key];
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { setError('ERROR: INVALID_FILE_TYPE'); return; }
    setError(null); setFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url); setResult(null);
  }, []);

  const startAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true); setError(null);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;
      const analysisContent = await analyzeImage(base64, file.type, selectedLang?.name || "English");
      if (analysisContent) {
        setResult({ text: analysisContent, imageUrl: previewUrl! });
      }
    } catch (err: any) {
      setError(err.message || 'SYSTEM_FAILURE');
    } finally { setIsAnalyzing(false); }
  };

  const reset = () => {
    setFile(null); setPreviewUrl(null); setResult(null); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-black text-[#00FF41] font-mono selection:bg-green-900 selection:text-green-100 relative overflow-x-hidden">
      <AnimatePresence>
        {!selectedLang && (
          <motion.div key="language-selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100]">
            <LanguageSelector onSelect={setSelectedLang} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed inset-0 z-[-1] opacity-100" style={{ backgroundImage: `url(${BG_GIF})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="fixed inset-0 bg-green-500/[0.03] pointer-events-none z-[-1]" />
      <FallingParticles />

      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-sm border-b border-green-500/30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-green-500/50 rounded flex items-center justify-center bg-green-500/10"><Terminal className="w-6 h-6 text-green-400" /></div>
            <span className="font-bold text-2xl tracking-tighter uppercase drop-shadow-[0_0_8px_rgba(0,255,0,0.5)]">{t('os_version')}</span>
          </div>
          <button onClick={() => setSelectedLang(null)} className="px-4 py-1 border border-green-500/50 bg-green-500/10 text-[10px] font-black uppercase hover:bg-green-500 hover:text-black transition-all">
            {selectedLang?.code.toUpperCase() || 'EN'} ⟳
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4 bg-black/30 p-6 border-l-4 border-green-500 backdrop-blur-sm shadow-2xl">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white">
                {t('title').split(' ')[0]} <span className="text-green-500">{t('title').split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-sm text-green-400/80 uppercase font-bold tracking-widest bg-green-500/10 p-2 inline-block">{t('scan_prompt')}</p>
            </div>

            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
              className={`relative group border-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[350px] p-8 bg-black/20 backdrop-blur-sm ${previewUrl ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-green-500/20 hover:border-green-400 hover:bg-green-500/5'}`}
            >
              <AnimatePresence mode="wait">
                {!previewUrl ? (
                  <motion.div key="upload-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 border border-green-500/30 bg-black flex items-center justify-center group overflow-hidden">
                      <Camera className="w-10 h-10 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-black tracking-widest uppercase text-white text-center">{t('upload_tip')}</p>
                      <p className="text-[10px] text-green-500/50 uppercase font-mono tracking-tighter text-center">{t('drop_tip')}</p>
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 border border-green-500 text-green-500 uppercase text-xs font-bold hover:bg-green-500 hover:text-black transition-all tracking-widest">{t('select_btn')}</button>
                  </motion.div>
                ) : (
                  <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full h-full border border-green-500/50 p-2 bg-black">
                    <img src={previewUrl} alt="Target" className="w-full h-auto object-contain max-h-[400px] grayscale brightness-75 hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                    <button onClick={reset} className="absolute -top-3 -right-3 p-2 bg-green-500 text-black border border-green-400 hover:bg-red-500 transition-colors"><X className="w-4 h-4" /></button>
                  </motion.div>
                )}
              </AnimatePresence>
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" accept="image/*" />
            </div>

            {previewUrl && !result && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} disabled={isAnalyzing} onClick={startAnalysis}
                className="w-full py-5 bg-green-600 text-black font-black uppercase text-sm tracking-[0.3em] hover:bg-green-400 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isAnalyzing ? <><Loader2 className="w-6 h-6 animate-spin" />{t('injecting')}</> : <><Search className="w-6 h-6" />{t('execute_btn')}</>}
              </motion.button>
            )}
            {error && <div className="p-4 bg-red-900/30 text-red-400 border border-red-500/50 uppercase text-[10px] font-bold flex items-center gap-4"><ShieldAlert className="w-6 h-6" /><span>{error}</span></div>}
          </div>

          <div className="lg:col-span-7">
            <div className="min-h-[550px] bg-black/30 border border-green-500/30 relative overflow-hidden backdrop-blur-sm">
              <div className="bg-green-500/10 h-8 border-b border-green-500/30 px-4 flex items-center justify-between">
                <div className="flex gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /><div className="w-2 h-2 rounded-full bg-yellow-500" /><div className="w-2 h-2 rounded-full bg-green-500" /></div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-green-500/50">{t('terminal_log')}</span>
              </div>
              <div className="p-8 h-full overflow-y-auto max-h-[600px]">
                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full pt-20">
                      <div className="text-green-500 text-6xl animate-pulse font-black uppercase tracking-tighter">{t('scanning')}</div>
                      <div className="flex flex-col gap-1 text-[10px] text-green-500/40 uppercase font-mono mt-4">
                        <p>{">"} {t('step1')}</p><p>{">"} {t('step2')}</p><p>{">"} {t('step3')}</p><p>{">"} {t('step4')}</p>
                      </div>
                    </motion.div>
                  ) : result ? (
                    <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="markdown-body custom-hacker-md text-[#00FF41]">
                      <ReactMarkdown>{result.text}</ReactMarkdown>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center py-20 opacity-30">
                      <Terminal className="w-24 h-24 text-green-500 mb-8" />
                      <h3 className="text-2xl font-black uppercase tracking-widest mb-2">{t('awaiting')}</h3>
                      <p className="text-[10px] uppercase tracking-tighter">{t('ready_msg')}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-green-500/30 mt-12 bg-black/60 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-green-500 font-black tracking-tighter text-xl">{t('os_version').split(' ')[0]}</span>
              <span className="text-white text-xs uppercase font-bold tracking-widest">{t('copyright')}</span>
            </div>
            <p className="text-[8px] text-green-500/40 uppercase tracking-[0.5em]">{t('enc_status')}</p>
          </div>
          <div className="flex flex-col gap-4 border-2 border-green-500 p-6 bg-black">
            <span className="text-green-500 text-xs font-black uppercase tracking-[0.3em] border-b border-green-500/30 pb-2">{t('dev_node')}</span>
            <div className="flex items-center gap-10">
              <a href="https://github.com/savich18-Official" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-green-400 hover:text-white transition-all"><Terminal className="w-6 h-6" /><span className="font-black text-sm tracking-widest uppercase">{t('github')}</span></a>
              <a href="https://www.donationalerts.com/r/official_savich18" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-yellow-500 hover:text-white transition-all"><ShieldAlert className="w-6 h-6" /><span className="font-black text-sm tracking-widest uppercase">{t('donate')}</span></a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-hacker-md h1, .custom-hacker-md h2, .custom-hacker-md h3 { color: #fff !important; border-left: 4px solid #22c55e; padding-left: 1rem; text-transform: uppercase; margin: 1.5rem 0 1rem; }
        .custom-hacker-md p, .custom-hacker-md li { color: #00FF41 !important; margin-bottom: 1rem; line-height: 1.6; }
        .custom-hacker-md strong { color: #fff !important; background: rgba(0, 255, 65, 0.2); padding: 0 4px; }
      `}</style>
    </div>
  );
}
