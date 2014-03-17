'use strict';

(function($){


  /*$.ready(function() {
   langs.codes.forEach(function(code){
   $("#change-lang a").set("href", "hola/");
   });
   });  */
  
  //TODO: change cookie lang on clic

  Zepto(function($){
    //TODO: Language detection & redirection
    

    var template = $("body").attr("id"),
        lang_elems = $(".change-lang li[data-lang]"), 
        lang;
    
    for(var i=0 ; i < lang_elems.length; i++){
      lang = $(lang_elems[i]).data("lang");
      //TODO: Move this to jade in header (not with JS
      $(".change-lang li[data-lang='" + lang + "'] a").attr("href", routing[template][lang]);
      
      //Change lang_cookie
      $(".change-lang li[data-lang='" + lang + "'] a").click(function(){
        setCookie("ppl_language",$(this).parent().data("lang"));
        console.log("Cambio lang a =" + $(this).parent().data("lang"));
      });
    }
    
    if(!getCookie("showed-cookies")){
      $("#cookies").addClass("show");

      //$("#cookies .close").on('click',closeCookies());

      setTimeout("closeCookies()",10000);
    }

    $(".change-lang li[data-lang='"+$("body").attr("data-lang")+"']").css("font-weight","600");

    $(".icon-list").on("click",function(){
      console.log("click");
      $(".slide-pannel.effects").toggleClass("slide-right")
    })
//    $(".icon-list").tap(function(){
//      console.log("tap");
//      $(".slide-pannel.effects").toggleClass("slide-right")
//    });
//
//    $("a").tap(function(){
//      $(this).click();
//    });

    $('.open-popup-link').magnificPopup({
      type:'inline',
      midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
    });
  });
})();