
var sadira;

window.onload = function(){
    //var shad_script=document.getElementById("shader-xd1");
    
//    alert(JSON.stringify(document.URL));
//    alert(JSON.stringify(window.location.pathname));

    
    var xd1;
    var hostname
    //="ws://192.168.176.103:9999";
    //="ws://192.168.1.134:9999";
    ="ws://localhost:9999";


    sadira=new sadira({ server : hostname, widget_prefix : "widgets", server_prefix : "~fullmoon/XD-1"}, function(error){
	console.log("Error sadira init : " + JSON.stringify(error));
        xd1= new xdone();
	xd1.xdone_init();	
	return;
    }, function(connected){
	console.log("sadira connected to " + hostname);
	xd1= new xdone();
	xd1.xdone_init();
    });
    
}
