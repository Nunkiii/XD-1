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
		ui_opts : {label : true},
		name : "Size",
		type : "bytesize",
		value: 0
	    }
	    // binary_type : {
	    // 	ui_opts : { label : true},
	    // 	name : "Binary type",
	    // 	type : "string",
	    // 	value : "octet/stream"
	    // }
	},
	
    },
    
    image_dimensions : {
	ui_opts : {
	    type : "short", label : true
	},
	name : "Image dimensions",
	tip : "Dimension of the image in pixels",
	type : "labelled_vector",
	min : "0",
	max : "65536",
	step : "1",
	value : [0, 0],
	value_labels : ["Dx", "Dy"]
    },

    sky_coords : {
	ui_opts : {label : true},
	name : "Sky coordinates",
	type : "labelled_vector",
	value_labels : ["Ra","Dec"],
	value : [0,0]
    },
    
    image_source : {
	subtitle: "Select a FITS image file on your local filesystem",
	name : "FITS file",
	type : "local_file",
	ui_opts : {
	    label : true, editable: false, sliding : false, slided : false, type : "edit",
	    root_classes : ["col-md-5"], child_classes : ["row"]
	}
    },
	
    image : {
	name : "No data loaded",
	type : "binary_object",
	//tpl_builder : "image",
	//template_name : "binary_object",
	ui_opts : {
	    child_view_type : "div", close: true, render_name : true,
	    //name_node : "h2",
	    child_classes : ["container-fluid"], root_classes : ["container-fluid"],
	    icon : "/sadira/icons/mat_float.svg"
	},
	events : ["image_ready"],
	elements : { 
	    source : {
		subtitle: "Select a FITS image file on your local filesystem :",
		name : "FITS file",
		type : "local_file",
		ui_opts : {editable: false, sliding : false, slided : false, type : "edit",
			   root_classes : ["col-md-12"], child_classes : ["inline"]
			  },
	    },
	    keys : {
		name : "Metadata", type : "text", elements : {},
		ui_opts: {sliding: true, slided: false, label : true, root_classes : ["col-md-12"]}
	    },	    
	    dims : {
		type : "image_dimensions",
		ui_opts: {
		    sliding: false, slided: false,
		    root_classes : ["col-md-6"],
		    child_classes : ["inline"]
		},
		widget_builder : function(ui_opts, dims){
		    //alert("Hello dims constructor!");
		}
	    },
	    bounds : {
		type : "labelled_vector",
		name : "Data value bounds",
		value : [0,0],
		value_labels : ["Min","Max"],
		min : "-100000", 
		max : "100000", 
		ui_opts : { editable : false, sliding : false , sliding_dir : "h",slided : false, label : true,
			    root_classes : ["col-md-6"],
			    child_classes : ["inline"]
			  }
		//ui_opts: {}
	    },
	    
	    view : {
		name: "Display",
		ui_opts: {sliding: false, slided: false, bar : false,
			  root_classes : ["container-fluid"],
			  child_classes : ["container-fluid"]},
		elements : {
		    new_display : {
			type : "action",
			name : "View in a new display",
			ui_opts : {
			    button_node : "span",
			    item_classes : ["btn btn-info btn-xs"]
			}
		    },
		    add_to_display : {
			type : "action",
			name : "Select existing display",
			ui_opts : {
			    button_node : "span",
			    item_classes : ["btn btn-info btn-xs"]
			}
		    },
		    display_list : {
			name : "Select display:",
			type : "combo",
			ui_opts : {
			    type : "edit",
			    item_classes : [""],
			}
		    },
		    add : {
			type : "action",
			name : "Add layer in selected display",
			ui_opts : {
			    button_node : "span",
			    item_classes : ["btn btn-info btn-xs"]
			}
		    }
		    
		}
	    }


	    

	},

	widget_builder : function(ui_opts, image){
	    
	    console.log("Image constructor ! " + image.name );
	    
	    var bin_size=image.elements.size;
	    var dims=image.elements.dims;
	    var bounds=image.elements.bounds;
	    var meta=image.elements.keys;
	    var fits_file=image.elements.source;//.elements.local_fits;
	    //var gloria=image.elements.source.elements.gloria;
	    var view=image.elements.view.elements;
	    
	    var new_display=view.new_display;
	    var display_list=view.display_list;
	    var add_to_display=view.add_to_display;
	    var add=view.add;
	    
	    var dlist=[];
	    
	    
	    var views;
	    if(è(image.xd))
		views=image.xd.elements.drawing.elements.views;
	    
	    add_to_display.listen("click", function(){
		var opts=[];
		dlist=[];
		for( var v in views.elements){
		    dlist.push(v); opts.push(v + " : " + views.elements[v].name );
		};
		
		display_list.set_options(dlist);
		
	    });
	    
	    
	    new_display.listen("click", function(){
		
		image.xd.create_image_view(image, function(error, glm){
		    glm.set_title(image.name + " display");
		});
	    });
	    
	    add.listen("click", function(){
		//console.log("Selected : " + display_list.ui.selectedIndex);
		var vn=dlist[display_list.ui.selectedIndex];
		var glm=views.elements[vn];
		glm.create_layer(image);
		image.xd.select_view(glm);
	    });
	    
/*	
	gloria.listen("image_data", function(dgm){
	image.setup_dgram_image(dgm.header,dgm.data);
	image.set_title("GloriaImage ID " + dgm.header.gloria.autoID );
	});
*/

	    image.update_extent=function(){
		var extent = [1e20,-1e20];
		for (var i=0;i<image.fvp.length;i++){
		    var v=image.fvp[i];
		    if(v>extent[1])extent[1]=v;
		    if(v<extent[0])extent[0]=v;
		}
		bounds.set_value(extent);
	    }
	    
	    image.copy_image=function(image_source){
		
		if(typeof image_source.fvp.length != 'undefined'){
		    
		    var length=image_source.fvp.length;
		    var blength=length*4;
		    
		    var fvp = image.fvp=new Float32Array(length);
		    for (var i=0;i<length;i++)
			fvp[i]=image_source.fvp[i];
		    image.update_extent();
		    
		    dims.set_value(image_source.elements.dims.value);
		    // Get the minimum and maximum pixels
		    //image.set_title(header.name);
		    bin_size.set_value(blength);
		    
		    
		    image.trigger("image_ready",image);
		}
		
	    }
	    
	    image.load_fits_data=function(data_source){
		
		var FITS = astro.FITS;
		var fits = new FITS(data_source, function(){
		    // Get the first header-dataunit containing a dataunit
		    var hdu = this.getHDU();
		    // Get the first header
		    var header = hdu.header;
		    // Read a card from the header
		    var bitpix = header.get('BITPIX');
		    // Get the dataunit object
		    var dataunit = hdu.data;
		    
		    //console.log("FITS OK "+ JSON.stringify(header.cards, null, 5));
		    
		    meta.set_value(JSON.stringify(eval(header.cards), null, 5));
		    
		    var opts={ dataunit : dataunit };
		    
		    // Get pixels representing the image and pass callback with options
		    dataunit.getFrame(0, function(arr, opts){// Get dataunit, width, and height from options
			var dataunit = opts.dataunit;
			var w= dataunit.width;
			var h= dataunit.height;
			
			dims.set_value([w,h]);
			// Get the minimum and maximum pixels
			var extent = dataunit.getExtent(arr);
			
			image.set_title(fits_file.value.name);
			//console.log("FF set_value is " + typeof(fits_file.elements.dims.set_value) );
			
			bin_size.set_value(fits_file.size);
			
			bounds.set_value(extent);
			console.log("Frame read : D=("+dims.value[0]+","+dims.value[1]+")  externt " + extent[0] + "," + extent[1] + " wh="+w+","+h);
			//image_info.innerHTML="Dims : ("+image.width+", "+image.height+")";
			
			image.fvp=arr;
			bounds.set_value(extent);
			image.trigger("image_ready",image);
			
		    }, opts);
		});
	    }
	    
	    fits_file.listen('change',function(evt){
		var file = evt.target.files[0]; // FileList object
		image.load_fits_data(file);
	    });
	    
	    image.setup_dgram_image=function(header, fvpin){
		
		//console.log("Setup dgram image size " + header.sz);
		var fvp;
		
		//if(header.name) this.name=header.name;
		
		//	if(header.colormap)
		//	    cmap.set_value(header.colormap);
		
		if(fvpin.length){
		    fvp=fvpin;
		    //     length=fvp.length;
		}else{
		    fvp =  new Float32Array(fvpin);
		    //     length = fvp.byteLength;
		}
		image.set_title(header.name);
		image.fvp=fvp;
		dims.set_value([header.width,header.height]);
		image.update_extent();
		
		//bin_size.set_value(header.sz);
		
		//console.log("FF set_value is " + typeof(fits_file.elements.dims.set_value) );
		meta.set_value(JSON.stringify(header, null, 5));
		image.trigger("image_ready",image);
	    }
	    
	    
	}
	
    },
    
    image_reduction : {
	//type : "image_reduction",
	name : "Simple image reduction",
	ui_opts : { child_view_type : "pills", close: true},
	elements : {
	    processing: {
		name : "Processing",
		ui_opts : { sliding : true, slided : false},
		elements : {
		    debias_flat : {
			ui_opts : { type : "edit"} , 
			type : "bool",
			name : "Substract bias from flat-field",
			value : true
		    },
		    normalize_flat : {
			ui_opts : { type : "edit"} , 
			type : "bool",
			name : "Normalize flat",
			value : true
		    },
		    start : {
			name : "Reduce image",
			type: "action"
		    }
		}
	    },
	    input : {
		name : "Input",
		ui_opts : { sliding : true, slided : false},
		elements : {
		    bias : {
			name : "Bias",
			ui_opts : { sliding : true, slided : false},
			type :  "image"
		    },
		    flat : {
			name : "Flat-field",
			ui_opts : { sliding : true, slided : false},
			type :  "image"
		    },
		    science : {
			name : "Science",
			ui_opts : { sliding : true, slided : false},
			type : "image"
		    }
		}
	    },
	    output : {
		name : "Output",
		ui_opts : { sliding : true, slided : false},
		elements : {
		    reduced_science : {
			name : "Reduced science",
			ui_opts : { sliding : true, slided : false},
			type : "image"
		    }
		}
	    }
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
		name : "Image",type :"image"
	    }
	}
    },

    object_editor : {
	name : "User objects",
	elements : {
	    bbox : {
		ui_opts : {
		    //child_view_type : "bbox"
		    child_classes : ["btn-group"]
		},
		elements : {
		    new_object : { 
			name : "New image",
			type : "action",
			ui_opts : {
			    item_classes : ["btn btn-default btn-sm"],
			    fa_icon : "plus"
			}
			// elements : {
			//     img : { name : "An image", type : "template", template_name : "image"},
			//     toto : { name : "Toto", type : "double", value : 3.14}
			// }
		    },
		    new_datared : { 
			name : "New image reduction",
			type : "action",
			ui_opts : {
			    item_classes : ["btn btn-default btn-sm"],
			    fa_icon : "plus"
			}
		    }
		}
	    },
	    tree : {
		name : "Images",
		ui_opts : {child_view_type : "tabbed"},
		elements : {}
	    }
	}
    },
    colormap_edit : {
	name : "Color interval ",
	ui_opts : { root_classes : [], label:true},
	elements : {
	    range : {
		name : "Range", 
		type : "labelled_vector", 
		value : [0,1], 
		value_labels : ["Start","End"], min : "0", max : "1", step : ".01",
		ui_opts : {root_classes : [], editable : true, type : "short", label:true} 
	    },	    
	    uniform : { name : "Uniform color", value : false, type : "bool" , ui_opts : {visible : false, label:true}},
	    
	    blend : { 
		name: "Blend boundaries", 
		ui_opts : {root_classes : [], label : true},
		elements : {
		    blendl : { name : "BlendLeft", value : true, type : "bool" , ui_opts : {visible : true,label:true}},
		    blendr : { name : "BlendRight", value : true, type : "bool" , ui_opts : {visible : true, label:true}},
		}
	    },
	    colors : {
		name : "Colors",
		ui_opts : {label : true},
		elements : {
		    
		    outleft : { name : "OutL", type : "color", value : "#fff", ui_opts : {root_classes : ["inline"], label:true}},
		    inleft : { name : "InL", type : "color", value : "#fff", ui_opts : {root_classes : ["inline"], label:true}},
		    inright : { name : "InR", type : "color", value : "#fff", ui_opts : {root_classes : ["inline"], label:true}},
		    outright : { name : "OutR", type : "color", value : "#fff", ui_opts : {root_classes : ["inline"], label:true}},
		}
	    },
	    split : {name : "Split section", type : "action", ui_opts : { label: true, btn_type : "xs", fa_icon : "insert"}},
	    delete : {name : "Delete section", type : "action", ui_opts : { label: true, btn_type : "xs", fa_icon : "delete"}},
	    
	}
	
    },
    
    cursor_info : {
	name : "Cursor",
	ui_opts : {
	    root_classes : ["container-fluid"], child_classes : ["container-fluid"]
	},
	elements : {
	    position : {
		//name : "Cursor position",
		ui_opts : {
		    root_classes : ["container-fluid panel panel-default"], child_classes : ["row"]
		},
		elements : {
		    screen : {
			type: "labelled_vector",
			name : "Screen pixel",
			value_labels : ["X","Y"],
			value : [0,0],
			ui_opts : { label : true, root_classes : ["col-sm-6"], child_classed : ["inline"] }
		    },
		    astro : {
			type: "labelled_vector",
			name : "Equatorial coordinates",
			value_labels : ["Ra","Dec"],
			value : [0,0],
			ui_opts : { label : true, root_classes : ["col-sm-6"], child_classed : ["inline"] }
		    }
		}
	    },
		    
	    layers : {
		//name : "Layers",
		ui_opts : { root_classes : ["col-sm-12"], child_classes : ["row"] }
	    }
	    
	}
    },
    
    cursor_layer_info : {
	name : "Cursor Layer Info",
	//type : "cursor_layer_info",
	ui_opts : {root_classes : ["col-xs-12 col-md-6 "], name_classes : [], child_classes : ["inline"], label : true},
	elements : {
	    imgpos : {
		type: "labelled_vector",
		name : "",
		value_labels : ["P<sub>X</sub>","P<sub>Y</sub>"],
		value : [0,0],
		ui_opts : { child_classes : ["inline"] }
	    },
	    pixval : {
		name : "I",
		type : "double",
		ui_opts : { label : true, item_classes : ["inline"] }
	    }
	}
    },

    gl_options : {
	name : "Viewer options",
	ui_opts : {
	    root_classes : ["col-md-12"],
	    //sliding : true, slided : false,
	    child_view_type : "div",
	    render_name : true,
	    subtitle : "Set display options",
	    child_classes : ["container-fluid form form-horizontal"]
	},
	elements : {
	    image_axes : {
		name : "Show image axes", type : "bool", default_value : false, ui_opts : {
		    type : "edit", label : true,
		    root_classes : ["form-group"]
		}
	    },
	    x_plot : {
		name : "Show X plot", type : "bool", default_value : false, ui_opts : { type : "edit", label : true, root_classes : []}
	    },
	    y_plot : {
		name : "Show Y plot", type : "bool", default_value : false, ui_opts : { type : "edit", label : true, root_classes : []}
	    },
	    interp_cmap : {
		name : "Interpolate colormap", type : "bool", default_value : true, ui_opts : { type : "edit", label : true, root_classes : [] }
	    }


	}
    },

    geometry : {
	name : "Geometry",
	ui_opts: {
	    //root_classes : ["inline"],  editable : false, sliding : false, sliding_dir : "h", slided : true
	    //render_name : false,
	    child_view_type : "div",
	    fa_icon : "crop",
	    root_classes : ["col-md-12"],
	    child_classes : ["container-fluid"]
	},

	elements : {
	    zoom : {
		name : "Scale", type: "double", min : 0.00001, max : 1000.0, step: 0.0001, value : 1.0, 
		ui_opts : { editable : true, root_classes : ["inline"], sliding : false, sliding_dir : "h", slided : true, label: true,
			    fa_icon : "crosshairs"} 
	    },


	    translation : {
		name : "Translation",
		tip : "Translation vector in image pixels units",
		type : "labelled_vector",
		value : [0,0],
		value_labels : ["T<sub>X</sub>","T<sub>Y</sub>"],
		
		min : "-8192", 
		max : "8192", 
		step: "1",
		ui_opts: {root_classes : [ "inline", "number_fixed_size"], child_classes : ["inline"],
			  editable : true, sliding : false, sliding_dir : "h", slided : true, label: true}
	    },
	    rotation : {
		name : "Rotation",
		ui_opts: {sliding: false, sliding_dir:"h", slided : true,
			  root_classes : ["inline"], label: true, fa_icon : "rotate-left",
			  child_classes : ["inline"]
			 },
		elements : {
		    angle : {
			name : "R<sub>α</sub>",type : "angle", value : 0.0, min : -100.0, max : 100.0, step: 0.02,
			tip : "Rotation angle value, in radians, trigonometric counting",
			ui_opts : { editable : true,root_classes : [ "inline"], label: true, item_classes : ["inline"] }
		    },

		    center : {
			name : "R<sub>C</sub>",
			tip : "Rotation center in image frame pixel units",
			type : "labelled_vector",
			value : [0,0],
			value_labels : ["Rx","Ry"],
			min : "-8192", 
			max : "8192", 
			step: "1",
			ui_opts: {
			    root_classes : [ "inline"],
			    child_classes : ["inline"],
			    editable: true, sliding : false, sliding_dir : "h", slided: false , label: true
			    
			}
		    }
		}
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
	ui_opts : { editable : true, label : true, item_classes : ["inline"] },
	
    },


    levelconf : {
	//xname : "Colors/Levels",
	ui_opts : { type: "short", root_classes : [], 
		    //sliding : true , sliding_dir : "v", slided : true,
		    child_view_type : "pills" 
		  },
	//ui_opts : {child_classes : ["column"]},
	elements : {
	    
	}
    },
    
    
    gl_image_layer : {
	name :  "Image view",

	ui_opts : {
	    root_classes : ["container-fluid"],
	    //child_classes : ["container-fluid"],
	    child_view_type : "tabbed",
	    close: true,
	    //toolbar_brand : true
	}, 
	//toolbar : { ui_opts : { toolbar_classes : ["navbar navbar-default"]} },
	elements : {
	    geometry : {
		name : "Layer options", subtitle  : "Set up parameters for this layer",
		type :  "geometry",
		ui_opts : {
		    //root_classes : ["col-md-12"],
		    //render_name : false
		    //sliding : true , sliding_dir : "h", slided : false
		    //child_view_type : "pills" 
		    name_node : "h4"
		},
		elements : {
		    enable : {
			name : "Display",
			type : "bool",
			value : true,
			ui_opts : {label : true, type : "edit", root_classes : ["inline"]}
		    },
		    lum :  {
			name : "Luminosity", type: "double", min : "0", max : "1.0", step: "0.01", value : ".1", 
			ui_opts : {
			    input_type : "range", editable: true , type : "short",
			    root_classes : ["inline"],
			    label : true,
			    fa_icon : "lightbulb-o"
			}
		    }
		}
	    },
	    cmap : {
	    	type : "colormap",
	    	ui_opts : { name_node : "h4" }
	    },
	    // histo : {
	    	    // 	name : "Colors and cuts",
	    // 	ui_opts : { root_classes : ["inline"], child_classes : "inline", sliding : true , sliding_dir : "h", slided : false },
	    // 	elements : {
	    
	    histo : {
	    	name : "Data histogram, value cuts",
	    	subtitle : "Display the histogram and select the value bounds fitting into the colormap.",
	    	intro : "<br/><br/><p class='alert alert-warning'><strong>This is buggy, sorry !</strong>The vector view (based on d3.js) is not yet very stable.</p>",
	    	type : "vector",

	    	ui_opts : {
	    	    root_classes : ["container-fluid"],
		    //child_classes : ["container-fluid"],
	    	    fa_icon : "signal",
	    	    name_node : "h4",
		    enable_selection : true
	    	},
	    	elements : {
	    	    cuts :{
	    		name : "Value cuts", type  : "cuts", 
	    		ui_opts: {
	    		    editable : true,  type : "short",
	    		    //root_classes : ["inline"],
			    //child_classes : ["inline"],// child_classes : ["container"],
	    		    label : true
	    		}
	    	    }
		    
		    
	    	}
		
		
	    }
	    
	}
    },
    
    xd1 : {
	name: "XD-1",
	subtitle : "FITS viewer",
	//type : "template",
	//tpl_builder : "xd1",
	
	toolbar : {
	    ui_opts : {
		toolbar_classes : ["navbar-fixed-top navbar-inverse"]
	    }
	},

	ui_opts: {
	    icon : "/XD-1/ico/discovery1_small.png",
	    //icon : "/XD-1/ico/xd-1.svg",
	    child_view_type : "pills",
	    root: true,
	    tabs_on_name: true,
	    root_classes: [],
	    child_classes : [],
	    name_node : "h3",
	    toolbar_brand : true
	},

	elements : {
	    objects : {
		name : "FITS images",
//		name_node : "h1",
		type : "object_editor",
		ui_opts: {
		    root_classes : ["col-md-12"],
		    fa_icon : "folder"
		},
		elements : {
		    
		}
	    },
	    
	    drawing : {
		name : "Views",
		ui_opts : {
		    //child_view_type : "div",
		    child_view_type : "divider",
		    root_classes : [],
		    child_classes : [],
		    //fa_icon : "image",
		    icon : "/XD-1/ico/stars.jpg",
		    render_name : false,
		    
		},
		//type : "string", value : "Hello widget !",
	    	elements : {
		    views : {
			name : "GL Views",
			//type : "view_manager",
			ui_opts: {
			    child_view_type : "tabbed",
			    render_name: false,
			    root_classes : ["col-md-4 col-xs-12 scrolling"],
			    //child_classes : ["container-fluid"]
			},
			elements : {}
		    },
		    
	    	    screen : {
			ui_opts : {
			    root_classes : ["col-md-8"],
			    //root_classes : ["container-fluid"],
			    child_classes : [],
			    item_classes : []},
			
	    		//name : "GL Screen"
	    		//type : "glscreen"
	    	    }
		    
	    	}
		
		//name : "GL 2D Screen",
		//intro  : "GL multiviews ...",
		//ui_opts : { root_classes : [], child_view_type : "tabbed" },
		//elements : {}
	    },
	    
	    demo : {
		name : "Multiband demos",
		subtitle : "Loads images from different wavelength bands in multiple color layers of the same display.",
		type : "demo_multilayer",
		ui_opts : {
		    root_classes : ["container-fluid"],
		    child_classes : ["row"], name_classes : [],
		    name_node : "h2",
		    icon : "/XD-1/ico/multi-layer.svg"

			  },
		elements : {
		    
		    cnx : {
			ui_opts : {label: true, root_classes : ["container"], sliding: true, slided: false},
			name : "Websocket",
			tip : "Websocket connexion to a sadira server",
			type : "socket"
			
		    },
		    demos : {
			name : "Choose an image set :",
			ui_opts :{child_classes : ["action_box vertical"],root_classes : ["container"]},
			
			elements : {
			    catseye : {
				name : "The Cat's Eye nebula (old HST data), 4 filters.",
				type : "action",
				ni : 4,
				demo_name : "catseye",
				ui_opts : { root_classes : [], item_classes : ["btn btn-info btn-lg btn-block"]}
			    },
			    loiano : {
				name : "Star field taken from Loiano observatory, 4 filters.",
				type : "action",
				ni : 4,
				demo_name : "loiano",
				ui_opts : {  item_classes : ["btn btn-info btn-lg btn-block"] }
			    },
			    M42 : {
				name : "Orion nebula as seen by Hubble, in red and infrared (2 filters).",
				type : "action",
				ni : 2,
				demo_name : "M42",
				ui_opts : {  item_classes : ["btn btn-info btn-lg btn-block"]}
			    }
			}
		    }
		}
	    },
	    about : {
		type : "html",
		url : "/XD-1/about.html",
		ui_opts : {
		    name_node : "h1",
		    name_classes : [],
		    root_classes : ["container-fluid"],
		    item_classes : ["container"],
		    icon : "/XD-1/ico/discovery1_small.png"
		},
		name : "About...",
		subtitle: "A multi-document, multi-layer FITS image viewer."
	    }
	}
	//     },
	// }
    },
    
    gl_multilayer : {
	name : "GL Multilayer",
	events : ["gl_ready"],
	ui_opts: {
	    child_view_type : "pills", render_name: false, close: true,
	    root_classes : [""],child_classes : [""]
	},
	elements : {
	    geometry : {
		tip : "View geometry",
		subtitle : "Change GL view's geometrical parameters",
		type : "geometry",
		ui_opts : {root_classes : [], name_node : "h4"}
		//ui_opts: {sliding: true, child_view_type : "div"}
			 
	    },
	    cursor : {
		//ui_opts : {render_name : false, root_classes : ["col-md-12"]},
		subtitle : "Display cursor position information",
		type :  "cursor_info",
		ui_opts : {fa_icon : "bullseye", name_node : "h4"} 
	    },
	    options : {
		type : "gl_options",
		subtitle : "GL display options",
		ui_opts : {
		    fa_icon : "list",
		    name_node : "h4"
		},
	    },
	    layers : {
		name :  "Image Layers",
		subtitle : "Configure this view's image layers.",
		intro : "<p>Up to four image layers can be displayed using a unique floating point RGBA texture as data input.</p><p> Geometry and color computations are done for every screen pixel using an OpenGL shader program using the 4-band floating-point texture and other small pseudo-textures containing the geometrical, colormap and other parameters needed for the final pixel color computation.</p><p> All the texture data is pre-loaded in the GPU RAM and parallel processed by the many potential GPU cores (thousands on high end hardware), resulting in an incredibly fast rendering of the rather complex XD-1 image pipeline.</p>",
		
		ui_opts: {
		    //sliding: true,
		    root_classes : [],
		    child_classes : ["row"],
		    child_view_type : "tabbed",
		    render_name : true,
		    fa_icon : "film",
		    name_node : "h4"
		},
		elements : {}
	    },
	    iexport : {
		name : "Export image",
		intro : "<p>The WebGL canvas content is encoded as a  base64 string embedded to an html image attached to a new browser tab/window.</p><p>This is the most straight way to produce a PNG image from an HTML canvas.",
		subtitle : "Save current GL view as a bitmap.",
		ui_opts : {root_classes : [],
			   item_classes : [],
			   name_node : "h4"
			  },
		elements : {
		    topng : {
			name : "Save view to PNG",
			type : "action"
		    }
		}
		
	    }
	}	
    }
    ,
    glscreen : {
	//type : "glscreen",
	ui_opts : {root_classes : [] }
    }
};


(function(){
  //window.tmaster=new local_templates();
//    window.addEventListener("load",function(){
    sadira.listen("ready",function(){
	tmaster.add_templates(xd1_templates);
	//console.log("adding xd1 templates");
	tmaster.icons={
	    /*	double : "sadira/icons/svg/double.svg", 
		bool : "sadira/icons/svg/bool.svg",
		string : "sadira/icons/svg/string.svg",
		
	    */
	    image : "/sadira/icons/mat_float.svg",
	    colormap : "/sadira/icons/svg/colormap.svg",
	    //object_editor : "/XD-1/ico/directory.svg",
	    gl_multilayer : "/XD-1/ico/gl_viewport.svg",
	    //gl_image_layer : "/sadira/icons/svg/plot.svg",
	    view_manager : "/sadira/icons/svg/plot.svg",
	};
    });
    

})();

