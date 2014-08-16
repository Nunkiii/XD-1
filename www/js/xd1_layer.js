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
//	name : "Color segment edit",
	ui_opts : { root_classes : "full"},
	elements : {
	    range : {name : "Range", type : "labelled_vector", value : [0,1], value_labels : ["Start","End"], min : "0", max : "1", step : ".01",ui_opts : {root_classes : [], editable : true, type : "short"} },	    
	    uniform : { name : "Uniform color", value : false, type : "bool" , ui_opts : {visible : false, root_classes : ["inline"]}},
	    
	    blend : { 
		name: "Blend boundaries", 
		ui_opts : {root_classes : ["inline"]},
		elements : {
		    blendl : { name : "BlendLeft", value : true, type : "bool" , ui_opts : {visible : true,root_classes : ["inline"]}},
		    blendr : { name : "BlendRight", value : true, type : "bool" , ui_opts : {visible : true,root_classes : ["inline"]}},
		}
	    },
	    colors : {
		name : "Colors",
		ui_opts : {root_classes : ["inline"]},
		elements : {

		    outleft : { name : "OutL", type : "color", value : "#fff", ui_opts : {root_classes : ["inline"]}},
		    inleft : { name : "InL", type : "color", value : "#fff", ui_opts : {root_classes : ["inline"]}},
		    inright : { name : "InR", type : "color", value : "#fff", ui_opts : {root_classes : ["inline"]}},
		    outright : { name : "OutR", type : "color", value : "#fff", ui_opts : {root_classes : ["inline"]}},
		}
	    },
	    split : {name : "Split section", type : "action"}
	    
	}
	
    },
    
    binary_resource_location : {},
    
    geometry : {
	
	name : "Geometry",
	ui_opts: {root_classes : ["inline"],name_classes : ["inline"], child_classes : ["inline"],  editable : false, sliding : true, sliding_dir : "h", slided : false},
	//ui_opts: {root_classes : [], child_classes : [], sliding : true, sliding_dir : "h", slided : true},
	elements : {
	    translation : {
		name : "Translation",
		type : "labelled_vector",
		value : [0,0],
		value_labels : ["Tx","Ty"],
		min : "-8192", 
		max : "8192", 
		step: "1",
		ui_opts: {root_classes : [ "inline", "number_fixed_size"], child_classes : [],  editable : true, sliding : true, sliding_dir : "v", slided : true}
	    },

	    rotation : {
		name : "Rotation",
		ui_opts: {sliding: true, sliding_dir:"v", slided : true, root_classes : ["inline"]},
		elements : {
		    angle : {
			name : "Angle (rad)",type : "angle", value : 0.0, min : -100.0, max : 100.0, step: 0.02, ui_opts : { editable : true }
		    },

		    center : {
			name : "Center",
			type : "labelled_vector",
			value : [0,0],
			value_labels : ["Rx","Ry"],
			min : "-8192", 
			max : "8192", 
			step: "1",
			ui_opts: {
			    //root_classes : [ "inline"], editable : true, 
			    editable: true, sliding : true, sliding_dir : "h", slided: false }
		    }
		}
	    },
	    
	    zoom : { name : "Scale", type: "double", min : 0.00001, max : 1000.0, step: 0.0001, value : 1.0, 
		     ui_opts : { editable : true, root_classes : []} 
		   }
	    
	}
    },

    cuts : {
	type : "labelled_vector",
	value : [0,0],
	value_labels : ["Low","High"],
	min : "-100000", 
	max : "100000", 
	step: "100",
	ui_opts : { editable : true, root_classes : [] }
	//ui_opts: {root_classes : ["inline"]}
    },
    

    gl_image_layer : {
	name :  "GL Image layer",
	ui_opts : { root_classes : ["inline"], child_classes : ["newline"], //name_classes : ["inline"], item_classes : ["inline"], 
		    //child_view_type : "tabbed", 
		    type : "short", sliding: false, slided : false, sliding_dir : "v", child_view_type : "bar" }, 
	
	elements : {
	    enable : {
		name : "Enable this layer",
		type : "bool",
		value : true,
		ui_opts : {editable : true, label : true, type : "edit"}
	    },
	    image : {

		ui_opts : {  
			    sliding : true , sliding_dir : "h", slided : true, child_classes : ["newline"], child_view_type : "bar"
			  },
		name : "FITS Image source",
		elements :{

		    source : {
			name : "Data source",
			ui_opts : { child_view_type : "tabbed", sliding : true, slided : true, root_classes : []}, 
			elements : {
			    local_fits : {
				ui_opts : {editable: true, sliding : false, slided : true},
				name : "Local FITS file",
				type : "local_file",
				value : "No file selected"
			    },
			    url_fits : {
				ui_opts : {editable: true, sliding : false, slided : false},
				name : "FITS URL",
				type : "url"
			    },
			    gloria : {
				ui_opts : {editable: false, sliding : false, slided : false},
				name : "GLORIA images",
				type : "template",
				template_name : "image_db_browser"
			    },
			    sbig : {
				name : "Camera control",
				ui_opts : {editable: false, sliding : false, slided : false}
			    }
			}
			
		    },
		    info : {
			name : "Image info",
			ui_opts : {editable: false, sliding : true, slided : false, root_classes : [], child_classes : ["inline"]},
			elements : {
			    
			    dims : { 
				type: "template", 
				template_name : "image_dimensions",
				ui_opts : { name_classes : ["inline"] }
			    },
			    file_size : {
				ui_opts : {root_classes : ["inline"] },
				name : "File size (original)",
				type : "bytesize"
			    },
			    size : {
				ui_opts : {root_classes : ["inline"] },
				name : "Image size (double) in ArrayBuffer",
				type : "bytesize"
			    },
			    bounds : {
				type : "labelled_vector",
				name : "Data value bounds",
				value : [0,0],
				value_labels : ["Min","Max"],
				min : "-100000", 
				max : "100000", 
				ui_opts : { editable : false, sliding : false , sliding_dir : "h", slided : true, root_classes : ["inline"] }
				//ui_opts: {}
			    }

			}
		    }
		}
	    },
	    geometry : {

		name : "Layer geometry",
		type : "template",
		template_name : "geometry",
		ui_opts : {  root_classes : ["inline"], child_classes : ["inline"], 
			    sliding : true , sliding_dir : "h", slided : false
			    //  child_view_type : "tabbed" 
			  }
	    },

	    general : {
		name : "Colours",
		ui_opts : { type: "short", root_classes : ["full", "newline"], 
			    sliding : true , sliding_dir : "v", slided : false,
			    child_view_type : "div" 
			  },
		//ui_opts : {child_classes : ["column"]},
		elements : {
		    lum :  {name : "Luminosity", type: "double", min : "0", max : "1.0", step: "0.01", value : ".1", 
			    ui_opts : {input_type : "range", editable: true , type : "edit",  root_classes : ["inline"]} },
		    
		    // histo : {
		    // 	name : "Colors and cuts",
		    // 	ui_opts : { root_classes : ["inline"], child_classes : "inline", sliding : true , sliding_dir : "h", slided : false },
		    // 	elements : {
		    
		    
		    cuts : { name : "Value cuts", type : "template", template_name : "cuts", 
			     ui_opts: { sliding : true , sliding_dir : "h", slided : true, root_classes : ["inline"]}},
		    cmap : { name : "Colormap", type : "colormap", 
			     ui_opts : {editable : true, sliding : true , sliding_dir : "h", slided : false,
					root_classes : ["newline"], item_classes : []
					
				       },
			     // value : [[0,0,0,1,0],
			     // 	      [0.8,0.2,0.8,1.0,0.2],
			     // 	      [0.9,0.9,0.2,1.0,0.2],
			     // 	      [0.9,0.9,0.2,1.0,0.5],
			     // 	      [0.9,0.2,0.2,1.0,0.5],
			     // 	      [1,1,1,1,1]] },
			     
			     
			     value : [[0,0,0,1,0],
				      [1.0,0.0,1.0,1.0,0.5],
				      [1,1,1,1,1]] 
			   },
		    
		    histo : {
			name : "Histogram", 
			type : "vector",
			ui_opts : {width: 300, height: 200, margin : {top: 10, right: 15, bottom: 30, left: 50},
				   root_classes : ["inline"], item_classes : ["newline"], sliding : true , sliding_dir : "v", slided : false
				  },
			elements :{
			    selection : {
				type : "labelled_vector",
				name : "Selection",
				value_labels : ["Begin","End"],
				value : [0, 0],
				ui_opts: {root_classes : ["inline"], child_classes : ["inline"], item_classes : [], editable : false, sliding: false},
			    },
			    zoom : { name: "Zoom in", type : "action", ui_opts:{root_classes:["zoom","inline"], sliding : false}},  
			    unzoom : { name : "Unzoom", type : "action", ui_opts:{root_classes:["unzoom","inline"]}}
			}
		    }
		}
	    }
	}
    },
    
    gl_view_2d :  {
	name : "XD-1",
	ui_opts: {root_classes : ["newline"], item_classes : ["inline"], child_classes : ["newline","full"],  editable : false, sliding : true, sliding_dir : "h", slided : true, child_view_type : "bar"},
	//ui_opts: {sliding: true, sliding_dir:"h", root_classes : []},
	// elements : {
	//     layers : { 
	// 	name: "Layers", 
	elements : {
	    layers : {
		name : "Image Layers",
		ui_opts: {
		    sliding: true, sliding_dir:"h", slided : true, root_classes : ["inline"], child_classes : ["newline"],child_view_type : "tabbed"
		},
	    	elements : {
		    newlayer : {
			type : "action",
			name : "Add new layer",
			ui_opts: {
			    root_classes : ["inline"], name_classes : [], label : true
			}

		    }/*,
		    layer_objects : { 
			ui_opts: {
			    child_view_type : "bar", root_classes : ["inline"], child_classes : ["newline"]
			}
		    }*/
		}
	    },
	    
	    //	}
	    //	    },
	    
	    geometry : {
		name : "Global geometry",
		type : "template",
		template_name : "geometry",
		ui_opts: {
		    sliding: true, child_view_type : "div"
		}
	    },
	    demo : {
		name : "Multi-WL Cat's eye demo",
		type : "action",
		ui_opts : {editable: false, sliding : false, slided : false, label : true}

	    },

	    about : { name : "About", type : "html", url : "about.html", ui_opts : { sliding : true, sliding_dir : "v", slided : false, root_classes : ["inline"]} }
	    
	}
	
    }
};

