const ee=`
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`,te=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;          // css px
uniform float uScale;       // device px per css px in the canvas buffer
uniform float uTime;
uniform vec4 uP[4];  // x, y, r, w
uniform vec4 uSa[3]; // ax, ay, bx, by
uniform vec2 uSw[3]; // r, w
uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a; vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1.0), 0.0, 1.0);
  return length(pa - ba * h);
}
vec3 ramp(float v) {
  if (v < 0.25) return mix(uC0, uC1, v / 0.25);
  if (v < 0.5) return mix(uC1, uC2, (v - 0.25) / 0.25);
  if (v < 0.75) return mix(uC2, uC3, (v - 0.5) / 0.25);
  return mix(uC3, uC4, (v - 0.75) / 0.25);
}
void main() {
  vec2 p = gl_FragCoord.xy / uScale;
  p.y = uRes.y - p.y;
  // slow atmospheric warp — air, not shape
  float t = uTime * 0.05;
  vec2 q = p / 340.0;
  vec2 warp = vec2(noise(q + vec2(t, 0.0)), noise(q + vec2(5.2, -t))) - 0.5;
  vec2 pw = p + warp * 90.0;

  float f = 0.0;
  for (int i = 0; i < 4; i++) {
    vec2 d = pw - uP[i].xy;
    float r = max(uP[i].z, 1.0);
    f += uP[i].w * exp(-dot(d, d) / (r * r));
  }
  for (int i = 0; i < 3; i++) {
    float d = segDist(pw, uSa[i].xy, uSa[i].zw);
    float r = max(uSw[i].x, 1.0);
    f += uSw[i].y * exp(-(d * d) / (r * r));
  }
  // Soft saturation, capped: most of the field stays in the pale sand
  // tones; the signal orange is reached only at the very core.
  float v = (1.0 - exp(-f * 0.8)) * 0.8;
  vec3 col = ramp(clamp(v, 0.0, 1.0));
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0; // dither against banding
  gl_FragColor = vec4(col, 1.0);
}
`;function Y(t){const h=parseInt(t.trim().replace("#",""),16);return[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255]}function oe(t){const h=getComputedStyle(document.documentElement),S=[0,1,2,3,4].map(c=>h.getPropertyValue(`--field-${c}`)||"#f3eee7");let y=1,A=1;function M(){const c=t.getBoundingClientRect();y=Math.max(1,c.width),A=Math.max(1,c.height),t.width=Math.round(y*.5),t.height=Math.round(A*.5)}const o=t.getContext("webgl",{antialias:!1,alpha:!1,preserveDrawingBuffer:!0});if(o){const c=(s,u)=>{const l=o.createShader(s);return o.shaderSource(l,u),o.compileShader(l),o.getShaderParameter(l,o.COMPILE_STATUS)?l:null},d=c(o.VERTEX_SHADER,ee),p=c(o.FRAGMENT_SHADER,te),w=o.createProgram();if(d&&p&&(o.attachShader(w,d),o.attachShader(w,p),o.linkProgram(w)),d&&p&&o.getProgramParameter(w,o.LINK_STATUS)){o.useProgram(w);const s=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,s),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),o.STATIC_DRAW);const u=o.getAttribLocation(w,"aPos");o.enableVertexAttribArray(u),o.vertexAttribPointer(u,2,o.FLOAT,!1,0,0);const l=C=>o.getUniformLocation(w,C);S.forEach((C,L)=>o.uniform3fv(l(`uC${L}`),Y(C)));const O=l("uRes"),E=l("uScale"),z=l("uTime"),_=l("uP"),N=l("uSa"),k=l("uSw");return M(),{resize:M,render(C,L,D){const G=new Float32Array(16);C.slice(0,4).forEach((g,q)=>G.set([g.x,g.y,g.r,g.w],q*4));const P=new Float32Array(12),H=new Float32Array(6);L.slice(0,3).forEach((g,q)=>{P.set([g.ax,g.ay,g.bx,g.by],q*4),H.set([g.r,g.w],q*2)}),o.viewport(0,0,t.width,t.height),o.uniform2f(O,y,A),o.uniform1f(E,t.width/y),o.uniform1f(z,D),o.uniform4fv(_,G),o.uniform4fv(N,P),o.uniform2fv(k,H),o.drawArrays(o.TRIANGLE_STRIP,0,4)}}}}const x=t.getContext("2d");return x?(M(),{resize:M,render(c,d){const p=t.width/y;x.fillStyle=S[0],x.fillRect(0,0,t.width,t.height);const w=[...c];for(const s of d)for(let u=0;u<=1;u+=.25)w.push({x:s.ax+(s.bx-s.ax)*u,y:s.ay+(s.by-s.ay)*u,r:s.r*1.2,w:s.w*.45});for(const s of w){if(s.w<=.01)continue;const u=x.createRadialGradient(s.x*p,s.y*p,0,s.x*p,s.y*p,s.r*1.8*p),l=Math.min(1,s.w)*.8;u.addColorStop(0,j(S[3],l)),u.addColorStop(.45,j(S[2],l*.6)),u.addColorStop(1,j(S[1],0)),x.fillStyle=u,x.fillRect(0,0,t.width,t.height)}}}):null}function j(t,h){const[S,y,A]=Y(t);return`rgba(${Math.round(S*255)},${Math.round(y*255)},${Math.round(A*255)},${h.toFixed(3)})`}const J=t=>Math.min(1,Math.max(0,t)),re=t=>t*t*(3-2*t),v=(t,h,S)=>re(J((t-h)/(S-h)));function ne(){const t=document.querySelector("[data-hero]"),h=t?.querySelector("[data-hero-stage]"),S=t?.querySelector("[data-field]"),y=t?.querySelector("[data-ext]"),A=t?.querySelector("[data-ext-label]");if(!t||!h||!S||!y||!A)return;const M=(e,r)=>e.dataset[r].split(",").map(Number),o=(e,r)=>{const[n,a]=M(e,"show"),[i,f]=M(e,"hide");return v(r,n,a)*(1-v(r,i,f))},x={};for(const e of t.querySelectorAll("[data-hfig]")){const[r,n,a,i]=e.dataset.win.split(",").map(Number);x[e.dataset.hfig]={el:e,svg:e.querySelector("svg"),win:{x:r,y:n,w:a,h:i},winClip:e.querySelector("[data-win-clip]"),winFrame:e.querySelector("[data-win-frame]"),lensClip:e.querySelector("[data-lens-clip]"),lensRing:e.querySelector("[data-lens-ring]"),field:JSON.parse(e.dataset.field),relation:JSON.parse(e.dataset.relation),cropW:Number(e.dataset.cropW),u:1}}const c=x.ikebana,d=x.trainpole,p=matchMedia("(prefers-reduced-motion: reduce)"),w=matchMedia("(hover: hover) and (pointer: fine)");let s=null,u=!1,l=!0,O=0,E=null;const z=performance.now();function _(e,r,n){const a=e.svg.getScreenCTM();if(!a)return{x:0,y:0,k:1};const i=new DOMPoint(r[0],r[1]).matrixTransform(a);return{x:i.x-n.left,y:i.y-n.top,k:a.a}}function N(e,r,n,a){const i=_(e,r.at,a);return{x:i.x,y:i.y,r:r.r*i.k,w:n}}function k(e,r,n,a){const i=_(e,r.at,a),f=_(e,r.to,a);return{ax:i.x,ay:i.y,bx:f.x,by:f.y,r:r.r*i.k,w:n}}function C(e,r){const{x:n,y:a,w:i,h:f}=e.win;for(const F of[e.winClip,e.winFrame])F.setAttribute("x",String(n+i*(1-r)/2)),F.setAttribute("y",String(a+f*(1-r)/2)),F.setAttribute("width",String(i*r)),F.setAttribute("height",String(f*r))}function L(){for(const e of Object.values(x)){const r=e.svg.getBoundingClientRect().width||1;e.u=e.cropW/r,e.el.style.setProperty("--u",e.u.toFixed(3))}s?.resize()}function D(e){O=0;const r=(e-z)/1e3;let n;if(u){const m=t.getBoundingClientRect(),b=m.height-window.innerHeight;n=b>0?J(-m.top/b):0}else n=.7;const a=v(n,.1,.3),i=v(n,.3,.42),f=v(n,.42,.54),F=v(n,.44,.54),I=v(n,.56,.64),U=v(n,.6,.68),K=v(n,.62,.68),V=v(n,.64,.7),B=v(n,.74,.86);if(u){const m=t.style;m.setProperty("--q",(1-v(n,.24,.34)).toFixed(4)),m.setProperty("--enter",I.toFixed(4)),m.setProperty("--ext",U.toFixed(4)),m.setProperty("--recede",B.toFixed(4)),m.setProperty("--statement",v(n,.8,.92).toFixed(4)),c.el.style.setProperty("--line",(i*(1-B)).toFixed(4)),c.el.style.setProperty("--open",F.toFixed(4)),d.el.style.setProperty("--line",(K*(1-B)).toFixed(4));for(const b of[c,d])b.el.querySelectorAll("[data-hlabel]").forEach(($,W)=>{b.el.style.setProperty(`--l${W}`,o($,n).toFixed(4))});A.style.opacity=o(A,n).toFixed(4),d.el.style.setProperty("--open",V.toFixed(4)),C(c,F),C(d,V)}const T=h.getBoundingClientRect(),R=_(c,c.relation[1],T),X=_(d,d.relation[0],T);if(y.setAttribute("x1",R.x.toFixed(1)),y.setAttribute("y1",R.y.toFixed(1)),y.setAttribute("x2",X.x.toFixed(1)),y.setAttribute("y2",X.y.toFixed(1)),A.style.left=`${(R.x+(X.x-R.x)*.35).toFixed(1)}px`,A.style.top=`${(R.y+(X.y-R.y)*.35).toFixed(1)}px`,s){const m=Z=>p.matches?1:1+.07*Math.sin(r*.45+Z*1.7),b=1-.75*B,$=c.field,W=[N(c,$.body,.85*(1-.6*a)*m(0)*b,T),N(c,$.heads,.75*(1-.55*a)*m(1)*b,T),N(c,$.gap,1.05*a*(1-.35*f)*m(2)*b,T)],Q=[k(c,$.relation,.9*f*(1-.3*U)*m(3)*b,T),{ax:R.x,ay:R.y,bx:X.x,by:X.y,r:120,w:.75*U*b},k(d,d.field.contact,.8*V*m(4)*b,T)];s.render(W,Q,p.matches?0:r),t.classList.add("has-field")}G(a*(1-B)),l&&u&&(O=requestAnimationFrame(D))}function G(e){for(const r of Object.values(x)){if(!(E&&w.matches&&e>.5)){r.el.classList.remove("is-lens");continue}const a=r.svg.getScreenCTM();if(!a)continue;const i=new DOMPoint(E.x,E.y).matrixTransform(a.inverse()),f=r.svg.viewBox.baseVal,F=i.x>f.x&&i.x<f.x+f.width&&i.y>f.y&&i.y<f.y+f.height;if(r.el.classList.toggle("is-lens",F),F)for(const I of[r.lensClip,r.lensRing])I.setAttribute("cx",String(i.x)),I.setAttribute("cy",String(i.y)),I.setAttribute("r",String(54*r.u))}}const P=()=>{O||(O=requestAnimationFrame(D))};function H(){u=!0,t.classList.add("is-scroll"),L(),P()}function g(){u=!1,t.classList.remove("is-scroll");for(const e of["--q","--enter","--ext","--recede","--statement"])t.style.removeProperty(e);for(const e of Object.values(x)){for(const r of["--line","--open","--l0","--l1","--l2"])e.el.style.removeProperty(r);C(e,1)}requestAnimationFrame(()=>{L(),D(performance.now())})}s=oe(S),window.addEventListener("scroll",P,{passive:!0}),window.addEventListener("resize",()=>{L(),P()}),t.addEventListener("pointermove",e=>{e.pointerType==="mouse"&&(E={x:e.clientX,y:e.clientY},P())}),t.addEventListener("pointerleave",()=>{E=null,P()}),new IntersectionObserver(([e])=>{l=e.isIntersecting&&!document.hidden,l&&P()}).observe(t),document.addEventListener("visibilitychange",()=>{l=!document.hidden,l&&P()});const q=()=>p.matches?g():H();p.addEventListener("change",q),q()}ne();
