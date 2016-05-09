var people;
var jobs;
var startups;
var funding;
var events;
var peoplecheckboxunit;
var peoplecheckbox;
var postcheckbox;
var postcheckboxunit;
var clicknumbers = 0;
var firstName;
var lastName;
var clientId;

//Set up input functionality
document.addEventListener("DOMContentLoaded", function(){
	people = document.getElementById("people");
	jobs = document.getElementById("jobs");
	startups = document.getElementById("startups");
	funding = document.getElementById("funding");
	events = document.getElementById("events");
	peoplecheckbox = document.getElementById("cboxpeople");
	peoplecheckboxunit = document.getElementById("peoplecheckbox");
	postcheckbox = document.getElementById("cboxpost");
	postcheckboxunit = document.getElementById("postcheckbox");

	loadAdvancedSearch();
	loadPeopleSearchListener();
	loadAdvPeopleSearchListener();
	loadPostSearchListener();
	loadAdvPostSearchListener();
	loadOptionsListener();
	loadCreatePost();
});

function getProfileData() {
	console.log("getting profile data");
	IN.API.Raw("/people/~:(first-name,last-name,picture-url,id)").result(onSuccess).error(onError);
}

function loadCreatePost() {
	var cjobs = document.getElementById("cjobs");
	var cstartups = document.getElementById("cstartups");
	var cfunding = document.getElementById("cfunding");
	var cevents = document.getElementById("cevents");

	document.getElementById("create").addEventListener("click", function() {
		if (clicknumbers % 2 === 0){
			document.getElementById("create_holder").style.display = "block";
		} else {
			document.getElementById("create_holder").style.display = "none";
		}

		clicknumbers++;
	});


	var createform = document.getElementById("create_form");

	cjobs.addEventListener("click", function() {
		createform.ctopic.value = "jobs";
		cjobs.style.borderColor = "#909090";
		cstartups.style.borderColor = "transparent";
		cfunding.style.borderColor = "transparent";
		cevents.style.borderColor = "transparent";
	} );

	cstartups.addEventListener("click", function() {
		createform.ctopic.value = "startups";
		cstartups.style.borderColor = "#909090";
		cjobs.style.borderColor = "transparent";
		cfunding.style.borderColor = "transparent";
		cevents.style.borderColor = "transparent";
	} );

	cfunding.addEventListener("click", function() {
		createform.ctopic.value = "funding";
		cfunding.style.borderColor = "#909090";
		cstartups.style.borderColor = "transparent";
		cjobs.style.borderColor = "transparent";
		cevents.style.borderColor = "transparent";
	} );

	cevents.addEventListener("click", function() {
		createform.ctopic.value = "events";
		cevents.style.borderColor = "#909090";
		cstartups.style.borderColor = "transparent";
		cfunding.style.borderColor = "transparent";
		cjobs.style.borderColor = "transparent";
	} );
	
	document.getElementById("exit_form").addEventListener('submit', function(e){
		e.preventDefault();
		clicknumbers++;

		document.getElementById("create_holder").style.display = "none";
			createform.subject.value = "";
			createform.create_element.value = "";
			createform.ctopic.value = "";
			cevents.style.borderColor = "transparent";
			cstartups.style.borderColor = "transparent";
			cfunding.style.borderColor = "transparent";
			cjobs.style.borderColor = "transparent";
	});
	
	createform.addEventListener('submit', function(e){

		e.preventDefault();
		var a = 0;
		var b  = 0;
		var c = 0;

		if (this.ctopic.value == ""){
			document.getElementById("required").style.display = "block";
		} else {
			document.getElementById("required").style.display =  "none";
			a=1;
		}
		if (this.subject.value == ""){
			document.getElementById("required2").style.display = "block";
		} else {
			document.getElementById("required2").style.display =  "none";
			b=1;
		}
		if (this.create_element.value == ""){
			document.getElementById("required3").style.display = "block";
		} else {
			document.getElementById("required3").style.display =  "none";
			c=1;
		}

		if ( (a==1) && (b==1) && (c==1) ){
			document.getElementById("create_holder").style.display = "none";
			clicknumbers++;
			
			var title = this.subject.value;
			var text = this.create_element.value;
			var category = this.ctopic.value;
			
			console.log("first Name in post creation: " + firstName + " lastName: " + lastName)
			
			console.log(subject, text, firstName, lastName, category); /* TO DO - ADD TO DATABASE - USE BACKEND */
			var data = {"author": clientId, "firstName": firstName, "lastName": lastName, "title": title, "category": category, "text": text}
			$.ajax({
				type: 'post',
				url: '/newPost',
				data: data,
				success: function(res) {
					// console.log("created new post and time is ");
					// var date = new Date(res.data);
					// console.log(date);
					loadPostsByCategory(category);
				}
			});

			this.subject.value = "";
			this.create_element.value = "";
			this.ctopic.value = "";
			cevents.style.borderColor = "transparent";
			cstartups.style.borderColor = "transparent";
			cfunding.style.borderColor = "transparent";
			cjobs.style.borderColor = "transparent";
			var a = 0;
			var b  = 0;
			var c = 0;
		}
		
	});
}

