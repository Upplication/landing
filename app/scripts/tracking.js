/*
ADD UTM_* to LOGIN AND REGISTER LINKS
*/
var params = "",prefix;
var campaign_keywords = 'utm_source utm_medium utm_campaign utm_content'.split(' '), kw = '';

for (var i = 0; i < campaign_keywords.length; i++){
  kw = getQueryParams(campaign_keywords[i]);
  if(kw.length){
    if(i != 0){
      params += "&";
    }
    params += campaign_keywords[i] + "=" + kw;
  }
}

$(document).ready(function(){
  var parse_urls=["http://dashboard.upplication.com/web/login","http://dashboard.upplication.com/web/new-user","/precios/","/pricing/"];
  for(var i = 0; i < parse_urls.length; i++){
    $("[href*='" + parse_urls[i] + "']").each(function(i, elem){
      $elem = $(elem);

      prefix="";
      if($elem.attr("href").split("?").length > 1)
        prefix="&";
      else
        prefix="?";

      if(params){
        $elem.attr("href",$elem.attr("href") + prefix + params);
      }
   });
  }
});
/*
END --> ADD UTM_* to LOGIN AND REGISTER LINKS
*/

var page_slug = $UPP.url, 
    registered_user=false,
    track_pages = ["/", "otras..."],
    prop = {
      page_slug: page_slug,
      registered_user: registered_user,
      visits: parseInt(localStorage.numVisits)
    },
    args="page_slug="+prop.page_slug+", registered_user="+prop.registered_user;

//Update if the user is registered
if(document.cookie.indexOf("user_type")!=-1){
  registered_user=true;
}

//Increment cookie (counting visits)
updateVisitInfo();

$(document).ready(function(){

  
  upplication.track_links("Click [landing] create-your-app",".crea-tu-app",prop,function(){
    log("Click [landing] create-your-app: "+args);
  });

  $("#download_ebook").click(function(){
    upplication.track("Click [landing] download-ebook",prop,function(){
      log("Click [landing] download-ebook: "+args);
    });  
  });
    

  if(track_pages.indexOf(page_slug) != -1){
  
    upplication.track("View landing",prop,function(){
      log("View landing: "+args);
    });

    //TODO: track form submit
    $("#boton-upp-tu, .boton-upp-tu").click(function(){
      if(!$(this).hasClass("spread")){
        upplication.track("Click btn_start",prop,function(){
          log("Click btn_start: "+args);;
        });  
      }
    });

    if (upplication.is_coworker && (document.cookie.indexOf("coworker_exclude=") == -1) ){
      //window.location = "/analytics";
      //TODO: avoid contamine samples
      console.log("TODO: Evitar contaminar muestras");
    }


    $(".video-container a").one("click",function(){
      upplication.track("Video played",prop,function(){
        log("Video played: "+args);;
      });  
    });

  }
});
