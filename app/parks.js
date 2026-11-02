(function(){'use strict';var names=['tetons.jpg','lake.jpg','canyon.jpg'],timer,serial=0;
function tick(){if(document.body.classList.contains("atelier")){++serial;clearTimeout(timer);document.body.style.backgroundImage="";return}if(window.Costa&&document.body.classList.contains('costa')){Costa.style(document.body);clearTimeout(timer);if(!document.hidden&&Number(Costa.values.rotate)>0)timer=setTimeout(tick,60000-Date.now()%60000+50);return}var mins=5;try{var v=localStorage.getItem('lume.wallMinutes');if(v!==null&&[0,1,5,15].indexOf(Number(v))>=0)mins=Number(v)}catch(e){}
var ms=mins*60000,now=Date.now(),idx=ms?Math.floor(now/ms)%names.length:0,img=new Image(),token=++serial;img.onload=function(){if(document.body.classList.contains('atelier')){document.body.style.backgroundImage='';return}if(token===serial)document.body.style.backgroundImage='linear-gradient(180deg,rgba(10,17,23,.57),rgba(10,17,23,.27) 36%,rgba(10,17,23,.49) 65%,rgba(10,17,23,.72)),url("'+img.src+'")'};img.src=names[idx];clearTimeout(timer);if(ms&&!document.hidden)timer=setTimeout(tick,ms-now%ms+50)}
window.lumeWallpaper=tick;document.addEventListener('visibilitychange',function(){if(!document.hidden)tick();else clearTimeout(timer)});tick()})();





