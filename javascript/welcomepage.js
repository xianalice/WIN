console.log("I'm ready");
//Set up input functionality
document.addEventListener("DOMContentLoaded", function(){
	console.log("DOM Content is Loaded");
	var loginform = document.getElementById("loginform");

	loginform.addEventListener('submit', function(e) {
		e.preventDefault();

		console.log("Button is clicked!"); 
		/* 
		1. LINKED IN API GOES HERE
		2. After coming back from Linked In, Redirect to homepage.html if successful
		3. If not successful, redirect to unauthorized.html
		*/
	})
});