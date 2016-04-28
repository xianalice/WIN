window.addEventListener('load', function(){
    alert("here we are");
     setInterval(linkedin, 7000);
});

function linkedin() {
       console.log(IN.User.isAuthorized());
 
}