function loadPostsByCategory(category) {
	console.log("loading posts in " + category);
	document.getElementById(category).click();
	data = {"category": category};
	$.get({
		url: '/getAllPosts',
		data: data,
		success: function(res) {
			console.log("displaying posts for " + category);
			for(var i=0; i<res.data.length; i++) {
				//SARITA
				//TODO: call function to display posts
				console.log(res.data[i]);
			}
		}
	});
}

/* Sets up conditions for advanced search */
function loadAdvancedSearch(){
	peoplecheckbox.addEventListener ("change", function(){
		if (peoplecheckbox.checked == true){
			showAdvancedPeopleSearch();
		}
		if (peoplecheckbox.checked == false){
			showPeopleSearch();
		}
	});

	postcheckbox.addEventListener ("change", function(){
		if (postcheckbox.checked == true){
			showAdvancedPostSearch();
		}
		if (postcheckbox.checked == false){
			showPostSearch();
		}
	});

	
}

function onSuccess(data) {
	console.log(data);
	fillInUserInfo(data);
}

function onError(err) {
	console.log(err);
}

/*Fills in User Info */
function fillInUserInfo(data){
	console.log("data from linkedin is ");
	console.log(data);

	var user_picture = document.getElementById("pro_pic");
	document.getElementById("pro_pic").style.backgroundImage = 'url(' + data.pictureUrl + ')';  

	/* TO DO: Instead of the random words I gave, put user's name here. */
	var user_picture = document.getElementById("my_profile");
	document.getElementById("my_profile").innerHTML = data.firstName + " " + data.lastName; 
	firstName = data.firstName;
	lastName = data.lastName;
	clientId = data.id;

}

/*Listens for input for people search submission (basic) */
function loadPeopleSearchListener(){
	var peoplesearch = document.getElementById("people_search");

	peoplesearch.addEventListener('submit', function(e) {
		e.preventDefault();

		var firstname = this.firstpeopletext.value;
		var lastname = this.lastpeopletext.value;
		console.log(firstname, lastname);
		displayPeople(firstname, lastname);
	});
}

function displayPeople(firstname, lastname) {
	if (firstname == "" && lastname == "") {
		console.log("both names blank");
		$.ajax({
			type: 'get',
			url: '/allPeople',
			success: function(res) {
				console.log("in basic search getting all people");
				for (var i=0; i < res.data.length; i++) {
					console.log(res.data[i]);
					//SARITA
					//TODO: display 
				}
			}
		});
	} else {
		var data = {"firstName":firstname, "lastName":lastname};
		$.ajax({
			type: 'get',
	    	url:'/searchPeopleByName',
	    	data: data,
	    	success: function(res) {
	    		console.log("in Name response callback");
	    		for(var i=0; i<res.data.length; i++) {
	    			//SARITA
	    			//TODO: Display a person 'card' for each entry i in data array - use a single function for all these
	    			console.log(res.data[i]);
	    		}
	    	}
		});
	}
}

