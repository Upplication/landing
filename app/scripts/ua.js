'use strict';

var upplication = function($,document,window){

  var is_coworker = false, 
      should_track, 
      user_ip, 
      _global_properties={};
  
  var _log = function(text){
      if($UPP.env != "PRO"){
          console.log(text);
      }
  }
  /*
    Constructor
  */
  var _init = function(){

    _set_coworker();

    should_track = ((is_coworker && (_getCookie("coworker_exclude") === "true"))? true: false);
    
    $(document).ready(function(){
      if (is_coworker && (_getCookie("coworker_exclude") === "false")  ){
        $("#page > .wrapper-section-site").css("top","50px");
        $(".grid-container.grid-parent").css("margin-top","50px");
        $("body").prepend("<div id='coworker' style='position:fixed;text-align:center;line-height:50px;background-color:black;color:white;width: 100%;top: 0;z-index: 999999;'>Si eres trabajador en Upplication avisa al pirata Robert de este aviso. <a href='/analytics' style='color:white'>Excluir mi tráfico</a></div>");
        
      }
    });

  }

  var _getCookie = function(c_name)
  {
      var c_value = document.cookie;
      var c_start = c_value.indexOf(" " + c_name + "=");
      if (c_start == -1){
        c_start = c_value.indexOf(c_name + "=");
      }

      if (c_start == -1){
        c_value = null;
      }else{
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1){
          c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start,c_end));
      }
      return c_value;
  }

  /*
    Private function which setup the user_ip
  */
  var _myIP = function () {
    var xmlhttp;
    if (window.XMLHttpRequest) 
      xmlhttp = new XMLHttpRequest();
    else 
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xmlhttp.open("GET","http://api.hostip.info/get_html.php",false);
    xmlhttp.send();

    var hostipInfo = xmlhttp.responseText.split("\n");
    var ipAddress;
    for (i=0; hostipInfo.length >= i; i++) {
        ipAddress = hostipInfo[i].split(":");
        if ( ipAddress[0] == "IP" ){
          user_ip = ipAddress[1];
          return user_ip;
        } 
    }

    return false;
  }

  /*
    Private function which initialize the is_coworker variable
  */
  var _set_coworker = function (){
    is_coworker = ((_myIP().indexOf("79.148.255.215")!=-1)? true : false);
  }
  
  var _add_global = function(props){
    for (var prop in _global_properties){

       if (_global_properties.hasOwnProperty(prop)) {
        if (!props[prop]){
          props[prop] = _global_properties[prop];
        }
      }
    }
    return props;
  }
  /*
    Public function which tracks to Segment.io if the user is not a coworker
  */
  var track = function(event, props, cb){

    if (should_track){
      props = _add_global(props);
      analytics.track(event, props, cb);
    }else{
      cb && cb();
      console.log("No trackeo");
    }
  }

  var identify = function (userId, traits){
    if (should_track){
      _log("Identificating the user");
      analytics.identify(userId, traits);
    }
  }

  var track_links = function(element_id, event, properties){
    $(document).ready(function(){
      var $element = $(element_id)
      if (should_track && $element){
        properties = _add_global(properties);
        $element.each(function(i, elem){
          analytics.trackLink(elem, event, properties);
          _log("Trackeando link: "+element_id);
        });
      }
    });
  }

  var track_forms = function(element_id, event, properties){
    $(document).ready(function(){
      $element = $(element_id)
      if (should_track && $element){
        properties = _add_global(properties);
        $element.each(function(i, elem){
          analytics.trackForm(elem, event, properties);
          _log("Trackeando link: "+element_id);
        });
      }
    });
  }

  var register = function(properties){
    for (var prop in properties){
      if (properties.hasOwnProperty(prop)) {
        _global_properties[prop] = properties[prop];
      }
    }
  }


  _init();
  return {
    is_coworker: is_coworker,
    user_ip: user_ip,
    track: track,
    identify: identify,
    track_links: track_links,
    track_forms: track_forms,
    register: register
  };

}($,document,window);

