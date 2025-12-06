import { useState, useRef, useEffect } from 'react';
import { 
  Radio, Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, ListMusic, Signal, Music, Loader2, WifiOff
} from 'lucide-react';
import sdk from '@farcaster/frame-sdk';

// ✅ 【核心配置】Cloudflare Worker 加速前缀
const WORKER_PREFIX = "https://vip.radio11.online/relay?url=";

// --- 📻 全球 90+ 精选电台库 ---
const STATIONS = [
  // === 🌟 站长推荐 (Editor's Choice) ===
  // ✅ Reggae 141 已排到第一位
  { name: "Reggae 141", genre: "Roots Reggae", url: "https://listen.181fm.com/181-reggae_128k.mp3" },
  { name: "NTS Radio 1 (London)", genre: "Underground", url: "https://stream-relay-geo.ntslive.net/stream" },
  { name: "NTS Radio 2 (Infinite)", genre: "Eclectic", url: "https://stream-relay-geo.ntslive.net/stream2" },
  { name: "KEXP 90.3 Seattle", genre: "Indie Rock", url: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3" },
  { name: "Dublab (Los Angeles)", genre: "Future Beats", url: "https://dublab.out.airtime.pro/dublab_a" },
  { name: "The Lot Radio (NYC)", genre: "Electronic", url: "https://thelot.out.airtime.pro/thelot_a" },
  { name: "Worldwide FM", genre: "Global Groove", url: "https://worldwidefm.out.airtime.pro/worldwidefm_b" },

  // === 🎌 二次元/动漫/游戏 (Anime & Game) ===
  { name: "Listen.moe (J-Pop)", genre: "Anime/J-Pop", url: "https://listen.moe/stream" },
  { name: "Listen.moe (K-Pop)", genre: "K-Pop", url: "https://listen.moe/kpop/stream" },
  { name: "Gensokyo Radio", genre: "Touhou", url: "https://stream.gensokyoradio.net/1/" },
  { name: "Radio SEGA", genre: "Game OST", url: "http://content.radiosega.net:8006/live" },
  { name: "Touhou Radio", genre: "Touhou Arr.", url: "https://touhouradio.com:8000/touhouradio.mp3" },
  { name: "Vocaloid Radio", genre: "Vocaloid", url: "http://curiosity.shoutca.st:8019/stream" },
  { name: "AnimNeko", genre: "Anime OST", url: "http://pool.animneko.net:8002/" },
  { name: "Asia DREAM Radio", genre: "J-Pop Hits", url: "https://igor.torontocast.com:1025/;" },

  // === 💤 专注/助眠/白噪音 (Lo-Fi & Ambient) ===
  { name: "Lofi Girl (Radio)", genre: "Lo-Fi Beats", url: "https://play.streamafrica.net/lofigirl" },
  { name: "Chillhop Radio", genre: "Chillhop", url: "http://stream.zeno.fm/f3wvbbqmdg8uv" },
  { name: "SomaFM: Groove Salad", genre: "Downtempo", url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { name: "SomaFM: Deep Space", genre: "Space Drone", url: "https://ice1.somafm.com/deepspaceone-128-mp3" },
  { name: "SomaFM: Drone Zone", genre: "Ambient", url: "https://ice1.somafm.com/dronezone-128-mp3" },
  { name: "Radio Paradise", genre: "Eclectic", url: "https://stream.radioparadise.com/mp3-128" },
  { name: "Radio Paradise Mellow", genre: "Mellow", url: "https://stream.radioparadise.com/mellow-128" },
  { name: "Sleep Radio", genre: "Sleep", url: "https://streams.ilovemusic.de/iloveradio17.mp3" },
  { name: "Rainwave", genre: "Chiptune/Chill", url: "http://relay.rainwave.cc:8000/all.mp3" },

  // === 💻 极客/黑客/合成器 (Synth & Cyber) ===
  { name: "SomaFM: Secret Agent", genre: "Spy/Lounge", url: "https://ice1.somafm.com/secretagent-128-mp3" },
  { name: "SomaFM: DEF CON", genre: "Hacker", url: "https://ice1.somafm.com/defcon-128-mp3" },
  { name: "Nightwave Plaza", genre: "Vaporwave", url: "https://radio.plaza.one/mp3" },
  { name: "RetroWave", genre: "Synthwave", url: "https://stream.retrowave.ru/retrowave.mp3" },
  { name: "Radio Caprice", genre: "Cyberpunk", url: "http://79.111.119.111:8000/cyberpunk" },

  // === 🎷 顶级爵士/蓝调 (Jazz & Blues) ===
  { name: "Linn Jazz", genre: "Audiophile Jazz", url: "http://radio.linn.co.uk:8000/stream" },
  { name: "TSF Jazz (Paris)", genre: "French Jazz", url: "http://tsfjazz.ice.infomaniak.ch/tsfjazz-high.mp3" },
  { name: "Jazz24 (Seattle)", genre: "Modern Jazz", url: "https://live.wostreaming.net/direct/ppm-jazz24aac-ibc1" },
  { name: "Swiss Jazz", genre: "Smooth Jazz", url: "http://stream.srg-ssr.ch/m/rsj/mp3_128" },
  { name: "Bluegrass Country", genre: "Bluegrass", url: "http://ice24.securenetsystems.net/WAMU" },
  { name: "181.fm The Breeze", genre: "Smooth Jazz", url: "http://listen.181fm.com/181-breeze_128k.mp3" },

  // === 🎻 古典/歌剧 (Classical) ===
  { name: "Classic FM UK", genre: "Popular Classical", url: "https://media-ssl.musicradio.com/ClassicFM" },
  { name: "BBC Radio 3", genre: "Classical/Arts", url: "http://stream.live.vc.bbcmedia.co.uk/bbc_radio_three" },
  { name: "Venice Classic", genre: "Baroque", url: "http://109.123.64.135:8010/stream" },
  { name: "WQXR 105.9 NY", genre: "New York Classic", url: "https://stream.wqxr.org/wqxr" },
  { name: "BR-Klassik", genre: "German Classic", url: "https://dispatcher.rndfnk.com/br/brklassik/live/mp3/low" },

  // === 🌏 华语/亚洲精选 (Chinese & Asian) ===
  { name: "RTHK Radio 1 (HK)", genre: "Cantonese/News", url: "https://stm1.rthk.hk/radio1" }, 
  { name: "RTHK Radio 2 (HK)", genre: "CantoPop", url: "https://stm1.rthk.hk/radio2" }, 
  { name: "RTHK Radio 4 (HK)", genre: "Fine Music", url: "https://stm1.rthk.hk/radio4" },
  { name: "Apple-FM (HK)", genre: "Mandarin Pop", url: "https://server2.apple-fm.net:8600/stream" },
  { name: "CNR 音乐之声", genre: "Mandarin Hits", url: "http://lhttp.qingting.fm/live/386/64k.mp3" },
  { name: "YES 933 (SG)", genre: "Mandarin Hits", url: "https://22393.live.streamtheworld.com/YES933_SC" },
  { name: "Big B Radio", genre: "K-Pop Hits", url: "http://stream.bigbradio.net:8000/;" },

  // === 🎸 摇滚/另类/金属 (Rock & Metal) ===
  { name: "Radio X UK", genre: "Alt Rock", url: "https://media-ssl.musicradio.com/RadioXUK" },
  { name: "Virgin Radio UK", genre: "Classic Rock", url: "https://radio.virginradio.co.uk/stream" },
  { name: "181.fm The Eagle", genre: "Classic Rock", url: "http://listen.181fm.com/181-eagle_128k.mp3" },
  { name: "181.fm Hard Rock", genre: "Hard Rock", url: "http://listen.181fm.com/181-hardrock_128k.mp3" },
  { name: "Metal Meyhem", genre: "Heavy Metal", url: "http://stream.metalmeyhemradio.com:8000/stream" },
  { name: "Absolute Radio 90s", genre: "90s Britpop", url: "https://ais-sa5.cdnstream1.com/1988_128.mp3" },
  { name: "Radio Bob!", genre: "German Rock", url: "http://streams.radiobob.de/bob-live/mp3-192/mediaplayer" },

  // === 🎤 嘻哈/R&B (Hip-Hop) ===
  { name: "181.fm The Beat", genre: "HipHop/R&B", url: "http://listen.181fm.com/181-beat_128k.mp3" },
  { name: "181.fm Old School", genre: "Golden Age", url: "http://listen.181fm.com/181-oldschool_128k.mp3" },
  { name: "Hot 97 NYC", genre: "Urban", url: "https://24263.live.streamtheworld.com/WQHTFMAAC.aac" },
  { name: "Power 106 LA", genre: "West Coast", url: "https://24233.live.streamtheworld.com/KPWRFMAAC.aac" },
  { name: "Generations (Paris)", genre: "French HipHop", url: "http://generations-ice.ice.infomaniak.ch/generations-high.mp3" },

  // === 🎧 电子/浩室/舞曲 (Electronic) ===
  { name: "Ibiza Global Radio", genre: "Balearic House", url: "https://listenssl.ibizaglobalradio.com:8024/ibizaglobalradio.mp3" },
  { name: "Sunshine Live", genre: "EDM/Techno", url: "http://sunshinelive.hoerradar.de/sunshinelive-live-mp3-hq" },
  { name: "Defected Radio", genre: "House Music", url: "https://23453.live.streamtheworld.com/DEFECTEDRADIO_SC" },
  { name: "Hirschmilch", genre: "Psytrance", url: "https://hirschmilch.de:7000/psytrance.mp3" },
  { name: "Drum & Bass Area", genre: "DnB", url: "http://fire.dnbradio.com:8000/dnbradio_main.mp3" },
  { name: "TechnoBase.FM", genre: "HandsUp", url: "http://listen.technobase.fm/tunein-mp3-pls" },

  // === 🇺🇸/🇬🇧 欧美流行 (Top 40) ===
  { name: "Capital FM London", genre: "UK Top 40", url: "https://media-ssl.musicradio.com/CapitalUK" },
  { name: "Heart London", genre: "Adult Contemp.", url: "https://media-ssl.musicradio.com/HeartLondon" },
  { name: "Z100 New York", genre: "US Top 40", url: "https://24263.live.streamtheworld.com/WHTZFMAAC.aac" },
  { name: "KIIS FM LA", genre: "US Hits", url: "https://24323.live.streamtheworld.com/KIISFMAAC.aac" },
  { name: "181.fm Power 181", genre: "Global Hits", url: "http://listen.181fm.com/181-power_128k.mp3" },
  { name: "NRJ France", genre: "French Hits", url: "http://cdn.nrjaudio.fm/audio1/fr/30001/mp3_128.mp3" },

  // === 🕰️ 怀旧/金曲 (Oldies & Retro) ===
  { name: "181.fm Awesome 80s", genre: "80s Hits", url: "http://listen.181fm.com/181-awesome80s_128k.mp3" },
  { name: "181.fm Star 90s", genre: "90s Hits", url: "http://listen.181fm.com/181-star90s_128k.mp3" },
  { name: "Gold Radio UK", genre: "60s/70s/80s", url: "https://media-ssl.musicradio.com/Gold" },
  { name: "Beatles Radio", genre: "The Beatles", url: "http://stream.beatlesradio.com:8000/stream" },
  { name: "Abacus.fm", genre: "British 60s", url: "http://198.245.60.88:8080/Abacus.fm_British_Comedy_Radio_128" },

  // === 🤠 乡村/民谣 (Country & Folk) ===
  { name: "181.fm Kickin'", genre: "Modern Country", url: "http://listen.181fm.com/181-kickincountry_128k.mp3" },
  { name: "181.fm Highway", genre: "Classic Country", url: "http://listen.181fm.com/181-highway_128k.mp3" },
  { name: "Nashville Radio", genre: "Nashville", url: "http://server1.kproxy.net:8000/stream" },
  { name: "Folk Alley", genre: "Folk/Americana", url: "http://freshgrass.streamguys.net/folkalley-128mp3" },

  // === 📰 新闻/资讯 (News & Talk) ===
  { name: "BBC World Service", genre: "World News", url: "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
  { name: "LBC London", genre: "UK Talk", url: "https://media-ssl.musicradio.com/LBCUK" },
  { name: "NPR 24 Hour", genre: "US News", url: "https://npr-ice.streamguys1.com/live.mp3" },
  { name: "C-SPAN Radio", genre: "US Politics", url: "https://skychannellive.com/radio/CSPANRadio" },
  { name: "Monocle 24", genre: "Design/Culture", url: "https://radio.monocle.com/live" },
  
  // === 🌍 世界音乐 (World) ===
  { name: "Latino FM", genre: "Latin Hits", url: "http://stream.latinofm.es:8000/latinofm.mp3" },
  { name: "Radio Bollywood", genre: "Hindi Hits", url: "http://stream.zeno.fm/g9a83z73588uv" },
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "none";
    }

    const audio = audioRef.current;

    const handleWaiting = () => {
      setIsLoading(true);
      setError(null);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (isLoading) {
          handleError("连接超时，切换下一台");
        }
      }, 15000); // 15秒超时，给 Worker 足够时间
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setError(null);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };
    
    const handleError = (e: any) => {
      console.warn("Stream failed, skipping:", STATIONS[currentStationIndex].name);
      setIsLoading(false);
      setError("信号弱，自动切台...");
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        nextChannel(); 
      }, 1500);
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentStationIndex]); 

  // ✅ 【关键逻辑】自动拼接 Worker 地址 + 原始链接
  useEffect(() => {
    if (audioRef.current) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsLoading(true);
      setError(null);
      
      // 获取原始链接
      const originalUrl = STATIONS[currentStationIndex].url;
      
      // 拼接 Worker 代理前缀
      // 使用 encodeURIComponent 保证特殊字符被正确处理
      audioRef.current.src = `${WORKER_PREFIX}${encodeURIComponent(originalUrl)}`;
      
      audioRef.current.volume = isMuted ? 0 : volume;
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .catch((err) => {
              console.error("Autoplay prevent:", err);
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
      setIsLoading(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
      setIsLoading(true);
      setError(null);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .catch((err) => {
            console.error("Manual play failed:", err);
            setIsPlaying(false);
            setIsLoading(false);
            setError("无法播放，请重试");
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
            <div className={`absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#0f172a,#1e293b,#0f172a)] ${isPlaying && !isLoading ? 'animate-[spin_6s_linear_infinite]' : ''}`}></div>
            {[...Array(3)].map((_, i) => (
               <div key={i} className={`absolute inset-${(i+1)*8} rounded-full border border-slate-800/20 opacity-30`}></div>
            ))}
            
            {/* 专辑封面/中心 */}
            <div className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-inner z-10">
               {isLoading ? (
                 <Loader2 size={40} className="text-white/80 animate-spin" />
               ) : error ? (
                 <WifiOff size={40} className="text-white/50" />
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
               error ? 'bg-orange-500/10 text-orange-400' :
               isLoading ? 'bg-yellow-500/10 text-yellow-500' : 
               'bg-indigo-500/10 text-indigo-400'
             }`}>
               {error ? "AUTO TUNING..." : isLoading ? "BUFFERING..." : currentStation.genre}
             </span>
          </div>
          
          <h2 className="text-2xl font-bold text-white truncate drop-shadow-sm px-2">
            {currentStation.name}
          </h2>
          
          <div className="text-xs h-4">
            {error ? (
              <span className="text-orange-400 animate-pulse">{error}</span>
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