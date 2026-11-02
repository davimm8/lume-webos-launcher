(function () {
  function parse(value) {
    var m = /^(https?):\/\/((?:\d{1,3}\.){3}\d{1,3})(?::([1-9]\d{0,4}))?\/?$/.exec(value || '');
    if (!m) return null;
    var n = m[2].split('.').map(Number);
    if (n.join('.') !== m[2] || Math.max.apply(null,n)>255 ||
        !(n[0]===10 || (n[0]===172 && n[1]>=16 && n[1]<=31) || (n[0]===192 && n[1]===168))) return null;
    var secure=m[1]==='https', port=Number(m[3] || (secure?443:80));
    if(port>65535)return null;
    return {host:m[2],port:port,secure:secure,origin:m[1]+'://'+m[2]+(port===(secure?443:80)?'':':'+port)};
  }
  function load() {
    try {var cfg=JSON.parse(localStorage.getItem('lume.servers'));
      if(cfg && Array.isArray(cfg.cameras))return cfg;
    }catch(e){}
    return {agent:'',immich:'',cameras:[]};
  }
  if(typeof module==='object')module.exports={parse:parse};
  else window.LumeNetwork={parse:parse,load:load};
})();
