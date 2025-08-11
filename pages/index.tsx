import Link from 'next/link'
export default function Home() {
  return (
    <main style={{padding:24, fontFamily:'ui-sans-serif, system-ui'}}>
      <h1>Chapterhouse — Live Fast</h1>
      <ul>
        <li><Link href="/memory">Memory smoke test</Link></li>
        <li><Link href="/widget">Assistant widget</Link></li>
      </ul>
      <p style={{marginTop:24, opacity:.7}}>Run: <code>npm run build</code> (static export)</p>
    </main>
  )
}
