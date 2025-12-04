import { useState, useRef, useEffect } from 'react';
import { 
  Radio, Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, ListMusic, Signal, Music 
} from 'lucide-react';
import sdk from '@farcaster/frame-sdk';

// --- 📻 优选电台列表 (20个) ---
const STATIONS = [
  // 华语/亚洲
  { name: "Apple FM (华语流行)", genre: "Pop", url: "https://janus.cdnstream1.com/appleradio" },
  { name: "RTHK Radio 2 (香港)", genre: "Cantopop/Talk", url: "https://stm1.rthk.hk/radio2" },
  { name: "Asia Hits (亚洲金曲)", genre: "Pop", url: "https://jenny.torontocast.com:8134/stream" },
  { name: "K-Pop Gayo (韩流)", genre: "K-Pop", url: "https://listen.moe/kpop/stream" },
  
  // 欧美/流行
  { name: "Capital FM (伦敦)", genre: "Top 40", url: "https://media-ssl.musicradio.com/CapitalUK" },
  { name: "Heart London", genre: "Pop/AC", url: "https://media-ssl.musicradio.com/HeartLondon" },
  { name: "Virgin Radio UK", genre: "Pop/Rock", url: "https://radio.virginradio.co.uk/stream" },
  { name: "Power 181 (Power Hits)", genre: "Top 40", url: "https://listen.181fm.com/181-power_128k.mp3" },

  // 放松/学习/Lo-Fi
  { name: "Lofi Girl (Radio)", genre: "Lo-Fi/Chill", url: "https://stream.zeno.fm/0r0xa792kwzuv" },
  { name: "SomaFM: Groove Salad", genre: "Ambient", url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { name: "Chillhop Radio", genre: "Chillhop", url: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
  { name: "Coffee House", genre: "Acoustic", url: "https://ssl.zbgin.net:9998/coffeehouse" },

  // 爵士/古典
  { name: "Jazz24", genre: "Jazz", url: "https://live.wostreaming.net/direct/ppm-jazz24aac-ibc1" },
  { name: "Linn Jazz", genre: "High Quality Jazz", url: "https://radio.linn.co.uk/radio/jazz/playlist.m3u" }, // Note: some might fallback
  { name: "Venice Classic", genre: "Classical", url: "https://uk2.internet-radio.com/proxy/vcr1?mp=/stream" },
  { name: "KDFC Classical", genre: "Classical", url: "https://23693.live.streamtheworld.com/KDFCFM_SC" },

  // 新闻/综合
  { name: "BBC World Service", genre: "News", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
  { name: "NPR News (美国)", genre: "News/Talk", url: "https://npr-ice.streamguys1.com/live.mp3" },
  { name: "Bloomberg Radio", genre: "Finance", url: "https://live.wostreaming.net/direct/bloomberg-bloombergradio-mp3" },
  { name: "NASA Radio", genre: "Space", url: "https://thirdrock.streamguys1.com/thirdrock.mp3" }
];

export default function App() {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [context, setContext] = useState<any>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // For visualizer (future)

  // 初始化 Farcaster
  useEffect(() => {
    const initSDK = async () => {
      try {
        const ctx = await sdk.context;
        setContext(ctx);
        sdk.actions.ready();
      } catch (e) {
        console.log("Web mode");
      }
    };
    initSDK();
  }, []);

  // 音频初始化
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
    }

    const audio = audioRef.current;

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      alert("该频道暂时无法连接，请尝试切换其他频道。");
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // 切换频道逻辑
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = STATIONS[currentStationIndex].url;
      audioRef.current.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            setIsPlaying(false); // Auto-play block handling
          });
        }
      }
    }
  }, [currentStationIndex]);

  // 音量控制
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 播放/暂停
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => console.error("Playback failed:", error));
      }
    }
  };

  const nextChannel = () => {
    setCurrentStationIndex((prev) => (prev + 1) % STATIONS.length);
    setIsPlaying(true); // 切换后尝试自动播放
  };

  const prevChannel = () => {
    setCurrentStationIndex((prev) => (prev - 1 + STATIONS.length) % STATIONS.length);
    setIsPlaying(true);
  };

  const selectStation = (index: number) => {
    setCurrentStationIndex(index);
    setIsPlaying(true);
    setShowList(false);
  }

  const currentStation = STATIONS[currentStationIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center relative overflow-hidden select-none">
      
      {/* 背景装饰光 */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-purple-900/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[50%] bg-blue-900/20 blur-[80px] rounded-full pointer-events-none"></div>

      {/* 顶部导航 */}
      <div className="w-full max-w-md p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-purple-400">
          <Radio size={20} className={isPlaying ? "animate-pulse" : ""} />
          <span className="font-bold tracking-wider">RETRO RADIO</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowList(!showList)}
             className={`p-2 rounded-full transition-all ${showList ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'}`}
           >
             <ListMusic size={20} />
           </button>
        </div>
      </div>

      {/* 主界面 */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-6 gap-8 z-10 relative">
        
        {/* 频道列表遮罩层 */}
        {showList && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-20 rounded-xl flex flex-col p-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
              <h3 className="font-bold text-lg">频道列表</h3>
              <button onClick={() => setShowList(false)} className="text-sm text-slate-400">关闭</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {STATIONS.map((station, idx) => (
                <button
                  key={idx}
                  onClick={() => selectStation(idx)}
                  className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${
                    currentStationIndex === idx 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' 
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-sm">{station.name}</span>
                    <span className="text-xs opacity-70">{station.genre}</span>
                  </div>
                  {currentStationIndex === idx && isPlaying && <Signal size={16} className="animate-pulse" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 唱片机动画 */}
        <div className="relative group">
          <div className={`w-64 h-64 rounded-full border-8 border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center relative overflow-hidden transition-all duration-700 ${isPlaying ? 'shadow-purple-500/20' : ''}`}>
            {/* 旋转的唱片 */}
            <div className={`absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#1e293b,#0f172a,#1e293b)] ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}></div>
            
            {/* 唱片纹理 */}
            <div className={`absolute inset-2 rounded-full border border-slate-800/50 opacity-50 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}></div>
            <div className={`absolute inset-8 rounded-full border border-slate-800/50 opacity-50 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}></div>
            
            {/* 中心封面 */}
            <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-inner z-10">
               <Music size={32} className="text-white/80" />
            </div>
          </div>
          
          {/* 状态指示灯 */}
          <div className={`absolute top-0 right-0 w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'} transition-all duration-500`}></div>
        </div>

        {/* 信息显示 */}
        <div className="text-center space-y-2 w-full">
          <div className="text-xs font-medium text-purple-400 tracking-widest uppercase bg-purple-900/20 py-1 px-3 rounded-full inline-block mb-2">
            {isLoading ? "正在缓冲..." : currentStation.genre}
          </div>
          <h2 className="text-2xl font-bold text-white truncate px-4">{currentStation.name}</h2>
          <p className="text-slate-500 text-xs font-mono">LIVE STREAMING</p>
        </div>

        {/* 控制台 */}
        <div className="w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          {/* 进度条 (装饰用，因为是直播流) */}
          <div className="w-full h-1 bg-slate-700 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-purple-500 w-full animate-[pulse_2s_ease-in-out_infinite] opacity-50"></div>
          </div>

          <div className="flex justify-between items-center">
            {/* 切换上一首 */}
            <button onClick={prevChannel} className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-all active:scale-95">
              <SkipBack size={24} fill="currentColor" />
            </button>

            {/* 播放/暂停 (大按钮) */}
            <button 
              onClick={togglePlay}
              disabled={isLoading}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                isPlaying 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/50' 
                  : 'bg-white hover:bg-slate-200 text-slate-900 shadow-white/20'
              }`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={28} fill="currentColor" />
              ) : (
                <Play size={28} fill="currentColor" className="ml-1" />
              )}
            </button>

            {/* 切换下一首 */}
            <button onClick={nextChannel} className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-all active:scale-95">
              <SkipForward size={24} fill="currentColor" />
            </button>
          </div>

          {/* 音量控制 */}
          <div className="mt-6 flex items-center gap-3 text-slate-400">
            <button onClick={() => setIsMuted(!isMuted)}>
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>
        </div>

      </main>

      {/* 底部 Footer */}
      <footer className="w-full p-4 text-center text-[10px] text-slate-600">
        <p>Radio Mini App • Farcaster Frame</p>
        {context?.user && <p className="mt-1 text-purple-900/50">Listening as @{context.user.username}</p>}
      </footer>
    </div>
  );
}