/* Listens for input for people search submission (advanced) */
function loadAdvPeopleSearchListener(){
	var advpeoplesearch = document.getElementById("adv_people_search");

	advpeoplesearch.addEventListener('submit', function(e) {
		e.preventDefault();

		var firstname = this.advfirstpeopletext.value;
		var lastname = this.advlastpeopletext.value;
		var location = this.advlocation.value;
		var radius = this.advradius.value;
		console.log(firstname, lastname, location, radius);
		var data = {"firstName":firstname, "lastName":lastname, "location":location, "radius":radius};


		if(location == "" && (firstname != "" || lastname != "")) {
			$.ajax({
				type: 'get',
	        	url:'/searchPeopleByName',
	        	data: data,
	        	success: function(res) {
	        		console.log("in NameOnly response callback");
	        		for(var i=0; i<res.data.length; i++) {
	        			//SARITA
	        			//TODO: Display a person 'card' for each entry i in data array - use a single function for all these
	        			console.log(res.data[i]);
	        		}
	        	}
	    	});
	    }
	    else if(firstname == "" && lastname == "" && location != "") {
	    	if(radius == "") {
	    		radius = 30;
	    	}
	    	data.radius = radius;
	    	$.ajax({
				type: 'get',
	        	url:'/searchPeopleByLocation',
	        	data: data,
	        	success: function(res) {
	        		console.log("in Location response callback");
	        		for(var i=0; i<res.data.length; i++) {
	        			//SARITA
	        			//TODO: Display a person 'card' for each entry i in data array - use a single function for all these
	        			console.log(res.data[i]);
	        		}
	        	}
	    	});
	    }
	    else if(location != "" && (firstname != "" || lastname != "")) {
	    	if(radius == "") {
	    		radius = 30;
	    	}
	    	data.radius = radius;
	    	$.ajax({
				type: 'get',
	        	url:'/searchPeopleByNameLocation',
	        	data: data,
	        	success: function(res) {
	        		console.log("in NameLocation response callback");
	        		for(var i=0; i<res.data.length; i++) {
	        			//SARITA
	        			//TODO: Display a person 'card' for each entry i in data array - use a single function for all these
	        			console.log(res.data[i]);
	        		}
	        	}
	    	});
	    }
	    //location and both names are blank - go back to default of displaying all people
	    else {
	    	//Call function (to be added) which is also called on page load to display all people
	    	$.ajax({
	    		type: 'get',
	    		url: '/allPeople',
	    		success: function(res) {
	    			console.log("in allPeople response callback");
	    			for(var i=0; i < res.data.length; i++) {
	    				//SARITA
	    				//TODO: Display all people 
	    				console.log(res.data[i]);
	    			}
	    		}
	    	});
	    }
	});
}


/* Listens for input for post search submission (basic) */
function loadPostSearchListener(){
	var postsearch = document.getElementById("post_search");
	console.log("set up");
	postsearch.addEventListener('submit', function(e) {
		console.log("hello");
		e.preventDefault();

		var keyword = this.posttext.value;
		var topic = this.ptopic.value;
		console.log(keyword, topic);

		/* TO DO: BASED ON THESE VALUES, SEND TO BACK END AND GET JSON BACK */
	});
}


/*Listens for input for post search submission (advanced) */
function loadAdvPostSearchListener(){
	var advpostsearch = document.getElementById("adv_post_search");

	advpostsearch.addEventListener('submit', function(e) {
		e.preventDefault();

		var keyword = this.advposttext.value;
		var firstname = this.advfirstposttext.value;
		var lastname = this.advlastposttext.value;
		var topic = this.aptopic.value;
		console.log(keyword, firstname, lastname, topic);

		/* TO DO: BASED ON THESE VALUES, SEND TO BACK END AND GET JSON BACK */
	});
}


