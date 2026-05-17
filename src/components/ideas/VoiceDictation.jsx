import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'

export default function VoiceDictation({ onTranscript }) {
  const [listening,  setListening]  = useState(false)
  const [supported,  setSupported]  = useState(false)
  const [interim,    setInterim]    = useState('')
  const recRef = useRef(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      setSupported(true)
      const rec = new SR()
      rec.continuous      = true
      rec.interimResults  = true
      rec.lang            = 'en-US'

      rec.onresult = (e) => {
        let final = ''
        let inter = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript
          if (e.results[i].isFinal) final += t
          else inter += t
        }
        if (final) onTranscript(final)
        setInterim(inter)
      }

      rec.onend = () => {
        setListening(false)
        setInterim('')
      }

      recRef.current = rec
    }
  }, [onTranscript])

  function toggle() {
    if (!recRef.current) return
    if (listening) {
      recRef.current.stop()
      setListening(false)
    } else {
      recRef.current.start()
      setListening(true)
    }
  }

  if (!supported) {
    return (
      <div className="flex items-center gap-2 text-xs text-tac-300 bg-tac-700 border border-tac-600 rounded-xl px-3 py-2">
        <MicOff size={13} />
        Voice dictation requires Chrome or Edge
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          listening
            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-900/40'
            : 'bg-flo/10 border border-flo/25 text-flo hover:bg-flo/20'
        }`}
      >
        {listening ? <Square size={14} /> : <Mic size={14} />}
        {listening ? 'Stop' : 'Dictate'}
      </button>

      {listening && interim && (
        <p className="text-sm text-tac-300 italic truncate max-w-xs">"{interim}"</p>
      )}
      {listening && !interim && (
        <span className="flex gap-1">
          {[0,1,2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
          ))}
        </span>
      )}
    </div>
  )
}
