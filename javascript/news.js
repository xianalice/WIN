var loggedin = true;

window.addEventListener('load', function(){
    console.log("news html loaded")
});

function searchPeople() {
	var search = document.getElementById("search").value;
	console.log("value of search is " + search);
	$.post({
        url:'/searchPeople',
        data: search,
        success: function(res) {
            document.location.href = res.redirect;
        }
    }
    );
}
