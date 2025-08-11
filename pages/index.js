export default function Home(){
  return (
    <main style={{padding:24,fontFamily:'ui-sans-serif,system-ui'}}>
      <h1>Chapterhouse — Admin</h1>
      <ul>
        <li><a href="/admin/dev-signup">Dev Admin Signup</a></li>
        <li><a href="/admin/login">Admin Login</a></li>
        <li><a href="/admin/dashboard">Dashboard</a></li>
      </ul>
      <h2 style={{marginTop:24}}>Extras</h2>
      <ul>
        <li><a href="/memory">Memory smoke test</a></li>
        <li><a href="/widget">Assistant widget</a></li>
      </ul>
    </main>
  );
}
