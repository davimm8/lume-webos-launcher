(function(){'use strict';var themes=window.LumeThemes,defaults=[['TV','com.webos.app.livetv'],['YouTube','youtube.leanback.v4'],['Spotify','spotify-beehive'],['Netflix','netflix'],['Prime Video','amazon'],['Pluto TV','com.plutotv.app']];
function get(k){try{return localStorage.getItem('lume.'+k)}catch(e){return null}}
function put(k,v){localStorage.setItem('lume.'+k,v)}
function catalog(){var map={},list=[];function add(id,title){if(!id||map[id]||id==='com.lume.launcher')return;map[id]=true;list.push([title,id])}defaults.forEach(function(a){add(a[1],a[0])});var cached;try{cached=JSON.parse(get('library'))}catch(e){};(Array.isArray(cached)?cached:lumeCatalog).forEach(function(x){add(x.id,x.title)});return list}
function initial(){var all=catalog(),stored;try{stored=JSON.parse(get('homeApps'))}catch(e){}if(!Array.isArray(stored)||!stored.length)return null;var seen={},out=[];stored.forEach(function(id){var a=all.filter(function(x){return x[1]===id})[0];if(a&&!seen[id]){out.push(a);seen[id]=true}});return out.length?out:null}
window.LumePrefs={themes:themes,get:get,put:put,catalog:catalog,initial:initial,defaults:defaults};
})();

