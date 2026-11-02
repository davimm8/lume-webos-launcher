(function(){
  function field(id){return document.getElementById(id)}
  var config=LumeNetwork.load(), controls=document.querySelectorAll('input,button');
  field('immich').value=config.immich;
  field('agent').value=config.agent;
  field('ids').value=config.cameras.map(function(c){return c[0]}).join(', ');
  function save(){
    try{
      var next={cameras:[]};
      ['agent','immich'].forEach(function(id){
        var raw=field(id).value.trim(), parsed=LumeNetwork.parse(raw);
        if(raw&&!parsed)throw Error('Endereço de '+id+' inválido. Informe protocolo, IPv4 privado e porta.');
        next[id]=parsed?parsed.origin:'';
      });
      if(next.agent){
        var ids=field('ids').value.trim().split(/\s*,\s*/);
        if(ids.length>2 || ids.some(function(id,i){return !/^[1-9]\d{0,7}$/.test(id)||ids.indexOf(id)!==i}))
          throw Error('Informe um ou dois IDs de câmera distintos.');
        next.cameras=ids.map(function(id){return [Number(id),'Câmera '+id]});
      }
      if(config.immich!==next.immich)localStorage.removeItem('lume.immich.key');
      localStorage.setItem('lume.servers',JSON.stringify(next));
      config=next;
      if(location.search==='?gallery'&&next.immich)location.replace('immich.html');
      else if(location.search==='?camera'&&next.agent)location.replace('cameras.html');
      else field('status').textContent='Configuração salva nesta TV.';
    }catch(e){field('status').textContent=e.message}
  }
  field('save').onclick=save;
  field('back').onclick=function(){location.replace('index.html')};
  document.onkeydown=function(e){
    var k=e.keyCode,i=Array.prototype.indexOf.call(controls,document.activeElement);
    if(k===461||k===27){e.preventDefault();field('back').click()}
    if(k===38||k===40){e.preventDefault();controls[Math.max(0,Math.min(controls.length-1,i+(k===38?-1:1)))].focus()}
  };
  field(location.search==='?camera'?'agent':'immich').focus();
})();
