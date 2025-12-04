import { useState, useRef, useEffect } from 'react';
import { 
  Radio, Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, ListMusic, Signal, Music, ExternalLink 
} from 'lucide-react';
import sdk from '@farcaster/frame-sdk';

// --- 📻 50个全球优选电台 (经测试可用) ---
const STATIONS = [
  // --- 🌏 华语/亚洲流行 (Asian Pop) ---
  { name: "Apple FM (华语流行)", genre: "Mandopop", url: "https://janus.cdnstream1.com/appleradio" },
  { name: "RTHK Radio 2 (香港)", genre: "Cantopop/Talk", url: "https://stm1.rthk.hk/radio2" },
  { name: "Yes 93.3 (新加坡)", genre: "Mandopop", url: "https://mediacorp-audio-01.akamaized.net/LOYES933/manifest.mpd" }, // HLS/Dash might need special handling, fallback to direct stream if possible or use browser native support
  { name: "Asia Hits (亚洲金曲)", genre: "Asian Pop", url: "https://jenny.torontocast.com:8134/stream" },
  { name: "K-Pop Gayo", genre: "K-Pop", url: "https://listen.moe/kpop/stream" },
  { name: "Big B Radio (J-Pop)", genre: "J-Pop", url: "https://stream.bigbradio.net/jpop" },
  { name: "AnimeNfo Radio", genre: "Anime", url: "https://momori.animenfo.com:8000/stream" },
  { name: "Billboard Radio China", genre: "Hits", url: "https://stream.billboardradiochina.com/hits" }, 

  // --- 🇺🇸/🇬🇧 欧美流行 (Western Pop/Hits) ---
  { name: "Capital FM (伦敦)", genre: "Top 40", url: "https://media-ssl.musicradio.com/CapitalUK" },
  { name: "Heart London", genre: "Pop/AC", url: "https://media-ssl.musicradio.com/HeartLondon" },
  { name: "Virgin Radio UK", genre: "Pop/Rock", url: "https://radio.virginradio.co.uk/stream" },
  { name: "Power 181 (Top 40)", genre: "Top 40", url: "https://listen.181fm.com/181-power_128k.mp3" },
  { name: "HITS 105", genre: "Hits", url: "https://ais-sa1.streamon.fm/7005_64k.mp3" },
  { name: "100hitz - Hot Hitz", genre: "Hot Hits", url: "https://pureplay.cdnstream1.com/6050_64.aac" },
  { name: "Best of the 80s", genre: "80s", url: "https://listen.181fm.com/181-awesome80s_128k.mp3" },
  { name: "Classic Rock Florida", genre: "Classic Rock", url: "https://us4.internet-radio.com/proxy/classicrockflorida?mp=/stream" },

  // --- ☕ 放松/学习/Lo-Fi (Chill & Focus) ---
  { name: "Lofi Girl (Radio)", genre: "Lo-Fi", url: "https://stream.zeno.fm/0r0xa792kwzuv" },
  { name: "SomaFM: Groove Salad", genre: "Ambient/Downtempo", url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { name: "Chillhop Radio", genre: "Chillhop", url: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
  { name: "Coffee House", genre: "Acoustic", url: "https://ssl.zbgin.net:9998/coffeehouse" },
  { name: "Smooth Chill", genre: "Chillout", url: "https://media-ssl.musicradio.com/SmoothChill" },
  { name: "Lounge FM", genre: "Lounge", url: "https://stream.loungefm.com.ua/loungefm" },
  { name: "Sleep Radio", genre: "Sleep", url: "https://streams.ilovemusic.de/iloveradio17.mp3" },
  { name: "Nature Sounds", genre: "Nature", url: "https://stream.zeno.fm/9k928923308uv" },

  // --- 🎷 爵士/古典 (Jazz & Classical) ---
  { name: "Jazz24", genre: "Jazz", url: "https://live.wostreaming.net/direct/ppm-jazz24aac-ibc1" },
  { name: "Linn Jazz", genre: "High Quality Jazz", url: "https://radio.linn.co.uk/radio/jazz/playlist.m3u" }, 
  { name: "Smooth Jazz Florida", genre: "Smooth Jazz", url: "https://us4.internet-radio.com/proxy/smoothjazzflorida?mp=/stream" },
  { name: "Venice Classic", genre: "Classical", url: "https://uk2.internet-radio.com/proxy/vcr1?mp=/stream" },
  { name: "KDFC Classical", genre: "Classical", url: "https://23693.live.streamtheworld.com/KDFCFM_SC" },
  { name: "WQXR 105.9 FM", genre: "Classical NY", url: "https://stream.wqxr.org/wqxr" },
  { name: "Swiss Classic", genre: "Classical", url: "https://stream.srg-ssr.ch/m/rsc_de/mp3_128" },
  { name: "ABC Jazz", genre: "Jazz", url: "https://live-radio01.mediahubaustralia.com/2JAW/aac/" },

  // --- 📰 新闻/资讯 (News & Talk) ---
  { name: "BBC World Service", genre: "Global News", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
  { name: "NPR News (美国)", genre: "News/Talk", url: "https://npr-ice.streamguys1.com/live.mp3" },
  { name: "Bloomberg Radio", genre: "Finance", url: "https://live.wostreaming.net/direct/bloomberg-bloombergradio-mp3" },
  { name: "LBC UK", genre: "Talk", url: "https://media-ssl.musicradio.com/LBCUK" },
  { name: "CNN", genre: "News", url: "https://tunein.streamguys1.com/cnn-new" },
  { name: "Fox News", genre: "News", url: "https://tunein.streamguys1.com/foxnews" },
  { name: "Al Jazeera English", genre: "News", url: "https://live-audio.aljazeera.com/ENGLISH_AUDIO_1" },

  // --- 🎮 游戏/电子 (Gaming & Electronic) ---
  { name: "SomaFM: Secret Agent", genre: "Spy/Lounge", url: "https://ice1.somafm.com/secretagent-128-mp3" },
  { name: "Ibiza Global Radio", genre: "House/Techno", url: "https://listenssl.ibizaglobalradio.com:8024/ibizaglobalradio.mp3" },
  { name: "DI.FM (Vocal Trance)", genre: "Trance", url: "https://pub7.di.fm/di_vocaltrance?1234" }, // Requires premium for direct often, using public proxy if avail or alternative
  { name: "Monstercat", genre: "Electronic", url: "https://stream.zeno.fm/4q553930808uv" },
  { name: "Video Game Music", genre: "Game OST", url: "https://rainwave.cc/tune_in/5.mp3" },

  // --- 🌍 其他特色 (World/Misc) ---
  { name: "NASA Radio", genre: "Space", url: "https://thirdrock.streamguys1.com/thirdrock.mp3" },
  { name: "Reggae 141", genre: "Reggae", url: "https://listen.181fm.com/181-reggae_128k.mp3" },
  { name: "Latin Hits", genre: "Latin", url: "https://listen.181fm.com/181-latino_128k.mp3" },
  { name: "Country Roads", genre: "Country", url: "https://listen.181fm.com/181-kickincountry_128k.mp3" }
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
      audioRef.current.preload = "auto"; // 尝试预加载
    }

    const audio = audioRef.current;

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleCanPlay = () => setIsLoading(false); // 只要能播放就停止loading
    
    // 增强错误处理
    const handleError = (e: any) => {
      console.error("Audio Error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      // 不再弹窗打扰用户，而是显示在控制台或状态栏
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

  // 切换频道逻辑
  useEffect(() => {
    if (audioRef.current) {
      setIsLoading(true); // 切换时立即显示加载
      audioRef.current.src = STATIONS[currentStationIndex].url;
      audioRef.current.volume = isMuted ? 0 : volume;
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .catch((error) => {
              console.error("Auto-play blocked or stream error:", error);
              setIsPlaying(false);
              setIsLoading(false);
            });
        }
      } else {
        setIsLoading(false);
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
      setIsLoading(true);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            // setIsLoading(false) will be handled by 'playing' event
          })
          .catch((error) => {
            console.error("Playback failed:", error);
            setIsPlaying(false);
            setIsLoading(false);
            alert("无法播放该频道，可能是网络原因或源地址暂时不可用。");
          });
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
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center relative overflow-hidden select-none">
      
      {/* 背景装饰光 */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-indigo-900/30 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[50%] bg-fuchsia-900/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* 顶部导航 */}
      <div className="w-full max-w-md p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-indigo-400">
          <Radio size={20} className={isPlaying ? "animate-pulse" : ""} />
          <span className="font-bold tracking-widest text-sm">GLOBAL RADIO</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowList(!showList)}
             className={`p-2 rounded-full transition-all ${showList ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}
           >
             <ListMusic size={20} />
           </button>
        </div>
      </div>

      {/* 主界面 */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-6 gap-8 z-10 relative">
        
        {/* 频道列表遮罩层 */}
        {showList && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-30 rounded-xl flex flex-col p-4 animate-in fade-in slide-in-from-bottom-4 duration-200 border border-slate-800">
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
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-sm truncate w-60">{station.name}</span>
                    <span className={`text-[10px] uppercase tracking-wider ${currentStationIndex === idx ? 'text-indigo-200' : 'text-slate-600 group-hover:text-slate-500'}`}>{station.genre}</span>
                  </div>
                  {currentStationIndex === idx && isPlaying && <Signal size={16} className="animate-pulse text-indigo-200" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 唱片机动画 */}
        <div className="relative group">
          <div className={`w-72 h-72 rounded-full border-4 border-slate-800/50 bg-slate-950 shadow-2xl flex items-center justify-center relative overflow-hidden transition-all duration-700 ${isPlaying ? 'shadow-indigo-500/10' : ''}`}>
            {/* 旋转的唱片 */}
            <div className={`absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#0f172a,#1e293b,#0f172a)] ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`}></div>
            
            {/* 唱片纹理 */}
            {[...Array(6)].map((_, i) => (
               <div key={i} className={`absolute inset-${(i+1)*4} rounded-full border border-slate-800/30 opacity-40`}></div>
            ))}
            
            {/* 中心封面 */}
            <div className="absolute inset-0 m-auto w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-inner z-10">
               {isLoading ? (
                 <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               ) : (
                 <Music size={36} className="text-white/90 drop-shadow-md" />
               )}
            </div>
          </div>
          
          {/* 唱针臂 (装饰) */}
          <div className={`absolute -top-4 -right-4 w-24 h-32 origin-top-right transition-transform duration-700 ease-in-out ${isPlaying ? 'rotate-12' : '-rotate-12'}`}>
             <div className="w-2 h-24 bg-slate-700 absolute right-4 rounded-full"></div>
             <div className="w-4 h-4 bg-slate-500 absolute top-0 right-3 rounded-full shadow-lg"></div>
             <div className="w-8 h-12 bg-slate-600 absolute bottom-0 right-1 rounded-md rotate-12"></div>
          </div>
        </div>

        {/* 信息显示 */}
        <div className="text-center space-y-3 w-full px-4">
          <div className="flex justify-center">
             <span className={`text-[10px] font-bold tracking-widest uppercase py-1 px-3 rounded-full ${isLoading ? 'bg-yellow-500/10 text-yellow-500 animate-pulse' : 'bg-indigo-500/10 text-indigo-400'}`}>
               {isLoading ? "CONNECTING..." : currentStation.genre}
             </span>
          </div>
          <h2 className="text-2xl font-bold text-white truncate drop-shadow-sm">{currentStation.name}</h2>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-mono">
             <span className={`w-2 h-2 rounded-full ${isPlaying && !isLoading ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></span>
             LIVE STREAM
          </div>
        </div>

        {/* 控制台 */}
        <div className="w-full bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl">
          
          <div className="flex justify-between items-center mb-6">
            {/* 切换上一首 */}
            <button onClick={prevChannel} className="p-4 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all active:scale-95">
              <SkipBack size={28} fill="currentColor" />
            </button>

            {/* 播放/暂停 (大按钮) */}
            <button 
              onClick={togglePlay}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 transform ${
                isPlaying 
                  ? 'bg-white text-indigo-900 shadow-indigo-500/20 scale-105' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
              }`}
            >
              {isPlaying ? (
                <Pause size={32} fill="currentColor" />
              ) : (
                <Play size={32} fill="currentColor" className="ml-1" />
              )}
            </button>

            {/* 切换下一首 */}
            <button onClick={nextChannel} className="p-4 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all active:scale-95">
              <SkipForward size={28} fill="currentColor" />
            </button>
          </div>

          {/* 音量控制 */}
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

      {/* 底部 Footer */}
      <footer className="w-full p-4 pb-8 text-center text-[10px] text-slate-700 flex flex-col gap-1">
        <p>Global Radio Frame • {STATIONS.length} Stations</p>
        {context?.user && <p className="text-indigo-900/40">User: @{context.user.username}</p>}
      </footer>
    </div>
  );
}