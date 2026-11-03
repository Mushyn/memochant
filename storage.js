import {DEFAULT_PATTERNS} from './patterns.js';
const KEY='memochant-v01';
const demo={id:'demo',title:'Aucune chanson sélectionnée',artist:'',lyrics:'Ajoute une chanson'};
export function load(){try{const raw=JSON.parse(localStorage.getItem(KEY));if(raw&&Array.isArray(raw.songs)&&Array.isArray(raw.patterns))return raw;}catch{}return {songs:[demo],patterns:structuredClone(DEFAULT_PATTERNS),songId:'demo',patternId:'ponts',speed:22,loop:true,hideOnPause:false,positions:{}};}
export function save(state){localStorage.setItem(KEY,JSON.stringify(state));}
export function uid(){return 'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
