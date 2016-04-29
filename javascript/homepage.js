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
	getEmailAddress();
}

function onEmailSuccess(data) {
    $.post({
        url:'/login',
        success: function(res) {
            document.location.href = res.redirect;
        }
    }
    );
}

// Handle an error response from the API call
function onError(error) {
    console.log(error);
}

// Use the API call wrapper to request the member's basic profile data
function getProfileData() {
	console.log("getting profile data");
	clearInterval(interval);
    IN.API.Raw("/people/~").result(onSuccess).error(onError);
}

function getEmailAddress() {
	IN.API.Raw("/people/~:(email-address)?format=json").result(onEmailSuccess).error(onError);
}