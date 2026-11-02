'use strict';
var http=require('http'), svc=new (require('webos-service'))('com.lume.launcher.immich');
var uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function place(x){var e=x.exifInfo||{},v=[e.city,e.state,e.country].filter(Boolean).join(', ');if(v)return v;if(typeof e.latitude==='number'&&typeof e.longitude==='number')return e.latitude.toFixed(3)+', '+e.longitude.toFixed(3);return ''}
svc.register('read',function(m){
 var p=m.payload||{},op=p.op,h={},path,body,done=false;
 function end(result){if(!done){done=true;m.respond(result)}}
 function err(code,msg){end({returnValue:false,errorCode:code,errorText:msg})}
 if(op==='version')path='/api/server/version';
 else if(op==='albums')path='/api/albums';
 else if(op==='cities')path='/api/search/suggestions?type=city';
 else if(op==='years')path='/api/timeline/buckets';
 else if(op==='detail'&&uuid.test(p.id))path='/api/assets/'+p.id;
 else if((op==='photos'||op==='probe')&&(!p.id||uuid.test(p.id))&&Number(p.page)>0&&Number(p.page)<=100000000){path='/api/search/metadata';body=JSON.stringify({albumIds:p.id?[p.id]:undefined,city:p.unknown?null:(typeof p.city==='string'&&p.city?p.city:undefined),state:p.unknown?null:undefined,country:p.unknown?null:undefined,type:'IMAGE',withExif:op!=='probe',isFavorite:p.favorite===true?true:undefined,takenAfter:p.year?String(Number(p.year))+'-01-01T00:00:00Z':undefined,takenBefore:p.year?String(Number(p.year))+'-12-31T23:59:59.999Z':undefined,order:p.oldest?'asc':'desc',size:12,page:Number(p.page)})}
 else if(op==='image'&&uuid.test(p.id))path='/api/assets/'+p.id+'/thumbnail?size='+(p.large?'preview':'thumbnail');
 else return err(400,'Consulta inválida.');
 if(p.key){if(typeof p.key!=='string'||p.key.length>512||!/^[!-~]+$/.test(p.key))return err(400,'Formato da chave inválido.');h['x-api-key']=p.key}
 if(body){h['Content-Type']='application/json';h['Content-Length']=Buffer.byteLength(body)}
 var origin=require('./network').parse(p.origin);
 if(!origin)return err(400,'Configure um IPv4 privado válido para o servidor.');
 var transport=origin.secure?require('https'):http;
 var r=transport.request({hostname:origin.host,port:origin.port,path:path,method:body?'POST':'GET',headers:h},function(res){
 if(res.statusCode!==200&&res.statusCode!==201){res.resume();return err(res.statusCode,'Immich respondeu HTTP '+res.statusCode+'.')}
 var chunks=[],size=0;res.on('data',function(b){size+=b.length;if(size>3*1024*1024){err(413,'Resposta muito grande.');r.abort()}else chunks.push(b)});
 res.on('error',function(){err(502,'Resposta interrompida.')});res.on('end',function(){if(done)return;try{var buf=Buffer.concat(chunks),data,typ=(res.headers['content-type']||'').split(';')[0];
 if(op==='image'){if(['image/jpeg','image/webp','image/png'].indexOf(typ)<0||!size)return err(415,'Formato de imagem não suportado.');data='data:'+typ+';base64,'+buf.toString('base64')}
 else{var j=JSON.parse(buf.toString());if(op==='version')data=[j.major,j.minor,j.patch].join('.');else if(op==='detail')data=place(j);else if(op==='cities')data=j.filter(function(x){return typeof x==='string'&&x.trim()}).sort();else if(op==='years'){var years={};j.forEach(function(x){var v=String(x.timeBucket).slice(0,4);if(/^[0-9]{4}$/.test(v))years[v]=true});data=Object.keys(years).sort().reverse()}else if(op==='albums')data=j.map(function(x){return {id:x.id,title:x.albumName}});else if(op==='probe')data={length:j.assets.items.length,next:j.assets.nextPage};else data={items:j.assets.items.map(function(x){var e=x.exifInfo||{};return {id:x.id,date:x.localDateTime||e.dateTimeOriginal||x.fileCreatedAt||'',place:place(x)}}),next:j.assets.nextPage}}
 end({returnValue:true,data:data})}catch(e){err(502,'Resposta inesperada do Immich.')}})});
 r.setTimeout(10000,function(){err(504,'O servidor não respondeu a tempo.');r.abort()});r.on('error',function(){err(502,'Não foi possível alcançar o Immich.')});r.end(body);
});





