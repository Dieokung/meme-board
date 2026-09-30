import {$,h,S,db,header,onChange,card,clearCards,collection,query,where,limit,onSnapshot} from "./app.js";
header({});
const uid=new URLSearchParams(location.search).get('uid')||'x',ms=m=>m.createdAt?.toMillis?.()??Date.now();let list=[],anim=true;
function draw(){
  clearCards();const box=$('one');box.textContent='';
  const l=list.filter(m=>!m.hidden&&((m.reportCount||0)<3||S.user?.uid===uid)).sort((a,b)=>ms(b)-ms(a));
  if(!l.length){box.append(h('p',{className:'empty',textContent:'ยังไม่มีโพสต์'}));return}
  const f=l[0],likes=l.reduce((a,m)=>a+(m.likeCount||0),0);
  box.append(h('div',{className:'prof'},f.photo?h('img',{className:'av',src:f.photo,referrerPolicy:'no-referrer'}):h('span',{className:'av',textContent:(f.name||'?')[0]}),
    h('div',{},h('b',{textContent:f.name||'ไม่ระบุชื่อ'}),h('br'),h('small',{textContent:l.length+' โพสต์ · ได้รับไลก์ '+likes}))));
  l.forEach((m,i)=>box.append(card(m,i,anim)));anim=false;
}
onSnapshot(query(collection(db,'memes'),where('uid','==',uid),limit(100)),s=>{list=s.docs.map(d=>({id:d.id,...d.data()}));draw()},()=>{list=[];draw()});
onChange(draw);
