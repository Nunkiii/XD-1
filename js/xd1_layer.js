/*
  
  XD1  - LAYER CLASS
  
*/


function layer(xd, id,update_shader_cb, update_cmap_cb){
    
    var lay=this;
    var gl=xd.gl;

    this.xd=xd;
    this.id=id;

    var div=this.div=document.createElement("div"); 
    div.className="layer";
    
    
    this.layer_head=document.createElement("nav");
    this.layer_head.className="layer_head";
    div.appendChild(this.layer_head);

    var layer_menu=this.layer_head; //.appendChild(document.createElement("ul"));
    layer_menu.frames=[];

    layer_menu.select_frame=function(f){
	if(typeof this.selected_frame!='undefined')
	    this.selected_frame.div.style.display='none';
	f.div.style.display='block';
	this.selected_frame=f;
	return f;
    }

    layer_menu.add_frame=function(title){
	var lm=this;
	var li=this.appendChild(document.createElement("li"));
	li.innerHTML=title;
	li.div=div.appendChild(document.createElement("div"));
	li.div.className="layer_section";
	li.div.style.display='none';
	this.frames.push(li);
	
	li.onclick=function(){
	    console.log("Click!!");
	    lm.select_frame(this); xd.fullscreen(false);
	}
	if(this.frames.length==1) this.select_frame(li);

	return li;
    }

    var source_div=layer_menu.add_frame("Data source").div;
    var settings_div=layer_menu.add_frame("Image settings").div;

    this.source_head=document.createElement("nav");
    this.source_head.className="source_head";
    source_div.appendChild(this.source_head);

    var source_menu=this.source_head; //.appendChild(document.createElement("ul"));
    source_menu.frames=[];

    source_menu.select_frame=function(f){
	if(typeof this.selected_frame!='undefined')
	    this.selected_frame.div.style.display='none';
	f.div.style.display='block';
	this.selected_frame=f;
	return f;
    }

    source_menu.add_frame=function(title){
	var lm=this;
	var li=this.appendChild(document.createElement("li"));
	li.innerHTML=title;
	li.div=source_div.appendChild(document.createElement("div"));
	li.div.className="source_section";
	li.div.style.display='none';
	this.frames.push(li);
	
	li.onclick=function(){
	    lm.select_frame(this); xd.fullscreen(false);
	}
	if(this.frames.length==1) this.select_frame(li);

	return li;
    }


    var fits_source = source_menu.add_frame("Local FITS");
    var cam_source = source_menu.add_frame("Camera control");
    var db_source = source_menu.add_frame("DB Browser");




    //lay.name.innerHTML="Layer " + lay.id + "";

    this.p_values=def_parameters[id];
    this.rotcenter=[0,0];
    

//    cmap_el.appendChild(div);



    var prms ={
	lc : { ui: document.createElement("input"),cap :"Low cut",id : 0,row : 0,cs:1 },
	hc : { ui:document.createElement("input"),cap:"High cut",id : 1,row : 0,cs:1},
	tx : { ui:document.createElement("input"),cap:"Tr X",id : 2,row : 0,cs:1},
	ty : { ui:document.createElement("input"),cap:"Tr Y",id : 3,row : 0,cs:1},
	zm : { ui:document.createElement("input"),cap:"Scale",id : 4,row : 1,cs:1},
	rx : { ui:document.createElement("input"),cap:"RotCenterX",id : -1,row : 1,cs:1, 
	       onchange : function(ui){
		   var rc_loc=gl.getUniformLocation(xd.program, "u_rotcenters");
		   
		   xd.p_rotcenters[2*lay.id]=ui.value;
		   console.log("Setting rotcenter for layer " + lay.id + " : " + JSON.stringify(xd.p_rotcenters));
		   gl.uniform2fv(rc_loc, xd.p_rotcenters);
		   xd.render();
	       },
	       set_value : function(ui){
		   ui.value=lay.rotcenter[0];
	       }},
	ry : { ui:document.createElement("input"),cap:"RotCenterY",id : -1,row : 1,cs:1, 
	       onchange : function(ui){
		   var rc_loc=gl.getUniformLocation(xd.program, "u_rotcenters");
		   
		   xd.p_rotcenters[2*lay.id+1]=ui.value;
		   //console.log("Setting parms for layer " + layer_id + " : " + JSON.stringify(p_vals));
		   gl.uniform2fv(rc_loc, xd.p_rotcenters);
		   xd.render();		   
	       },
	       set_value : function(ui){
		   ui.value=lay.rotcenter[1];
	       }},
	ag : { ui:document.createElement("input"),cap:"Angle",id : 5,row : 1,cs:1},
	lu : { ui:document.createElement("input"),cap:"Luminosity",id : 6,row : 2,cs:3}
    };

    
    
    prms.lu.ui.type="range";
    prms.lu.ui.min=0.0;
    prms.lu.ui.max=1.0;
    prms.lu.ui.step=0.01;
    prms.lu.ui.value=1.0;
    
    prms.lc.ui.type="number";
    prms.hc.ui.type="number";

    prms.lc.ui.step="10";
    prms.lc.ui.min="-65535";
    prms.lc.ui.max="65535";

    prms.hc.ui.step="10";
    prms.hc.ui.min="-65535";
    prms.hc.ui.max="65535";

    prms.tx.ui.type="number";
    prms.ty.ui.type="number";
    
    prms.tx.ui.min="-8192";
    prms.tx.ui.max="8192";

    prms.ty.ui.min="-8192";
    prms.ty.ui.max="8192";

    prms.rx.ui.type="number";
    prms.ry.ui.type="number";
    prms.rx.ui.min="-100";
    prms.rx.ui.max="100";
    prms.ry.ui.min="-100";
    prms.ry.ui.max="100";

    prms.zm.ui.type="number";
    prms.zm.ui.step=.05;
    prms.zm.ui.min="0.000001";
    prms.zm.ui.max="1000";

    prms.ag.ui.type="number";
    prms.ag.ui.step=.05;
    prms.ag.ui.min="-100";
    prms.ag.ui.max="100";

    var cmap=this.cmap=new colormap();  
    
    //var cmap_data=cmap.json_colormap();


    var hzoom_but=document.createElement("button");
    var hreset_but=document.createElement("button");
    
    
    var canvas_info  = document.getElementById('canvas_info');
    var x_domain=null;
    var brush=null;
    var nbins=512;


    var bsize=null; 

    //    var x_domain_full=null; //[low+.5*bsize,low+(nbins-.5)*bsize];

    hzoom_but.onclick=function(){
	x_domain = [brush.extent()[0],brush.extent()[1]];//
	compute_histogram(x_domain[0],x_domain[1]);
	draw_histogram();
    }
    

    function reset_histogram(){

	var low=lay.ext[0];
	var high=lay.ext[1];

	x_domain=[low+.5*bsize,low+(nbins-.5)*bsize];
	console.log("X DOM " + x_domain[0] + ", " + x_domain[1]);
	bsize=(high-low)/nbins;
	compute_histogram(x_domain[0],x_domain[1]);
	draw_histogram();
    }
    
    hreset_but.onclick=function(){
	console.log("Clicked!!");
	reset_histogram();
    }
    
    
    
    // [0, //low cut
    // 		  15.0, //high cut
    // 		  0, //Tx
    // 		  0, //Ty
    // 		  1.0, //Scale
    // 		  0, //Rot
    // 		  1.0, //Luminosity
    // 		  0
    // 		 ];
    




    this.pointer_info  = document.createElement('div');
    this.pointer_info.className="pointer_info";

    this.width=0;
    this.height=0;

    this.g_tr=[0,0];
    this.g_mrot=[[1,0],[0,1]];
    this.g_screen_center=[0,0];
    this.g_scale=1.0;

    
    var tab=document.createElement("table");
    settings_div.appendChild(tab);
    
    var th=[document.createElement("tr"),document.createElement("tr"),document.createElement("tr")];
    var tre=[document.createElement("tr"),
	     document.createElement("tr"),
	     document.createElement("tr"),
	     document.createElement("tr"),
	     document.createElement("tr"),
	     document.createElement("tr")];

    tab.appendChild(th[0]);
    tab.appendChild(tre[0]);
    tab.appendChild(th[1]);
    tab.appendChild(tre[1]);
    tab.appendChild(th[2]);
    tab.appendChild(tre[2]);
    tab.appendChild(tre[3]);
    tab.appendChild(tre[4]);
    tab.appendChild(tre[5]);
    
    var cap=document.createElement("td"); 
    cap.innerHTML="Color segment";
    cap.colSpan="3";
    th[2].appendChild(cap);
    
    var cap=document.createElement("td"); 
    cap.colSpan="3";
    cap.appendChild(cmap.colornode);
    tre[2].appendChild(cap);
    
    var cmt=document.createElement("td");
    cmt.colSpan="6";
    cmt.appendChild(cmap.domnode);
    tre[3].appendChild(cmt);
    
    for(var p in prms){
	var cap=document.createElement("td"); 
	cap.colSpan=prms[p].cs;
	cap.innerHTML=prms[p].cap;
	th[prms[p].row].appendChild(cap);
    }
    
    for(var p in prms){
	var td=document.createElement("td");
	td.colSpan=prms[p].cs;
	var ui=prms[p].ui;
	var id=prms[p].id;
	td.appendChild(ui);
	
	tre[prms[p].row].appendChild(td);

	if(id>=0)
	    ui.value=lay.p_values[id];
	else
	    ui.value=prms[p].set_value(ui);

	ui.layer=lay;
	ui.id=id;
	ui.prm=prms[p];
	
	if(typeof prms[p].onchange == 'undefined')
	    ui.onchange=function(){
		//console.log("Change pvals[" + this.layer.id + "]["+this.id+"]=" + this.value);
		lay.p_values[this.id]=this.value;
		update_pvalues();	    
	    //update_shader_cb(this.layer.lay.p_values, this.layer.id);
	    }; 
	else{
	    
	    ui.onchange=function(){
		this.prm.onchange(this);
	    }
	}
	
	//ui.onchange();
	//update_shader_cb(this.lay.p_values, lay.id);
    }
    
    update_pvalues();	    
    
    lay.htd=document.createElement("td");
    lay.htd.colSpan="6";
    //htd.style.backgroundColor="white";
    tre[4].appendChild(lay.htd);
    
    
    var tdzoom=document.createElement("td");
    var tdreset=document.createElement("td");
    tdzoom.colSpan="3";
    tdreset.colSpan="3";
    tre[5].appendChild(tdzoom);
    tre[5].appendChild(tdreset);
    
    tdzoom.appendChild(hzoom_but);
    tdreset.appendChild(hreset_but);
    
    hzoom_but.innerHTML="Zoom in selection";
    hreset_but.innerHTML="Reset histogram";

    cmap.update_callback=function(){
	
	var cmap_data=cmap.json_colormap();
	//console.log("Update CB cmap.... " + JSON.stringify(cmap_data));
	xd.ncolors[lay.id]=cmap_data.length;
	
	var of=128*4*lay.id;
	for(var cmi=0;cmi<cmap_data.length;cmi++){
	    var c=cmap_data[cmi];
	    for(var k=0;k<4;k++)
		xd.cmap_texdata[of+4*cmi+k]=c[k];
	    xd.cmap_fracdata[of+4*cmi]=c[4];
	}

	for(var cmi=cmap_data.length;cmi<128;cmi++){
	    for(var k=0;k<4;k++)
		xd.cmap_texdata[of+4*cmi+k]=-1.0;
	    xd.cmap_fracdata[of+4*cmi]=-1;
	}
	
	// for(var k=0;k<4;k++){
	//     console.log("Layer " + k + " nc=" + ncolors[k] );
	//     for(var cmi=0;cmi<ncolors[k];cmi++){
	// 	console.log("L"+k+" C"+cmi + "=" + cmap_texdata[k*128*4+cmi*4]+","+ cmap_texdata[k*128*4+cmi*4+1]+","+ cmap_texdata[k*128*4+cmi*4+2]+","+ cmap_texdata[k*128*4+cmi*4+3]+"" );
	//     }
	// }
	
	//console.log("NCOLORS="+JSON.stringify(ncolors));
	var ncolors_loc = gl.getUniformLocation(xd.program, "u_ncolors");
	gl.uniform4iv(ncolors_loc, xd.ncolors);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, xd.cmap_texture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 4, 0, gl.RGBA, gl.FLOAT, xd.cmap_texdata);
	gl.uniform1i(gl.getUniformLocation(xd.program, "u_cmap_colors"), 1);
	
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, xd.cmap_frac);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128,4, 0, gl.RGBA, gl.FLOAT, xd.cmap_fracdata);
	gl.uniform1i(gl.getUniformLocation(xd.program, "u_cmap_fracs"), 2);
	
	
	xd.render();
	
	//console.log("Update colormap for layer "+lay.id + "cm="+JSON.stringify(xd.cmap_fracdata) + " OK" );
	
    }
    


    function init_cam_source() {

	var table=document.createElement("table");
	var tr1=table.appendChild(document.createElement("tr"));
	var tr2=table.appendChild(document.createElement("tr"));
	var tr3=table.appendChild(document.createElement("tr"));
	

	var dialog_button = document.createElement("button");	
	var start_stop_button = document.createElement("button");	
	var exptime = document.createElement("input");
	var status = document.createElement("div");
	status.style.overflow="scroll";


	exptime.type="number";
	exptime.value=1.0;
	exptime.step=1.0;
	exptime.min=0.000;
	exptime.max=10000;
	
	var nexpo = document.createElement("input");

	nexpo.type="number";
	nexpo.value=1;
	nexpo.step=1;
	nexpo.min=0;
	nexpo.max=100;
	
	var start_expo = document.createElement("button");
	var camera_status = document.createElement("div");
	//camera_status.style.overflow="scroll";	
	camera_status.className="camera_status";
	
	dialog_button.innerHTML="Start ws dialog";
	start_stop_button.innerHTML="Start camera";
	start_expo.innerHTML="Start exposure";
	
	cam_source.div.appendChild(table);
	cam_source.div.appendChild(status);
	var td;
	
	td=tr1.appendChild(document.createElement("td"));
	td.appendChild(dialog_button);
	td.appendChild(start_stop_button);

	td=tr1.appendChild(document.createElement("td"));
	td.appendChild(camera_status);


	td=tr2.appendChild(document.createElement("th"));
	td.innerHTML="Expo time(s)";
	td=tr2.appendChild(document.createElement("th"));
	td.innerHTML="Nexpo";

	td=tr3.appendChild(document.createElement("td"));
	td.appendChild(exptime);
	td=tr3.appendChild(document.createElement("td"));
	td.appendChild(nexpo);
	td=tr3.appendChild(document.createElement("td"));
	td.appendChild(start_expo);
	
	//camera_status.innerHTML="Not connected";
	
	dialog_button.onclick=function(){
	    
	    var d= xd.sadira.dialogs.create_dialog({ handler : "sbig.drive"});
	    
	    d.listen("cam_status", function(dgram){
		var m=dgram.header.status;
		
		camera_status.innerHTML+=JSON.stringify(m)+"<br/>";
	        camera_status.scrollTop = camera_status.scrollHeight;

		if(m.ready) {
		    
		    start_expo.onclick=function(){
			d.send_datagram({ type : "start_expo", exptime : exptime.value, nexpo : nexpo.value },null,function(error){} );
		    }
		    
		}
		if(m.info) {
		    
		}
		if(m.error){
		}
		
	    });
	    
	    d.lay_id=this.id;

	    d.srz_request=function(dgram,  calb){
		console.log("SRZ req called...");

		var w=lay.width = dgram.header.width;
		var h=lay.height =dgram.header.height;
		
		var sz=dgram.header.sz;
		
		console.log("Ready to receive "+sz +" bytes. Image ["+dgram.header.name+"] size will be : " + w + ", " + h);
		status.innerHTML+="Ready to receive "+sz +" bytes. Image ["+dgram.header.name+"] size will be : " + w + ", " + h;
      
		setup_bbig(w,h);
		
		// if(bbig==null){
		
		// 	sz=dgram.header.sz;
		// 	w=
		// 	h=
		
	    // 	bbig=new ArrayBuffer(4*sz);
		// 	fv = new Float32Array(bbig);
	    // 	for(var i=0;i<fv.length/4;i++){
		// 	    fv[4*i]=0.0;
		// 	    fv[4*i+1]=0.0;
		// 	    fv[4*i+2]=0.0;
		// 	    fv[4*i+3]=1.0;
	    // 	}
		// }
		
		status.innerHTML+=dgram.header.name;

		console.log("X");
		var b=new ArrayBuffer(sz);
		console.log("X");
		var fvp = new Float32Array(b);
		//console.log("AB: = "+ fv.length +" =? "+sz/4+" first elms : " + fv[0] + ", " + fv[1] );
		var sr=new srz_mem(b);

		lay.arr=fvp;
		sr.lay_id=d.lay_id;
		
		console.log("X");

		sr.on_chunk=function(dgram){
		    //console.log("Fetching data chunk...");
		    status.innerHTML="Fetching data for " + dgram.header.name +
	    		" : "+(Math.floor(100*( (dgram.header.cnkid*sr.chunk_size)/sr.sz_data)))+" %";
		}

		console.log("XXX w,h = " + w + ", " + h);
		
		sr.on_done=function(){

		    console.log("Fetch image done !");

		    var lid=lay.id;
		    var fv=xd.fv;
		    var min=1e20,max=-1e20;
		    
		    var rangeLocation = gl.getUniformLocation(xd.program, "u_layer_range");
		    
		    xd.p_layer_range[2*lid]=1.0;//w*1.0/w;
		    xd.p_layer_range[2*lid+1]=1.0;//h*1.0/h;
		    
		    gl.uniform2fv(rangeLocation, xd.p_layer_range);
		    var fv=xd.fv;
		    console.log("Filling texture ("+xd.w+","+xd.h+") with image ("+w +","+h+")"  );
		    for(var i=0;i<h;i++){
			for(var j=0;j<w;j++){
			    var v=fvp[i*w+j]*1.0;
			    fv[4*(i*xd.w+j)+lid]=1.0*v;
			    if(v>max)max=v; else if(v<min)min=v;
			}
		    }

		    console.log("Setting up layer data...");
		    lay.ext=[min,max];
		    setup_layer_data();
		    
		};

		console.log("XXX");

		console.log("calling cb");
		calb(null, sr);
		console.log("calling cb done");
	    };
	    

	    d.connect(function(error, init_dgram){
		if(error)
		    status.innerHTML+="Init data error= " + error + " init datagram = <pre> " + JSON.stringify(init_dgram,null,4)+" </pre><br/>";
		else{
		    
		    status.innerHTML+="Dialog handshake OK <br/>";
		    
		    
		    start_stop_button.onclick=function(){
			
			d.send_datagram({type : "start_camera"},null,function(error){
			    
			    if(error){
				camera_status.innerHTML+="ERROR"+error+" <br/>";
				camera_status.scrollTop = camera_status.scrollHeight;
			    }
			});
			
		    }
		
		}
		
		
	    }); 
	    
	};	
	
    }
    

    function setup_bbig(w, h){
	if(xd.bbig==null){
	    
	    var p2w=1,p2h=1;
	    while(p2w < w) p2w*=2;
	    while(p2h < h) p2h*=2;
	    
	    var w=xd.w=p2w;
	    var h=xd.h=p2h;
	    
	    canvas_info.innerHTML="GL texture ("+ w + ", " + h + ")";
	    
	    xd.bbig=new ArrayBuffer(4*4*w*h);
	    var fv=xd.fv = new Float32Array(xd.bbig);
	    for(var i=0;i<fv.length/4;i++){
		fv[4*i]=0.0;
		fv[4*i+1]=0.0;
		fv[4*i+2]=1.0;
		fv[4*i+3]=1.0;
	    }
	    
	    var resolutionLocation = gl.getUniformLocation(xd.program, "u_resolution");
	    gl.uniform2f(resolutionLocation, w, h);
	}
	
    }
    
    function init_fits_source() {
	
	var file_input=document.createElement("input");
	
	file_input.type="file";

	fits_source.div.innerHTML+="Choose a FITS file : ";
	fits_source.div.appendChild(file_input);
	fits_source.div.appendChild(document.createElement("output"));
	var image_info=document.createElement("div");
	image_info.className="image_info";
	fits_source.div.appendChild(image_info);
	
	var FITS = astro.FITS;
	// Define a callback function for when the FITS file is received
	var callback = function() {
	    // Get the first header-dataunit containing a dataunit
	    var hdu = this.getHDU();
	    // Get the first header
	    var header = hdu.header;
	    // Read a card from the header
	    var bitpix = header.get('BITPIX');
	    // Get the dataunit object
	    var dataunit = hdu.data;
	    console.log("FITS OK "+dataunit);
	    
	    var opts={ dataunit : dataunit };
	    
	    // Get pixels representing the image and pass callback with options
	    dataunit.getFrame(0, function(arr, opts){// Get dataunit, width, and height from options
		var dataunit = opts.dataunit;
		var w=lay.width = dataunit.width;
		var h=lay.height = dataunit.height;
		
		// Get the minimum and maximum pixels
		var extent = dataunit.getExtent(arr);
		
		
		console.log("Frame read : D=("+lay.width+","+lay.height+")  externt " + extent[0] + "," + extent[1]);
		image_info.innerHTML="Dims : ("+lay.width+", "+lay.height+")";

		lay.arr=arr;
		lay.ext=extent;

		setup_bbig(w,h);

		
		var id=lay.id;
		
		console.log("Filling big array with layer  " + id + " : " + w + ", " + h + " global dims " + w + ", "+h);
		
		var rangeLocation = gl.getUniformLocation(xd.program, "u_layer_range");
		xd.p_layer_range[2*id]=w*1.0/w;
		xd.p_layer_range[2*id+1]=h*1.0/h;
		
		gl.uniform2fv(rangeLocation, xd.p_layer_range);
		var fv=xd.fv;
		
		for(var i=0;i<h;i++){
		    for(var j=0;j<w;j++){
			fv[4*(i*xd.w+j)+id]=1.0*arr[i*w+j];
		    }
		}
		
		//lay.opts=opts;
		//console.log("Opts: " + JSON.stringify(lay.opts));
		setup_layer_data();
		
		
//		result_cb(null, { w : lay.width, h : lay.height, arr : arr, ext : extent});
		
		
	    }, opts);
	    
	    // Do some wicked client side processing ...
	}
	
	var FITS=astro.FITS;
	
	file_input.addEventListener('change', function (evt){
	    
	    var file = evt.target.files[0]; // FileList object
	    var fits = new FITS(file, callback);
	}, false);
	
	
    }

    //dinfo.innerHTML+="Requesting image binary data...<br/>";
    
    function draw_histogram(){
	
	var margin = {top: 0, right: 10, bottom: 30, left: 50};
	var width = 350 - margin.left - margin.right;
	var height = 150- margin.top - margin.bottom;
	var brg=null;
	var xmarg, xw, ymarg;
	var svg;

	var x = d3.scale.linear()//d3.time.scale()
	    .range([0, width]);
	
	var y = d3.scale.sqrt()
	    .range([height, 0]);
	
	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");
	
	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .ticks(5);
	
	brush = d3.svg.brush()
	    .x(x)
	    .on("brushend", brushed);
	
	var area = d3.svg.area()
	    .interpolate("step-before")
	    .x(function(d) { return x(d.x); })
	    .y0(height)
	    .y1(function(d) { return y(d.n); });
	
	
	lay.htd.innerHTML="";
	var bn=d3.select(lay.htd);
	//d3.select("svg").remove();

	svg = bn.append('svg'); //document.createElement("svg");
	
	//console.log('got the shit ' + bn + ' the svg ' + svg);
	//base_node.appendChild(svg.ownerSVGElement);
	
	svg.attr("width", width + margin.left + margin.right);
	svg.attr("height", height + margin.top + margin.bottom);
	
	// .append("g")
	// .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	context = svg.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	
	var histo=lay.histo;
	if(x_domain==null){
	    x_domain=[histo[0].x*1.0,histo[histo.length-1].x*1.0];
	}
	
	x.domain(x_domain);//
	//x.domain([fv.viewer_cuts[0],fv.viewer_cuts[1]]);
	y.domain(d3.extent(lay.histo, function(d) { return d.n; }));
	
	
	
	var xsvg = context.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);
	
	
	xmarg=margin.left; //this.getBBox().x;
	ymarg=margin.top; //this.getBBox().x;
	
	xsvg.each(function(){
	    //	 console.log("XAXIS: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	    xw=this.getBBox().width;
	});	       
	
	
	var ysvg=context.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	    .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("Number of pixels");
	
	// ysvg.each(function(){
	// 		 console.log("YAXIS: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	// 	     });	       
	
	var pathsvg=context.append("path")
	    .datum(lay.histo)
	    .attr("class", "line")
	//.attr("d", line);
	    .attr("d", area);
	
	// pathsvg.each(function(){
	// 		    console.log("PATH: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	// 		});
	
	
	/*
	  fv.cmap.domnode.style.marginLeft=(xmarg-2.0)+'px';
	  fv.cmap.domnode.style.width=(xw+0.0)+'px';
	  fv.cmap.domnode.style.height=(50+0.0)+'px';
	  fv.cmap.domnode.style.marginTop='-10px';
	*/	       
	
	// cmap.display();
	
	var height2=height;
	
	brg=context.append("g")
	    .attr("class", "brush")
	    .call(brush);
	
	brg.selectAll("rect")
	    .attr("y", -6)
	    .attr("height", height2 + 7);
	
	brg.selectAll(".resize").append("path").attr("d", resizePath);
	
	//			   
	
	
	//base_node.appendChild(fv.cmap.domnode);
	
	
	//		   brush.extent([data[0].pixvalue*1.0,data[data.length-1].pixvalue*1.0]);
	brush.extent(x_domain);//[fv.viewer_cuts[0],fv.viewer_cuts[1]]);
	
	
	

	
	function resizePath(d) {
	    var e = +(d == "e"),
	    x = e ? 1 : -1,
	    y = height / 3;
	    
	    //brushed();
	    //x+=xmarg;
	    
	    return "M" + (.5 * x) + "," + y
		+ "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
		+ "V" + (2 * y - 6)
		+ "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
		+ "Z"
		+ "M" + (2.5 * x) + "," + (y + 8)
		+ "V" + (2 * y - 8)
		+ "M" + (4.5 * x) + "," + (y + 8)
		+ "V" + (2 * y - 8);
	    
	    
	}
	
	
	
	//brush.extent([2000,4000]);
	//svg.select(".brush").call(brush);		   
	brushed();
	//
	//ready_function();
 	//brush(context);
	
	//$('#bottom_space')[0].innerHTML='<br/><br/>The End!<br/>';
	
	//   brush.extent([0.2, 0.8]);
	//  svg.select(".brush").call(brush);		   
	
	// var gBrush = g.append("g").attr("class", "brush").call(brush);
	// gBrush.selectAll("rect").attr("height", height);
	// gBrush.selectAll(".resize").append("path").attr("d", resizePath);
	
	function brushed() {
	    
	    // brush.extent();
	    
	    //	console.log("Helllo ! " );
	    prms.lc.ui.value=lay.p_values[0]=brush.extent()[0];
	    prms.hc.ui.value=lay.p_values[1]=brush.extent()[1];
	    
	    //console.log("Hello " + lay.p_values[0] + ","+lay.p_values[1]);
	    update_pvalues();
	    //low_cut.value=fv.viewer_cuts[0];
	    //high_cut.value=fv.viewer_cuts[1];
	    
	    
	    svg.select(".brush").call(brush);
	    
	    
	    if(brg!=null){
		
		
		//cmap.domnode.style.width=(brg[1].getBBox().width+0.0)+'px';
		//cmap.domnode.style.marginLeft=(brg[1].getBBox().x+xmarg)+'px';
		

		var bid=0;
		
		brg.selectAll("rect").each(function(){
		    
		    // brg.each(function(){
		    //console.log("BRUSH "+bid+": x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
		    if(bid==1){
			cmap.domnode.style.width=(this.getBBox().width+0.0)+'px';
			cmap.domnode.style.marginLeft=(this.getBBox().x+xmarg)+'px';
			
		    }
		    bid++;
		    
		});	       	
		
	    }else
		console.log("brg is NULL !");
	    
	    //	    fv.cmap.display();
	    
	}
    }
    
    
    function compute_histogram(low, high){
	

	var bsize=(high-low)/nbins;
	
	var data=lay.arr;
	var dl=data.length;
	var histo=lay.histo=[];
	

	for(var i=0;i<nbins;i++){
	    histo[i]={x: low+(i+.5)*bsize, n:0};
	}
	
	console.log("Data bounds : " + lay.ext[0] + ", " + lay.ext[1], " bin size = " + bsize);
	
	
	for(var i=0;i<dl;i++){
	    var v=data[i];
	    if(v>=low&&v<=high){
		var bid=Math.floor( (v-low)/bsize);
		if(bid>=0&&bid<nbins)
		    histo[bid].n++; 
	    }
	}
	
	//console.log("Histo : " + JSON.stringify(lay.histo));
	
    }  

    
    function update_pvalues(){
	var pv_loc=gl.getUniformLocation(xd.program, "u_pvals");
	for(var p=0; p<8;p++) xd.p_vals[lay.id*8+p]=lay.p_values[p];
	//console.log("Setting parms for layer " + layer_id + " : " + JSON.stringify(p_vals));
	gl.uniform4fv(pv_loc, xd.p_vals);
	prms.zm.ui.step=prms.zm.ui.value/10.0;
	//lay.update_geometry();
	xd.render();
    }

    
    function setup_layer_data(){
	
	var w=xd.w;
	var h=xd.h;

	console.log("Setting up layer " + lay.id + "... " + w + ", " + h);
	
	lay.p_values[0]=lay.ext[0];
	lay.p_values[1]=lay.ext[1];
	
	//x_domain_full=[lay.p_values[0]+.5*bsize,lay.p_values[0]+(nbins-.5)*bsize];
	compute_histogram(lay.p_values[0],lay.p_values[1]);
	
	//if(bsize==null)
	bsize=(lay.p_values[1]-lay.p_values[0])/nbins;

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, xd.texture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.FLOAT, xd.fv);
	gl.uniform1i(gl.getUniformLocation(xd.program, "u_image"), 0);
	
	reset_histogram();
	
	cmap.create_colors(def_colormaps[lay.id]);
	//cmap.last.insert_color([0.0,0.4,0.0,1.0], 0.5);
	cmap.select_element(cmap.elements[cmap.elements.length-1]);
	cmap.display();
	
	xd.fullscreen(false);

	
    }
    
    
    
    // if(opts.source=="sadira"){
    
    //   var d= sadira.dialogs.create_dialog({ handler : "fits.test_get_data"});
    
    //   //var image_data;
    //   d.lay_id=this.id;
    
    //   d.srz_request=function(dgram, result_cb){
    
    //     if(bbig==null){
    
    // 	sz=dgram.header.sz;
    // 	w=dgram.header.width;
    // 	h=dgram.header.height;
    
    // 	bbig=new ArrayBuffer(4*sz);
    // 	fv = new Float32Array(bbig);
    // 	for(var i=0;i<fv.length/4;i++){
    // 	  fv[4*i]=0.0;
    // 	  fv[4*i+1]=0.0;
    // 	  fv[4*i+2]=0.0;
    // 	  fv[4*i+3]=1.0;
    // 	}
    //     }
    
    //     lay.layer_name=dgram.header.name;
    //     dinfo.innerHTML+="Ready to receive "+sz +" bytes. Image ["+dgram.header.name+"] size will be : " + w + ", " + h + "<br/>";
    
    //     var b=new ArrayBuffer(sz);
    //     var fvp = new Float32Array(b);


    //     console.log("AB: N= "+ fv.length +" =? "+sz/4+" first elms : " + fv[0] + ", " + fv[1] );
    //     var sr=new srz_mem(b);
    //     sr.lay_id=d.lay_id;
    
    //     sr.on_chunk=function(dgram){
    // 	lay.name.innerHTML="Fetching data "+
    // 	    		   " : "+(Math.floor(100*( (dgram.header.cnkid*sr.chunk_size)/sr.sz_data)))+" %";
    //     }
    
    //     sr.on_done=function(){
    // 	  var lid=sr.lay_id;
    
    // 	  //test_webclgl(fvp);
    
    

    // 	  for(var i=0;i<fvp.length;i++){
    // 	    fv[4*i+lid]=fvp[i];
    // 	  // fv[4*i+1]=0;
    // 	  // fv[4*i+2]=0;
    // 	  // fv[4*i+3]=0;
    // 	  // console.log("v="+fvp[i]);
    // 	}
    // 	setup_layer_data(fv);
    //     };

    //     result_cb(null, sr);

    //   };
    
    //   d.connect(function(error, init_dgram){
    //     if(error)
    //     dinfo.innerHTML+="Init data error= " + error + " init datagram = <pre> " + JSON.stringify(init_dgram,null,4)+" </pre><br/>";
    
    //     else{
    
    // 	lay.name.innerHTML+="Dialog handshake OK <br/>";
    
    // 	d.send_datagram({type : "get_data", imgid : lay.id},null,function(error){
    // 	  if(error){
    // 	    dinfo.innerHTML+="ERROR"+error+" <br/>";
    // 	  }
    
    // 	});
    //     }
    
    //   });
    // }
    

    
    
    init_fits_source();
    init_cam_source();

    xd.display_layer_ui(this);
	
    
    

    //var cuts=[0,2]; //pv[0] 0,1
    //var tr=[0,0]; //pv[0] 2,3
    //var zoom=1.0; //pv[1] 0
    //var angle=0.0;//pv[1] 1


    /*
      var cuts_loc = gl.getUniformLocation(program, "u_cuts");
      var zoom_loc=gl.getUniformLocation(program, "u_zoom");
      var angle_loc=gl.getUniformLocation(program, "u_angle");
      var tr_loc=gl.getUniformLocation(program, "u_tr");
      gl.uniform2f(cuts_loc, cuts[0], cuts[1]);
      gl.uniform2f(tr_loc, tr[0], tr[1]);
      gl.uniform1f(angle_loc, angle);
      gl.uniform1f(zoom_loc, zoom );
    */
}



