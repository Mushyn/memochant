import {initUpdates} from './updates.js';
import {load,save,uid} from './storage.js';import {parseSequence,buildSteps} from './patterns.js';
const $=id=>document.getElementById(id);let state=load(),model,step=0,playing=false,pausedByTouch=false,offset=0,lastFrame=0,demo=false;let toastTimer;let stepStartedAt=0;let lastRenderedStep=-1;
function notify(msg){$('toast').textContent=msg;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2200)}
function song(){return state.songs.find(s=>s.id===state.songId)||state.songs[0]}function pattern(){return state.patterns.find(p=>p.id===state.patternId)||state.patterns[0]}
function savePosition(){state.positions[state.songId+'|'+state.patternId]=step;save(state)}
// Étoiles manuelles par chanson : ne pas confondre répétitions et maîtrise vérifiée.
function starsFor(id){return Math.max(0,Math.min(5,Number(state.mastery?.[id]||0)))}
function renderStars(){
 const s=song(), panel=$('starsPanel'), area=$('starButtons');panel.hidden=s.id==='demo';area.replaceChildren();
 if(s.id==='demo')return;
 const level=starsFor(s.id);$('starLabel').textContent=level+'/5';
 for(let n=1;n<=5;n++){
  const b=document.createElement('button');b.type='button';b.className='mastery-star'+(n<=level?' earned':'');
  b.textContent=n<=level?'★':'☆';b.setAttribute('aria-label',`Définir la maîtrise à ${n} étoile${n>1?'s':''}`);
  b.setAttribute('aria-pressed',String(n===level));b.title=`${n} étoile${n>1?'s':''}`;
  b.onclick=()=>{const before=starsFor(s.id);state.mastery??={};state.mastery[s.id]=n===before?0:n;save(state);renderStars();notify(`Maîtrise : ${state.mastery[s.id]}/5 étoiles`)};
  area.append(b);
 }
}
function splitLines(units){return units.map(u=>u.replace(/\n/g,' '))}
function render(){const s=song(),p=pattern();$('addSongQuick').hidden=s.id!=='demo';$('welcome').hidden=s.id!=='demo';$('stageContent').hidden=s.id==='demo';$('footer').hidden=s.id==='demo';model=buildSteps(s.lyrics.split(/\r?\n/).map(s=>s.trim()).filter(Boolean),p,state.loop);step=Math.min(state.positions[s.id+'|'+p.id]||0,Math.max(0,model.steps.length-1));$('songTitle').textContent=s.title;$('songArtist').textContent=s.artist||'';renderStars();renderStep(true);}
function renderStep(resetScroll=false){const st=model.steps[step],container=$('lyrics');if(!st)return;stepStartedAt=0;lastRenderedStep=step;container.replaceChildren();const text=splitLines(model.units);text.forEach((line,i)=>{const p=document.createElement('p');p.className='lyric-line'+(st.ids.includes(i)?' active':'');p.dataset.index=i;p.textContent=line;container.append(p)});$('stepLabel').textContent=st.token+' · '+(step+1)+'/'+model.steps.length;$('progressFill').style.width=((step+1)/model.steps.length*100)+'%';$('prevBtn').disabled=step===0;$('nextBtn').disabled=step===model.steps.length-1;const mini=$('minimap');mini.replaceChildren();text.forEach((_,i)=>{const bar=document.createElement('div');bar.className='mini'+(st.ids.includes(i)?' current':i<Math.min(...st.ids)?' done':'');mini.append(bar)});if(resetScroll){offset=0;const first=container.querySelector(`[data-index="${st.ids[0]}"]`);if(first){container.scrollTop=Math.max(0,first.offsetTop-container.offsetTop-container.clientHeight*.32)}}if(demo)renderDemo();}
function renderDemo(){const st=model.steps[step];if(!st)return;const nodes=[...$('lyrics').querySelectorAll('.lyric-line')].filter(n=>st.ids.includes(Number(n.dataset.index)));const statuses=['missing','good','good','bad'];let j=0;for(const n of nodes){const words=n.textContent.split(/\s+/);n.replaceChildren();let groups=[];for(const w of words){const status=statuses[j++%statuses.length];if(groups.at(-1)?.status===status)groups.at(-1).words.push(w);else groups.push({status,words:[w]})}groups.forEach((g,k)=>{if(k)n.append(document.createTextNode(' '));const span=document.createElement('span');span.className='pill '+g.status;span.textContent=g.words.join(' ');n.append(span)})}}
function advance(delta){step=Math.max(0,Math.min(model.steps.length-1,step+delta));demo=false;savePosition();renderStep(true)}
function setPlay(v){if(song().id==='demo'){openLibraryForImport();return}playing=v;$('toggleBtn').textContent=v?'Pause':'Démarrer';$('status').textContent=v?'V0.1.6 · Lecture':'V0.1.6 · Prêt';$('phaseLabel').textContent=v?'Lecture':'Pause';lastFrame=0}
// Avancement cadencé par le texte actif, indépendant de scrollHeight (qui peut être nul sur mobile).
function frame(t){
  if(playing&&!pausedByTouch){
    if(!lastFrame)lastFrame=t;
    const dt=Math.min((t-lastFrame)/1000,.08);
    const el=$('lyrics');
    const active=[...el.querySelectorAll('.lyric-line.active')];
    const words=active.reduce((n,node)=>n+node.textContent.trim().split(/\s+/).filter(Boolean).length,0);
    const duration=Math.max(5,words*0.62+2.5)*1000;
    stepStartedAt+=dt*1000;
    const progress=Math.min(1,stepStartedAt/duration);
    const first=active[0],last=active.at(-1);
    if(first&&last){
      const top=Math.max(0,first.offsetTop-el.offsetTop-el.clientHeight*.32);
      const bottom=Math.max(top,last.offsetTop-el.offsetTop+last.offsetHeight-el.clientHeight*.60);
      el.scrollTop=top+(bottom-top)*progress;
    }
    if(progress>=1){if(step<model.steps.length-1)advance(1);else setPlay(false)}
  }
  lastFrame=t;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
$('toggleBtn').onclick=()=>setPlay(!playing);$('prevBtn').onclick=()=>advance(-1);$('nextBtn').onclick=()=>advance(1);
const lyricEl=$('lyrics');lyricEl.addEventListener('pointerdown',()=>{pausedByTouch=true;$('phaseLabel').textContent='Maintenu'});for(const ev of ['pointerup','pointercancel','pointerleave'])lyricEl.addEventListener(ev,()=>{pausedByTouch=false;$('phaseLabel').textContent=playing?'Lecture':'Pause'});
function open(id){$(id).showModal()}function openLibraryForImport(){resetSongForm();renderLibrary();open('libraryDialog');$('songForm').scrollIntoView({block:'nearest'})}document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());$('libraryBtn').onclick=()=>{renderLibrary();open('libraryDialog')};$('addSongQuick').onclick=openLibraryForImport;$('welcomeAdd').onclick=openLibraryForImport;$('settingsBtn').onclick=()=>{renderSettings();open('settingsDialog')};
function resetSongForm(){const f=$('songForm');f.reset();f.elements.id.value='';$('songFormTitle').textContent='Ajouter une chanson'}
function editSong(s){const f=$('songForm');f.elements.id.value=s.id;f.elements.title.value=s.title;f.elements.artist.value=s.artist||'';f.elements.lyrics.value=s.lyrics;$('songFormTitle').textContent='Modifier les paroles';f.scrollIntoView({block:'nearest'})}
function renderLibrary(){const list=$('songList');list.replaceChildren();for(const s of state.songs.filter(x=>x.id!=='demo')){const row=document.createElement('div');row.className='item';const btn=document.createElement('button');btn.textContent=s.title;const small=document.createElement('small');small.textContent=s.artist||'Sans interprète';btn.append(small);if(starsFor(s.id)){const rating=document.createElement('small');rating.className='library-stars';rating.textContent='★'.repeat(starsFor(s.id))+'☆'.repeat(5-starsFor(s.id));btn.append(rating)}btn.onclick=()=>{state.songId=s.id;save(state);setPlay(false);render();$('libraryDialog').close()};row.append(btn);if(s.id!=='demo'){const edit=document.createElement('button');edit.className='edit-song';edit.textContent='Modifier';edit.onclick=()=>editSong(s);row.append(edit);const del=document.createElement('button');del.textContent='×';del.setAttribute('aria-label','Supprimer '+s.title);del.onclick=()=>{if(!confirm('Supprimer cette chanson ?'))return;state.songs=state.songs.filter(x=>x.id!==s.id);if(state.mastery)delete state.mastery[s.id];if(state.songId===s.id)state.songId=state.songs.find(x=>x.id!=='demo')?.id||'demo';save(state);renderLibrary();render()};row.append(del)}list.append(row)}}
$('songForm').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target);const lyrics=String(data.get('lyrics')).trim();if(!lyrics)return;const id=String(data.get('id')||'')||uid();const s={id,title:String(data.get('title')).trim(),artist:String(data.get('artist')).trim(),lyrics};const existing=state.songs.findIndex(x=>x.id===id);if(existing>=0)state.songs[existing]=s;else state.songs.push(s);state.songId=s.id;save(state);e.target.reset();$('libraryDialog').close();setPlay(false);render();notify('Chanson enregistrée sur cet appareil')};
function renderSettings(){$('patternSelect').replaceChildren();for(const p of state.patterns){const o=document.createElement('option');o.value=p.id;o.textContent=p.name;$('patternSelect').append(o)}$('patternSelect').value=state.patternId;$('speed').value=state.speed;$('speedValue').textContent=state.speed;$('loop').checked=state.loop;$('hideOnPause').checked=state.hideOnPause}
$('patternSelect').onchange=e=>{state.patternId=e.target.value;save(state);setPlay(false);render()};$('speed').oninput=e=>{$('speedValue').textContent=e.target.value;state.speed=Number(e.target.value);save(state)};$('loop').onchange=e=>{state.loop=e.target.checked;save(state);render()};$('hideOnPause').onchange=e=>{state.hideOnPause=e.target.checked;save(state)};
function patternEditor(p){const form=$('patternForm');form.elements.id.value=p?.id||'';form.elements.name.value=p?.name||'';form.elements.unit.value=String(p?.unit||1);form.elements.sequence.value=p?.sequence.join(', ')||'A, A, B, A+, B, B, A+, B, AB, AB, AB';$('patternError').textContent='';open('patternDialog')}
$('newPattern').onclick=()=>patternEditor();$('editPattern').onclick=()=>patternEditor(pattern());$('deletePattern').onclick=()=>{if(state.patterns.length<=1){notify('Conserve au moins un pattern');return}if(!confirm('Supprimer ce pattern ?'))return;state.patterns=state.patterns.filter(p=>p.id!==state.patternId);state.patternId=state.patterns[0].id;save(state);renderSettings();render()};
$('patternForm').onsubmit=e=>{e.preventDefault();try{const f=e.target.elements;const seq=parseSequence(f.sequence.value);const p={id:f.id.value||uid(),name:f.name.value.trim(),unit:Number(f.unit.value),sequence:seq};const index=state.patterns.findIndex(x=>x.id===p.id);if(index<0)state.patterns.push(p);else state.patterns[index]=p;state.patternId=p.id;save(state);$('patternDialog').close();renderSettings();render();notify('Pattern enregistré')}catch(err){$('patternError').textContent=err.message}};
$('demoBtn').onclick=()=>{demo=true;renderStep(false);$('settingsDialog').close();notify('Aperçu des badges (simulation)')};$('clearDemo').onclick=()=>{demo=false;renderStep(false);$('settingsDialog').close()};
render();
initUpdates();
