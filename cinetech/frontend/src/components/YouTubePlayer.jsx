// Lecteur YouTube personnalisé (API iFrame) avec contrôles
import { useEffect, useRef, useState } from 'react'

// Charge l'API YouTube iFrame si nécessaire
function loadYouTubeApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT)
      return
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
    const check = () => {
      if (window.YT && window.YT.Player) {
        resolve(window.YT)
      } else {
        setTimeout(check, 50)
      }
    }
    check()
  })
}

// Crée un player YouTube et expose des contrôles (play, mute, seek, rate)
function YouTubePlayer({ videoId, autoPlay = false }) {
  const containerRef = useRef(null)
  const wrapperRef = useRef(null)
  const playerRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [volume, setVolume] = useState(60)
  const [rate, setRate] = useState(1)
  const [showUi, setShowUi] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const hideTimerRef = useRef(null)

  useEffect(() => {
    let mounted = true
    if (!videoId) return
    loadYouTubeApi().then((YT) => {
      if (!mounted || !containerRef.current) return
      playerRef.current = new YT.Player(containerRef.current, {
        host: 'https://www.youtube-nocookie.com',
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 0,
          fs: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          disablekb: 1,
        },
        events: {
          onReady: () => {
            setReady(true)
            const p = playerRef.current
            if (p) {
              setDuration(p.getDuration() || 0)
              setMuted(p.isMuted())
            }
            if (autoPlay) {
              playerRef.current.playVideo()
              setPlaying(true)
            }
          },
          onStateChange: (e) => {
            if (e.data === 1) setPlaying(true)
            else if (e.data === 2) setPlaying(false)
          },
        },
      })
    })
    return () => {
      mounted = false
      const p = playerRef.current
      if (p && p.destroy) p.destroy()
      playerRef.current = null
    }
  }, [videoId, autoPlay])

  const onPlayPause = () => {
    const p = playerRef.current
    if (!p) return
    if (playing) p.pauseVideo()
    else p.playVideo()
  }

  const onMuteUnmute = () => {
    const p = playerRef.current
    if (!p) return
    if (muted) {
      p.unMute()
      setMuted(false)
    } else {
      p.mute()
      setMuted(true)
    }
  }

  useEffect(() => {
    const p = playerRef.current
    if (!p || !ready) return
    p.setPlaybackRate(rate)
    p.setVolume(volume)
    const id = setInterval(() => {
      const pl = playerRef.current
      if (!pl) return
      setCurrent(pl.getCurrentTime() || 0)
      setMuted(pl.isMuted())
    }, 250)
    return () => clearInterval(id)
  }, [ready, rate, volume])

  const formatTime = (t) => {
    const s = Math.floor(t)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
    const ss = String(sec).padStart(2, '0')
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
  }

  const onSeek = (e) => {
    const p = playerRef.current
    if (!p || !ready) return
    const v = Number(e.target.value)
    p.seekTo(v, true)
    setCurrent(v)
  }

  const onVol = (e) => {
    const p = playerRef.current
    if (!p || !ready) return
    const v = Number(e.target.value)
    setVolume(v)
    p.setVolume(v)
    if (v === 0) {
      p.mute()
      setMuted(true)
    } else {
      p.unMute()
      setMuted(false)
    }
  }

  const onRate = (e) => {
    const p = playerRef.current
    if (!p || !ready) return
    const v = Number(e.target.value)
    setRate(v)
    p.setPlaybackRate(v)
  }

  const onSkip = (delta) => {
    const p = playerRef.current
    if (!p || !ready) return
    const t = Math.min(Math.max(current + delta, 0), duration)
    p.seekTo(t, true)
    setCurrent(t)
  }

  const requestFs = () => {
    const el = wrapperRef.current
    if (!el) return
    setShowUi(true)
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen
    const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement
    if (isFs) {
      if (exit) exit.call(document)
      setFullscreen(false)
    } else {
      if (req) {
        req.call(el)
        setFullscreen(true)
      }
    }
  }

  const onMouseMove = () => {
    setShowUi(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      if (playing) setShowUi(false)
    }, 2000)
  }

  return (
    <div ref={wrapperRef} className="relative" onMouseMove={onMouseMove}>
      <div className={`${fullscreen ? 'h-full w-full' : 'aspect-video'} overflow-hidden rounded-xl bg-neutral-800`}>
        <div ref={containerRef} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-transparent" />
        <div className={`pointer-events-none absolute inset-0 flex items-center justify-center transition ${showUi ? 'opacity-100' : 'opacity-0'}`}>
          <button
            type="button"
            onClick={onPlayPause}
            disabled={!ready}
            className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white shadow hover:bg-black/70 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[28px]">{playing ? 'pause' : 'play_arrow'}</span>
          </button>
        </div>
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 p-3 transition ${showUi ? 'opacity-100' : 'opacity-0'}`}>
          <div className="pointer-events-auto grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onSkip(-10)} disabled={!ready} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white shadow hover:bg-black/70 disabled:opacity-50">
                <span className="material-symbols-outlined">replay_10</span>
              </button>
              <button type="button" onClick={onPlayPause} disabled={!ready} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 disabled:opacity-50">
                <span className="material-symbols-outlined">{playing ? 'pause' : 'play_arrow'}</span>
              </button>
              <button type="button" onClick={() => onSkip(10)} disabled={!ready} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white shadow hover:bg-black/70 disabled:opacity-50">
                <span className="material-symbols-outlined">forward_10</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input type="range" min="0" max={Math.max(duration, 0)} step="1" value={Math.min(current, duration)} onChange={onSeek} className="w-full accent-red-600" />
              <div className="text-xs text-neutral-200">
                <span>{formatTime(current)}</span>
                <span className="mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onMuteUnmute} disabled={!ready} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-600 bg-black/60 text-white shadow hover:border-red-600 disabled:opacity-50">
                <span className="material-symbols-outlined">{muted ? 'volume_up' : 'volume_off'}</span>
              </button>
              <input type="range" min="0" max="100" step="1" value={volume} onChange={onVol} className="w-24 accent-red-600" />
              <select value={rate} onChange={onRate} className="rounded-md border border-neutral-600 bg-black/60 px-2 py-1 text-xs text-neutral-200">
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
              <button type="button" onClick={requestFs} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-600 bg-black/60 text-white shadow hover:border-red-600">
                <span className="material-symbols-outlined">{fullscreen ? 'close_fullscreen' : 'open_in_full'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default YouTubePlayer
