import dynamic from "next/dynamic";
const Widget = dynamic(() => import("@/components/Widget"), { ssr: false });

export default function WidgetPage(){
  return (
    <main style={{padding:24,fontFamily:"ui-sans-serif,system-ui"}}>
      <h1>Assistant widget</h1>
      <Widget />
    </main>
  );
}
