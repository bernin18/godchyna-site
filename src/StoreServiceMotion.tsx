import { useEffect, useRef } from "react";
import "./store-service-motion.css";

type Point = [number, number];
const skins = [
  ["deagle serpent.png", "Desert Eagle Serpent Strike"],
  ["Ak redline.png", "AK-47 Redline"],
  ["Mogul.png", "Gloves Mogul"],
  ["Black Nile.png", "AWP Black Nile"],
  ["M4a1 black lotus.png", "M4A1-S Black Lotus"],
  ["Party Animal.png", "Party Animal"],
];

function dustRenderer(ctx: CanvasRenderingContext2D) {
function poly(p: Point[],fill: string,stroke?: string){ctx.beginPath();p.forEach((a,i)=>i?ctx.lineTo(...a):ctx.moveTo(...a));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function project(x: number,y: number,z=0): Point{return [320+(x-y)*1.52,102+(x+y)*.64-z]}
function box(x: number,y: number,w: number,d: number,h: number){let a=project(x,y),b=project(x+w,y),c=project(x+w,y+d),e=project(x,y+d);poly([a,b,[b[0],b[1]-h],[a[0],a[1]-h]],'#aa9369');poly([b,c,[c[0],c[1]-h],[b[0],b[1]-h]],'#72674f');poly([e,c,[c[0],c[1]-h],[e[0],e[1]-h]],'#8f7e5a');poly([[a[0],a[1]-h],[b[0],b[1]-h],[c[0],c[1]-h],[e[0],e[1]-h]],'#c2ac80','#d0ba8b55')}
function soldier(x: number,y: number,t: number,color: string,selected: boolean){const [px,py]=project(x,y);ctx.save();ctx.translate(px,py);ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(0,2,12,5,0,0,7);ctx.fill();if(selected){ctx.strokeStyle='#20f39a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,18,8,0,0,7);ctx.stroke()}const step=Math.sin(t*10)*4;ctx.lineWidth=5;ctx.strokeStyle='#303a3c';ctx.beginPath();ctx.moveTo(-3,-13);ctx.lineTo(-4+step,0);ctx.moveTo(3,-13);ctx.lineTo(4-step,0);ctx.stroke();ctx.fillStyle=color;ctx.fillRect(-7,-29,14,17);ctx.fillStyle='#343f43';ctx.fillRect(-6,-26,11,10);ctx.fillStyle='#bca485';ctx.beginPath();ctx.arc(0,-35,5,0,7);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(-1,-38,6,4,0,0,7);ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(-5,-25);ctx.lineTo(6,-21);ctx.lineTo(14,-25);ctx.stroke();ctx.fillStyle='#151d20';ctx.fillRect(6,-28,18,3);if(selected){ctx.strokeStyle='#20f39a88';ctx.lineWidth=1;ctx.strokeRect(-12,-46,39,50)}ctx.restore()}
function draw(t: number){ctx.clearRect(0,0,640,400);const bg=ctx.createLinearGradient(0,0,0,400);bg.addColorStop(0,'#253339');bg.addColorStop(1,'#0c1318');ctx.fillStyle=bg;ctx.fillRect(0,0,640,400);poly([project(-130,-80),project(150,-80),project(150,150),project(-130,150)],'#ab9670');for(let i=-120;i<150;i+=22){ctx.strokeStyle='#594e391c';ctx.beginPath();ctx.moveTo(...project(i,-80));ctx.lineTo(...project(i,150));ctx.stroke()}
box(-135,-85,110,38,82);box(30,-85,120,40,68);box(-135,-45,28,140,56);box(108,-45,35,110,45);box(-105,90,135,35,27);box(48,85,55,40,35);box(72,-2,25,25,23);box(75,28,22,22,23);box(-68,-20,28,23,23);
ctx.save();ctx.translate(...project(30,60));ctx.fillStyle='#b44428';ctx.font='bold 30px Arial';ctx.fillText('A',0,0);ctx.restore();
const pause=t%8>4.8&&t%8<6.6;const p=pause ? .6 :(t%8<4.8?(t%8)/8:((t%8)-1.8)/8);const x=-70+p*185,y=38-Math.sin(p*3)*35;
ctx.setLineDash([5,5]);ctx.strokeStyle='#20f39a99';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...project(-75,38));ctx.lineTo(...project(0,6));ctx.lineTo(...project(64,27));ctx.stroke();ctx.setLineDash([]);
soldier(x-18,y+27,t,'#627c87',false);soldier(x,y,t,'#627c87',true);soldier(66,-18,t,'#9c895b',false);
if(pause){const q=project(x,y);ctx.strokeStyle='#ffc438';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q[0]+8,q[1]-20,32,0,7);ctx.stroke();ctx.fillStyle='#0a161ee8';ctx.fillRect(355,300,220,29);ctx.fillStyle='#f9d56c';ctx.font='18px Arial';ctx.fillText('Rever posicionamento',367,320)}
const vign=ctx.createRadialGradient(320,200,100,320,200,370);vign.addColorStop(0,'#0000');vign.addColorStop(1,'#000b');ctx.fillStyle=vign;ctx.fillRect(0,0,640,400);

}

return draw;
}

export default function StoreServiceMotion({kind, asset, label}: {kind: string; asset: (name: string)=>string; label: string}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    const root = rootRef.current;
    if (!root) return;
    const context = canvasRef.current?.getContext("2d");
    const draw = context ? dustRenderer(context) : null;
    const slots = root.querySelector<HTMLDivElement>(".ssm-slots");
    const inspect = root.querySelector<HTMLDivElement>(".ssm-inspect");
    const weapon = root.querySelector<HTMLImageElement>(".ssm-weapon");
    let frameId = 0, previous = 0, elapsed = 0, visible = true;
    function render(t: number) {
      draw?.(t);
      if (slots && inspect && weapon) {
        const phase = t % 9, examining = phase > 3 && phase < 8;
        slots.style.opacity = examining ? "0" : "1";
        slots.style.transform = examining ? "scale(.9)" : "scale(1)";
        slots.children[0]?.classList.toggle("selected", phase > 1.5 && phase < 3);
        inspect.style.opacity = examining ? "1" : "0";
        inspect.style.transform = examining ? "scale(1)" : "scale(.7)";
        weapon.style.transform = "perspective(500px) rotateY(" + Math.sin(t*1.5)*28 + "deg) rotate(" + Math.sin(t)*7 + "deg)";
      }
    }
    function frame(now: number) {
      if (previous && visible && !document.hidden) elapsed += Math.min((now-previous)/1000,.1);
      previous = now;
      if (visible && !document.hidden) render(elapsed);
      frameId = requestAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry])=>{visible = entry.isIntersecting; previous = 0;});
    observer.observe(root);
    render(0);
    frameId = requestAnimationFrame(frame);
    return ()=>{cancelAnimationFrame(frameId); observer.disconnect();};
  }, [kind]);

  return <div ref={rootRef} className="store-service-motion">
    {kind === "demo-review"
      ? <canvas ref={canvasRef} width={640} height={400} role="img" aria-label={label}/>
      : <div className="ssm-inventory" role="img" aria-label={label}>
          <div className="ssm-slots">{skins.map(([file,name])=><div key={file} className="ssm-slot"><img src={asset(file)} alt={name} loading="lazy"/></div>)}</div>
          <div className="ssm-inspect">
            <span className="ssm-inspect-label">EXAMINAR</span>
            <img className="ssm-weapon" src={asset("deagle serpent.png")} alt="Desert Eagle Serpent Strike" loading="lazy"/>
            <span className="ssm-weapon-name">StatTrak™ Desert Eagle<br/><strong>Serpent Strike</strong></span>
          </div>
        </div>}
  </div>;
}
