export default function Home(){
  return (
    <main style={{padding:24,fontFamily:"ui-sans-serif,system-ui"}}>
      <h1>Chapterhouse (SSR)</h1>
      <ul>
        <li><a href="/admin/dev-signup">Dev Admin Signup</a></li>
        <li><a href="/admin/login">Admin Login</a></li>
        <li><a href="/admin/dashboard">Dashboard</a></li>
      </ul>
      <p style={{opacity:.7}}>Deploy as SSR on Netlify (.next via @netlify/plugin-nextjs)</p>
    </main>
  );
}
