import {$,h,S,db,TAGS,header,onChange,need,toast,card,clearCards,collection,query,where,orderBy,limit,onSnapshot,getDocs,startAfter,doc,writeBatch,serverTimestamp} from "./app.js";
header({search:true,post:true});
const PAGE=20,WEEK=7*864e5,ms=m=>m.createdAt?.toMillis?.()??Date.now();
let sort='new',tag=new URLSearchParams(location.search).get('tag')||'',q='',live=[],older=[],cursor=null,hasMore=false,paged=false,loaded=false,busy=false,unsub=null,anim=true;
const map=s=>s.docs.map(d=>({id:d.id,...d.data()}));

function subscribe(){
  unsub&&unsub();live=[];older=[];cursor=null;hasMore=false;loaded=false;render();
  const C=collection(db,'memes');let qy;paged=false;
  if(sort==='mine')qy=query(C,where('uid','==',S.user.uid),limit(100));
  else if(tag)qy=query(C,where('tags','array-contains',tag),limit(200));
  else if(sort==='top')qy=query(C,where('createdAt','>=',new Date(Date.now()-WEEK)),orderBy('createdAt','desc'),limit(200));
  else{qy=query(C,orderBy('createdAt','desc'),limit(PAGE));paged=true}
  unsub=onSnapshot(qy,s=>{live=map(s);if(!loaded){loaded=true;if(paged){cursor=s.docs[s.docs.length-1];hasMore=s.size>=PAGE}}render()},()=>toast('โหลดฟีดไม่ได้ ตรวจสอบ config.js และ rules'));
}
async function more(){
  if(!paged||!hasMore||busy||!cursor)return;busy=true;
  try{const s=await getDocs(query(collection(db,'memes'),orderBy('createdAt','desc'),startAfter(cursor),limit(PAGE)));
    older.push(...map(s));if(s.docs.length)cursor=s.docs[s.docs.length-1];hasMore=s.size>=PAGE;render()}catch(e){hasMore=false}
  busy=false;
}
function render(){
  clearCards();const f=$('feed');
  if(!loaded){f.innerHTML='<div class="sk"></div><div class="sk"></div>';$('empty').hidden=true;return}
  const ids=new Set(live.map(m=>m.id)),uid=S.user?.uid;
  let l=[...live,...older.filter(m=>!ids.has(m.id))].filter(m=>!m.hidden&&((m.reportCount||0)<3||m.uid===uid));
  if(sort==='top')l=l.filter(m=>ms(m)>=Date.now()-WEEK).sort((a,b)=>(b.likeCount||0)-(a.likeCount||0));
  else l.sort((a,b)=>ms(b)-ms(a));
  if(q)l=l.filter(m=>(m.caption||'').toLowerCase().includes(q));
  f.textContent='';$('empty').hidden=l.length>0;
  l.forEach((m,i)=>f.append(card(m,i,anim)));anim=false;
  if(hasMore)requestAnimationFrame(()=>$('more').getBoundingClientRect().top<innerHeight+400&&more());
}
new IntersectionObserver(e=>e[0].isIntersecting&&more(),{rootMargin:'400px'}).observe($('more'));

// ---- tabs / tag chips / search ----
const tabs=[...document.querySelectorAll('.t')];
const pill=()=>{const b=tabs.find(x=>x.classList.contains('on')),p=$('pill');p.style.width=b.offsetWidth+'px';p.style.transform=`translateX(${b.offsetLeft}px)`};
const setSort=s=>{sort=s;tabs.forEach(x=>x.classList.toggle('on',x.dataset.s===s));pill()};
const go=()=>{const f=$('feed');f.classList.add('swap');setTimeout(()=>{anim=true;subscribe();f.classList.remove('swap')},170)};
tabs.forEach(b=>b.onclick=()=>{const s=b.dataset.s;if(s===sort||(s==='mine'&&!need()))return;setSort(s);go()});
['',...TAGS].forEach(t=>$('chips').append(h('button',{className:'chip'+(t===tag?' on':''),textContent:t?'#'+t:'ทั้งหมด',onclick:e=>{tag=t;[...$('chips').children].forEach(x=>x.classList.toggle('on',x===e.currentTarget));history.replaceState(null,'',t?'?tag='+encodeURIComponent(t):location.pathname);go()}})));
addEventListener('resize',pill);document.fonts?.ready.then(pill);pill();
$('sBtn').onclick=()=>{$('sb').classList.toggle('open');if($('sb').classList.contains('open'))setTimeout(()=>$('q').focus(),250);else{$('q').value='';q='';render()}};
$('q').oninput=e=>{q=e.target.value.trim().toLowerCase();render()};
onChange(()=>{if(sort==='mine'&&!S.user){setSort('new');subscribe()}else render()});
subscribe();

// ---- โพสต์ (จำกัด 1 โพสต์/นาที บังคับที่ rules) ----
const shrink=f=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>{const s=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);let y=.85,d;do{d=c.toDataURL('image/jpeg',y);y-=.1}while(d.length>850000&&y>.3);d.length>850000?no():ok(d)};im.onerror=no;im.src=URL.createObjectURL(f)});
const sel=new Set(),closeM=()=>$('ov').classList.remove('open');
TAGS.forEach(t=>$('ptags').append(h('button',{className:'chip',textContent:'#'+t,onclick:e=>{const b=e.currentTarget;if(sel.has(t)){sel.delete(t);b.classList.remove('on')}else if(sel.size<3){sel.add(t);b.classList.add('on')}else toast('เลือกได้สูงสุด 3 แท็ก')}})));
$('pBtn').onclick=()=>{$('msg').textContent='';$('ov').classList.add('open')};
$('cancel').onclick=closeM;$('ov').onclick=e=>e.target===$('ov')&&closeM();
$('file').onchange=e=>{const f=e.target.files[0];$('prev').hidden=!f;if(f)$('prev').src=URL.createObjectURL(f)};
$('send').onclick=async()=>{
  const f=$('file').files[0];if(!f)return $('msg').textContent='เลือกรูปก่อนนะ';
  $('send').disabled=true;$('msg').textContent='กำลังย่อรูปและอัปโหลด…';
  try{const img=await shrink(f),u=S.user,b=writeBatch(db);
    b.set(doc(db,'users',u.uid),{lastPost:serverTimestamp()},{merge:true});
    b.set(doc(collection(db,'memes')),{img,caption:$('cap').value.trim(),tags:[...sel],uid:u.uid,name:u.displayName||'สมาชิก',photo:u.photoURL||'',createdAt:serverTimestamp(),likeCount:0,reportCount:0,hidden:false});
    await b.commit();
    closeM();toast('โพสต์แล้ว 🎉');$('file').value='';$('cap').value='';$('prev').hidden=true;sel.clear();[...$('ptags').children].forEach(x=>x.classList.remove('on'));
    if(sort!=='new'){setSort('new');}anim=true;subscribe();
  }catch(e){$('msg').textContent=e&&e.code==='permission-denied'?'โพสต์ได้ทุก 1 นาที (หรือบัญชีถูกแบน) — รอสักครู่แล้วลองใหม่':'ย่อรูปไม่สำเร็จ (ไฟล์ใหญ่เกินไป)'}
  $('send').disabled=false;
};
