import {$,h,toast,auth,db,ADMIN_EMAIL,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,collection,query,where,orderBy,limit,onSnapshot,getDocs,setDoc,updateDoc,deleteDoc,doc,writeBatch,serverTimestamp} from "./app.js";
const LBL={spam:'สแปม',inappropriate:'ไม่เหมาะสม',copyright:'ละเมิดลิขสิทธิ์'};
let memes=[],users=[],banned=new Set(),view='memes',flt='all',started=false;
const fail=()=>toast('ทำรายการไม่ได้');
$('lBtn').onclick=()=>signInWithPopup(auth,new GoogleAuthProvider()).catch(()=>toast('เข้าสู่ระบบไม่สำเร็จ'));
$('oBtn').onclick=()=>signOut(auth);
onAuthStateChanged(auth,u=>{
  $('oBtn').hidden=!u;$('lBtn').hidden=!!u;
  if(!u){$('app').hidden=true;$('gate').hidden=false;$('gmsg').textContent='เข้าสู่ระบบด้วยบัญชีแอดมินเพื่อใช้งานหลังบ้าน';return}
  if(u.email!==ADMIN_EMAIL){$('app').hidden=true;$('gate').hidden=false;$('gmsg').textContent='บัญชีนี้ ('+u.email+') ไม่ใช่แอดมิน';return}
  $('gate').hidden=true;$('app').hidden=false;start();
});
function start(){
  if(started)return;started=true;
  onSnapshot(query(collection(db,'memes'),orderBy('createdAt','desc'),limit(200)),s=>{memes=s.docs.map(d=>({id:d.id,...d.data()}));render()},fail);
  onSnapshot(collection(db,'users'),s=>{users=s.docs.map(d=>({id:d.id,...d.data()}));render()},fail);
  onSnapshot(collection(db,'banned'),s=>{banned=new Set(s.docs.map(d=>d.id));render()},fail);
}
document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{view=b.dataset.v;document.querySelectorAll('[data-v]').forEach(x=>x.classList.toggle('on',x===b));$('flt').hidden=view!=='memes';render()});
document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{flt=b.dataset.f;document.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('on',x===b));render()});
const when=t=>t?.toDate?t.toDate().toLocaleString('th-TH'):'-';
const reps=id=>getDocs(query(collection(db,'reports'),where('memeId','==',id)));
function render(){
  const st=[['มีมทั้งหมด',memes.length],['ผู้ใช้',users.length],['ถูกรายงาน',memes.filter(m=>m.reportCount>0).length],['ซ่อนอยู่',memes.filter(m=>m.hidden).length],['ไลก์รวม',memes.reduce((a,m)=>a+(m.likeCount||0),0)]];
  $('stats').textContent='';st.forEach(([k,v],i)=>{const c=h('div',{className:'card stat'},h('b',{textContent:v}),h('small',{textContent:k}));c.style.animationDelay=i*60+'ms';$('stats').append(c)});
  const L=$('list');L.textContent='';
  if(view==='memes'){
    memes.filter(m=>flt==='all'||(flt==='rep'&&m.reportCount>0)||(flt==='hid'&&m.hidden)).forEach(m=>{
      const ref=doc(db,'memes',m.id);
      L.append(h('div',{className:'card row'},h('img',{className:'th',src:m.img}),
        h('div',{className:'m'},h('b',{textContent:m.caption||'(ไม่มีแคปชั่น)'}),h('small',{textContent:(m.name||'?')+' · '+when(m.createdAt)}),
          h('small',{textContent:'ไลก์ '+(m.likeCount||0)+' · รายงาน '+(m.reportCount||0)+((m.tags||[]).length?' · '+m.tags.map(t=>'#'+t).join(' '):'')})),
        h('div',{className:'b'},
          h('button',{className:'sm ghost',textContent:m.hidden?'แสดง':'ซ่อน',onclick:()=>updateDoc(ref,{hidden:!m.hidden}).catch(fail)}),
          m.reportCount>0?h('button',{className:'sm ghost',textContent:'เหตุผล',onclick:async()=>{const s=await reps(m.id),c={};s.docs.forEach(d=>{const r=d.data().reason;c[r]=(c[r]||0)+1});alert(Object.entries(c).map(([k,v])=>(LBL[k]||k)+' × '+v).join('\n')||'ไม่มีข้อมูล')}}):'',
          m.reportCount>0?h('button',{className:'sm ghost',textContent:'ล้างรายงาน',onclick:async()=>{try{const s=await reps(m.id),b=writeBatch(db);s.docs.forEach(d=>b.delete(d.ref));b.update(ref,{reportCount:0});await b.commit()}catch(e){fail()}}}):'',
          h('button',{className:'sm',textContent:'ลบ',onclick:()=>confirm('ลบมีมนี้ถาวร?')&&deleteDoc(ref).catch(fail)}))));
    });
  }else{
    users.forEach(u=>{const n=memes.filter(m=>m.uid===u.id).length,bn=banned.has(u.id);
      L.append(h('div',{className:'card row'},u.photo?h('img',{className:'av',src:u.photo,referrerPolicy:'no-referrer'}):h('span',{className:'av',textContent:(u.name||'?')[0]}),
        h('div',{className:'m'},h('b',{textContent:u.name||u.email}),h('small',{textContent:u.email+' · โพสต์ '+n+' · เข้าล่าสุด '+when(u.lastLogin)})),
        bn?h('span',{className:'tag',textContent:'ถูกแบน'}):'',
        h('button',{className:'sm '+(bn?'ghost':''),textContent:bn?'ปลดแบน':'แบน',onclick:()=>(bn?deleteDoc(doc(db,'banned',u.id)):setDoc(doc(db,'banned',u.id),{email:u.email,at:serverTimestamp()})).catch(fail)})));
    });
  }
  if(!L.children.length)L.append(h('p',{className:'empty',textContent:'ไม่มีข้อมูล'}));
}
