import {INCLUDED_SONGS} from './songs.js';
import {DEFAULT_PATTERNS} from './patterns.js';
const KEY='memochant-v01';
const demo={id:'demo',title:'Aucune chanson sélectionnée',artist:'',lyrics:'Ajoute une chanson'};
export function load(){try{const raw=JSON.parse(localStorage.getItem(KEY));if(raw&&Array.isArray(raw.songs)&&Array.isArray(raw.patterns)){
  // Ajout non destructif : ne jamais remplacer les paroles déjà enregistrées.
  const ids=new Set(raw.songs.map(s=>s.id));
  for(const s of INCLUDED_SONGS)if(!ids.has(s.id))raw.songs.push({...s});
  if(raw.songId==='demo' || !raw.songs.some(s=>s.id===raw.songId))raw.songId=INCLUDED_SONGS[0].id;
  return raw;
}}catch{}return {songs:[...INCLUDED_SONGS],patterns:structuredClone(DEFAULT_PATTERNS),songId:INCLUDED_SONGS[0].id,patternId:'ponts',speed:22,loop:true,hideOnPause:false,positions:{}};}
export function save(state){localStorage.setItem(KEY,JSON.stringify(state));}
export function uid(){return 'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
