(function(){'use strict';
var apps=[['TV','com.webos.app.livetv'],['YouTube','youtube.leanback.v4'],['Netflix','netflix'],['Prime Video','amazon'],['Pluto TV','com.plutotv.app']];
var themes=window.LumeThemes,ix=0,busy=false,timer,lower=false,col=0,tool=0;
var svg=[
'<rect x="5" y="12" width="54" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="4"/><path d="M23 55h18M32 48v7" stroke="currentColor" stroke-width="4"/>',
'<rect x="3" y="12" width="58" height="40" rx="12" fill="#ed343d"/><path d="M27 21l17 11-17 11z" fill="white"/>',
'<rect x="5" y="5" width="54" height="54" rx="10" fill="#181517"/><path d="M20 49V15h8l9 20V15h8v34h-8l-9-20v20z" fill="#f34049"/>',
'<rect x="3" y="7" width="58" height="50" rx="11" fill="#124a76"/><path d="M26 15l16 10-16 10z" fill="white"/><path d="M13 39q15 14 36 0m-7 0 8-2-2 7" fill="none" stroke="#66d7ff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'];
svg.push('<circle cx="32" cy="32" r="26" fill="#261947"/><circle cx="32" cy="32" r="13" fill="#ffcd31"/><ellipse cx="32" cy="32" rx="28" ry="8" transform="rotate(-25 32 32)" fill="none" stroke="#ff7ab6" stroke-width="4"/>');
var settings=document.getElementById('settings'),settingsApp=['Configurações da TV','com.palm.app.settings'];
function read(k){try{return localStorage.getItem('lume.'+k)||''}catch(e){return ''}}
function save(k,v){try{localStorage.setItem('lume.'+k,v)}catch(e){}}
function say(v){document.getElementById('library-message').textContent=v}
var first=read('first');for(var j=1;j<apps.length;j++){if(apps[j][1]===first){apps.splice(1,0,apps.splice(j,1)[0]);svg.splice(1,0,svg.splice(j,1)[0]);break}}
var afterYouTube=apps.map(function(x){return x[1]}).indexOf('youtube.leanback.v4')+1;apps.splice(afterYouTube,0,['Spotify','spotify-beehive']);svg.splice(afterYouTube,0,'');
var t=window.lumeTheme;for(j=0;j<themes.length;j++)if(themes[j][0]===t)ix=j;
var $=function(id){return document.getElementById(id)}, toolIds=['theme','settings','store','more','cameras','gallery'],labels=['Tema','Preferências','Instalar apps','Demais apps','Câmeras','Galeria'], paths=['<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor" stroke="none"/>','<path d="m9 3 1-2h4l1 2 2 1 2-.2 2 3-1.3 2v3l1.3 2-2 3-2-.2-2 1-1 3h-4l-1-3-2-1-2 .2-2-3 1.3-2v-3L3 7l2-3 2 .2z" transform="translate(0 1)"/><circle cx="12" cy="12" r="3"/>','<path d="M4 8h16l1 13H3L4 8zm4 0V6a4 4 0 0 1 8 0v2"/>','<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'];
var catalog=lumeCatalog, extras=[],menu=false,pos=0,buttons=[],socket=null;
try{var cached=JSON.parse(read('library'));if(Array.isArray(cached)&&cached.length)catalog=cached}catch(e){}
function art(id){var names={'youtube.leanback.v4':'youtube','spotify-beehive':'spotify','netflix':'netflix','amazon':'primevideo'};return Object.prototype.hasOwnProperty.call(names,id)?'costa/'+names[id]+'.svg':''}
function img(src){var im=document.createElement('img');im.src=src;im.alt='';return im}
paths.push('<rect x="2" y="6" width="13" height="12" rx="2"/><path d="m15 10 6-3v10l-6-3z"/>','<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.5"/><path d="m4 17 5-5 3 3 3-4 6 6"/>');
toolIds.push('inputs');labels.push('Entradas');paths.push('<path d="M3 6h18v7l-4 5H7l-4-5zm4 3v3m3-3v3m4-3v3m3-3v3"/>');
var order=[1,4,5,6,3,2];toolIds=order.map(function(i){return toolIds[i]});labels=order.map(function(i){return labels[i]});paths=order.map(function(i){return paths[i]});function paint(){document.body.className=themes[ix][0];toolIds.forEach(function(id,i){$(id).innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">'+paths[i]+'</svg>';var tag=document.createElement("span");tag.textContent=labels[i];$(id).appendChild(tag);$(id).setAttribute("aria-label",labels[i])})}
var coast=window.lumeTheme==='costa',clist=coast&&Costa.values.layout==='list',artMode=false,confirmExit=false;var configured=LumePrefs.initial();if(configured)apps=configured;if(coast){try{var kept=sessionStorage.getItem('lume.co.focus');col=Math.max(0,apps.map(function(x){return x[1]}).indexOf(kept))}catch(e){}}var drawn=-1;function focus(){if(!lower&&drawn!==(coast?0:Math.floor(col/6)))drawApps();(lower?$(toolIds[tool]):$('app'+col)).focus()}
function library(open){menu=open;document.body.classList.toggle("library-open",open);$('home').hidden=open;$('library').hidden=!open;say('');if(open){render();pos=0;buttons[pos].focus()}else{lower=true;tool=toolIds.indexOf('more');focus()}}
function render(){extras=catalog.filter(function(x){return x.id!=='com.lume.launcher'&&x.id!=='com.webos.app.discovery'&&x.id!==settingsApp[1]&&!apps.some(function(a){return a[1]===x.id})});buttons=[];$('list').innerHTML='';extras.forEach(function(x,i){var b=document.createElement('button');b.setAttribute('data-app',x.id);if(art(x.id))b.appendChild(img(art(x.id)));b.appendChild(document.createTextNode(x.title));b.onfocus=function(){pos=i};b.onclick=function(){launch([x.title,x.id])};$('list').appendChild(b);buttons.push(b)});buttons.push($('return'),$('refresh'));$('return').onfocus=function(){pos=extras.length};$('refresh').onfocus=function(){pos=extras.length+1}}
function refresh(){if(socket)return;var w;try{w=new WebSocket('ws://127.0.0.1:3000')}catch(e){say('Atualização indisponível. Lista anterior mantida.');return}socket=w;say('Consultando a TV. Se solicitado, aceite a conexão.');var timer=setTimeout(function(){finish('Tempo esgotado. Lista anterior mantida.')},45000);function finish(msg){if(socket!==w)return;clearTimeout(timer);socket=null;w.close();if(menu)say(msg)}
w.onopen=function(){w.send(JSON.stringify({id:'pair',type:'register',payload:{pairingType:'PROMPT','client-key':read('catalogkey'),manifest:{manifestVersion:1,appVersion:'0.4',permissions:['READ_INSTALLED_APPS']}}}))};
w.onmessage=function(e){try{var m=JSON.parse(e.data);if(m.type==='registered'){if(m.payload['client-key'])save('catalogkey',m.payload['client-key']);w.send(JSON.stringify({type:'request',id:'apps',uri:'ssap://com.webos.applicationManager/listLaunchPoints'}))}else if(m.id==='apps'&&m.payload&&Array.isArray(m.payload.launchPoints)){var seen={};var next=m.payload.launchPoints.filter(function(x){if(!x.id||!x.title||seen[x.id])return false;seen[x.id]=true;return true}).map(function(x){return {id:x.id,title:x.title}});if(!next.length){finish('Lista indisponível. Dados anteriores mantidos.');return}catalog=next;save('library',JSON.stringify(next));if(menu){render();$('refresh').focus()}finish('Lista atualizada.')}else if(m.type==='error')finish('Consulta recusada. Lista anterior mantida.')}catch(err){finish('Consulta indisponível. Lista anterior mantida.')}};
w.onerror=w.onclose=function(){finish('Consulta indisponível. Lista anterior mantida.')}}
$('return').onclick=function(){library(false)};$('refresh').onclick=refresh;
function action(i){i=order[i];if(i===0){ix=(ix+1)%themes.length;paint();save('theme',themes[ix][0])}else if(i===1)ThemePrefs.open(window.lumeTheme);else if(i===2)launch(['LG Content Store','com.webos.app.discovery']);else if(i===3)library(true);else if(i===4)location.href="cameras.html";else if(i===6)location.href="inputs.html";else location.href="immich.html"}
toolIds.forEach(function(id,i){$(id).onfocus=function(){tool=i;lower=true};$(id).onclick=function(){action(i)}});
function drawApps(){drawn=coast?0:Math.floor(col/6);document.getElementById('apps').innerHTML='';document.getElementById('pages').textContent=!coast&&apps.length>6?'Página '+(drawn+1)+' de '+Math.ceil(apps.length/6):'';(coast?apps:apps.slice(drawn*6,drawn*6+6)).forEach(function(a,n){var i=n+drawn*6;var b=document.createElement('button');b.id='app'+i;b.setAttribute('data-app',a[1]);b.setAttribute('aria-label',a[0]);if(a[1]==='com.webos.app.livetv'){b.innerHTML='<span class="tile-label">TV</span>'}var mark=coast&&({'youtube.leanback.v4':'youtube','spotify-beehive':'spotify','netflix':'netflix','amazon':'primevideo'})[a[1]];var av=window.lumeTheme==='atelier'&&({'youtube.leanback.v4':'youtube','spotify-beehive':'spotify','netflix':'netflix'})[a[1]];if(av)b.appendChild(img('costa/'+av+'.svg'));else if(mark)b.appendChild(img('costa/'+mark+'.svg'));else if(art(a[1]))b.appendChild(img(window.lumeTheme==='atelier'?art(a[1]).replace('icons/','atelier-icons/'):art(a[1])));else if(a[1]!=='com.webos.app.livetv')b.appendChild(document.createTextNode(a[0]));else b.insertAdjacentHTML('beforeend','<svg aria-hidden="true" viewBox="0 0 64 64">'+svg[0]+'</svg>');var caption=document.createElement('span');caption.className='dock-label';caption.textContent=a[0];b.appendChild(caption);b.onfocus=function(){lower=false;col=i;if(coast){try{sessionStorage.setItem('lume.co.focus',a[1])}catch(e){}}};b.onclick=function(){launch(a)};$('apps').appendChild(b)})}
var features=document.querySelectorAll('#featured button');
Array.prototype.forEach.call(features,function(b,i){b.onclick=function(){if(i===0)launch(['TV','com.webos.app.livetv']);else location.href=i===1?'cameras.html':'immich.html'}});
paint();if(coast){
document.body.classList.add('co-home');Costa.style(document.body);
var dock=document.getElementById('apps'),nav=document.getElementById('tools');var add=document.createElement('button');add.id='scenery';add.setAttribute('aria-label','Paisagem');add.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 17 6-6 4 4 3-5 5 7"/></svg><span>Paisagem</span>';nav.insertBefore(add,nav.firstChild);toolIds.unshift('scenery');order.unshift(7);
add.onfocus=function(){tool=0;lower=true};add.onclick=function(){artMode=true;document.body.classList.add('co-art');document.activeElement.blur()};toolIds.slice(1).forEach(function(id,i){var b=$(id);b.onfocus=function(){tool=i+1;lower=true};b.onclick=function(){action(i+1)};var label=b.lastChild.textContent;b.setAttribute('aria-label',label);b.removeChild(b.lastChild);var sp=document.createElement('span');sp.textContent=label;b.appendChild(sp)});
$('stay').onclick=function(){confirmExit=false;$('escape').hidden=true;lower=false;focus()};$('leave').onclick=function(){launch(['Home da LG','com.webos.app.fullhome'])};
document.addEventListener('keydown',function(e){if(menu)return;var k=e.keyCode,back=k===461||k===27||k===8;if(!back&&k!==13&&(k<37||k>40))return;e.preventDefault();e.stopImmediatePropagation();if((back||k===13)&&e.repeat)return;
if(artMode){if(back||k===13){artMode=false;document.body.classList.remove('co-art');lower=true;focus()}return}
if(confirmExit){if(back)$('stay').click();else if(k===13)document.activeElement.click();else (k===39?$('leave'):$('stay')).focus();return}
if(back){if(lower){lower=false;focus()}else{confirmExit=true;$('escape').hidden=false;$('stay').focus()}return}
if(k===13){document.activeElement.click();return}
if(!lower){if(k===(clist?39:38))lower=true;else if(k===(clist?38:37))col=Math.max(0,col-1);else if(k===(clist?40:39))col=Math.min(apps.length-1,col+1)}
else{if(k===(clist?37:40))lower=false;else if(k===(clist?38:37))tool=Math.max(0,tool-1);else if(k===(clist?40:39))tool=Math.min(toolIds.length-1,tool+1)}focus()},true)
}focus();
if(window.lumeTheme==='atelier')initAtelier({catalog:catalog,menu:function(){return menu},launch:launch,back:function(){if(webOS.platformBack)webOS.platformBack()},shelf:function(step){lower=false;col=Math.max(0,Math.min(apps.length-1,col+step));focus()}});
var networkSubscription;
function networkState(r){if(!r)return;var wifi=r.wifi&&r.wifi.state,wired=r.wired&&r.wired.state,msg='';
if(wifi==='connected'&&r.isInternetConnectionAvailable===false){msg='Wi-Fi conectado, sem acesso à internet.'}
else if(wifi==='disconnected'&&wired!=='connected'&&r.isInternetConnectionAvailable===false){msg='Wi-Fi desconectado.'}
document.getElementById('status').textContent=msg}
function watchNetwork(){if(!window.PalmSystem&&!window.webOSSystem)return;
try{networkSubscription=webOS.service.request('luna://com.palm.connectionmanager',{method:'getStatus',parameters:{subscribe:true},onSuccess:networkState,onFailure:function(){/* Falha na consulta não comprova queda de rede. */}})}catch(e){}}
watchNetwork();
function launch(item){if(item[1]==='local.immich'){location.href='immich.html';return}if(busy)return;var t=performance.now();if(!window.PalmSystem&&!window.webOSSystem){return}
busy=true;var done=false;
function finish(ok,msg){if(done)return;done=true;busy=false;clearTimeout(timer);var m=Math.round(performance.now()-t)+' ms até '+msg;save('metric',item[0]+': '+m);if(!ok && menu)say(msg)}
timer=setTimeout(function(){finish(false,'Sem confirmação do sistema.')},8000);
try{webOS.service.request('luna://com.webos.applicationManager',{method:'launch',parameters:item[2]?{id:"com.webos.app.browser",params:{target:item[2]}}:{id:item[1]},onSuccess:function(){finish(true,'o sistema aceitar a abertura')},onFailure:function(){finish(false,'Não foi possível abrir '+item[0]+'. Verifique se está instalado e se o ID corresponde à TV.')}})}catch(e){finish(false,'Serviço de abertura indisponível.')}
}
document.addEventListener('keydown',function(e){var k=e.keyCode;if(!menu&&document.body.className==='atelier'){var fi=Array.prototype.indexOf.call(features,document.activeElement);if(fi>=0){if(k===13){e.preventDefault();if(!e.repeat)features[fi].click();return}if(k>=37&&k<=40){e.preventDefault();if(k===40){lower=false;focus()}else if(k!==38)features[Math.max(0,Math.min(2,fi+(k===39?1:-1)))].focus();return}}else if(!lower&&k===38){e.preventDefault();features[Math.min(2,Math.floor((col%6)/2))].focus();return}}if(!menu&&(k===461||k===27||k===8)){e.preventDefault();if(!e.repeat&&window.webOS&&webOS.platformBack)webOS.platformBack();return}if(menu){if(k===461||k===27||k===8){e.preventDefault();library(false);return}if(k===13){e.preventDefault();if(!e.repeat)buttons[pos].click();return}if(k>=37&&k<=40){e.preventDefault();var n=extras.length;var step=clist?1:4;if(k===40&&pos<n)pos=pos+step<n?pos+step:n;else if(k===38)pos=pos>=n?Math.max(0,n-1):Math.max(0,pos-step);else if(k===39||k===37)pos=Math.max(0,Math.min(buttons.length-1,pos+(k===37?-1:1)));buttons[pos].focus()}return}if(k>=37&&k<=40){e.preventDefault();if(k===38)lower=false;else if(k===40)lower=true;else if(lower)tool=Math.max(0,Math.min(toolIds.length-1,tool+(k===37?-1:1)));else col=Math.max(0,Math.min(apps.length-1,col+(k===37?-1:1)));focus()}else if(k===13){e.preventDefault();if(!e.repeat){if(lower)action(tool);else launch(apps[col])}}});
})();


























