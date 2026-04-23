import { useEffect, useState, useCallback, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, Ghost } from "lucide-react";

const TRACKS = [
  {
    id: 1,
    title: "Synthwave Nights [AI Generated]",
    artist: "Neon Core",
    url: "https://rpg.hamsterrepublic.com/wiki-images/a/a2/Tetsuo.ogg",
    color: "neon-text-magenta",
    bg: "bg-[linear-gradient(45deg,#ff00e5,#00f3ff)]"
  },
  {
    id: 2,
    title: "Cyber Horizon [AI Generated]",
    artist: "Virtual Memory",
    url: "https://rpg.hamsterrepublic.com/wiki-images/d/d7/Juhani_Junkala_%5BRetro_Game_Music_Pack%5D_Level_1.ogg",
    color: "neon-text-cyan",
    bg: "bg-[linear-gradient(45deg,#00f3ff,#7000ff)]"
  },
  {
    id: 3,
    title: "Digital Escape [AI Generated]",
    artist: "System Override",
    url: "https://rpg.hamsterrepublic.com/wiki-images/9/91/Juhani_Junkala_%5BRetro_Game_Music_Pack%5D_Level_2.ogg",
    color: "text-white",
    bg: "bg-[linear-gradient(45deg,#ff00e5,#4400ff)]"
  }
];

// Grid dimensions
const GRID_SIZE = 20;
// Speeds (ms)
const SPEED = 120;

type Point = { x: number; y: number };

