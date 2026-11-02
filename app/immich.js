(function(){'use strict';var $=function(s){return document.getElementById(s)},area=$('area'),key='',stage='',epoch=0,album,page,ids=[],pos,next,load;
var origin=LumeNetwork.load().immich;
if(!origin){location.replace('servers.html?gallery');return}
try{key=localStorage.getItem('lume.immich.key')||'';document.body.className=window.lumeTheme}catch(e){}
function print(s){$('msg').textContent=s}function clear(s,t){document.body.classList.remove('theater');stage=s;++epoch;area.innerHTML='';$('title').textContent=t;print('')}
function btn(t,fn){var b=document.createElement('button');b.textContent=t;b.onclick=fn;area.appendChild(b);return b}
function call(op,p,ok,bad){var n=epoch;p.origin=origin;p.op=op;if(op!=='version')p.key=key;webOS.service.request('luna://com.lume.launcher.immich',{method:'read',parameters:p,onSuccess:function(r){if(op==='version'||n===epoch)ok(r.data)},onFailure:function(r){if(op==='version'||n===epoch)(bad||fail)(r)}})}
function fail(r){if(Number(r.errorCode)===401){key='';reset();try{localStorage.removeItem('lume.immich.key')}catch(e){}login();print('Chave recusada. Confira a chave do Immich.')}else print(r.errorText||'Consulta indisponível.')}
function login(){clear('login','Conectar ao Immich');var inp=document.createElement('input');inp.type='password';inp.placeholder='Chave de API do Immich';inp.autocomplete='off';area.appendChild(inp);var label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';label.appendChild(check);label.appendChild(document.createTextNode(' Lembrar nesta TV'));area.appendChild(label);btn('Conectar',function(){key=inp.value.trim();if(!key)return print('Digite uma chave de leitura.');album=null;photos(1,check.checked)});print('Permissões da chave: album.read, asset.read e asset.view.');inp.focus()}
function albums(remember){clear('albums','Seus álbuns');print('Buscando álbuns…');call('albums',{},function(a){try{if(remember)localStorage.setItem('lume.immich.key',key)}catch(e){}print(a.length?'Escolha um álbum.':'Nenhum álbum disponível.');a.sort(function(x,y){return x.title.localeCompare(y.title)});a.forEach(function(x){btn(x.title,function(){choose(x,'',0)})});(area.firstChild||$('back')).focus()})}
var tiles=[],last=0,cache={},cached=[],bytes=0,pages={},generation=0,city="",year=0,records=[],queue=[],active=0,inflight={};
var missing="Local não informado",starts={1:{raw:1,offset:0}};var total=null,countState='idle';function reset(){total=null;countState='idle';starts={1:{raw:1,offset:0}};generation++;cache={};cached=[];bytes=0;pages={};queue=[]}
function api(op,p,yes,no){p.origin=origin;p.op=op;p.key=key;webOS.service.request('luna://com.lume.launcher.immich',{method:'read',parameters:p,onSuccess:function(r){yes(r.data)},onFailure:no})}
function unknownPage(pg,g,ok,no){
 var start=starts[pg];if(!start)return no({errorText:'Página indisponível.'});var out=[];
 function scan(raw,offset){if(g!==generation)return;api('photos',{page:raw,unknown:true},function(x){if(g!==generation)return;var i=offset;
 function step(){if(g!==generation)return;if(i>=x.items.length){if(x.next)return scan(Number(x.next),0);return ok({items:out,next:null})}
 var at=i++,v=x.items[at];if(v.place)return step();api('detail',{id:v.id},function(place){if(g!==generation)return;if(!place){if(out.length===12){starts[pg+1]={raw:raw,offset:at};return ok({items:out,next:pg+1})}v.checked=true;out.push(v)}step()},no)}step()},no)}scan(start.raw,start.offset)
}
function pageData(pg,yes,no){var g=generation,v=pages[pg];if(v){if(v.value)yes(v.value);else v.wait.push([yes,no]);return}
 var r=pages[pg]={wait:[[yes,no]]};function done(x){if(g!==generation)return;r.value=x;r.wait.splice(0).forEach(function(f){f[0](x)})}function error(e){if(g!==generation)return;delete pages[pg];r.wait.splice(0).forEach(function(f){f[1](e)})}
 if(city===missing)unknownPage(pg,g,done,error);else api('photos',{id:album?album.id:null,page:pg,year:year,city:city},done,error)}
function caption(x){var m=/^(\d{4})-(\d\d)-(\d\d)/.exec(x.date);return (m?m[3]+'/'+m[2]+'/'+m[1]:'Data indisponível')+' · '+(x.place||(x.detailError?'Local indisponível':x.checked?'Local não informado':'Consultando local…'))}
function keep(id,src){if(cache[id])return;cache[id]=src;cached.push(id);bytes+=src.length;while(cached.length>36||bytes>8*1024*1024){var k=cached.shift();bytes-=cache[k].length;delete cache[k]}}
function schedule(list){queue=list.slice();pump()}
function pump(){while(active<2&&queue.length){var id=queue.shift();if(cache[id]||inflight[id])continue;fetchThumb(id)}}
function fetchThumb(id){var g=generation;active++;inflight[id]=true;api('image',{id:id},function(src){finish(src)},function(e){finish(null,e)});
 function finish(src,e){active--;delete inflight[id];if(g===generation){if(src)keep(id,src);if(stage==='grid'){var i=ids.indexOf(id);if(i>=0&&tiles[i]){if(src)tiles[i].firstChild.src=src;else tiles[i].firstChild.alt='Prévia indisponível'}}if(e&&Number(e.errorCode)===401){fail(e);return}}pump()}}
function photos(pg,remember,anchor){clear('loading',album?album.title:'Todas as fotos');var stamp=epoch;queue=[];print('Buscando fotos…');pageData(pg,function(x){if(stamp!==epoch)return;if(remember)try{localStorage.setItem('lume.immich.key',key)}catch(e){}page=pg;records=x.items;ids=records.map(function(r){return r.id});next=x.next;Object.keys(pages).forEach(function(k){if(Math.abs(Number(k)-page)>1&&pages[k].value)delete pages[k]});grid(0,anchor)},function(e){if(stamp===epoch)fail(e)})}
function choose(a,c,y){album=a;city=c;year=y;reset();photos(1)}
function fold(s){s=String(s).toLowerCase();return s.normalize?s.normalize('NFD').replace(/[\u0300-\u036f]/g,''):s}
function picker(kind){var isCity=kind==='cities';clear(kind,isCity?'Local':'Ano');var inp;
 if(isCity){inp=document.createElement('input');inp.type='text';inp.placeholder='Buscar cidade';inp.setAttribute('aria-label','Buscar cidade');area.appendChild(inp);inp.focus()}
 print('Carregando…');call(kind,{},function(list){if(isCity)list=[missing].concat(list.filter(function(x){return x!==missing}).sort(function(a,b){return a.localeCompare(b,'pt-BR')}));var box=document.createElement('div');area.appendChild(box);function render(){box.innerHTML='';var query=isCity?fold(inp.value||''):'';var n=0;list.forEach(function(v){if(query&&fold(v).indexOf(query)<0)return;n++;var b=document.createElement('button');b.textContent=v;b.onclick=function(){choose(null,isCity?v:'',isCity?0:Number(v))};box.appendChild(b)});print(n?(isCity?n+' opções':'Escolha o ano'):(query?'Nenhuma cidade corresponde à busca.':isCity?'Nenhuma cidade indexada no Immich.':'Nenhum ano encontrado.'))}if(inp)inp.oninput=render;render();if(!isCity)(box.firstChild||$('back')).focus()})}
function loadPlaces(){var stamp=epoch,i=0;function step(){if(epoch!==stamp)return;while(i<records.length&&(records[i].place||records[i].checked))i++;if(i>=records.length)return;var j=i++,item=records[j];call('detail',{id:item.id},function(v){item.checked=true;item.detailError=false;item.place=v;tiles[j].lastChild.textContent=caption(item);tiles[j].setAttribute('aria-label',caption(item));step()},function(r){if(Number(r.errorCode)===401)return fail(r);item.detailError=true;tiles[j].lastChild.textContent=caption(item);step()})}step();step()}
function pageLabel(){if(stage!=='grid')return;var end=document.getElementById('pgEnd');if(end)end.disabled=total===null||!next||page>=Math.ceil(total/12);var format=function(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')};if(total===0){print('0 fotos · Nenhuma página');return}if(total!==null){print(format(total)+(total===1?' foto':' fotos')+' · Página '+format(page)+' de '+format(Math.ceil(total/12))+' · OK para ampliar');return}print((countState==='error'?'Total indisponível':'Contando fotos…')+' · Página '+format(page))}
function countPages(){var g=generation;
 function done(n){if(g!==generation)return;total=n;countState='done';pageLabel()}
 function failed(){if(g!==generation||total!==null)return;countState='error';pageLabel()}
 if(!next){done((page-1)*12+ids.length);return}
 if(total!==null||countState==='busy'){pageLabel();return}countState='busy';pageLabel();
 if(city===missing){function walk(pg){if(g!==generation||total!==null)return;pageData(pg,function(x){if(g!==generation||total!==null)return;if(!x.next){done((pg-1)*12+x.items.length);return}if(Math.abs(pg-page)>1)delete pages[pg];setTimeout(function(){walk(Number(x.next))},0)},failed)}walk(page+1);return}
 // Probe only page lengths: bracket the last page, then bisect. No image downloads.
 function probe(pg,lo,hi){if(g!==generation||total!==null)return;api('probe',{page:pg,id:album?album.id:null,city:city,year:year},function(x){if(g!==generation||total!==null)return;if(typeof x.length!=='number')return failed();if(!x.next&&x.length){done((pg-1)*12+x.length);return}if(x.length===0)hi=pg;else lo=pg;if(hi&&hi-lo===1){done(lo*12);return}var n=hi?Math.floor((hi+lo)/2):pg*2;if(n>100000000)return failed();probe(n,lo,hi)},failed)}probe(page+1,page,0)
}
function grid(selected,anchor){
 clear('grid',(album?album.title:city||String(year||'Todas as fotos')));tiles=[];var stamp=epoch;
 var box=document.createElement('div');box.id='mosaic';area.appendChild(box);
 records.forEach(function(x,i){var b=document.createElement('button'),im=document.createElement('img'),cap=document.createElement('span');b.className='tile';cap.textContent=caption(x);b.setAttribute('aria-label',cap.textContent);im.alt='Foto';b.appendChild(im);b.appendChild(cap);box.appendChild(b);tiles.push(b);if(cache[x.id])im.src=cache[x.id];b.onclick=function(){show(i)};b.onfocus=function(){last=i}});
 function pgButton(label,path,fn){var b=btn(label,fn);b.setAttribute('aria-label',label);b.title=label;b.innerHTML='<svg aria-hidden="true" width="24" height="18" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="2"><path d="'+path+'"/></svg>';return b}
 var first=pgButton('Primeira página','M5 2v14m12-14-7 7 7 7',function(){photos(1,false,'next')});first.disabled=page<=1;
 var prev=pgButton('Página anterior','m15 2-7 7 7 7',function(){photos(page-1,false,'prev')});prev.disabled=page<=1;
 var fwd=pgButton('Próxima página','m9 2 7 7-7 7',function(){photos(Number(next),false,'next')});fwd.disabled=!next;
 var end=pgButton('Última página','M19 2v14M7 2l7 7-7 7',function(){if(total!==null)photos(Math.ceil(total/12),false,'prev')});end.id='pgEnd';end.disabled=total===null||!next;
 btn('Álbuns',function(){albums(false)});btn('Local',function(){picker('cities')});btn('Ano',function(){picker('years')});if(album||city||year)btn('Todas as fotos',function(){choose(null,'',0)});(anchor==="next"?(fwd.disabled?(prev.disabled?area.lastChild:prev):fwd):anchor==="prev"?(prev.disabled?(fwd.disabled?area.lastChild:fwd):prev):(tiles[selected]||area.lastChild)).focus();pageLabel();
 schedule(ids);loadPlaces();countPages();if(next)pageData(Number(next),function(x){if(epoch===stamp)schedule(ids.concat(x.items.map(function(r){return r.id})))},function(){})}
function show(i){clear('full','');queue=[];pos=i;document.body.classList.add('theater');var im=document.createElement('img');im.id='fullpic';im.alt='Foto ampliada';if(cache[ids[i]])im.src=cache[ids[i]];area.appendChild(im);var cap=document.createElement('span');cap.id='fullcap';cap.textContent=caption(records[i]);area.appendChild(cap);var item=records[i];if(!item.place&&!item.checked)call('detail',{id:item.id},function(v){item.place=v;item.checked=true;item.detailError=false;cap.textContent=caption(item)},function(r){if(Number(r.errorCode)===401)return fail(r);item.detailError=true;cap.textContent=caption(item)});var ret=btn('Voltar à grade',function(){grid(pos)});ret.className='exitpic';ret.focus();call('image',{id:ids[i],large:true},function(src){im.src=src},function(r){if(Number(r.errorCode)===401)return fail(r);print(cache[ids[i]]?'Exibindo a miniatura ampliada.':'Prévia indisponível.')})}
function back(){if(stage==='full')grid(pos);else if(stage==='albums'||stage==='cities'||stage==='years')grid(last);else location.href='index.html'}
$('back').onclick=back;
function neighbor(from,all,k){
 if(!from||all.indexOf(from)<0)return all[0];
 var vert=k===38||k===40,sign=k===37||k===38?-1:1,best=null,score=null;
 function axes(r){return vert?[r.top,r.bottom,r.left,r.right]:[r.left,r.right,r.top,r.bottom]}
 var a=axes(from.getBoundingClientRect());all.forEach(function(el){if(el===from)return;var r=el.getBoundingClientRect();if(!r.width||!r.height)return;var b=axes(r);
 var gap=sign>0?b[0]-a[1]:a[0]-b[1];if(gap< -2)return;
 var side=Math.abs((b[2]+b[3]-a[2]-a[3])/2),cross=Math.max(0,a[2]-b[3],b[2]-a[3]),n=Math.max(0,gap)+2*cross+.40*side;
 if(score===null||n<score){best=el;score=n}});return best||from}
document.addEventListener('keydown',function(e){var k=e.keyCode,typing=/^(password|text)$/.test(document.activeElement.type);
 if(k===461||k===27||(k===8&&!typing)||e.key==='GoBack'||e.key==='BrowserBack'){e.preventDefault();if(!e.repeat)back();return}
 if(stage==='full'){if(k===37||k===39){e.preventDefault();var i=pos+(k===37?-1:1);if(i>=0&&i<ids.length)show(i)}return}
 if(k>=37&&k<=40){if(typing&&(k===37||k===39))return;var all=Array.prototype.slice.call(document.querySelectorAll('input,button:not(:disabled)'));var el=neighbor(document.activeElement,all,k);e.preventDefault();if(el)el.focus()}}); 
if(key)photos(1,false);else login();call('version',{},function(v){$('ver').textContent='Immich '+v+' · Rede local'},function(r){$('ver').textContent='Servidor indisponível';print(r.errorText||'Serviço local indisponível.')})
})();







