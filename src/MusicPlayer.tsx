import { useState, useRef, useEffect } from 'react';
import { VoiceBeam } from 'voice-glow';
import './MusicPlayer.css';

const TRACKS = [
  { title: 'Eyelahenazz', src: import.meta.env.BASE_URL + 'music/@eyelahenazz.mp3' },
  { title: 'Fogholade', src: import.meta.env.BASE_URL + 'music/Behzad Leito Ft Sijal Ft Sami Beigi - Fogholade.mp3' },
  { title: 'Farda (Remix)', src: import.meta.env.BASE_URL + 'music/Behzad-Leito-Farda-(Ft-Laleh-Live-Tomorrow-Remix)-256.mp3' },
  { title: 'Hamisheh Ghayeb', src: import.meta.env.BASE_URL + 'music/Hamisheh Ghayeb   Dariush.mp3' },
  { title: 'Veridis Quo', src: import.meta.env.BASE_URL + 'music/Veridis Quo - Daft Punk.mp3' },
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initAudioStream = () => {
    if (audioCtxRef.current || !audioRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      const source = ctx.createMediaElementSource(audioRef.current);
      const dest = ctx.createMediaStreamDestination();
      
      source.connect(ctx.destination);
      source.connect(dest);
      
      setAudioStream(dest.stream);
      audioCtxRef.current = ctx;
    } catch (e) {
      console.error('Failed to init Web Audio stream', e);
    }
  };

  // Autoplay Logic
  useEffect(() => {
    const handleInteraction = () => {
      const audio = audioRef.current;
      if (audio && audio.paused) {
        initAudioStream();
        if (audioCtxRef.current?.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        audio.play().then(() => {
          setIsPlaying(true);
          window.removeEventListener('pointerdown', handleInteraction, true);
          window.removeEventListener('touchstart', handleInteraction, true);
          window.removeEventListener('click', handleInteraction, true);
          window.removeEventListener('keydown', handleInteraction, true);
        }).catch(e => console.warn('Autoplay failed:', e));
      }
    };

    window.addEventListener('pointerdown', handleInteraction, true);
    window.addEventListener('touchstart', handleInteraction, true);
    window.addEventListener('click', handleInteraction, true);
    window.addEventListener('keydown', handleInteraction, true);

    // Try immediate
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        initAudioStream();
        window.removeEventListener('pointerdown', handleInteraction, true);
          window.removeEventListener('touchstart', handleInteraction, true);
          window.removeEventListener('click', handleInteraction, true);
        window.removeEventListener('keydown', handleInteraction, true);
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('pointerdown', handleInteraction, true);
          window.removeEventListener('touchstart', handleInteraction, true);
          window.removeEventListener('click', handleInteraction, true);
      window.removeEventListener('keydown', handleInteraction, true);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        if (audioCtxRef.current?.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        audioRef.current.play().catch((err) => {
          console.error('Playback prevented:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrackIndex, isPlaying]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        initAudioStream();
        if (audioCtxRef.current?.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioRef.current.duration;
    if (isFinite(newTime)) {
      audioRef.current.currentTime = newTime;
      setProgress(percentage * 100);
    }
  };

  return (
    <div className="music-player-wrapper">
      <VoiceBeam 
        stream={audioStream}
        colorVariant="sunset" 
        theme="dark"
        type={isMobile ? "mobile" : "default"}
      >
        <div className="music-player">
          <audio 
            autoPlay
            ref={audioRef} 
            src={TRACKS[currentTrackIndex].src} 
            preload="metadata"
            
          />
          <div className="player-info">
            <span className="track-title">{TRACKS[currentTrackIndex].title}</span>
          </div>
          <div className="player-controls">
            <button className="ctrl-btn" onClick={handlePrev} aria-label="Previous">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            <button className="ctrl-btn play-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            <button className="ctrl-btn" onClick={handleNext} aria-label="Next">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>
          <div className="progress-bar" onClick={handleProgressClick} style={{ cursor: 'pointer' }}>
            <div className="progress-fill" style={{ width: progress + '%' }}></div>
          </div>
        </div>
      </VoiceBeam>
    </div>
  );
}
