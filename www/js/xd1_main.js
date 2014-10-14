
var sadira;
var xd1;

window.addEventListener("load", function(){

    if(typeof xd1 != 'undefined') return;


    


    //var shad_script=document.getElementById("shader-xd1");
    //alert(JSON.stringify(document.URL));
    //alert(JSON.stringify(window.location.pathname));

    

//    var hostname
    //="ws://192.168.176.103:9999";
    //="ws://192.168.1.134:9999";
//	="ws://localhost:9999";
//    ="ws://sadira.iasfbo.inaf.it:9999";

    console.log("create template .... ");
    var xd1_tpl = window.xd=tmaster.build_template("xd1"); 

    xd1_tpl.xdone_node=document.getElementById("xdone");
    console.log("create ui .... " + xd1_tpl.xdone_node);
    var xd1_ui= create_ui({},xd1_tpl);
    
    return;
    
    var xd1_tpl = tmaster.build_template("gl_view_2d"); 

    var xd1_opts={ html_node : xdone_node, tpl : xd1_tpl};

    
    
    //var xd1_ui=create_ui({ type: "short", root_classes : [] } , glv_opts);

//    bar_node.appendChild();

    function xd1_setup(){

	
	xd1= new xdone();
	xd1.xdone_init(xd1_opts, function (error){

	    if(error!=null){
		console.log("Error init XD1 : " + error);
		return;
	    }

	    var gl=xd1.gl;

	    var newlayer=xd1_tpl.elements.layers.elements.newlayer;
	    var layer_objects=xd1_tpl.elements.layers;//.elements.layer_objects;

	    var catseye_start=xd1_tpl.elements.demo.elements.catseye;
	    var m42_start=xd1_tpl.elements.demo.elements.M42;
	    
	    newlayer.onclick=function(){
		if(xd1.nlayers<xd1.maxlayers){
		    
		    var layer_opts=tmaster.build_template("gl_image_layer"); 
		    var lay_ui=create_ui({type:"short" }, layer_opts, 0);
		    
		    layer_opts.xd1_attach(xd1, xd1.nlayers);

		    //var lay=new layer(xd1, xd1.nlayers,function(error, l){
			
			// if(error){
			//     console.log("Error ! " + error);
			//     return;
			// }
			
			//var layer_opts = l.layer_opts; 
			
		    layer_opts.container=layer_objects.ui_childs;
		    layer_objects.ui_childs.add_child(layer_opts,lay_ui);
			
		    xd1.layers[xd1.nlayers]=layer_opts;
		    xd1.layer_enabled[xd1.nlayers]=1;
		    var le_loc=gl.getUniformLocation(xd1.program, "u_layer_enabled");
		    gl.uniform4iv(le_loc, xd1.layer_enabled);
		    
		    xd1.nlayers++;
		    xd1.fullscreen(false);
			
		  //  });
		    
		}else alert("Max 4 layers!");
		
	    };
	    
	    function load_mwl_demo(what,nf){
		var img_id=0;
		var d= sadira.dialogs.create_dialog({ handler : "fits.test_get_data", what : what});
		
		d.srz_request=function(dgram, result_cb){
		    
		    console.log("SRZ Request !");
		    
		    var sz=dgram.header.sz;
		    var	w=dgram.header.width;
		    var h=dgram.header.height;
		    
		    console.log("Ready to receive "+sz +" bytes. Image ["+dgram.header.name+"] size will be : " + w + ", " + h + "<br/>");
		    
		    //lay.layer_name=dgram.header.name;
		    
		    var b=new ArrayBuffer(sz);
		    var fvp = new Float32Array(b);
		    //console.log("AB: N= "+ fv.length +" =? "+sz/4+" first elms : " + fv[0] + ", " + fv[1] );
		    var sr=new srz_mem(b);
		    
		    
		    sr.on_chunk=function(dgram){
			//console.log("Fetching data : "+(Math.floor(100*( (dgram.header.cnkid*sr.chunk_size)/sr.sz_data)))+" %");
		    }
		    
		    sr.on_done=function(){
			if(xd1.nlayers<xd1.maxlayers){
			    
			    var l=tmaster.build_template("gl_image_layer"); 
			    var lay_ui=create_ui({type:"short" }, l, 0);
			    l.xd1_attach(xd1, xd1.nlayers);
			    
			    //var lay=new layer(xd1, xd1.nlayers,function(error, l){
			    l.p_values[6]=.25;
			    sr.lay_id=l.lay_id;
			    
			    if(error){
				console.log("Error ! " + error);
				return;
			    }
			    
			    var layer_opts = l.layer_opts; 
			    
			    l.container=layer_objects.ui_childs;
			    layer_objects.ui_childs.add_child(l,lay_ui);
			    
			    var gl=xd1.gl;
			    
			    xd1.layers[xd1.nlayers]=l;
			    xd1.layer_enabled[xd1.nlayers]=1;
			    var le_loc=gl.getUniformLocation(xd1.program, "u_layer_enabled");
			    gl.uniform4iv(le_loc, xd1.layer_enabled);
			    
			    xd1.nlayers++;
			    xd1.fullscreen(false);
			    
			    
			    l.setup_dgram_layer(dgram.header, fvp);
			    //});
			    
			}
		    }
		    
		    
		    result_cb(null, sr);
		    console.log("srz request completed");
		};
		
		d.connect(function(error, init_dgram){
		    if(error){
			console.log("Init data error= " + error + " init datagram = <pre> " + JSON.stringify(init_dgram,null,4)+" </pre><br/>");
		    }
		    else{
			
			//lay.name.innerHTML+="Dialog handshake OK <br/>";
			for(img_id=0;img_id<nf;img_id++)
			    d.send_datagram({type : "get_data", imgid : img_id},null,function(error){
				if(error){
				    dinfo.innerHTML+="ERROR"+error+" <br/>";
				}else{
				    console.log("OK");
				}
				
			    });
		    }
		    
		});
	    }
	    
	    
	    m42_start.onclick=function(){
		load_mwl_demo("M42",2);
	    }
	    
	    catseye_start.onclick=function(){
		load_mwl_demo("catseye",4);
	    }
	});
	
	
    }
    
    sadira=new sadira({ server : hostname, widget_prefix : "widgets", server_prefix : "~fullmoon/XD-1"}, function(error){
	console.log("Error connecting to sadira websocket server ("+ hostname +"): " + JSON.stringify(error) + ", No Problem ! ... ");
	xd1_setup();
	return;
    }, function(connected){
	console.log("Yes! Sadira websocket server connected to " + hostname);
	xd1_setup();
    });
    
});

