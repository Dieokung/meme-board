import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,query,where,orderBy,limit,onSnapshot,getDocs,startAfter,addDoc,setDoc,updateDoc,deleteDoc,doc,writeBatch,increment,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig,ADMIN_EMAIL,TAGS,SHARE_VIA_API} from "./config.js";
export {GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,collection,query,where,orderBy,limit,onSnapshot,getDocs,startAfter,addDoc,setDoc,updateDoc,deleteDoc,doc,writeBatch,increment,serverTimestamp,ADMIN_EMAIL,TAGS};
export const $=i=>document.getElementById(i),h=(t,p={},...k)=>{const e=document.createElement(t);Object.assign(e,p);e.append(...k);return e};
const app=initializeApp(firebaseConfig);export const auth=getAuth(app),db=getFirestore(app);
export const S={user:null,likes:new Set()};
let tt,cbs=[],cleanups=[],lastLike=null;const openT=new Set();
export const onChange=f=>cbs.push(f);const fire=()=>cbs.forEach(f=>f());
export const toast=m=>{const t=$('toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2400)};
export const need=()=>S.user||(toast('เข้าสู่ระบบด้วย Google ก่อนนะ'),false);
export const clearCards=()=>{cleanups.forEach(f=>f());cleanups=[]};

export function header({search=false,post=false}={}){
  document.body.insertAdjacentHTML('afterbegin',`<header><div class="bar"><a class="logo" href="./">🐸 <span>มีมบอร์ด</span></a><div class="hact">
  ${search?'<button class="ghost ic" id="sBtn" aria-label="ค้นหา"><svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></button>':''}
  ${post?'<button id="pBtn" hidden><svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>โพสต์</button>':''}
  <button class="ghost" id="lBtn"><b class="g">G</b>เข้าสู่ระบบ</button>
  <div class="me" id="me" hidden><img class="av" id="ava" alt="" referrerpolicy="no-referrer"><div class="menu" id="menu"><small id="uname"></small><a id="myProf">โปรไฟล์ของฉัน</a><a id="adminLink" href="admin.html" hidden>หลังบ้าน</a><button class="ghost sm" id="oBtn">ออกจากระบบ</button></div></div>
  </div></div></header><div class="toast" id="toast"></div>`);
  $('lBtn').onclick=()=>signInWithPopup(auth,new GoogleAuthProvider()).catch(()=>toast('เข้าสู่ระบบไม่สำเร็จ'));
  $('oBtn').onclick=()=>{signOut(auth);$('menu').classList.remove('open')};
  $('ava').onclick=e=>{e.stopPropagation();$('menu').classList.toggle('open')};
  document.addEventListener('click',e=>{if(!e.target.closest('.menu'))$('menu').classList.remove('open')});
  let unL=null;
  onAuthStateChanged(auth,u=>{
    S.user=u;S.likes=new Set();unL&&unL();unL=null;
    $('lBtn').hidden=!!u;$('me').hidden=!u;if($('pBtn'))$('pBtn').hidden=!u;
    if(u){$('ava').src=u.photoURL||'';$('uname').textContent=u.displayName||u.email;$('myProf').href='profile.html?uid='+u.uid;$('adminLink').hidden=u.email!==ADMIN_EMAIL;
      setDoc(doc(db,'users',u.uid),{name:u.displayName||'',email:u.email,photo:u.photoURL||'',lastLogin:serverTimestamp()},{merge:true}).catch(()=>{});
      unL=onSnapshot(query(collection(db,'likes'),where('uid','==',u.uid)),s=>{S.likes=new Set(s.docs.map(d=>d.data().memeId));fire()},()=>{});
    }
    fire();
  });
}

// ---- ไลก์ / รายงาน: 1 คน 1 ครั้ง (เอกสารแยก id = memeId_uid) ----
async function toggleLike(m){
  if(!need())return;
  const u=S.user,lr=doc(db,'likes',m.id+'_'+u.uid),b=writeBatch(db);
  if(S.likes.has(m.id)){b.delete(lr);b.update(doc(db,'memes',m.id),{likeCount:increment(-1)})}
  else{b.set(lr,{memeId:m.id,uid:u.uid,t:serverTimestamp()});b.update(doc(db,'memes',m.id),{likeCount:increment(1)})}
  lastLike=m.id;
  try{await b.commit()}catch(e){toast('ทำรายการไม่ได้')}
}
function pick(){return new Promise(res=>{
  const o=h('div',{className:'ov'}),done=v=>{o.classList.remove('open');setTimeout(()=>o.remove(),300);res(v)};
  o.onclick=e=>e.target===o&&done(null);
  o.append(h('section',{className:'card'},h('strong',{textContent:'รายงานเพราะอะไร?'}),
    ...[['spam','สแปม / โฆษณา'],['inappropriate','เนื้อหาไม่เหมาะสม'],['copyright','ละเมิดลิขสิทธิ์']].map(([k,t])=>h('button',{className:'ghost',textContent:t,onclick:()=>done(k)})),
    h('button',{className:'ghost sm',textContent:'ยกเลิก',onclick:()=>done(null)})));
  document.body.append(o);setTimeout(()=>o.classList.add('open'),10);
})}
async function report(m){
  if(!need())return;const reason=await pick();if(!reason)return;
  const u=S.user,b=writeBatch(db);
  b.set(doc(db,'reports',m.id+'_'+u.uid),{memeId:m.id,uid:u.uid,reason,t:serverTimestamp()});
  b.update(doc(db,'memes',m.id),{reportCount:increment(1)});
  try{await b.commit();toast('ส่งรายงานแล้ว ขอบคุณครับ')}catch(e){toast('คุณรายงานมีมนี้ไปแล้ว หรือทำรายการไม่ได้')}
}

// ---- คอมเมนต์ (subcollection) ----
function thread(m,box){
  const list=h('div'),c=collection(db,'memes',m.id,'comments');
  const un=onSnapshot(query(c,orderBy('t','desc'),limit(30)),s=>{list.textContent='';s.docs.forEach(d=>{const x=d.data(),p=h('p',{},h('b',{textContent:(x.name||'?')+': '}),document.createTextNode(x.text||''));
    if(S.user&&(x.uid===S.user.uid||S.user.email===ADMIN_EMAIL))p.append(h('a',{className:'x',textContent:' ×',onclick:()=>deleteDoc(d.ref)}));list.append(p)})},()=>{});
  box.textContent='';box.append(list);
  if(S.user){const inp=h('input',{placeholder:'คอมเมนต์…',maxLength:140}),send=async()=>{const t=inp.value.trim();if(!t)return;inp.value='';
    try{await addDoc(c,{uid:S.user.uid,name:S.user.displayName||'สมาชิก',text:t,t:serverTimestamp()})}catch(e){toast('คอมเมนต์ไม่ได้ (อาจถูกแบน)')}};
    inp.onkeydown=e=>e.key==='Enter'&&send();box.append(h('div',{className:'cf'},inp,h('button',{className:'sm',textContent:'ส่ง',onclick:send})))}
  return un;
}

const ic=d=>`<svg class="icon" viewBox="0 0 24 24"><path d="${d}"/></svg>`;
const ICON={heart:ic("M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"),chat:ic("M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6A8 8 0 1 1 21 12z"),share:ic("M4 12v7h16v-7M12 3v12M8 7l4-4 4 4"),trash:ic("M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"),flag:ic("M5 3v18M5 4h11l-2 4 2 4H5"),dl:ic("M12 3v12M8 11l4 4 4-4M4 19h16"),open:ic("M14 3h7v7M10 14L21 3M21 14v7H3V3h7")};
const shareUrl=id=>SHARE_VIA_API?location.origin+'/m/'+id:new URL('meme.html?id='+id,location.href).href;

export function card(m,i=0,anim=false,single=false){
  const u=S.user,liked=S.likes.has(m.id),ref=doc(db,'memes',m.id),pop=lastLike===m.id&&liked;
  if(pop)setTimeout(()=>{lastLike=null},700);
  const c=h('article',{className:'card meme'+(anim?' enter':'')});c.style.setProperty('--i',Math.min(i,8));
  const av=m.photo?h('img',{className:'av',src:m.photo,referrerPolicy:'no-referrer'}):h('span',{className:'av',textContent:(m.name||'?')[0]});
  const side=(u&&m.uid===u.uid)||u?.email===ADMIN_EMAIL
    ?h('button',{className:'ghost sm ic',title:'ลบ',innerHTML:ICON.trash,onclick:()=>confirm('ลบมีมนี้?')&&deleteDoc(ref).then(()=>{if(single)location.href='./'}).catch(()=>toast('ลบไม่ได้'))})
    :h('button',{className:'ghost sm ic',title:'รายงาน',innerHTML:ICON.flag,onclick:()=>report(m)});
  const t=m.createdAt?.toMillis?.()??Date.now(),n=Math.floor((Date.now()-t)/6e4);
  const ago=n<1?'เมื่อสักครู่':n<60?n+' นาทีที่แล้ว':n<1440?Math.floor(n/60)+' ชม.ที่แล้ว':Math.floor(n/1440)+' วันที่แล้ว';
  c.append(h('div',{className:'mh'},h('a',{className:'who',href:'profile.html?uid='+m.uid},av,h('div',{className:'mi'},h('b',{textContent:m.name||'ไม่ระบุชื่อ'}),h('small',{textContent:ago}))),side),
    h('img',{className:'mimg',src:m.img,alt:m.caption||'meme',loading:'lazy',ondblclick:()=>toggleLike(m)}));
  if(m.caption)c.append(h('div',{className:'mcap',textContent:m.caption}));
  if(m.tags?.length)c.append(h('div',{className:'tags'},...m.tags.map(g=>h('a',{href:'./?tag='+encodeURIComponent(g),textContent:'#'+g}))));
  const box=h('div',{className:'cm'});box.hidden=true;let un=null;
  const openThread=()=>{openT.add(m.id);box.hidden=false;un=thread(m,box);cleanups.push(un)};
  const tog=()=>{if(un){un();un=null;openT.delete(m.id);box.hidden=true}else openThread()};
  const dl=()=>{const a=h('a',{href:m.img,download:'meme-'+m.id+'.jpg'});document.body.append(a);a.click();a.remove()};
  const share=async()=>{const url=shareUrl(m.id);try{navigator.share?await navigator.share({title:m.caption||'มีม',url}):(await navigator.clipboard.writeText(url),toast('คัดลอกลิงก์แล้ว'))}catch(e){}};
  const btn=(cls,icon,txt,fn,title)=>h('button',{className:'ghost sm '+cls,title:title||'',innerHTML:icon+(txt!==undefined?'<span>'+txt+'</span>':''),onclick:fn});
  c.append(h('div',{className:'acts'},btn(liked?'liked'+(pop?' pop':''):'',ICON.heart,m.likeCount||0,()=>toggleLike(m)),btn('ic',ICON.chat,undefined,tog,'คอมเมนต์'),h('span',{className:'sp'}),
    ...(single?[]:[btn('ic',ICON.open,undefined,()=>{location.href='meme.html?id='+m.id},'เปิดโพสต์')]),btn('ic',ICON.dl,undefined,dl,'ดาวน์โหลดรูป'),btn('',ICON.share,'แชร์',share)),box);
  if(single||openT.has(m.id))openThread();
  return c;
}
