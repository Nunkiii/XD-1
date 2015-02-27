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
	ui_opts : {editable: false, sliding : false, slided : false, type : "edit"}
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
	ui_opts : {child_view_type : "div", close: true, render_name : true },
	events : ["image_ready"],
	elements : { 
	    source : {
		intro: "Select a FITS image file on your local filesystem",
		name : "FITS file",
		type : "local_file",
		ui_opts : {editable: false, sliding : false, slided : false, type : "edit"},
		elements : {
		    keys : { name : "Metadata", type : "text", elements : {}, ui_opts: {sliding: true, slided: false, label : true}}
		}
		
	    },
	    
	    dims : { type: "template", template_name : "image_dimensions", ui_opts: {sliding: false, slided: false}},
	    bounds : {
		type : "labelled_vector",
		name : "Data value bounds",
		value : [0,0],
		value_labels : ["Min","Max"],
		min : "-100000", 
		max : "100000", 
		ui_opts : { editable : false, sliding : false , sliding_dir : "h",slided : false, label : true }
		//ui_opts: {}
	    },
	    view : {
		name: "Display",
		ui_opts: {sliding: false, slided: false, bar : false, child_classes : ["btn-group"]},
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
	ui_opts : { child_view_type : "bar", close: true},
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
	//ui_opts : {sliding : true, slided : false},
	elements : {
	    screen : {
		type: "labelled_vector",
		name : "Screen pixel",
		value_labels : ["X","Y"],
		value : [0,0],
		ui_opts : { label : true, root_classes : ["inline"] }
	    },
	    astro : {
		type: "labelled_vector",
		name : "Equatorial coordinates",
		value_labels : ["Ra","Dec"],
		value : [0,0],
		ui_opts : { label : true, root_classes : ["inline"] }
	    },
	    layers : {
	    }
	    
	}
    },
    
    cursor_layer_info : {
	name : "Cursor Layer Info",
	type : "cursor_layer_info",
	elements : {
	    imgpos : {
		type: "labelled_vector",
		name : "Image pixel",
		value_labels : ["X","Y"],
		value : [0,0],
		ui_opts : { label : true }
	    },
	    pixval : {
		name : "Pixel value",
		type : "double",
		ui_opts : { label : true }
	    }
	}
    },

    options : {
	name : "Viewer options",
	ui_opts : {
	    //sliding : true, slided : false, child_view_type : "div",
	    child_classes : ["action_box", "vertical"]
	},
	elements : {
	    image_axes : {
		name : "Show image axes", type : "bool", value : false, ui_opts : { type : "edit" }
	    },
	    x_plot : {
		name : "Show X plot", type : "bool", value : false, ui_opts : { type : "edit"}
	    },
	    y_plot : {
		name : "Show Y plot", type : "bool", value : false, ui_opts : { type : "edit"}
	    }

	}
    },

    geometry : {
	
	name : "Geometry",
	intro : undefined,
	ui_opts: {
	    //root_classes : ["inline"],  editable : false, sliding : false, sliding_dir : "h", slided : true
	    //render_name : false,
	    child_view_type : "div"
	    
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
			  root_classes : ["inline"], label: true},
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
		     ui_opts : { editable : true, root_classes : ["inline"], sliding : false, sliding_dir : "h", slided : true, label: true} 
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
	ui_opts : { //root_classes : ["inline"], child_classes : ["newline"], //name_classes : ["inline"], item_classes : ["inline"], 
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
		ui_opts : {editable : false, label : false, type : "edit"}
	    },
	    geometry : {
		name : "Layer geometry",
		type : "template",
		template_name : "geometry",
		ui_opts : {
		    
		    root_classes : [], child_classes : [], 
		    //sliding : true , sliding_dir : "h", slided : false
		    //child_view_type : "pills" 
		},
		elements : {
		}
	    },
	    lum :  {name : "Luminosity", type: "double", min : "0", max : "1.0", step: "0.01", value : ".1", 
		    ui_opts : {input_type : "range", editable: true , type : "short",  root_classes : [], label : false} },
	    
	    // histo : {
		    // 	name : "Colors and cuts",
	    // 	ui_opts : { root_classes : ["inline"], child_classes : "inline", sliding : true , sliding_dir : "h", slided : false },
	    // 	elements : {
	    
		    
	    cmap : { 
		name : "Colormap", 
		type : "colormap",
		//intro : "This is unstable (because of general questions of svg scaling and how to properly scale d3 plots). &#10; Used as sandbox. Should contain a list of «common» colormaps for straight use .and. these should come from the DB, generically.",
		ui_opts : {editable : true,
			   root_classes : [], item_classes : [],
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
			 sliding : false , sliding_dir : "h", slided : false, editable : true,  type : "short",  root_classes : ["inline"],
			 label : false
		     }},
	    
	    histo : {
		name : "Histogram",
		type : "template",
		template_name : "vector",
		ui_opts : {
		    //width: 300, height: 200, margin : {top: 10, right: 15, bottom: 30, left: 70},
		    //root_classes : [], item_classes : [],
		    sliding : false , sliding_dir : "h", slided : true
		}
		
		
	    }
	    
	    // ,
	    // general : {
	    // 	type : "template", template_name : "levelconf"
	    
	    // }
	    
	}
    },
    
    gl_view_2d :  {
	name : "GL 2D View",
	ui_opts: {
	    //root_classes : ["inline"], item_classes : ["inline"], child_classes : ["inline"],  editable : false, sliding : false, sliding_dir : "h", slided : true,
	    child_view_type : "tabbed"},
	//ui_opts: {sliding: true, sliding_dir:"h", root_classes : []},
	// elements : {
	//     layers : { 
	// 	name: "Layers", 
	elements : {
	    layers : {
		name : "Image Layers",
		ui_opts: {
		    //sliding: false, sliding_dir:"h", slided : true, root_classes : ["inline"], child_classes : ["inline"],
		    child_view_type : "tabbed"
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
		    sliding: false, child_view_type : "div"
		}
	    },
	    demo : {
		name : "Multi-Wavelength demos",
		ui_opts : {editable: false, sliding : false, slided : false, child_classes : ["action_box","vertical"]},
		intro : "Loads multiple fits files of different wavelength band in multiple color layers.",
		elements : {
		    sadira : {
			intro : "Websocket connexion to sadira server.",
			name : "Websocket",
			type : "template",
			template_name : "sadira"
		    },
		    catseye : {
			intro : "The Cat's Eye nebula as seen by Hubble a long time ago, with 4 different filters.",
			name : "Hubble Cat's Eye Nebula (4 filters)",
			type : "action",
			ui_opts : { root_classes : ["inline"]}
		    },
		    M42 : {
			intro : "Orion nebula as seen by Hubble, in red and infrared.",
			name : "Hubble M42 Nebula (2 filters)",
			type : "action",
			ui_opts : { root_classes : ["inline"]}
		    }
		}
	    },

	    about : { name : "About", type : "html", url : "about.html", ui_opts : { sliding : false, sliding_dir : "v", slided : false, root_classes : ["inline"]} },

   
	}
	
    },
    
    xd1 : {

	//name: "XD1", 
	type : "template",
	tpl_builder : "xd1",
	ui_opts: {child_view_type : "pills", root: true, label: true, divdir: false, split_frac : 33, root_classes : ["container-fluid"], child_classes : ["row"] },
	
	// elements : {

	    
	//     ui : {
	// 	name : "Images",
	// 	//subtitle : "A multi-document, multi-layer FITS image viewer",
	// 	ui_opts: {child_view_type : "tabbed", root_classes : ["col-md-6","left"], name_classes : [], name_node : "h2"},
		
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
		type : "template",
		ui_opts: {},
		template_name : "user_objects",
		elements : {
		    
		}
	    },
	    
	    drawing : {
		name : "Views",
		ui_opts : { child_view_type : "div", divdir : false, root_classes : ["row","right"]},
		//type : "string", value : "Hello widget !",
	    	elements : {
		    views : {
			name : "GL Views",
			type : "view_manager",
			ui_opts: {child_view_type : "tabbed", render_name: false, root_classes : ["col-md-6"]},
			elements : {}
		    },
		    
	    	    screen : {
			ui_opts : { root_classes : ["col-md-6"], item_classes : ["col-md-6"]},
	    		//name : "GL Screen"
	    		//type : "glscreen"
	    	    }
		    
	    	}
		
		//name : "GL 2D Screen",
		//intro  : "GL multiviews ...",
		//ui_opts : { root_classes : [], child_view_type : "tabbed" },
		//elements : {}
	    },
	    
	    /*
	      
		      setup : {
		      name : "Setup",
		      elements : {
		      sadira : {
		      tip : "DEV",
		      name : "Sadira link",
		      type : "template",
		      template_name : "sadira"
		      }
		      }
		      },
		      telescope_control : {
		      name: "Telescope control",
		      ui_opts : { child_view_type : "tabbed"},
		      elements : {
		      mount : {
		      name : "Pointing",
		      type : "template",
		      template_name : "mount_control",
		      ui_opts : { sliding : false, slided: false },
		      },
		      camera_science : {
		      name : "Science Camera",
		      type: "template",
		      template_name : "sbig_control",
		      ui_opts : { sliding : false, slided: false }
		      },
		      camera_guider : {
		      name : "Guider Camera",
		      type: "template",
		      template_name : "sbig_control",
		      ui_opts : { sliding : false, slided: false }
		      },
		      filter_wheel : {
		      ui_opts : { sliding : false, slided: false },
		      name : "Filter wheel"
		    }
		    }
		    },
		    */
		    
		    demo : {
			name : "Multiband demos",
			ui_opts : {render_name: false},
			intro : "Loads multiple FITS files of different wavelength band in multiple color layers.",
			tpl_builder : "demo_multilayer",
			elements : {
			    
			    cnx : {
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
	    child_view_type : "pills", render_name: false, close: true
	},
	elements : {
	    geometry : {
		tip : "View geometry",
		intro : "Change GL view's geometrical parameters",
		type : "template",
		template_name : "geometry"
		//ui_opts: {sliding: true, child_view_type : "div"}
			 
	    },
	    cursor : {
		ui_opts : {render_name : false},
		intro : "Display the cursor position image information",
		template_name : "cursor_info",
		type : "template"
	    },
	    options : {
		ui_opts : {render_name : false},
		intro : "GL display options",
		template_name : "options",
		type : "template"
	    },
	    layers : {
		name : "Image layers",
		ui_opts: {
		    //sliding: true,
		    child_view_type : "tabbed",
		    render_name : false
		},
		elements : {}
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

