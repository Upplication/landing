'use strict';


var log = function(text)
{
  if($UPP.env != "PRO"){
    console.log(text);
  }
};

//Inicialize $UPP global variable with config settings
(function(document,window){  
    var host = window.location.hostname,
        env;
    
    if(!$UPP.config.hasOwnProperty(host)){
      log("No hay configuraciones para el entorno")
    }
    else{
      for(var index in $UPP.config[host]) { 
         if ($UPP.config[host].hasOwnProperty(index)) {
             $UPP[index] = $UPP.config[host][index];
         }
      }
    }
}(document,window));





function getQueryParams(name) 
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  var value = results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "))
  return value;
}
  
(function(){
  
  $UPP.params="";
  var campaign_keywords = 'utm_source utm_medium utm_campaign utm_content'.split(' '), 
      kw = '';
  for (var i=0; i < campaign_keywords.length; i++){
    kw = getQueryParams(campaign_keywords[i]);
    if(kw.length){
      if(i != 0){
        $UPP.params+="&";
      }
      $UPP.params+=campaign_keywords[i]+"="+kw;
    }
  }
  
}(document,window));



var updateVisitInfo = function() 
{
  localStorage.numVisits = (parseInt(localStorage.numVisits) || 0) + 1;
}

var getCookie = function(c_name)
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

var setCookie = function(c_name, c_value)
{
  var CookieDate = new Date;
  CookieDate.setFullYear(CookieDate.getFullYear( ) + 10);
  var domain = "";
  if($UPP.env != "DES") 
    domain = " ;domain=" + document.domain; 
  var aux = c_name + "=" + c_value + "; expires=" + CookieDate.toGMTString( ) + domain + ";path=/";
  log("aux=",aux)
  document.cookie = aux;
};

//TODO: USE ACCEPT PREFERRED LANGUAGE (Not browser language)
/*
var languageRedirection = function(brow_lang){
  
}

$.ajax({ 
  url: "http://ajaxhttpheaders.appspot.com", 
  dataType: 'jsonp', 
  success: function(headers) {
      var language = headers['Accept-Language'];
      languageRedirection(language);
    }
});
*/
var checkLanguage = function()
{
  var lang_cookie = getCookie("ppl_language"),
      location, browser_lang, lang;
  
  if(lang_cookie){
    //CHECK IF CURRENT LANG != LANG COOKIE
    if(lang_cookie.substring(0,2) !== current_lang.substring(0,2)){
      //Redirect to lang cookie version
      location = routing[view][lang_cookie];

      log("Hay cookie -> "+ location)
      log("Routing -> "+ routing)
      //debugger
      window.location = location;
    }
  }else{
    browser_lang = window.navigator.userLanguage || window.navigator.language;
    //CHECK BROWSER PREFERENCES
    if(browser_lang !== current_lang.substring(0,2)){
      //TODO: improve this , not manually
      //Redirect to browser lang 
       lang = "";
      if(browser_lang == "es"){
        lang = "es_ES";
        setCookie(ppl_language, "es-ES") ;
      }else{
        lang = "en_EN";
        setCookie(ppl_language, "en-EN") ;
      }
      location = routing[view][lang];
      log("No hay cookie -> "+ location)
      window.location = location;
    }
  }
};

var closeCookies = function()
{
  setCookie("showed-cookies", "true");
  $("#cookies").removeClass('show');
};