var tmaster=new local_templates();

tmaster.add_templates(xd1_templates);
tmaster.add_templates(image_db_browser_templates);

function layer(xd, id, cb){

    var lay=this;
    var gl=xd.gl;

    this.xd=xd;
    this.id=id;

    var div=this.div=document.createElement("div"); 
    div.className="layer";

    this.p_values=def_parameters[id];
    this.rotcenter=[0,0];


    var layer_opts=this.layer_opts=tmaster.build_template("gl_image_layer"); 
    var depth=1;//layer_opts.depth+1;
    console.log("Hello");

    var cuts=layer_opts.elements.general.elements.cuts; 
    var histo_tpl=layer_opts.elements.general.elements.histo; 
    var cmap=this.cmap=layer_opts.elements.general.elements.cmap; 
    var lum=layer_opts.elements.general.elements.lum; 
    var tr=layer_opts.elements.geometry.elements.translation;
    var zm=layer_opts.elements.geometry.elements.zoom; 
    var ag=layer_opts.elements.geometry.elements.rotation.elements.angle; 
    var rc=layer_opts.elements.geometry.elements.rotation.elements.center;

    var image=layer_opts.elements.image;

    var fits_file=image.elements.source.elements.local_fits;
    var file_size=image.elements.info.elements.file_size;
    var image_size=image.elements.info.elements.size;
    var dims=image.elements.info.elements.dims;
    var bounds=image.elements.info.elements.bounds; 
    
    var nbins=512;
    var bsize=null; 

    histo_tpl.on_slide=function(slided){
	console.log("Histo slide ! " + slided);
	if(slided){
	    //histo_tpl.ui_opts.width=
	    //histo_tpl.redraw(); 
	    compute_histogram(nbins, cuts.value);
	}
    }

    histo_tpl.selection_change=function(new_cuts){

	console.log("Histo selection change!"); 
	cuts.set_value(new_cuts);
	cuts.onchange();
    }

    histo_tpl.on_range_change=function(new_cuts){
	//console.log("Range change !, recomp histo");
	compute_histogram(nbins, new_cuts);
    }

    layer_opts.elements.enable.onchange = function(){
	//console.log("Change !!!");
	xd.layer_enabled[lay.id]=this.value;
	var le_loc=gl.getUniformLocation(xd.program, "u_layer_enabled");
	gl.uniform4iv(le_loc, xd.layer_enabled);
	xd.render();
    };

    cuts.onchange = function(){
	lay.p_values[0]=this.value[0];
	lay.p_values[1]=this.value[1];
	//console.log("Cuts changed to " + JSON.stringify(this.value));
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
		
		layer_opts.set_title(fits_file.ui.files[0].name);
		file_size.value=fits_file.ui.files[0].size;

		//console.log("FF set_value is " + typeof(fits_file.elements.dims.set_value) );

		file_size.set_value();
		

		bounds.set_value(extent);
		console.log("Frame read : D=("+lay.width+","+lay.height+")  externt " + extent[0] + "," + extent[1]);
		//image_info.innerHTML="Dims : ("+lay.width+", "+lay.height+")";
		
		dims.set_value([w,h]);
		
		lay.arr=arr;
		lay.ext=extent;
		
		setup_bbig(w,h);
		
		image_size.set_title("pixel byte size " + arr.length*1.0/w/h + " PixType " + typeof(arr[0]));
		image_size.set_value(arr.length*4);

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

    lay.setup_dgram_layer=function(header, fvp){

	console.log("Setting layer data " + JSON.stringify(header));
	cmap.set_value(header.colormap);

	var w=lay.width=header.width;
	var h=lay.height=header.height;
	
	var extent = [1e20,-1e20];
	for (var i=0;i<fvp.length;i++){
	    if(fvp[i]>extent[1])extent[1]=fvp[i];
	    if(fvp[i]<extent[0])extent[0]=fvp[i];
	}
	// Get the minimum and maximum pixels
	
	layer_opts.set_title(header.name);
	file_size.set_value(header.sz);

	//console.log("FF set_value is " + typeof(fits_file.elements.dims.set_value) );
	
	bounds.set_value(extent);
	console.log("Frame read : D=("+lay.width+","+lay.height+")  externt " + extent[0] + "," + extent[1]);
	//image_info.innerHTML="Dims : ("+lay.width+", "+lay.height+")";
		
	dims.set_value([w,h]);
		
	lay.arr=fvp;
	lay.ext=extent;
	
	setup_bbig(w,h);
	
	image_size.set_title("pixel byte size " + fvp.length*1.0/w/h + " PixType " + typeof(fvp[0]));
	image_size.set_value(fvp.length*4);
	
	var id=lay.id;
	
	console.log("Filling big array with layer  " + id + " : " + w + ", " + h + " global dims " + w + ", "+h);
		
	var rangeLocation = gl.getUniformLocation(xd.program, "u_layer_range");
	xd.p_layer_range[2*id]=lay.width*1.0/xd.w;
	xd.p_layer_range[2*id+1]=lay.height*1.0/xd.h;
	
	gl.uniform2fv(rangeLocation, xd.p_layer_range);
	var fv=xd.fv;
	
	for(var i=0;i<h;i++){
	    for(var j=0;j<w;j++){
		fv[4*(i*xd.w+j)+id]=1.0*fvp[i*w+j];
	    }
	}
	
	setup_layer_data();

    }
    
    var canvas_info  = document.getElementById('canvas_info');
    
    //    var x_domain_full=null; //[low+.5*bsize,low+(nbins-.5)*bsize];

    function auto_cuts(){
	
	var histo=histo_tpl.value;
	var max=0,maxid=0, total=0, frac=.95, cf=0;

	//console.log("cuts.... ND=" + histo.length);

	for(var i=0;i<histo.length;i++){
	    var v=histo[i];
	    if(v>max){max=v;maxid=i;}
	    total+=v;
	}
	
	var i;
	for(i=0;i<histo.length;i++){
	    cf+=histo[i];
	    if(cf*1.0/total>=frac) break;
	}
	
	//if(maxid>0) maxid-=1;
	var autocouts=[histo_tpl.start+histo_tpl.step*maxid,histo_tpl.start+histo_tpl.step*i];

	console.log("cuts.... total " + total + " maxid " + maxid + " max " + max + " -> cuts " + JSON.stringify(autocouts));
	

	cuts.set_value(autocouts);
	cuts.onchange();
	console.log("cuts....done");
    }

    function reset_histogram(){

	var low=lay.ext[0];
	var high=lay.ext[1];

	//cuts.set_value([low+.5*bsize,low+(nbins-.5)*bsize]);
	//console.log("X DOM " + x_domain[0] + ", " + x_domain[1]);
	//bsize=(high-low)/nbins;
	compute_histogram(nbins,lay.ext);
	auto_cuts();

	//draw_histogram();
	
    }

    this.pointer_info  = document.createElement('div');
    this.pointer_info.className="pointer_info";

    this.width=0;
    this.height=0;

    this.g_tr=[0,0];
    this.g_mrot=[[1,0],[0,1]];
    this.g_screen_center=[0,0];
    this.g_scale=1.0;

    update_pvalues();	    
    

    cmap.update_callback=function(){

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
    
    
    function compute_histogram(nbins, data_bounds){
	
	var data=lay.arr;
	var dl=data.length;

	var histo=histo_tpl.value=[];
	var step=histo_tpl.step=(data_bounds[1]-data_bounds[0])/nbins;
	var start=histo_tpl.start=data_bounds[0];//+.5*step;

	bsize=(histo_tpl.elements.selection.value[1]-histo_tpl.elements.selection.value[0])/nbins;

	for(var i=0;i<nbins;i++){
	    histo[i]=0;
	}
	
	console.log("Data bounds : " + lay.ext[0] + ", " + lay.ext[1], " bin size = " + bsize + " nbins " + nbins + " ndata=" + dl + " start " + start + " step " + step);
	
	
	for(var i=0;i<dl;i++){
	    var v=data[i];
	    if(v>=data_bounds[0]&&v<=data_bounds[1]){
		var bid=Math.floor( (v-data_bounds[0])/step);
		if(bid>=0&&bid<nbins)
		    histo[bid]++; 
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

	histo_tpl.min=lay.ext[0];
	histo_tpl.max=lay.ext[1];
	histo_tpl.step=(lay.ext[1]-lay.ext[0])/200.0;
	//x_domain_full=[lay.p_values[0]+.5*bsize,lay.p_values[0]+(nbins-.5)*bsize];

	//histo_tpl.ui_opts.width=histo_tpl.ui.clientWidth;
	//histo_tpl.ui_opts.heigth=histo_tpl.ui.clientHeight;


	compute_histogram(nbins, lay.ext);
	auto_cuts();
	histo_tpl.set_range(cuts.value);

	//if(bsize==null)

	console.log("Histo ui " + JSON.stringify(histo_tpl.ui_opts));
	histo_tpl.redraw();

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, xd.texture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.FLOAT, xd.fv);
	gl.uniform1i(gl.getUniformLocation(xd.program, "u_image"), 0);
	
	//reset_histogram();
	
	//cmap.create_colors(def_colormaps[lay.id]);
	//cmap.last.insert_color([0.0,0.4,0.0,1.0], 0.5);
	//cmap.select_element(cmap.elements[cmap.elements.length-1]);
	cmap.display({type : "edit"});
	
	xd.fullscreen(false);
	
	
    }

    this.ui=create_ui({type:"short" }, layer_opts, depth);
    
    cb(null,this);

}

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
    if(typeof this.g_trl=="undefined") return [0,0];

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

    if(typeof this.arr=='undefined') return;

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

