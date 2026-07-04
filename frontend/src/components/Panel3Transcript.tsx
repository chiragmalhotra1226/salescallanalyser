import React, { useState } from 'react'

// --- Types ---
interface ParsedCall {
  id: number;
  title: string;
  content: string;
}

// --- Helpers ---
const splitCalls = (text: string): ParsedCall[] => {
  if (!text) return [];
  // Split by the delimiter, removing the first empty element if it exists
  const parts = text.split(/^=== CALL /m).filter(p => p.trim() !== "");
  
  return parts.map((chunk, i) => {
    const lines = chunk.split("\n");
    const header = lines[0]; // e.g., "1: RE60e4... (42 min) ==="
    const content = lines.slice(1).join("\n").replace(/=== END OF ALL CALLS ===/, "").trim();
    
    return {
      id: i + 1,
      title: `Call ${i + 1}`,
      content: content
    };
  });
};

// --- Sub-Component for Individual Lines ---
function TranscriptLine({ line }: { line: string }) {
  // Regex to extract [00:00] Name: Text
  const match = line.match(/^\[([\d:]+)\]\s*(.*?):\s*(.*)$/);
  
  if (!match) return <div style={{ color: 'var(--dim)', padding: '2px 0' }}>{line}</div>;

  const [, time, speaker, text] = match;
  // Use speaker name to determine color
  const isAgent = speaker.toLowerCase().includes('agent') || speaker.includes('AG');

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      padding: '6px 0',
      alignItems: 'flex-start',
      animation: 'fade-up .15s ease both',
    }}>
      <span style={{
        fontSize: 14,
        fontWeight: 700,
        minWidth: 35,
        color: isAgent ? 'var(--blue)' : 'var(--amber)',
        fontFamily: 'var(--mono)',
      }}>
        {speaker.substring(0, 2).toUpperCase()}
      </span>
      <span style={{
        fontSize: 16,
        color: 'var(--text)',
        lineHeight: 1.5,
        fontFamily: 'var(--sans)',
        flex: 1,
      }}>
        {text}
      </span>
      <span style={{
        fontSize: 13,
        color: 'var(--dim)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {time}
      </span>
    </div>
  );
}

// --- Main Component ---
export default function Panel3Transcript({ transcriptText }: { transcriptText: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const calls = splitCalls(transcriptText);
  const currentCall = calls[activeIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header Bar */}
      <div style={{
        height: 34,
        borderBottom: '1px solid var(--b-sub)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        fontSize: 12,
        letterSpacing: '.1em',
        color: 'var(--mute)',
        background: 'rgba(0,0,0,0.1)'
      }}>
        <span style={{ color: 'white', fontWeight: 600 }}>3. TRANSCRIPT ENGINE</span>
        {currentCall && (
          <span style={{ marginLeft: 'auto', opacity: 0.7 }}>
            {currentCall.title} active
          </span>
        )}
      </div>

      {/* Tabs for Multiple Calls */}
      {calls.length > 1 && (
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          borderBottom: '1px solid var(--b-sub)',
          background: 'var(--bg)',
          scrollbarWidth: 'none',
        }}>
          {calls.map((call, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                padding: '10px 16px',
                fontSize: 14,
                border: 'none',
                borderBottom: `2px solid ${activeIdx === i ? 'var(--green)' : 'transparent'}`,
                background: activeIdx === i ? 'var(--green-d)' : 'transparent',
                color: activeIdx === i ? 'var(--green)' : 'var(--mute)',
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                whiteSpace: 'nowrap',
                transition: 'all .2s',
              }}
            >
              CALL {call.id}
            </button>
          ))}
        </div>
      )}

      {/* Transcript Body */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '15px',
        background: 'linear-gradient(180deg, var(--bg) 0%, rgba(0,0,0,0.2) 100%)'
      }}>
        {!currentCall ? (
          <div style={{ color: 'var(--dim)', textAlign: 'center', marginTop: 50 }}>
            Waiting for transcription data...
          </div>
        ) : (
          currentCall.content.split('\n').map((line, i) => (
            <TranscriptLine key={i} line={line} />
          ))
        )}
      </div>
    </div>
  );
}