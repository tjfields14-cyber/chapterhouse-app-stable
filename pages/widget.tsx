'use client'
import dynamic from 'next/dynamic'
const Widget = dynamic(()=>import('@/components/Widget'), { ssr: false })
export default function WidgetPage() {
  return (
    <main style={{minHeight:'100vh'}}>
      <Widget />
    </main>
  )
}
