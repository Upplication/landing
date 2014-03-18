'use strict';

(function($){


  /*$.ready(function() {
   langs.codes.forEach(function(code){
   $("#change-lang a").set("href", "hola/");
   });
   });  */
  
  //TODO: change cookie lang on clic
  var asd,asda;

  Zepto(function($){
    //TODO: Language detection & redirection
    

    var template = $("body").attr("id"),
        lang_elems = $(".change-lang li[data-lang]"), 
        lang;
    
    //Add dynamic translations
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
    //Stilize current language
    $(".change-lang li[data-lang='"+$("body").attr("data-lang")+"']").css("font-weight","600");
    
    //Display cookies announce
    if(!getCookie("showed-cookies")){
      $("#cookies").addClass("show");
    }

    //Register form through AJAX
    //Validation done in HTML5 (patterns, minlength, etc)
    $("form[name='register']").submit(function(e){
      e.preventDefault();
      
      var vals = $(this).serialize(),
          host, url;
      
      if($UPP.env === "DES"){
        host = "desarrollo.upplication.priv";
      }else if($UPP.env === "PRE"){
        host = "prepro.upplication.com";
      }else if($UPP.env === "PRO"){
        host = "dashboard.upplication.com";
      }
      

      url = "http://"+host+"/web/register.action;?"+vals+"&__checkbox_terms=true&category=business";
      console.log("URL=",url);

      $.ajax({
        type: "GET",
        url: url,
        context: this,
        dataType: "JSON",
        success: function(data){
          data = $.parseJSON(data);
          
          if(data.success){
            window.location = data.url;
          }else{
            var error = {};

            switch(data.case){
              case 2:
                //CREATING_APPREQUEST_ERROR
                error.appName = ajax.error[2]; 
                break;
              case 3:
                //DUPLICATE_EMAIL_ERROR
                error.email = ajax.error[3]; 
                break;
              case 4:
                //DUPLICATE_NAME_ERROR
                error.appName = ajax.error[4]; 
                break;
              case 5:
                //SELLER_ERROR
                error.seller = ajax.error[5]; 
                break;
              case 6:
                //DUPLICATE_NAME_AND_DUPLICATED_EMAIL_ERROR
                error.email = ajax.error[3]; 
                error.appName = ajax.error[4]; 
                break;
              case 7:
                //DUPLICATE_NAME_AND_SELLER_ERROR
                error.appName = ajax.error[4]; 
                error.seller = ajax.error[5]; 
                break;
              case 8:
                //DUPLICATE_EMAIL_AND_SELLER_ERROR
                error.email = ajax.error[3]; 
                error.seller = ajax.error[5]; 
                break;
              case 9:
                //DUPLICATE_NAME_AND_DUPLICATED_EMAIL_AND_SELLER_ERROR
                error.email = ajax.error[3]; 
                error.appName = ajax.error[4]; 
                error.seller = ajax.error[5]; 
                break;
              case 10:
                //SOME_PARAMETER_NULL_ERROR
                console.log(ajax.error[10]); 
                break;
            }
            //debugger
            //Seller is never used in home
            var $email = $(this).find("[for=email] p.error"),
                $appName = $(this).find("[for=appName] p.error"),
                $seller = $(this).find("[for=seller] p.error");

            if(error.appName){
              $appName.text(error.appName);
              $appName.show();
            }
            if(error.email){
              $email.text(error.email);
              $email.show();
            }
            if(error.seller){
              $seller.text(error.seller);
              $seller.show();
            }

            /*            
            $("#ajax-error-popup .msg").text(msg);
                
            $.magnificPopup.open({
              items:{src:'#ajax-error-popup'},
              type:'inline',
            });*/

          }
        },error: function(xhr, type){
          $.magnificPopup.open({
            items:{src:'#ajax-error-popup'},
            type:'inline',
            midClick: true 
          });
        }

      });
    });
    
    //Hide errors on input fields when it is modified
    $("[name='register'] input").on('keypress',function(){ 
      $(this).siblings("p.error").hide();
    });
    

    //Display sidebar menu in mobile
    $(".icon-list").on("click",function(){
      $(".slide-pannel.effects").toggleClass("slide-right")
      var $outer = $("div.outer-wrap");
      if($outer.css("height") == "100%"){
        $outer.css("height","auto");
      }
      else{
        $outer.css("height","100%");
      }
    })

    //
    $('.open-popup-link').magnificPopup({
      type:'inline',
      midClick: true 
    });

    $('#ajax-error-popup').magnificPopup({
      type:'inline',
      midClick: true 
    });
  });
})();