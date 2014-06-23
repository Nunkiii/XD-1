var SRZ=require('../sadira/www/js/serializer.js');
//var fits=require("../node-fits/build/Release/fits");
var sbig=require("../../node-sbig/build/Release/sbig");


var cam; 


//var M=new sbig.mat_float();
//M.extend({w : 10, h : 10});

dialog_handlers.sbig = {

    drive : function (dlg, status_cb){
	status_cb();

	function send_info(m){
	    dlg.send_datagram({type : "cam_status", status : m},null,function(error){} );
	}

	dlg.listen("start_camera",function(dgram){
	    
	    if(typeof cam=='undefined')
		cam = new sbig.cam();
	    
	    cam.initialize(function (m){

		dlg.send_datagram({type : "cam_status", status : m},null,function(error){} );
		
	    });
	    
	});


	dlg.listen("start_expo",function(dgram){

	    
	    var expo_counter=0;
	    cam.exptime=dgram.header.exptime;
	    cam.nexpo=dgram.header.nexpo;

	    cam.start_exposure(function (expo_message){


		console.log("expo message : " + JSON.stringify(expo_message));
		
		if(expo_message.started){
		    send_info(expo_message.started);
		    return;
		}
		    
		if(expo_message.new_image){
			
		    var image=cam.last_image_float;
		    
		    send_info("New image ! w= " + image.width() + " h= " + image.height());
		    

	  //image.extend({w : 1024, h : 1024});
		    

		    console.log("extend OK");
		    send_info("Resized w= " + image.width() + " h= " + image.height());

		    //sbig.last_image=img;
		    //fifi.write_image_hdu(img);
		    
		    //if( m instanceof sbig.mat_ushort){
	  
		    image.swapx();
		    image.swapy();
	  
		    var data=image.get_data();

		    console.log("Got data  + " + (typeof data) );


		    console.log("We have the data buffer serializing... SRZ is  " + typeof SRZ);
		    console.log("We have the data buffer serializing... SRZ is  " + typeof SRZ.srz_mem);
		    
		    var srep=new SRZ.srz_mem(data);

		    console.log("Filling header");

		    srep.header={width : image.width(), height: image.height(), name : "SBIG capture"};
		    //srep.header={width : 512, height: 512 };

		    console.log("SRZ configured size= " + srep.size());
		    
		    srep.on_done=function(){
			console.log("Image data sent!");
			//dlg.close();
		    };
		    
		    send_info("serializing...");
		    console.log("serializing...");
		    dlg.srz_initiate(srep, function(error){
			if(error) console.log("SRZ error : " + error);
		    });
		    console.log("serializing call done...");


		}
		    
		if(expo_message.done){
		    console.log("Sending DONE message .... ");
		    send_info(expo_message.done + " --> standby ...");
		    console.log("Sending DONE message .... DONE ");

		    /*
		    cam.shutdown(function (shut_msg){
	    		if(shut_msg.off) reply.info(shut_msg.off + " Ciao !");
			
		    });
		    */
		}
	
		if(expo_message.error){		
		    console.log("EXPO ERROR!");
		    send_info(expo_message.error + "");
		}


		if(expo_message.expo_complete){		
		    send_info(expo_message.expo_complete);
		}

		if(expo_message.grab_complete){		
		    send_info(expo_message.grab_complete);
		}
		
	    });
	    
	    //send_info("After start exposure...");
	    
	});
	

	
	//dlg.send_datagram({type : "tags", tags: multi_files}, null, function(error){});

/*
	dlg.listen("get_data", function(dgram){



	});

*/
	    
    }
    
}