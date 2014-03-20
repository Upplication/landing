'use strict';

(function($){

  
  Zepto(function($){
    
    var template = $("body").attr("id"),
        lang_elems = $(".change-lang li[data-lang]"), 
        lang;
    
    //Add dynamic translations
    for(var i=0 ; i < lang_elems.length; i++){
      lang = $(lang_elems[i]).data("lang");
      //TODO: Move this to jade in header (not with JS)
      $(".change-lang li[data-lang='" + lang + "'] a").attr("href", routing[template][lang]);
      
      //Change lang_cookie
      $(".change-lang li[data-lang='" + lang + "'] a").click(function(){
        setCookie("ppl_language",$(this).parent().data("lang"));
        log("Cambio lang a =" + $(this).parent().data("lang"));
      });
    }
    //Stilize current language
    $(".change-lang li[data-lang='"+$("body").attr("data-lang")+"']").css("font-weight","600");
    
    //Display cookies announce
    if(!getCookie("showed-cookies")){
      $("#cookies").addClass("show");
    }
    
    $(".login_btn a").each(function(i, elem){
      $(this).attr("href","http://" + $UPP.host + "/web");
    });

    //Register form through AJAX
    //Validation done in HTML5 (patterns, minlength, etc)
    $("form[name='register']").submit(function(e){
      e.preventDefault();
      
      var vals = $(this).serialize(),
          host, url;     
      var aux = JSON.parse('{"' + decodeURI(vals).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
      //debugger

      url = "http://"+$UPP.host+"/web/register.action;?"+vals;
      if($UPP.params)
        url += "&" + $UPP.params;
      log("URL=",url);

      $.ajax({
        type: "POST",
        url: url,
        data: aux,
        context: this,
        dataType: "jsonp",
        success: function(data){         
          if(data.success){
            window.location = "http://" + $UPP.host + "/web" + data.url;
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
            var $email = $(this).find("[for=email]"),
                $appName = $(this).find("[for=appName]"),
                $seller = $(this).find("[for=seller]");

            if(error.email){
              $email.find('p.error').text(error.email);
              $email.find('p.error').show();
              $email.find('input').addClass("error");
            }
            if(error.appName){
              $appName.find('p.error').text(error.appName);
              $appName.find('p.error').show();
              $appName.find('input').addClass("error");
            }
            if(error.seller){
              $seller.find('p.error').text(error.seller);
              $seller.find('p.error').show();
              $seller.find('input').addClass("error");
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
            items:{
              src:'#ajax-error-popup',
              type: 'inline'

            },
            //type:'inline',
            //midClick: true ,
            callbacks: {
              open: function() {
                // Will fire when this exact popup is opened
                // this - is Magnific Popup object
                console.log("Opened");


              },
              close: function() {
                // Will fire when popup is closed
                //debugger
                //console.log("Closed");
                $.magnificPopup.close();
              }
            }
          });
        }

      });
    });
    
    //Hide errors on input fields when it is modified
    $("[name='register'] input").on('keypress',function(){ 
      $(this).siblings("p.error").hide();
      $(this).removeClass("error");
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
    $('#youtube-video').magnificPopup({
      type:'inline',
      midClick: true,
      callbacks: {
        open: function() {
          // Will fire when this exact popup is opened
          // this - is Magnific Popup object
          console.log("Opened");


        },
        close: function() {
          // Will fire when popup is closed
          console.log("Closed");
        }
      }
    });

    $('#ajax-error-popup').magnificPopup({
      type:'inline'
      //,
      //midClick: true 
    });
  });
})();