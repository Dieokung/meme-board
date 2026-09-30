import {$,h,S,db,ADMIN_EMAIL,header,onChange,card,clearCards,doc,onSnapshot} from "./app.js";
header({});
const id=new URLSearchParams(location.search).get('id')||'x';let m=null;
function draw(){
  clearCards();const box=$('one');box.textContent='';
  const ok=m&&(!m.hidden||S.user?.uid===m.uid||S.user?.email===ADMIN_EMAIL);
  box.append(ok?card(m,0,true,true):h('p',{className:'empty',textContent:'ไม่พบมีมนี้ (อาจถูกลบหรือซ่อนอยู่)'}));
}
onSnapshot(doc(db,'memes',id),s=>{m=s.exists()?{id:s.id,...s.data()}:null;if(m)document.title=(m.caption||'มีม')+' · มีมบอร์ด';draw()},()=>{m=null;draw()});
onChange(draw);
