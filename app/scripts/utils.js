'use strict';


var log = function(text)
{
  if($UPP.localConfig.env != "PRO"){
    console.log(text);
  }
};


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
  if($UPP.localConfig.env != "DES") 
    domain = " ;domain=" + document.domain; 
  var aux = c_name + "=" + c_value + "; expires=" + CookieDate.toGMTString( )+ ";path=/"; //+ domain + ";path=/";
  log("aux=" + aux);
  document.cookie = aux;
};


var checkLanguage = function()
{
  var lang_cookie = getCookie("ppl_language"),
      location, browser_lang, lang;
  
  if(lang_cookie){
    //CHECK IF CURRENT LANG != LANG COOKIE
    if(lang_cookie.substring(0,2) !== current_lang.substring(0,2)){
      //Redirect to lang cookie version
      location = routing[view][lang_cookie];

      log("Hay cookie -> "+ location);
      log("Routing -> "+ routing);
      //debugger
      if (location){
         window.location = location;
      }
     
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
        setCookie("ppl_language", "es-ES") ;
      }else{
        lang = "en_EN";
        setCookie("ppl_language", "en-EN") ;
      }
      location = routing[view][lang];
      log("No hay cookie -> "+ location);

      if (location){
        window.location = location;
      }
    }
  }
};

var closeCookies = function()
{
  setCookie("showed-cookies", "true");
  $("#cookies").removeClass('show');
};