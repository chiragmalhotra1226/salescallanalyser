import Panel1Vitals from './Panel1Vitals'
import Panel2Intelligence from './Panel2Intelligence'
import Panel3Transcript from './Panel3Transcript'

export default function HUDShell() {
  return (
    <div style={{
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '300px 400px 1fr',
      overflow: 'hidden',
      minHeight: 0,
    }}>
      <Panel1Vitals />
      <Panel2Intelligence />
      <Panel3Transcript />
    </div>
  )
}