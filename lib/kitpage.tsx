// Shared layout component for all kit pages
'use client';

import Link from 'next/link';
import { useEffect, useRef, ReactNode } from 'react';

export function HexCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    const R = 28, HW = R * Math.sqrt(3), HH = R * 1.5;
    let W = 0, H = 0, t = 0, id: any;
    const hexes: any[] = [];
    function resize() {
      W = c.width = window.innerWidth; H = c.height = window.innerHeight; hexes.length = 0;
      for (let r = -1; r < Math.ceil(H/HH)+2; r++)
        for (let col = -1; col < Math.ceil(W/HW)+2; col++)
          hexes.push({x:col*HW+(r%2===0?0:HW/2),y:r*HH,a:Math.random()*.25+.04,s:Math.random()*.004+.001,p:Math.random()*Math.PI*2});
    }
    function hex(x:number,y:number,r:number){ctx.beginPath();for(let i=0;i<6;i++){const a=Math.PI/180*(60*i-30);ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));}ctx.closePath();}
    function draw(){ctx.clearRect(0,0,W,H);t+=.008;for(const h of hexes){const a=h.a*(.5+.5*Math.sin(t*h.s*200+h.p));ctx.strokeStyle=`rgba(57,255,20,${a})`;ctx.lineWidth=.5;hex(h.x,h.y,R-2);ctx.stroke();}id=window.setTimeout(()=>requestAnimationFrame(draw),50);}
    window.addEventListener('resize',resize);resize();draw();
    return()=>{clearTimeout(id);window.removeEventListener('resize',resize);};
  },[]);
  return <canvas ref={ref} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0,opacity:.22}}/>;
}

interface KitPageProps {
  title: string;
  tag: string;
  icon: string;
  accentColor: string;
  desc: string;
  children: ReactNode;
  backLabel?: string;
}

export function KitPageLayout({ title, tag, icon, accentColor, desc, children, backLabel }: KitPageProps) {
  return (
    <>
      <HexCanvas />
      <div className="scanline" />
      {/* NAV */}
      <nav className="nav">
        <div style={{display:'flex',alignItems:'center',gap:12,maxWidth:1200,margin:'0 auto',padding:'0 20px',height:52}}>
          <Link href="/" style={{fontFamily:'var(--disp)',fontSize:14,fontWeight:900,color:'rgba(57,255,20,.5)',letterSpacing:'.12em',textDecoration:'none',transition:'color .18s'}}
            onMouseEnter={e=>(e.currentTarget.style.color='var(--g1)')}
            onMouseLeave={e=>(e.currentTarget.style.color='rgba(57,255,20,.5)')}>
            ← PAYCLAW
          </Link>
          <div style={{fontFamily:'var(--mono)',fontSize:9,color:'rgba(57,255,20,.2)',letterSpacing:'.2em'}}>/</div>
          <div style={{fontFamily:'var(--disp)',fontSize:12,fontWeight:700,color:accentColor,letterSpacing:'.1em'}}>{title.toUpperCase()}</div>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6}}>
            <div className="net-badge"><div className="pdot" /><span style={{fontFamily:'var(--mono)',fontSize:9,color:'rgba(57,255,20,.5)',letterSpacing:'.12em'}}>ARC TESTNET</span></div>
          </div>
        </div>
      </nav>

      <div style={{position:'relative',zIndex:1,maxWidth:1200,margin:'0 auto',padding:'0 20px 60px'}}>
        {/* PAGE HEADER */}
        <div style={{padding:'44px 0 32px'}}>
          <div style={{fontFamily:'var(--mono)',fontSize:9,color:`${accentColor}99`,letterSpacing:'.22em',textTransform:'uppercase',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:20,height:1,background:`linear-gradient(90deg,transparent,${accentColor}66)`}}/>
            {tag}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:16}}>
            <div style={{width:56,height:56,borderRadius:'50%',border:`1px solid ${accentColor}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,color:accentColor,background:`${accentColor}08`,flexShrink:0,boxShadow:`0 0 20px ${accentColor}22`}}>{icon}</div>
            <h1 style={{fontFamily:'var(--disp)',fontSize:'clamp(22px,4vw,40px)',fontWeight:900,color:'#e8e8e8',letterSpacing:'.04em',lineHeight:1.1}}>{title}</h1>
          </div>
          <p style={{fontSize:15,lineHeight:1.75,color:'var(--muted)',maxWidth:640,borderLeft:`2px solid ${accentColor}33`,paddingLeft:16}}>{desc}</p>
        </div>

        {/* KIT CONTENT */}
        <div style={{border:`1px solid ${accentColor}22`,background:'#050905',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${accentColor}88,transparent)`}}/>
          <div style={{padding:'28px 24px'}}>
            <div style={{fontFamily:'var(--mono)',fontSize:9,color:`${accentColor}55`,letterSpacing:'.18em',marginBottom:20}}>// CIRCLE APP KIT · OFFICIAL SDK · {title.toUpperCase()}</div>
            {children}
          </div>
        </div>

        {/* BACK TO SUITE */}
        <div style={{marginTop:32,paddingTop:24,borderTop:'1px solid rgba(57,255,20,.08)',display:'flex',alignItems:'center',gap:16}}>
          <Link href="/" style={{fontFamily:'var(--disp)',fontSize:9,fontWeight:700,letterSpacing:'.14em',padding:'8px 16px',border:'1px solid rgba(57,255,20,.2)',color:'rgba(57,255,20,.5)',textDecoration:'none',transition:'all .18s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--g1)';e.currentTarget.style.color='var(--g1)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(57,255,20,.2)';e.currentTarget.style.color='rgba(57,255,20,.5)';}}>
            ← BACK TO SUITE
          </Link>
          <Link href="/app" style={{fontFamily:'var(--disp)',fontSize:9,fontWeight:700,letterSpacing:'.14em',padding:'8px 16px',border:'1px solid rgba(57,255,20,.2)',color:'rgba(57,255,20,.5)',textDecoration:'none',transition:'all .18s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--g1)';e.currentTarget.style.color='var(--g1)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(57,255,20,.2)';e.currentTarget.style.color='rgba(57,255,20,.5)';}}>
            ◈ OPEN PAYROLL APP
          </Link>
        </div>
      </div>
    </>
  );
}
