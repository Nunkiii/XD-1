/*
  
  XD1  - LAYER CLASS
  
*/

var xd1_templates={
    
    binary_source : {
	name : "Source",
	elements : {
	    

	}
    },

    binary_object : {
	name : "Binary object",
	elements : {
	    size : {
		name : "Size",
		type : "bytesize"
	    }
	}
	
    },
    image_dimensions : {
	ui_opts : {type : "short"},
	name : "Dimensions",
	type : "labelled_vector",
	min : "0",
	max : "65536",
	step : "1",
	value : [0, 0],
	value_labels : ["Dx", "Dy"]
    },

    image : {
	name : "Image",
	elements : {
	    data : { name : "Data", type: "template", template_name : "binary_object"},
	    dims : { type: "template", template_name : "image_dimensions"},
	}
    },
    
    fits_image : {
	elements : {
	    fits_file : { name : "FITS file", type : "local_file" , ui_opts : { editable : true }},
	    fits_meta : { 
		name : "Image location",
		elements : {
		    du : { name: "Data unit", type : "double", min : "0", max : "64", step : "1" } 
		}
	    },
	    image : {
		name : "Image",type : "template",template_name:"image"
	    }
	}
    },

    colormap_edit : {
	name : "Color segment edit",
	elements : {
	    range : {name : "Range", type : "labelled_vector", value : [0,1], value_labels : ["Start","End"], min : "0", max : "1", step : ".01",ui_opts : {root_classes : [], editable : true, type : "short"} },	    
	    blendl : { name : "BlendLeft", value : true, type : "bool" , ui_opts : {visible : true,root_classes : ["inline"]}},
	    blendr : { name : "BlendRight", value : true, type : "bool" , ui_opts : {visible : true,root_classes : ["inline"]}},
	    uniform : { name : "Uniform color", value : false, type : "bool" , ui_opts : {visible : false, root_classes : ["inline"]}},


	    outleft : { name : "OutL", type : "color", value : "#fff", ui_opts : {root_classes : ["inline"]}},
	    inleft : { name : "InL", type : "color", value : "#fff", ui_opts : {root_classes : ["inline"]}},
	    inright : { name : "InR", type : "color", value : "#fff", ui_opts : {root_classes : ["inline"]}},
	    outright : { name : "OutR", type : "color", value : "#fff", ui_opts : {root_classes : ["inline"]}},
	    split : {name : "Split section", type : "action"}
	}
	
    },
    
    binary_resource_location : {},
    
    geometry : {
	
	name : "Geometry",
	elements : {
	    translation : {
		name : "Translation",
		type : "labelled_vector",
		value : [0,0],
		value_labels : ["Tx","Ty"],
		min : "-8192", 
		max : "8192", 
		step: "1",
		ui_opts: {root_classes : ["inline", "number_fixed_size","newline"], editable : true}
	    },

	    rotation : {
		name : "Rotation",
		elements : {
		    center : {
			name : "Center",
			type : "labelled_vector",
			value : [0,0],
			value_labels : ["Rx","Ry"],
			min : "-8192", 
			max : "8192", 
			step: "1",
			ui_opts: {root_classes : ["inline"], editable : true}
		    },
		    angle : {
			name : "Angle",type : "angle", value : 0.0, min : -100.0, max : 100.0, step: 0.02, ui_opts : { editable : true }
		    }
		}
	    },
	    
	    zoom : { name : "Scale", type: "double", min : 0.00001, max : 1000.0, step: 0.0001, value : 1.0, ui_opts : { editable : true} }
	    
	}
    },
	
    cuts : {
	type : "labelled_vector",
	value : [0,0],
	value_labels : ["Low","High"],
	min : "-100000", 
	max : "100000", 
	step: "100",
	ui_opts : { editable : true, root_classes : ["newline"] }
	//ui_opts: {root_classes : ["inline"]}
    },
    

    gl_image_layer : {
	name :  "GL Image layer",
	type : "bool",
	value : true,
	ui_opts : { root_classes : ["column"], child_view_type : "tabbed", type : "edit" }, 
	elements : {
	    image : {
		type : "local_file",
		ui_opts : { type: "edit" },
		name : "FITS image",
		elements :{
		    dims : { type: "template", template_name : "image_dimensions"},
		    file_size : {
			name : "File size",
			type : "bytesize"
		    },
		    size : {
			name : "Image size",
			type : "bytesize"
		    }
		}
	    },
	    general : {
		name : "Colours",
		elements : {
		    lum :  {name : "Luminosity", type: "double", min : "0", max : "1.0", step: "0.01", value : "1.0", 
			    ui_opts : {input_type : "range", editable: true} },
		    
		    histo : {
			name : "Colour-value editor",
			
			elements : {
			    cuts : { name : "Value cuts", type : "template", template_name : "cuts", ui_opts: {}},
			    cmap : { name : "Colormap", type : "colormap", ui_opts : {editable : true},
				     value : [[0,0,0,1,0],
					      [0.8,0.2,0.8,1.0,0.2],
					      [0.9,0.9,0.2,1.0,0.2],
					      [0.9,0.9,0.2,1.0,0.5],
					      [0.9,0.2,0.2,1.0,0.5],
					      [1,1,1,1,1]] },
			    histo : {
				name : "Histogram", type : "vector",
				ui_opts : {width: 200, height: 100, margin : {top: 0, right: 10, bottom: 30, left: 50} }
			    }
			    
			}
		    }
		}
	    },
	    geometry : {

		name : "Geometry",
		type : "template",
		template_name : "geometry"
	    }
	}
    },
    
    gl_view_2d :  {
	name :  "",
	type : "template",
	template_name : "geometry"
    }
    };

