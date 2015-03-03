var xd1_templates={
    
    mount_control : {
	type : "mount_control",
	name : "Mount control",
	elements : {
	    config : {
		elements : {
		    server : {
			name : "Mount server",
			type : "template",
			template_name : "sadira"
		    },
		}
	    },
	    status : {
		name : "Mount status",
		elements : {
		    position : {
			name : "Current position",
			type : "sky_coords"
			
		    }
		}
	    },
	    actions : {
		name : "Actions",
		
		elements : {
		
		    goto_radec : {
			name : "Goto Ra-Dec",
			elements : {
			    coords : {
				name : "Coordinates",
				type : "sky_coords",
				value : [0,0]
			    },
			    go : {
				name : "Goto",
				type : "action"
			    }
			}
		    },
		    slew : {
			name : "Slew telescope",
			elements : {
			    speed : {
				name : "Slewing speed",
				type : "double",
				value : 0
			    },
			    arrow_pad : {
				name : "Direction",
				type : "arrow_pad"
			    },
			    slew : {
				name : "Slew",
				type : "action"
			    }
			    
			    
			}
		    }
		}
	    }
	}
    },
    
    sbig_control : {
	name : "SBIG Camera Control",
	type : "sbig_control",
	elements : {
	    server : {
		name : "Camera server",
		type : "template",
		template_name : "sadira",
		ui_opts : { bar : true}
	    },
	    exposure : {
		name : "Exposure configuration",
		elements : {
		    exptime : { name : "Exposure time (s)", type : "double"},
		    nexpo : { name : "Number of expos", type : "double"},
		    binning : { name : "Binning" }
		}
	    },
	    cooling : {
		name : "Cooling",
		elements : {
		    temp : {name : "CCD temperature", value : 0.0, type : "double"},
		    ambient_temp : {name : "Ambient temperature", value : 0.0, type : "double"},
		    pow : {name : "Cooling power", value : 0.0, type : "double"},
		    enable : {name : "Enable cooling", value : false, type : "bool", ui_opts : { type : "edit"} },
		    setpoint : {name: "Temperature setpoint", value : 0.0, type : "double", ui_opts : { type : "edit"}}
		}
	    },
	    actions : {
		name : "Actions",
		elements : {
		    start_camera : { 
			name : "Start camera", type : "action"
		    },
		    start_exposure : {
			name : "Start exposure", 
			type : "action",
			elements : {
			    expo_progress : {
				name : "Exposure",
				type : "progress"
			    },
			    grab_progress : {
				name : "Exposure",
				type : "progress"
			    }
			}
			
		    }
		}
	    },
	    last_image : {
		name : "Last image",
		type : "template",
		template_name: "image",
		elements : {
		    view : {
			name : "Preview",
			template_name : "gl_multilayer",
			type : "template"
		    }
		}
	    },
	    messages : {
		name : "Info",
		type : "text"
	    }
	}
    },

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
		type : "bytesize"
	    },
	    binary_type : {
		ui_opts : { label : true},
		name : "Binary type",
		type : "string"
	    }
	},
	
    },
    
    image_dimensions : {
	ui_opts : {type : "short", label : true},
	name : "Dimensions",
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
	intro: "Select a FITS image file on your local filesystem",
	name : "FITS file",
	type : "local_file",
	ui_opts : {label : true, editable: false, sliding : false, slided : false, type : "edit",
		   root_classes : ["col-md-12"], child_classes : ["row"]
		  }
/*

	ui_opts : { child_view_type : "radio", sliding : true, slided : false, root_classes : []}, 
	elements : {
	    local_fits : {
		ui_opts : {editable: false, sliding : false, slided : false, type : "edit"},
		name : "Local FITS file",
		type : "local_file",
		value : "No file selected"
	    }
	    ,
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
*/
    },
	
    image : {
	name : "Image",
	type : "template",
	tpl_builder : "image",
	template_name : "binary_object",
	ui_opts : {child_view_type : "div", close: true, render_name : true,
		   child_classes : ["row"], root_classes : ["container-fluid"] },
	events : ["image_ready"],
	elements : { 
	    source : {
		intro: "Select a FITS image file on your local filesystem",
		name : "FITS file",
		type : "local_file",
		ui_opts : {editable: false, sliding : false, slided : false, type : "edit",
			   root_classes : ["col-md-12"]
			  },
		elements : {
		    keys : { name : "Metadata", type : "text", elements : {},
			     ui_opts: {sliding: true, slided: false, label : true, root_classes : ["col-md-3"]}}
		}
		
	    },
	    
	    dims : { type: "template", template_name : "image_dimensions",
		     ui_opts: {sliding: false, slided: false,
			       root_classes : ["col-md-4"]
			      }},
	    bounds : {
		type : "labelled_vector",
		name : "Data value bounds",
		value : [0,0],
		value_labels : ["Min","Max"],
		min : "-100000", 
		max : "100000", 
		ui_opts : { editable : false, sliding : false , sliding_dir : "h",slided : false, label : true,
			    root_classes : ["col-md-4"]
			  }
		//ui_opts: {}
	    },
	    view : {
		name: "Display",
		ui_opts: {sliding: false, slided: false, bar : false,
			  root_classes : ["col-md-12"],
			  child_classes : ["btn-group"]},
		elements : {
		    new_display : {
			type : "action",
			name : "View in a new display"
		    },
		    add_to_display : {
			type : "action",
			name : "Select existing display",
		    },
		    display_list : {
			name : "Display list",
			type : "combo",
		    },
		    add : {
			type : "action",
			name : "Add layer in selected display"
		    }
		    
		}
	    }
	    

	}
    },

    image_reduction : {
	type : "image_reduction",
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
			type : "template",
			template_name : "image"
		    },
		    flat : {
			name : "Flat-field",
			ui_opts : { sliding : true, slided : false},
			type : "template",
			template_name : "image"
		    },
		    science : {
			name : "Science",
			ui_opts : { sliding : true, slided : false},
			type : "template",
			template_name : "image"
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
			type : "template",
			template_name : "image"
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
		name : "Image",type : "template",template_name:"image"
	    }
	}
    },
    user_objects : {
	name : "User objects",
	type : "object_editor",
	elements : {
	    new_object : { 
		name : "New image",
		type : "action"
		// elements : {
		//     img : { name : "An image", type : "template", template_name : "image"},
		//     toto : { name : "Toto", type : "double", value : 3.14}
		// }
	    },
	    new_datared : { 
		name : "New image reduction",
		type : "action"
	    },
	    tree : {
		//name : "Object tree",
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
	    root_classes : ["panel panel-default container-fluid"], child_classes : ["row"]
	},
	elements : {
	    screen : {
		type: "labelled_vector",
		name : "Screen pixel",
		value_labels : ["X","Y"],
		value : [0,0],
		ui_opts : { label : true, root_classes : ["col-md-6"] }
	    },
	    astro : {
		type: "labelled_vector",
		name : "Equatorial coordinates",
		value_labels : ["Ra","Dec"],
		value : [0,0],
		ui_opts : { label : true, root_classes : ["col-md-6"] }
	    },
	    layers : {
	    }
	    
	}
    },
    
    cursor_layer_info : {
	name : "Cursor Layer Info",
	type : "cursor_layer_info",
	ui_opts : {root_classes : ["container-fluid"], child_classes : ["row"], label : true},
	elements : {
	    imgpos : {
		type: "labelled_vector",
		name : "Image pixel",
		value_labels : ["X","Y"],
		value : [0,0],
		ui_opts : { label : true, root_classes : ["col-md-5"] }
	    },
	    pixval : {
		name : "Pixel value",
		type : "double",
		ui_opts : { label : true, root_classes : ["col-md-5"] }
	    }
	}
    },

    options : {
	name : "Viewer options",
	ui_opts : {
	    root_classes : ["panel panel-default container-fluid"],
	    //sliding : true, slided : false, child_view_type : "div",
	    render_name : true,
	    subtitle : "Set display options",
	    child_classes : ["col-md-12"]
	},
	elements : {
	    image_axes : {
		name : "Show image axes", type : "bool", value : false, ui_opts : { type : "edit", label : true, root_classes : ["inline"] }
	    },
	    x_plot : {
		name : "Show X plot", type : "bool", value : false, ui_opts : { type : "edit", label : true, root_classes : ["inline"]}
									 
	    },
	    y_plot : {
		name : "Show Y plot", type : "bool", value : false, ui_opts : { type : "edit", label : true, root_classes : ["inline"]}
	    }

	}
    },

    geometry : {
	
	name : "Geometry",
	ui_opts: {
	    //root_classes : ["inline"],  editable : false, sliding : false, sliding_dir : "h", slided : true
	    //render_name : false,
	    child_view_type : "div",
	    fa_icon : "crop"
	    
	},

	elements : {
	    translation : {
		name : "Translation",
		tip : "Translation vector in image pixels units",
		type : "labelled_vector",
		value : [0,0],
		value_labels : ["T<sub>X</sub>","T<sub>Y</sub>"],
		
		min : "-8192", 
		max : "8192", 
		step: "1",
		ui_opts: {root_classes : [ "inline", "number_fixed_size"],
			  editable : true, sliding : false, sliding_dir : "h", slided : true, label: true}
	    },

	    rotation : {
		name : "Rotation",
		ui_opts: {sliding: false, sliding_dir:"h", slided : true,
			  root_classes : ["inline"], label: true, fa_icon : "rotate-left"},
		elements : {
		    angle : {
			name : "R<sub>α</sub>",type : "angle", value : 0.0, min : -100.0, max : 100.0, step: 0.02,
			tip : "Rotation angle value, in radians, trigonometric counting",
			ui_opts : { editable : true,root_classes : [ "inline"], label: true }
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
			    editable: true, sliding : true, sliding_dir : "h", slided: false , label: true
			}
		    }
		}
	    },
	    
	    zoom : { name : "Scale", type: "double", min : 0.00001, max : 1000.0, step: 0.0001, value : 1.0, 
		     ui_opts : { editable : true, root_classes : ["inline"], sliding : false, sliding_dir : "h", slided : true, label: true,
				 fa_icon : "crosshairs"} 
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
	ui_opts : { editable : true, root_classes : [],label : true }
	//ui_opts: {root_classes : ["inline"]}
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
	name :  "GL Image layer",
	type : "template",
	tpl_builder : "xd1_layer",
	ui_opts : {
	    root_classes : [], child_classes : [],
	    child_view_type : "pills",
	    
		    //type : "short", sliding: false, slided : false, sliding_dir : "v", child_view_type : "bar",
	    render_name : false,
	    close: true
	}, 
	
	elements : {
	    enable : {
		name : "Enable layer",
		type : "bool",
		value : true,
		ui_opts : {editable : false, label : false, type : "edit", root_classes : ["col-md-12"]}
	    },
	    geometry : {
		name : "Layer geometry",
		type : "template",
		template_name : "geometry",
		ui_opts : {
		    root_classes : ["col-md-12"],
		    child_classes : [], 
		    //sliding : true , sliding_dir : "h", slided : false
		    //child_view_type : "pills" 
		},
		elements : {
		}
	    },
	    lum :  {name : "Luminosity", type: "double", min : "0", max : "1.0", step: "0.01", value : ".1", 
		    ui_opts : {
			input_type : "range", editable: true , type : "short", root_classes : ["col-md-12"], label : false,
			fa_icon : "lightbulb-o"
		    }

		   },
	    
	    // histo : {
		    // 	name : "Colors and cuts",
	    // 	ui_opts : { root_classes : ["inline"], child_classes : "inline", sliding : true , sliding_dir : "h", slided : false },
	    // 	elements : {
	    
		    
	    cmap : { 
		name : "Colormap", 
		type : "colormap",
		//intro : "This is unstable (because of general questions of svg scaling and how to properly scale d3 plots). &#10; Used as sandbox. Should contain a list of «common» colormaps for straight use .and. these should come from the DB, generically.",
		ui_opts : {editable : true,
			   root_classes : ["col-md-12"], item_classes : [],
			  },
			// value : [[0,0,0,1,0],
		// 	      [0.8,0.2,0.8,1.0,0.2],
		// 	      [0.9,0.9,0.2,1.0,0.2],
		// 	      [0.9,0.9,0.2,1.0,0.5],
			// 	      [0.9,0.2,0.2,1.0,0.5],
		// 	      [1,1,1,1,1]] },
		
		
		value : [[0,0,0,1,0],
				 [0.7,0.2,0.1,1.0,0.2],
			 [0.8,0.9,0.1,1.0,0.6],
			 [1,1,1,1,1]] 
	    },
	    cuts : { name : "Value cuts", type : "template", template_name : "cuts", 
		     ui_opts: {
			 sliding : false , sliding_dir : "h", slided : false, editable : true,  type : "short", root_classes : ["col-md-12"],
			 label : false
		     }},
	    
	    histo : {
		name : "Histogram",
		type : "template",
		template_name : "vector",
		ui_opts : {
		    //width: 300, height: 200, margin : {top: 10, right: 15, bottom: 30, left: 70},
		    //root_classes : [], item_classes : [],
		    sliding : false , sliding_dir : "h", slided : true,
		    root_classes : ["col-md-12"]
		}
		
		
	    }
	    
	    // ,
	    // general : {
	    // 	type : "template", template_name : "levelconf"
	    
	    // }
	    
	}
    },
    
    xd1 : {
	/*
	name: "XD1",
	intro : "JS/WebGL FITS viewer",
*/
	type : "template",
	tpl_builder : "xd1",
	ui_opts: {child_view_type : "pills", root: true, label: false, divdir: false, split_frac : 33, root_classes : ["container-fluid"], child_classes : ["row"] },
	
	toolbar : {
	    file : {
		name : "File",
		elements : {
		    open : {
			name : "Open FITS file"
		    },
		    demos : {
			name : "Load a demo"
		    },
		}
	    },
	    about : {
		name : "XD-1.984",
		intro: "A multi-document, multi-layer FITS image viewer."
	    }
	},
	
	
	elements : {
	    objects : {
		name : "Images",
		type : "template",
		ui_opts: {root_classes : ["col-md-12"]},
		template_name : "user_objects",
		elements : {
		    
		}
	    },
	    
	    drawing : {
		name : "Views",
		ui_opts : { child_view_type : "div", divdir : false, root_classes : ["col-md-12"], child_classes : ["row"],
			    fa_icon : "image",
			    render_name : false
			  },
		//type : "string", value : "Hello widget !",
	    	elements : {
		    views : {
			name : "GL Views",
			type : "view_manager",
			ui_opts: {child_view_type : "tabbed",
				  render_name: false,
				  root_classes : ["col-md-6"],
				  child_classes : [""]},
			elements : {}
		    },
		    
	    	    screen : {
			ui_opts : { root_classes : ["col-md-6"], item_classes : []},
			
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
		ui_opts : {render_name: false},
		subtitle : "Loads multiple FITS files of different wavelength band in multiple color layers.",
		tpl_builder : "demo_multilayer",
		ui_opts : { root_classes : [], child_classes : [], name_classes : ["page-header"] },
		elements : {
		    
		    cnx : {
			ui_opts : {label: true},
			name : "Websocket",
			tip : "Websocket connexion to a sadira server",
			type : "template",
			template_name : "sadira"
			
		    },
		    demos : {
			intro : "Choose an image set :",
			ui_opts :{child_classes : ["action_box","vertical"]},
			
			elements : {
			    catseye : {
				intro : "The Cat's Eye nebula (old HST data), 4 filters.",
				name : "Launch demo",
				type : "action",
				ni : 4,
				demo_name : "catseye",
				ui_opts : { root_classes : []}
			    },
			    loiano : {
				intro : "Star field taken from Loiano observatory, 4 filters.",
				name : "Launch demo",
				type : "action",
				ni : 4,
				demo_name : "loiano",
				ui_opts : { root_classes : []}
			    },
			    M42 : {
				intro : "Orion nebula as seen by Hubble, in red and infrared (2 filters).",
				name : "Launch demo",
				type : "action",
				ni : 2,
				demo_name : "M42",
				ui_opts : { root_classes : []}
			    }
			}
		    }
		}
	    },
	    about : {
		type : "html", url : "/XD-1/about.html", ui_opts : {},
		name : "About xd1",
		intro: "A multi-document, multi-layer FITS image viewer."
	    }
	}
	//     },
	// }
    },
    
    gl_multilayer : {
	name : "GL Multilayer",
	type: "gl_multilayer",
	events : ["gl_ready"],
	ui_opts: {
	    child_view_type : "pills", render_name: false, close: true,
	    root_classes : [""],child_classes : [""]
	},
	elements : {
	    geometry : {
		tip : "View geometry",
		subtitle : "Change GL view's geometrical parameters",
		type : "template",
		template_name : "geometry",
		ui_opts : {root_classes : ["panel panel-default col-md-12"]}
		//ui_opts: {sliding: true, child_view_type : "div"}
			 
	    },
	    cursor : {
		//ui_opts : {render_name : false, root_classes : ["col-md-12"]},
		subtitle : "Display cursor position information",
		template_name : "cursor_info",
		type : "template"
	    },
	    options : {
		ui_opts : {root_classes : ["panel panel-default col-md-12"]},
		subtitle : "GL display options",
		template_name : "options",
		type : "template"
	    },
	    layers : {
		name : "Image layers",
		ui_opts: {
		    //sliding: true,
		    root_classes : ["col-md-12"],
		    child_classes : ["row"],
		    child_view_type : "tabbed",
		    render_name : false
		},
		elements : {}
	    },
	    iexport : {
		name : "Export image",
		subtitle : "Save current GL view as a bitmap.",
		ui_opts : {root_classes : ["panel panel-default container-fluid"],
			  item_classes : ["row"]
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
	type : "glscreen", ui_opts : {root_classes : [] }
    }
};


(function(){
  //window.tmaster=new local_templates();
//    window.addEventListener("load",function(){
    sadira.listen("ready",function(){
	tmaster.add_templates(xd1_templates);
	console.log("adding xd1 templates");
	tmaster.icons={
	    /*	double : "sadira/icons/svg/double.svg", 
		bool : "sadira/icons/svg/bool.svg",
		string : "sadira/icons/svg/string.svg",
		
	    */
	    image : "/sadira/icons/svg/mat_float.svg",
	    colormap : "/sadira/icons/svg/colormap.svg",
	    object_editor : "/sadira/icons/svg/root.svg",
	    gl_multilayer : "/sadira/icons/svg/gl_viewport.svg",
	    gl_image_layer : "/sadira/icons/svg/plot.svg",
	    view_manager : "/sadira/icons/svg/plot.svg",
	};
    });
    

})();

