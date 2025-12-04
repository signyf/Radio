import { useState, useRef, useEffect } from 'react';
import { 
  Radio, Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, ListMusic, Signal, Music, Loader2
} from 'lucide-react';
import sdk from '@farcaster/frame-sdk';

// --- 📻 50个全球优选电台 (全HTTPS/高可用) ---
const STATIONS = [
  // --- 🌏 华语/亚洲流行 (Mandopop / K-Pop / J-Pop) ---
  { name: "Apple FM (华语流行)", genre: "Mandopop", url: "https://janus.cdnstream1.com/appleradio" },
  { name: "RTHK Radio 2 (香港)", genre: "Cantopop", url: "https://stm1.rthk.hk/radio2" },
  { name: "Hit FM Taiwan", genre: "Mandopop", url: "https://stream.rcs.revma.com/k53q2312w98uv" }, // 备用高质流
  { name: "K-Pop Gayo", genre: "K-Pop", url: "https://listen.moe/kpop/stream" },
  { name: "Big B Radio (J-Pop)", genre: "J-Pop", url: "https://stream.bigbradio.net/jpop" },
  { name: "Asia Hits", genre: "Asian Mix", url: "https://jenny.torontocast.com:8134/stream" },
  { name: "AnimeNfo", genre: "Anime OST", url: "https://momori.animenfo.com:8000/stream" },
  { name: "Japan Hits", genre: "J-Pop", url: "https://igor.torontocast.com:1025/;" },

  // --- ☕ 专注/放松/Lo-Fi (Chill & Study) ---
  { name: "Lofi Girl Radio", genre: "Lo-Fi", url: "https://stream.zeno.fm/0r0xa792kwzuv" },
  { name: "SomaFM: Groove Salad", genre: "Ambient", url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { name: "Chillhop Radio", genre: "Chillhop", url: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
  { name: "Coffee House", genre: "Acoustic", url: "https://ssl.zbgin.net:9998/coffeehouse" },
  { name: "Smooth Chill", genre: "Chillout", url: "https://media-ssl.musicradio.com/SmoothChill" },
  { name: "Sleep Radio", genre: "Sleep/Ambient", url: "https://streams.ilovemusic.de/iloveradio17.mp3" },
  { name: "Piano Solo", genre: "Piano", url: "https://pianosolo.stream.publicradio.org/pianosolo.mp3" },
  { name: "Rain Sounds", genre: "Nature", url: "https://stream.zeno.fm/9k928923308uv" },

  // --- 🇺🇸/🇬🇧 欧美金曲 (Top 40 / Hits) ---
  { name: "Capital FM London", genre: "Top 40", url: "https://media-ssl.musicradio.com/CapitalUK" },
  { name: "Heart London", genre: "Pop/AC", url: "https://media-ssl.musicradio.com/HeartLondon" },
  { name: "Virgin Radio UK", genre: "Pop/Rock", url: "https://radio.virginradio.co.uk/stream" },
  { name: "Power 181", genre: "Top 40", url: "https://listen.181fm.com/181-power_128k.mp3" },
  { name: "HITS 105", genre: "Hits", url: "https://ais-sa1.streamon.fm/7005_64k.mp3" },
  { name: "100hitz - Hot Hitz", genre: "Hot Hits", url: "https://pureplay.cdnstream1.com/6050_64.aac" },
  { name: "Awesome 80s", genre: "80s", url: "https://listen.181fm.com/181-awesome80s_128k.mp3" },
  { name: "The 90s Channel", genre: "90s", url: "https://listen.181fm.com/181-star90s_128k.mp3" },
  
  // --- 🎷 爵士/古典 (Jazz & Classical) ---
  { name: "Jazz24", genre: "Jazz", url: "https://live.wostreaming.net/direct/ppm-jazz24aac-ibc1" },
  { name: "Linn Jazz", genre: "Audiophile Jazz", url: "https://radio.linn.co.uk/radio/jazz/playlist.m3u" }, // HLS/Stream handling
  { name: "Smooth Jazz Florida", genre: "Smooth Jazz", url: "https://us4.internet-radio.com/proxy/smoothjazzflorida?mp=/stream" },
  { name: "Venice Classic", genre: "Classical", url: "https://uk2.internet-radio.com/proxy/vcr1?mp=/stream" },
  { name: "KDFC Classical", genre: "Classical", url: "https://23693.live.streamtheworld.com/KDFCFM_SC" },
  { name: "WQXR 105.9 FM", genre: "Classical NY", url: "https://stream.wqxr.org/wqxr" },
  { name: "Swiss Classic", genre: "Classical", url: "https://stream.srg-ssr.ch/m/rsc_de/mp3_128" },
  { name: "ABC Jazz", genre: "Jazz", url: "https://live-radio01.mediahubaustralia.com/2JAW/aac/" },

  // --- 🎸 摇滚/另类 (Rock & Alternative) ---
  { name: "Classic Rock Florida", genre: "Classic Rock", url: "https://us4.internet-radio.com/proxy/classicrockflorida?mp=/stream" },
  { name: "Radio X", genre: "Alternative", url: "https://media-ssl.musicradio.com/RadioXUK" },
  { name: "The Eagle", genre: "Classic Rock", url: "https://listen.181fm.com/181-eagle_128k.mp3" },
  { name: "Hard Rock Heaven", genre: "Hard Rock", url: "https://listen.181fm.com/181-hardrock_128k.mp3" },

  // --- 📰 新闻/资讯 (News & Info) ---
  { name: "BBC World Service", genre: "Global News", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
  { name: "NPR News", genre: "News/Talk", url: "https://npr-ice.streamguys1.com/live.mp3" },
  { name: "Bloomberg Radio", genre: "Finance", url: "https://live.wostreaming.net/direct/bloomberg-bloombergradio-mp3" },
  { name: "LBC UK", genre: "Talk", url: "https://media-ssl.musicradio.com/LBCUK" },
  { name: "Monocle 24", genre: "Culture/News", url: "https://radio.monocle.com/live" },

  // --- 🎧 电子/舞曲 (Electronic) ---
  { name: "Ibiza Global Radio", genre: "House", url: "https://listenssl.ibizaglobalradio.com:8024/ibizaglobalradio.mp3" },
  { name: "Defected Radio", genre: "House", url: "https://26683.live.streamtheworld.com/DEFECTEDRADIO_SC" },
  { name: "Monstercat", genre: "Electronic", url: "https://stream.zeno.fm/4q553930808uv" },
  { name: "SomaFM: Secret Agent", genre: "Downtempo", url: "https://ice1.somafm.com/secretagent-128-mp3" },

  // --- 🌍 其他 (Misc) ---
  { name: "NASA Radio", genre: "Space", url: "https://thirdrock.streamguys1.com/thirdrock.mp3" },
  { name: "Reggae 141", genre: "Reggae", url: "https://listen.181fm.com/181-reggae_128k.mp3" },
  { name: "Disney Hits", genre: "Kids", url: "https://streaming.radio.co/s5d59529b4/listen" }
];

export default function App() {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<any>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // 音频对象初始化 (修复：移除 crossOrigin 以提高兼容性)
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // 注意：移除了 crossOrigin="anonymous"，这能解决大部分 "无法播放" 的问题
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setError(null);
    };
    const handleCanPlay = () => setIsLoading(false);
    
    const handleError = (e: any) => {
      console.error("Audio Error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      setError("连接中断或资源不可用，请切换频道");
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // 切换频道
  useEffect(() => {
    if (audioRef.current) {
      setIsLoading(true);
      setError(null);
      audioRef.current.src = STATIONS[currentStationIndex].url;
      audioRef.current.volume = isMuted ? 0 : volume;
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .catch((error) => {
              console.error("Autoplay blocked/failed:", error);
              setIsPlaying(false);
              setIsLoading(false);
            });
        }
      } else {
        setIsLoading(false);
      }
    }
  }, [currentStationIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setError(null);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // State update handled by 'playing' event listener
          })
          .catch((error) => {
            console.error("Playback failed:", error);
            setIsPlaying(false);
            setIsLoading(false);
            setError("无法播放，请点击播放或切换频道");
          });
      }
    }
  };

  const nextChannel = () => {
    setCurrentStationIndex((prev) => (prev + 1) % STATIONS.length);
    setIsPlaying(true);
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
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center relative overflow-hidden select-none">
      
      {/* 氛围背景 */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-indigo-900/30 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[50%] bg-fuchsia-900/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* 顶部栏 */}
      <div className="w-full max-w-md p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-indigo-400">
          <Radio size={20} className={isPlaying ? "animate-pulse" : ""} />
          <span className="font-bold tracking-widest text-sm">GLOBAL RADIO</span>
        </div>
        <button 
          onClick={() => setShowList(!showList)}
          className={`p-2 rounded-full transition-all ${showList ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}
        >
          <ListMusic size={20} />
        </button>
      </div>

      {/* 主体内容 */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-6 gap-8 z-10 relative">
        
        {/* 频道列表 */}
        {showList && (
          <div className="absolute inset-0 bg-slate-900/98 backdrop-blur-xl z-30 rounded-xl flex flex-col p-4 animate-in fade-in zoom-in-95 duration-200 border border-slate-800">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <h3 className="font-bold text-lg text-indigo-100">频道列表 ({STATIONS.length})</h3>
              <button onClick={() => setShowList(false)} className="text-sm text-slate-400 hover:text-white">关闭</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              {STATIONS.map((station, idx) => (
                <button
                  key={idx}
                  onClick={() => selectStation(idx)}
                  className={`w-full p-3 rounded-lg flex items-center justify-between transition-all group ${
                    currentStationIndex === idx 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                      : 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <span className="font-bold text-sm truncate w-full">{station.name}</span>
                    <span className={`text-[10px] uppercase tracking-wider ${currentStationIndex === idx ? 'text-indigo-200' : 'text-slate-600'}`}>{station.genre}</span>
                  </div>
                  {currentStationIndex === idx && isPlaying && <Signal size={16} className="animate-pulse text-indigo-200 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 唱片动画区域 */}
        <div className="relative group">
          <div className={`w-72 h-72 rounded-full border-4 border-slate-800/50 bg-slate-950 shadow-2xl flex items-center justify-center relative overflow-hidden transition-all duration-700 ${isPlaying ? 'shadow-indigo-500/20' : ''}`}>
            {/* 旋转底盘 */}
            <div className={`absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#0f172a,#1e293b,#0f172a)] ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`}></div>
            {[...Array(3)].map((_, i) => (
               <div key={i} className={`absolute inset-${(i+1)*8} rounded-full border border-slate-800/20 opacity-30`}></div>
            ))}
            
            {/* 专辑封面/中心 */}
            <div className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-inner z-10">
               {isLoading ? (
                 <Loader2 size={40} className="text-white/80 animate-spin" />
               ) : (
                 <Music size={40} className="text-white/90 drop-shadow-md" />
               )}
            </div>
          </div>
          
          {/* 唱针 */}
          <div className={`absolute -top-4 -right-4 w-24 h-32 origin-top-right transition-transform duration-700 ease-in-out pointer-events-none ${isPlaying ? 'rotate-12' : '-rotate-12'}`}>
             <div className="w-2 h-24 bg-slate-700 absolute right-4 rounded-full shadow-lg"></div>
             <div className="w-4 h-4 bg-slate-500 absolute top-0 right-3 rounded-full"></div>
             <div className="w-8 h-12 bg-slate-600 absolute bottom-0 right-1 rounded-md rotate-12"></div>
          </div>
        </div>

        {/* 状态信息 */}
        <div className="text-center space-y-2 w-full px-4 h-24 flex flex-col justify-center">
          <div className="flex justify-center">
             <span className={`text-[10px] font-bold tracking-widest uppercase py-1 px-3 rounded-full transition-colors duration-300 ${
               error ? 'bg-red-500/10 text-red-400' :
               isLoading ? 'bg-yellow-500/10 text-yellow-500' : 
               'bg-indigo-500/10 text-indigo-400'
             }`}>
               {error ? "ERROR" : isLoading ? "BUFFERING..." : currentStation.genre}
             </span>
          </div>
          
          <h2 className="text-2xl font-bold text-white truncate drop-shadow-sm px-2">
            {currentStation.name}
          </h2>
          
          <div className="text-xs h-4">
            {error ? (
              <span className="text-red-400 animate-pulse">{error}</span>
            ) : (
              <div className="flex items-center justify-center gap-2 text-slate-500 font-mono">
                <span className={`w-2 h-2 rounded-full ${isPlaying && !isLoading ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></span>
                {isPlaying && !isLoading ? "LIVE ON AIR" : "READY"}
              </div>
            )}
          </div>
        </div>

        {/* 控制面板 */}
        <div className="w-full bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <button onClick={prevChannel} className="p-4 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all active:scale-95">
              <SkipBack size={28} fill="currentColor" />
            </button>

            <button 
              onClick={togglePlay}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 transform ${
                isPlaying && !error
                  ? 'bg-white text-indigo-900 shadow-indigo-500/20 scale-105' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
              }`}
            >
              {isPlaying && !isLoading ? (
                <Pause size={32} fill="currentColor" />
              ) : (
                <Play size={32} fill="currentColor" className="ml-1" />
              )}
            </button>

            <button onClick={nextChannel} className="p-4 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all active:scale-95">
              <SkipForward size={28} fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
            <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
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
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
            />
          </div>
        </div>

      </main>

      <footer className="w-full p-4 pb-8 text-center text-[10px] text-slate-700">
        <p>Global Radio Frame • {STATIONS.length} Stations</p>
        {context?.user && <p className="mt-1 text-indigo-900/40">User: @{context.user.username}</p>}
      </footer>
    </div>
  );
}