var tmaster=new local_templates();
tmaster.add_templates(xd1_templates);

function layer(xd, id,update_shader_cb, update_cmap_cb){

    var lay=this;
    var gl=xd.gl;

    this.xd=xd;
    this.id=id;

    var div=this.div=document.createElement("div"); 
    div.className="layer";
    
    
    // this.layer_head=document.createElement("nav");
    // this.layer_head.className="layer_head";
    // div.appendChild(this.layer_head);

    // var layer_menu=this.layer_head; //.appendChild(document.createElement("ul"));
    // layer_menu.frames=[];

    // layer_menu.select_frame=function(f){
    // 	if(typeof this.selected_frame!='undefined')
    // 	    this.selected_frame.div.style.display='none';
    // 	f.div.style.display='block';
    // 	this.selected_frame=f;
    // 	return f;
    // }

    // layer_menu.add_frame=function(title){
    // 	var lm=this;
    // 	var li=this.appendChild(document.createElement("li"));
    // 	li.innerHTML=title;
    // 	li.div=div.appendChild(document.createElement("div"));
    // 	li.div.className="layer_section";
    // 	li.div.style.display='none';
    // 	this.frames.push(li);
	
    // 	li.onclick=function(){
    // 	    console.log("Click!!");
    // 	    lm.select_frame(this); xd.fullscreen(false);
    // 	}
    // 	if(this.frames.length==1) this.select_frame(li);

    // 	return li;
    // }

    // var source_div=layer_menu.add_frame("Data source").div;
    // var settings_div=layer_menu.add_frame("Image settings").div;

    // this.source_head=document.createElement("nav");
    // this.source_head.className="source_head";
    // source_div.appendChild(this.source_head);

    // var source_menu=this.source_head; //.appendChild(document.createElement("ul"));
    // source_menu.frames=[];

    // source_menu.select_frame=function(f){
    // 	if(typeof this.selected_frame!='undefined')
    // 	    this.selected_frame.div.style.display='none';
    // 	f.div.style.display='block';
    // 	this.selected_frame=f;
    // 	return f;
    // }

    // source_menu.add_frame=function(title){
    // 	var lm=this;
    // 	var li=this.appendChild(document.createElement("li"));
    // 	li.innerHTML=title;
    // 	li.div=source_div.appendChild(document.createElement("div"));
    // 	li.div.className="source_section";
    // 	li.div.style.display='none';
    // 	this.frames.push(li);
	
    // 	li.onclick=function(){
    // 	    lm.select_frame(this); xd.fullscreen(false);
    // 	}
    // 	if(this.frames.length==1) this.select_frame(li);

    // 	return li;
    // }


    // var fits_source = source_menu.add_frame("Local FITS");
    // var cam_source = source_menu.add_frame("Camera control");
    // var db_source = source_menu.add_frame("DB Browser");

    //lay.name.innerHTML="Layer " + lay.id + "";

    this.p_values=def_parameters[id];
    this.rotcenter=[0,0];
    

//    cmap_el.appendChild(div);


    var layer_opts = this.layer_opts= tmaster.build_template("gl_image_layer"); 
    
    var cuts=layer_opts.elements.general.elements.histo.elements.cuts; 
    var histo_tpl=layer_opts.elements.general.elements.histo.elements.histo; 

    var cmap=this.cmap=layer_opts.elements.general.elements.histo.elements.cmap; 

    var lum=layer_opts.elements.general.elements.lum; 
    var tr=layer_opts.elements.geometry.elements.translation;
    var zm=layer_opts.elements.geometry.elements.zoom; 
    var ag=layer_opts.elements.geometry.elements.rotation.elements.angle; 
    var rc=layer_opts.elements.geometry.elements.rotation.elements.center;

    var fits_file=layer_opts.elements.image;

    layer_opts.onchange = function(){
  //console.log("Change !!!");
	xd.layer_enabled[lay.id]=this.value;
	var le_loc=gl.getUniformLocation(xd.program, "u_layer_enabled");
	gl.uniform4iv(le_loc, xd.layer_enabled);
	xd.render();
    };

    cuts.onchange = function(){
	lay.p_values[0]=this.value[0];
	lay.p_values[1]=this.value[1];
	console.log("Cuts changed to " + JSON.stringify(this.value));
	update_pvalues();
    };
    
    tr.onchange = function(){
	lay.p_values[2]=this.value[0];
	lay.p_values[3]=this.value[1];
	update_pvalues();
    };

    zm.onchange=function(){
	lay.p_values[4]=this.value;
	update_pvalues();
    }
    ag.onchange=function(){
	lay.p_values[5]=this.value;
	update_pvalues();
    }
    lum.onchange=function(){
	lay.p_values[6]=this.value;
	update_pvalues();
    }

    rc.onchange=function(){
	var rc_loc=gl.getUniformLocation(xd.program, "u_rotcenters");
	xd.p_rotcenters[2*lay.id]=this.value[0];
	xd.p_rotcenters[2*lay.id+1]=this.value[1];
	console.log("Setting rotcenter for layer " + lay.id + " : " + JSON.stringify(xd.p_rotcenters));
	gl.uniform2fv(rc_loc, xd.p_rotcenters);
	xd.render();
	
    }

    fits_file.onchange=function(evt){

	var FITS = astro.FITS;
	// Define a callback function for when the FITS file is received
	var callback = function() {
	    
	    // Do some wicked client side processing ...
	}
	
	var FITS=astro.FITS;
	var file = evt.target.files[0]; // FileList object

	var fits = new FITS(file, function(){
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
		
		layer_opts.ui_name.innerHTML=fits_file.ui.files[0].name;

		fits_file.elements.file_size.value=fits_file.ui.files[0].size;
		fits_file.elements.file_size.set_value();

		console.log("Frame read : D=("+lay.width+","+lay.height+")  externt " + extent[0] + "," + extent[1]);
		//image_info.innerHTML="Dims : ("+lay.width+", "+lay.height+")";
		
		console.log("Setting " + w);
		fits_file.elements.dims.value[0]=w;
		fits_file.elements.dims.value[1]=h;
		fits_file.elements.dims.set_value();

		lay.arr=arr;
		lay.ext=extent;

		setup_bbig(w,h);
	
		fits_file.elements.size.value=arr.length;
		fits_file.elements.size.set_value();

		var id=lay.id;
		
		console.log("Filling big array with layer  " + id + " : " + w + ", " + h + " global dims " + w + ", "+h);
		
		var rangeLocation = gl.getUniformLocation(xd.program, "u_layer_range");
		xd.p_layer_range[2*id]=lay.width*1.0/xd.w;
		xd.p_layer_range[2*id+1]=lay.height*1.0/xd.h;
		
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

	});

    }
    
    div.appendChild(create_ui({type:"short" }, layer_opts));


    
    // var cmap=this.cmap=new colormap();  
    
    // //var cmap_data=cmap.json_colormap();


    // var hzoom_but=document.createElement("button");
    // var hreset_but=document.createElement("button");
    
    
    var canvas_info  = document.getElementById('canvas_info');
    var x_domain=null;
    var brush=null;
    var nbins=512;


    var bsize=null; 

    //    var x_domain_full=null; //[low+.5*bsize,low+(nbins-.5)*bsize];

    function auto_cuts(){

	var histo=histo_tpl.value;
	var max=0,maxid=0, total=0, frac=.95, cf=0;
	for(var i=0;i<histo.length;i++){
	    var v=histo[i].n;
	    if(v>max){max=v;maxid=i;}
	    total+=v;
	}
	
	for(var i=0;i<histo.length;i++){
	    cf+=histo[i].n;
	    if(cf*1.0/total>=frac) break;
	}
	
	if(maxid-2>=0) maxid-=2;
	cuts.set_value([histo[maxid].x,histo[i].x]);
	cuts.onchange();
    }

    function reset_histogram(){

	var low=lay.ext[0];
	var high=lay.ext[1];

	x_domain=[low+.5*bsize,low+(nbins-.5)*bsize];
	console.log("X DOM " + x_domain[0] + ", " + x_domain[1]);
	bsize=(high-low)/nbins;
	compute_histogram(x_domain[0],x_domain[1]);
	auto_cuts();

	//draw_histogram();
	
    }

/*
    hzoom_but.onclick=function(){
	x_domain = [brush.extent()[0],brush.extent()[1]];//
	compute_histogram(x_domain[0],x_domain[1]);
	draw_histogram();
    }
    
    hreset_but.onclick=function(){
	console.log("Clicked!!");
	reset_histogram();
    }

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
    
  */  


    this.pointer_info  = document.createElement('div');
    this.pointer_info.className="pointer_info";

    this.width=0;
    this.height=0;

    this.g_tr=[0,0];
    this.g_mrot=[[1,0],[0,1]];
    this.g_screen_center=[0,0];
    this.g_scale=1.0;


    
    
    // var tab=document.createElement("table");
    // div.appendChild(tab);
    
    // var th=[document.createElement("tr"),document.createElement("tr"),document.createElement("tr")];
    // var tre=[document.createElement("tr"),
    // 	     document.createElement("tr"),
    // 	     document.createElement("tr"),
    // 	     document.createElement("tr"),
    // 	     document.createElement("tr"),
    // 	     document.createElement("tr")];

    // tab.appendChild(th[0]);
    // tab.appendChild(tre[0]);
    // tab.appendChild(th[1]);
    // tab.appendChild(tre[1]);
    // tab.appendChild(th[2]);
    // tab.appendChild(tre[2]);
    // tab.appendChild(tre[3]);
    // tab.appendChild(tre[4]);
    // tab.appendChild(tre[5]);
    
    // var cap=document.createElement("td"); 
    // cap.innerHTML="Color segment";
    // cap.colSpan="3";
    // th[2].appendChild(cap);
    
    // var cap=document.createElement("td"); 
    // cap.colSpan="3";
    // cap.appendChild(cmap.colornode);
    // tre[2].appendChild(cap);
    
    // var cmt=document.createElement("td");
    // cmt.colSpan="6";
    // cmt.appendChild(cmap.domnode);
    // tre[3].appendChild(cmt);
    
    // for(var p in prms){
    // 	var cap=document.createElement("td"); 
    // 	cap.colSpan=prms[p].cs;
    // 	cap.innerHTML=prms[p].cap;
    // 	th[prms[p].row].appendChild(cap);
    // }
    
    // for(var p in prms){
    // 	var td=document.createElement("td");
    // 	td.colSpan=prms[p].cs;
    // 	var ui=prms[p].ui;
    // 	var id=prms[p].id;
    // 	td.appendChild(ui);
	
    // 	tre[prms[p].row].appendChild(td);

    // 	if(id>=0)
    // 	    ui.value=lay.p_values[id];
    // 	else
    // 	    ui.value=prms[p].set_value(ui);

    // 	ui.layer=lay;
    // 	ui.id=id;
    // 	ui.prm=prms[p];
	
    // 	if(typeof prms[p].onchange == 'undefined')
    // 	    ui.onchange=function(){
    // 		//console.log("Change pvals[" + this.layer.id + "]["+this.id+"]=" + this.value);
    // 		lay.p_values[this.id]=1.0*this.value;
    // 		update_pvalues();	    
    // 	    //update_shader_cb(this.layer.lay.p_values, this.layer.id);
    // 	    }; 
    // 	else{
	    
    // 	    ui.onchange=function(){
    // 		this.prm.onchange(this);
    // 	    }
    // 	}
	
    // 	//ui.onchange();
    // 	//update_shader_cb(this.lay.p_values, lay.id);
    // }
    
    update_pvalues();	    
    

    cmap.update_callback=function(){
	
	//var cmap_data=cmap.json_colormap();
	


	var cmap_data=cmap.value;
	xd.ncolors[lay.id]=cmap_data.length;
	
	//console.log("Update Colormap ncolors: "+xd.ncolors[lay.id]+"  data :" + JSON.stringify(cmap_data));

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
	
	
	
    }

    //dinfo.innerHTML+="Requesting image binary data...<br/>";
    
    function draw_histogram(){
	
    }
    
    
    function compute_histogram(low, high){
	

	var bsize=(high-low)/nbins;
	var data=lay.arr;
	var dl=data.length;
	var histo=histo_tpl.value=[];
	

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
	histo_tpl.set_value();
	//console.log("Histo : " + JSON.stringify(lay.histo));
	
    }  




    
    function update_pvalues(){
	var pv_loc=gl.getUniformLocation(xd.program, "u_pvals");
	for(var p=0; p<8;p++) xd.p_vals[lay.id*8+p]=lay.p_values[p];
	//console.log("Setting parms for layer " + layer_id + " : " + JSON.stringify(p_vals));
	gl.uniform4fv(pv_loc, xd.p_vals);
	if(zm.ui)
	    zm.ui.step=zm.ui.value/10.0;
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
	
	//cmap.create_colors(def_colormaps[lay.id]);
	//cmap.last.insert_color([0.0,0.4,0.0,1.0], 0.5);
	//cmap.select_element(cmap.elements[cmap.elements.length-1]);
	cmap.display({type : "edit"});
	
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
    

    
    
//    init_fits_source();
//    init_cam_source();

//    xd.display_layer_ui(this);
	
    
    

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

/*
        float lpos=(float(l)+.5)/4.0;
        float alpha=u_pvals[2*l+1][1];//this layer's angle
        mat2 rm =mat2(cos(alpha),sin(alpha),-sin(alpha),cos(alpha));//this layer's rotation matrix
        vec2 trl=vec2(u_pvals[2*l][2],u_pvals[2*l][3]);//this layer's translation (x,y) vector
        float lzoom=u_pvals[2*l+1][0]; //This layer's zoom level
        vec2 screen_center = u_screen/2.0; //Screen center
        vec2 image_tex_center = u_layer_range[l]/2.0; //The center of this layer image within the "whole" texture.

        vec2 p =(gl_FragCoord.xy-screen_center);
	
	p = p/u_zoom+u_tr-u_rotc;
	p = rmg*p+u_rotc;
	p = p/lzoom+trl-u_rotcenters[l];
	p = rm*p+u_rotcenters[l];
	p = p/u_resolution+image_tex_center;
*/


layer.prototype.update_geometry=  function (){
    var xd=this.xd;

    var alpha_l=-1.0*this.p_values[5];
    var alpha=-1.0*xd.angle;

    this.g_lzoom=1.0*this.p_values[4]; //*xd.zoom;

    this.g_trl=[1.0*this.p_values[2],1.0*this.p_values[3]]; //xd.tr[]
    this.g_rm=[[Math.cos(alpha_l),Math.sin(alpha_l)],
	       [-1.0*Math.sin(alpha_l),Math.cos(alpha_l)]];
    this.g_rmg=[[Math.cos(alpha),Math.sin(alpha)],
		[-1.0*Math.sin(alpha),1.0*Math.cos(alpha)]];
    this.g_screen_center=[xd.canvas.width/2.0, xd.canvas.height/2.0];
    this.g_rotc=[1.0*xd.p_rotcenters[2*this.id],1.0*xd.p_rotcenters[2*this.id+1]];
    this.g_texc=[this.width/xd.w/2.0, this.height/xd.h/2.0];
    
    //console.log("ROTC = " + JSON.stringify(this.g_rotc) + "TEXC " + JSON.stringify(this.g_texc)+ "TR " + JSON.stringify(this.g_trl) + " scale " + this.g_lzoom);

}
layer.prototype.get_image_pixel= function(screen_pixel) {
    var xd=this.xd;
    var ipix=[
	(screen_pixel[0]-this.g_screen_center[0])/xd.zoom+xd.tr[0]-xd.rotcenter[0],
	(screen_pixel[1]-this.g_screen_center[1])/xd.zoom+xd.tr[1]-xd.rotcenter[1]
    ];
    
    ipix= numeric.dot(this.g_rmg,ipix);
    
    ipix[0]=((ipix[0]+xd.rotcenter[0])/this.g_lzoom+this.g_trl[0]-this.g_rotc[0]);
    ipix[1]=((ipix[1]+xd.rotcenter[1])/this.g_lzoom+this.g_trl[1]-this.g_rotc[1]);

    ipix= numeric.dot(this.g_rm,ipix);

//    ipix[0]=(((ipix[0]+this.g_rotc[0])/xd.w+.5)*this.width);
//    ipix[1]=(((ipix[1]+this.g_rotc[1])/xd.h+.5)*this.height);

    ipix[0]=(ipix[0]+this.g_rotc[0])+this.width/2.0;///xd.w+this.g_texc[0];
    ipix[1]=(ipix[1]+this.g_rotc[1])+this.height/2.0;///xd.h+this.g_texc[1];
//    console.log("P="+JSON.stringify(ipix));
    return ipix;
}

layer.prototype.update_pointer_info=function(screen_pixel){

//    if(typeof this.opts=='undefined') return;

    var ipix=this.get_image_pixel(screen_pixel);
    if(ipix[0]<0 || ipix[0]>=this.width || ipix[1]<0 || ipix[1]>=this.height){
	this.pointer_info.innerHTML="outside<br/>image";
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

