'use strict';

(function(){


  /*$.ready(function() {
   langs.codes.forEach(function(code){
   $("#change-lang a").set("href", "hola/");
   });
   });  */
  Zepto(function($){
    $.getJSON('/routing.json', function(data){
      console.log(data)
      var template = $("body").attr("id");

      var lang_elems = $("#change-lang li"), lang;
      for(var i=0 ; i < lang_elems.length; i++){
        lang = $(lang_elems[i]).data("lang");

        $("#change-lang li[data-lang='" + lang + "'] a").attr("href", data[template][lang]);
      }
    });

    $(".icon-list").on("click",function(){
      console.log("click");
      $(".slide-pannel.effects").toggleClass("slide-right")
    })
    $(".icon-list").tap(function(){
      console.log("tap");
      $(".slide-pannel.effects").toggleClass("slide-right")
    });

    $("a").tap(function(){
      $(this).click();
    });
  });


  $('.open-popup-link').magnificPopup({
    type:'inline',
    midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
  });

})();