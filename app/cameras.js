(function(){'use strict';
var config=LumeNetwork.load();
if(!config.agent||!config.cameras.length){location.replace('servers.html?camera');return}
var origin=config.agent,cams=config.cameras,views=[],solo=-1,current=0,gen=0,theme=window.lumeTheme,blank='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
try{theme=localStorage.getItem('lume.theme')||theme}catch(e){}
function stamp(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2)}
function url(i,video){return origin+(video?'/video.mjpg?oid=':'/grab.jpg?oid=')+cams[i][0]+(video?'&size=1920x1080&fps=5':'&size=1920x1080')+'&t='+Date.now()}
function cancel(v){clearTimeout(v.timer);clearTimeout(v.watch);if(v.pending){v.pending.onload=v.pending.onerror=null;v.pending.src=blank;v.pending=null}v.im.onload=v.im.onerror=null;v.im.src=blank}
function still(i,g){if(g!==gen||document.hidden)return;var v=views[i],pic=new Image();v.pending=pic;
 function done(ok){if(g!==gen||v.pending!==pic)return;clearTimeout(v.watch);pic.onload=pic.onerror=null;v.pending=null;if(ok){v.im.parentNode.replaceChild(pic,v.im);v.im=pic;pic.alt=cams[i][1];v.count++;v.status.textContent='Recebida às '+stamp()}else{pic.src=blank;v.status.textContent='Sem atualização · tentando novamente'}v.timer=setTimeout(function(){still(i,g)},ok?420:2500)}
 pic.onload=function(){done(pic.naturalWidth>1)};pic.onerror=function(){done(false)};v.watch=setTimeout(function(){done(false)},5000);pic.src=url(i,false)}
function video(i,g){var v=views[i];function fallback(){if(g!==gen)return;clearTimeout(v.watch);v.im.onerror=v.im.onload=null;v.im.src=blank;v.status.textContent='Buscando imagens…';still(i,g)}
 v.im.onerror=fallback;v.im.onload=function(){if(g===gen&&v.im.naturalWidth>1)v.status.textContent='Vídeo direto'};v.watch=setTimeout(function(){if(v.im.naturalWidth<=1)fallback();else v.status.textContent='Vídeo direto'},4500);v.im.src=url(i,true)}
function render(){gen++;document.body.className=theme+(solo>=0?' solo':'');views.forEach(function(v,i){cancel(v);v.b.hidden=solo>=0&&i!==solo;v.status.textContent='Conectando…';if(v.b.hidden||document.hidden)return;if(solo>=0)video(i,gen);else still(i,gen)});views[current].b.focus()}
function back(){if(solo>=0){solo=-1;render()}else location.href='index.html'}
cams.forEach(function(c,i){var b=document.createElement('button');b.innerHTML='<img alt=""><span class="strip"><b></b><small></small></span>';b.querySelector('b').textContent=c[1];b.setAttribute('aria-label',c[1]);views.push({b:b,im:b.firstChild,status:b.querySelector('small'),count:0});b.onfocus=function(){current=i};b.onclick=function(){current=i;solo=solo===i?-1:i;render()};document.getElementById('wall').appendChild(b)});
var exit=document.getElementById('exit');exit.onclick=back;
document.addEventListener('keydown',function(e){var k=e.keyCode;if(k===461||k===27||k===8){e.preventDefault();if(!e.repeat)back()}else if(k>=37&&k<=40){e.preventDefault();if(k===40)exit.focus();else if(k===38)views[current].b.focus();else{current=Math.max(0,Math.min(views.length-1,current+(k===37?-1:1)));if(solo>=0){solo=current;render()}else views[current].b.focus()}}});
function stop(){gen++;views.forEach(cancel)}document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else render()});window.addEventListener('pagehide',stop);
render();
})();