export default function App() {
  // MUSIC PLAYER STATE
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // GAME STATE
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [nextDirection, setNextDirection] = useState<Point>({ x: 0, y: -1 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Fake Visualizer Animation State
  const [visualizerMeters, setVisualizerMeters] = useState<number[]>(Array(16).fill(10));

  useEffect(() => {
    if (!isPlaying) {
      setVisualizerMeters(Array(16).fill(10));
      return;
    }
    const intervalId = setInterval(() => {
      setVisualizerMeters(Array.from({ length: 16 }, () => Math.max(20, Math.random() * 100)));
    }, 150);
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  // Sync music and playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.log("Audio play error", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  // Handle track ends
  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  // Prevent default scroll on arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        e.preventDefault();
      }
      
      if (!gameStarted && (e.code === "Space" || e.code.startsWith("Arrow"))) {
        setGameStarted(true);
        setIsGameOver(false);
        setSnake([{ x: 10, y: 10 }]);
        setScore(0);
        setDirection({ x: 0, y: -1 });
        setNextDirection({ x: 0, y: -1 });
      }

      if (e.code === "ArrowUp" && direction.y !== 1) setNextDirection({ x: 0, y: -1 });
      if (e.code === "ArrowDown" && direction.y !== -1) setNextDirection({ x: 0, y: 1 });
      if (e.code === "ArrowLeft" && direction.x !== 1) setNextDirection({ x: -1, y: 0 });
      if (e.code === "ArrowRight" && direction.x !== -1) setNextDirection({ x: 1, y: 0 });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, gameStarted]);

  // Game Loop
  useEffect(() => {
    if (isGameOver || !gameStarted) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { x: head.x + nextDirection.x, y: head.y + nextDirection.y };

        // Check Wall Collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        // Check Self Collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check Food Collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          });
        } else {
          newSnake.pop();
        }

        setDirection(nextDirection);
        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, SPEED);
    return () => clearInterval(intervalId);
  }, [nextDirection, gameStarted, isGameOver, food]);


  const track = TRACKS[currentTrackIndex];

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row items-center justify-center gap-6 p-6 font-sans relative">
      
      {/* Background Orbs */}
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-[0.15] -top-[100px] -left-[100px] bg-[#00f3ff] z-0 pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-[0.15] -bottom-[100px] -right-[100px] bg-[#ff00e5] z-0 pointer-events-none"></div>

      {/* AUDIO ELEMENT */}
      <audio 
        ref={audioRef}
        src={track.url}
        onEnded={handleNextTrack}
      />

      {/* MUSIC PLAYER - FROSTED GLASS */}
      <div className="w-full max-w-xs md:max-w-sm glass p-6 md:p-8 flex flex-col space-y-6 relative z-10 shrink-0">
        
        <div className="flex flex-col space-y-1 mt-2">
          <h2 className="text-[14px] uppercase tracking-[1.5px] opacity-50 mb-3">Playlist</h2>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(0,243,255,0.1)] border-l-[3px] border-[#00f3ff]">
             <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-[#00f3ff] to-[#ff00e5]"></div>
             <div>
               <div className={`text-sm font-semibold ${track.color}`}>{track.title}</div>
               <div className="text-[11px] opacity-60">{track.artist}</div>
             </div>
          </div>
        </div>

        {/* Fake Visualizer */}
        <div className="flex items-end justify-between h-16 space-x-1 z-10 mt-4 px-2">
          {visualizerMeters.map((height, i) => (
            <div 
              key={i} 
              className={`w-full rounded-t-sm transition-all duration-150 ${track.bg}`}
              style={{
                height: `${height}%`,
              }}
            ></div>
          ))}
        </div>

        <div className="flex items-center justify-center space-x-6 z-10 pt-4">
          <button 
            onClick={handlePrevTrack}
            className="w-12 h-12 glass-btn"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-14 h-14 glass-btn ${isPlaying ? '' : 'glass-btn-play'}`}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-[#050505] pl-1" />}
          </button>
          
          <button 
            onClick={handleNextTrack}
            className="w-12 h-12 glass-btn"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>

      {/* SNAKE GAME WINDOW - FROSTED GLASS */}
      <div className="flex-1 glass flex flex-col items-center justify-center p-6 md:p-8 max-w-2xl relative z-10 mt-6 md:mt-0">
        
        {/* Game Header */}
        <div className="w-full flex justify-between items-center mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00f3ff] rounded-md flex items-center justify-center">
              <span className="text-[#050505] font-black text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold m-0 tracking-[1px] uppercase">Synth-Snake</h1>
          </div>
          <div className="text-2xl font-bold tracking-[2px] neon-text-cyan">SCORE: {score.toString()}</div>
        </div>

        {/* Game Board */}
        <div className="snake-grid-glass group flex-shrink-0 relative" style={{ width: "100%", maxWidth: "400px", aspectRatio: "1/1" }}>
          <div 
            className="grid w-full h-full"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              
              const isSnakeHead = snake[0].x === x && snake[0].y === y;
              const isSnakeBody = snake.some((seg, i) => i !== 0 && seg.x === x && seg.y === y);
              const isFoodTarget = food.x === x && food.y === y;

              let cellClass = "";
              if (isSnakeHead) cellClass = "snake-head z-20";
              else if (isSnakeBody) cellClass = "snake-part scale-90 z-10";
              else if (isFoodTarget) cellClass = "snake-food scale-75 animate-pulse z-10";

              return (
                <div key={index} className={`w-full h-full flex items-center justify-center relative`}>
                   {cellClass && <div className={`absolute inset-[1px] ${cellClass}`}></div>}
                </div>
              );
            })}
          </div>

          {/* Overlays */}
          {!gameStarted && !isGameOver && (
            <div className="absolute inset-0 bg-black/60 glass m-2 flex items-center justify-center flex-col shadow-none border-white/5 backdrop-blur-[4px] z-30 pointer-events-none">
              <p className="neon-text-cyan text-2xl font-bold tracking-[2px] mb-4">SYSTEM READY</p>
              <p className="text-[#00f3ff]/70 text-sm uppercase tracking-widest animate-pulse">Press SPACE to Start</p>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 bg-black/60 glass m-2 flex items-center justify-center flex-col shadow-none border-white/5 backdrop-blur-[4px] z-30 pointer-events-auto">
              <p className="neon-text-magenta text-3xl font-bold tracking-[2px] mb-2 uppercase">System Failure</p>
              <p className="text-white mb-6 tracking-widest">FINAL SCORE: {score}</p>
              <button 
                onClick={() => {
                  setGameStarted(true);
                  setIsGameOver(false);
                  setSnake([{ x: 10, y: 10 }]);
                  setScore(0);
                  setDirection({ x: 0, y: -1 });
                  setNextDirection({ x: 0, y: -1 });
                }}
                className="px-6 py-2 glass glass-btn text-[#00f3ff] hover:text-white uppercase tracking-wider text-sm rounded-lg w-auto h-auto min-h-[40px] border border-[#00f3ff]/30"
              >
                Reboot System
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-[12px] opacity-50 uppercase tracking-widest hidden md:block">Use arrow keys to maneuver</p>
        </div>

        {/* Mobile Controls */}
        <div className="mt-4 flex md:hidden">
          <div className="grid grid-cols-3 gap-3">
            <div></div>
            <button onClick={() => setNextDirection(d => d.y !== 1 ? {x: 0, y: -1} : d)} className="w-12 h-12 glass-btn text-[#00f3ff]">▲</button>
            <div></div>
            <button onClick={() => setNextDirection(d => d.x !== 1 ? {x: -1, y: 0} : d)} className="w-12 h-12 glass-btn text-[#00f3ff]">◀</button>
            <button onClick={() => setNextDirection(d => d.y !== -1 ? {x: 0, y: 1} : d)} className="w-12 h-12 glass-btn text-[#00f3ff]">▼</button>
            <button onClick={() => setNextDirection(d => d.x !== -1 ? {x: 1, y: 0} : d)} className="w-12 h-12 glass-btn text-[#00f3ff]">▶</button>
          </div>
        </div>
      </div>

    </div>
  );
}