layer.prototype.update_geometry=  function (){
    var xd=this.xd;

    var alpha_l=-1.0*this.p_values[5];
    var alpha=-1.0*xd.angle;

    this.g_scale=1.0*this.p_values[4]*xd.zoom;
    this.g_tr=[xd.tr[0]+1.0*this.p_values[2],xd.tr[1]+1.0*this.p_values[3]];
    this.g_mrot=numeric.dot([[Math.cos(alpha_l),Math.sin(alpha_l)],
			     [-1.0*Math.sin(alpha_l),Math.cos(alpha_l)]],
			    [[Math.cos(alpha),Math.sin(alpha)],
			     [-1.0*Math.sin(alpha),1.0*Math.cos(alpha)]]);
    this.g_screen_center=[xd.canvas.width/2.0, xd.canvas.height/2.0];
    //console.log("ROT = " + JSON.stringify(this.g_mrot) + "TR " + JSON.stringify(tr)+ "TR " + JSON.stringify(this.g_tr) + " scale " + this.g_scale);

}
layer.prototype.get_image_pixel= function(screen_pixel) {
    var ipix=[
	screen_pixel[0]-this.g_screen_center[0]+this.g_tr[0]*this.g_scale,
	screen_pixel[1]-this.g_screen_center[1]+this.g_tr[1]*this.g_scale
    ];
    
    ipix= numeric.dot(this.g_mrot,ipix);
    
    ipix[0]=(ipix[0]/this.g_scale+this.width/2.0);
    ipix[1]=(ipix[1]/this.g_scale+this.height/2.0);
//    console.log("P="+JSON.stringify(ipix));
    return ipix;
}

layer.prototype.update_pointer_info=function(screen_pixel){
    if(typeof this.opts=='undefined') return;

    var ipix=this.get_image_pixel(screen_pixel);
    if(ipix[0]<0 || ipix[0]>=this.width || ipix[1]<0 || ipix[1]>=this.height){
	this.pointer_info.innerHTML="outside<br/>---";
	return;
    }

    ipix[0]=Math.floor(ipix[0]);
    ipix[1]=Math.floor(ipix[1]);

    var pos=ipix[1]*this.width+ ipix[0];
    var pixel_value = this.arr[pos];

    this.pointer_info.innerHTML="("+ipix[0]+","+ipix[1]+")<br/>" + Math.floor(pixel_value*1000)/1000.0;
    //POS " +pos + " L= " + this.arr.length + 
//	" D : " + this.width + "," + this.height ;
    
}

