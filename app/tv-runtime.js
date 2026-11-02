(function () {
  var pending=[];
  function request(uri, options) {
    var opts=options||{}, bridge, reply;
    function finish(result) {
      var keep=result.returnValue!==false && (opts.subscribe || (opts.parameters||{}).subscribe);
      if(!keep && bridge && pending.indexOf(bridge)>=0)pending.splice(pending.indexOf(bridge),1);
      reply=result.returnValue===false?opts.onFailure:opts.onSuccess;
      if(reply)reply(result);
    }
    try {
      bridge=new window.PalmServiceBridge();
      pending.push(bridge);
      bridge.onservicecallback=function(raw){
        var result;
        try {result=JSON.parse(raw)}catch(e){result={returnValue:false,errorText:'Resposta inválida da TV.'}}
        finish(result);
      };
      bridge.call(uri.replace(/\/$/,'')+'/'+opts.method,JSON.stringify(opts.parameters||{}));
    }catch(e){finish({returnValue:false,errorText:'Serviço indisponível nesta TV.'})}
    return bridge;
  }
  window.webOS={service:{request:request},platformBack:function(){
    if(window.PalmSystem && window.PalmSystem.platformBack)window.PalmSystem.platformBack();
  }};
})();
