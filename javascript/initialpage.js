var interval;
window.addEventListener('load', function(){
   interval = setInterval(linkedin, 3000);
});

function linkedin() {
    if(IN.User.isAuthorized()) {
    	getProfileData();
    }
}

function onLinkedInLoad() {
    IN.Event.on(IN, "auth", getProfileData);
}

// Handle the successful return from the API call
function onSuccess(data) {
    console.log("in onSuccess");
    console.log(data);
    $.post({
        url:'/login',
        data: data,
        success: function(res) {
            document.location.href = res.redirect;
        }
    });
}

// Handle an error response from the API call
function onError(error) {
    console.log(error);
}

// Use the API call wrapper to request the member's basic profile data
function getProfileData() {
	console.log("getting profile data");
	clearInterval(interval);
    IN.API.Raw("/people/~:(id,first-name,last-name,email-address,public-profile-url,picture-url,location,industry,headline)").result(onSuccess).error(onError);
}