/* Listens to buttons wishing to change the search type */
function loadOptionsListener(){
	people.addEventListener("click", function() {
		people.style.borderColor = "#909090";
		jobs.style.borderColor = "transparent";
		startups.style.borderColor = "transparent";
		funding.style.borderColor = "transparent";
		events.style.borderColor = "transparent";
		showPeopleSearch();
		displayPeople("","");
	} );

	jobs.addEventListener("click", function() {
		document.getElementById("adv_post_search").aptopic.value = "jobs";
		document.getElementById("post_search").ptopic.value = "jobs";
		people.style.borderColor = "transparent";
		jobs.style.borderColor = "#909090";
		startups.style.borderColor = "transparent";
		funding.style.borderColor = "transparent";
		events.style.borderColor = "transparent";
		showPostSearch();
		loadPostsByCategory("jobs");
	} );

	startups.addEventListener("click", function() {
		document.getElementById("adv_post_search").aptopic.value = "startups";
		document.getElementById("post_search").ptopic.value = "startups";
		people.style.borderColor = "transparent";
		startups.style.borderColor = "#909090";
		jobs.style.borderColor = "transparent";
		funding.style.borderColor = "transparent";
		events.style.borderColor = "transparent";
		showPostSearch();
		loadPostsByCategory("startups");
	} );

	funding.addEventListener("click", function() {
		document.getElementById("adv_post_search").aptopic.value = "funding";
		document.getElementById("post_search").ptopic.value = "funding";
		people.style.borderColor = "transparent";
		funding.style.borderColor = "#909090";
		startups.style.borderColor = "transparent";
		jobs.style.borderColor = "transparent";
		events.style.borderColor = "transparent";
		showPostSearch();
		loadPostsByCategory("funding");
	} );

	events.addEventListener("click", function() {
		document.getElementById("adv_post_search").aptopic.value = "events";
		document.getElementById("post_search").ptopic.value = "events";
		people.style.borderColor = "transparent";
		events.style.borderColor = "#909090";
		startups.style.borderColor = "transparent";
		funding.style.borderColor = "transparent";
		jobs.style.borderColor = "transparent";
		showPostSearch();
		loadPostsByCategory("events");
	} );
}


/* displays basic post search, resets everything else. */
function showPostSearch(){
	document.getElementById("people_search").style.display = "none";
	document.getElementById("post_search").style.display = "block";
	document.getElementById("adv_people_search").style.display = "none";
	document.getElementById("adv_post_search").style.display = "none";
	postcheckboxunit.style.display = "block";
	peoplecheckbox.checked = false;
	postcheckbox.checked = false;
	peoplecheckboxunit.style.display = "none";
}

/* displays advanced post search, resets everything else. */
function showAdvancedPostSearch(){
	document.getElementById("people_search").style.display = "none";
	document.getElementById("post_search").style.display = "none";
	document.getElementById("adv_people_search").style.display = "none";
	document.getElementById("adv_post_search").style.display = "block";
	postcheckboxunit.style.display = "block";
	peoplecheckboxunit.style.display = "none";
}

/* displays basic people search, resets everything else. */
function showPeopleSearch(){
	document.getElementById("post_search").style.display = "none";
	document.getElementById("people_search").style.display = "block";
	document.getElementById("adv_people_search").style.display = "none";
	document.getElementById("adv_post_search").style.display = "none";
	peoplecheckbox.checked = false;
	peoplecheckboxunit.style.display = "block";
	postcheckbox.checked = false;
	postcheckboxunit.style.display = "none";
}


/* displays advanced people search, resets everything else. */
function showAdvancedPeopleSearch(){
	document.getElementById("post_search").style.display = "none";
	document.getElementById("people_search").style.display = "none";
	document.getElementById("adv_people_search").style.display = "block";
	document.getElementById("adv_post_search").style.display = "none";
	peoplecheckboxunit.style.display = "block";
	postcheckboxunit.style.display = "none";
}
