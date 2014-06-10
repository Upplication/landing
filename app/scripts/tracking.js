'use strict';


var page_slug = $UPP.url,
    registered_user = false,
    prop = {
        page_slug: page_slug,
        registered_user: registered_user,
        visits: parseInt(localStorage.numVisits)
    };

//Update if the user is registered
if (document.cookie.indexOf("user_type") != -1) {
    registered_user = true;
}

//Increment cookie (counting visits)
updateVisitInfo();

$(document).ready(function () {

    $("#download_ebook").click(function () {
        upplication.track("Click [landing] download-ebook", prop, function () {
            log("Click [landing] download-ebook with properties:");
            log(prop);
        });
    });

    $("#youtube-video").one("click", function () {
        upplication.track("Video played", prop, function () {
            log("Video played with properties:");
            log(prop);
        });
    });


    upplication.track("View landing [" + $UPP.url  + "]", prop, function () {
        log("View landing [" +$UPP.url + "]  with properties: ");
        log(prop)
    });

});
