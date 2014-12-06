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
		name : "Size",
		type : "bytesize"
	    },
	    binary_type : {
		name : "Binary type",
		type : "string"
	    }
	},
	
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

    sky_coords : {
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
		ui_opts : {editable: false, sliding : false, slided : false, type : "edit"}
	    },
	    keys : { name : "Metadata", type : "text", elements : {}, ui_opts: {sliding: true, slided: false}},
	    dims : { type: "template", template_name : "image_dimensions", ui_opts: {sliding: false, slided: false}},
	    bounds : {
		type : "labelled_vector",
		name : "Data value bounds",
		value : [0,0],
		value_labels : ["Min","Max"],
		min : "-100000", 
		max : "100000", 
		ui_opts : { editable : false, sliding : false , sliding_dir : "h",slided : false }
		//ui_opts: {}
	    },
	    view : {
		name: "Display",
		ui_opts: {sliding: false, slided: false, bar : false},
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
	ui_opts : { child_view_type : "bar"},
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
//	name : "Color segment edit",
	ui_opts : { root_classes : []},
	elements : {
	    range : {
		name : "Range", 
		type : "labelled_vector", 
		value : [0,1], 
		value_labels : ["Start","End"], min : "0", max : "1", step : ".01",
		ui_opts : {root_classes : [], editable : true, type : "short"} 
	    },	    
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
    
    cursor_info : {
	name : "Cursor",
	ui_opts : {sliding : true, slided : false},
	elements : {
	    screen : {
		type: "labelled_vector",
		name : "Screen pixel",
		value_labels : ["X","Y"],
		value : [0,0]
	    },
	    astro : {
		type: "labelled_vector",
		name : "Equatorial coordinates",
		value_labels : ["Ra","Dec"],
		value : [0,0]
	    },
	    layers : {
	    }
	    
	}
    },
    
    cursor_layer_info : {
	name : "Info",
	elements : {
	    imgpos : {
		type: "labelled_vector",
		name : "Image pixel",
		value_labels : ["X","Y"],
		value : [0,0]
	    },
	    pixval : {
		name : "Pixel value",
		type : "double"
	    }
	}
    },

    options : {
	name : "Viewer options",
	ui_opts : {sliding : true, slided : false, child_view_type : "div"},
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
	ui_opts: {root_classes : ["inline"],  editable : false, sliding : false, sliding_dir : "h", slided : true},
	//ui_opts: {root_classes : [], child_classes : [], sliding : true, sliding_dir : "h", slided : true},
	elements : {
	    translation : {
		name : "Translation",
		intro : "Translation vector in image pixels units",
		type : "labelled_vector",
		value : [0,0],
		value_labels : ["Tx","Ty"],
		min : "-8192", 
		max : "8192", 
		step: "1",
		ui_opts: {root_classes : [ "inline", "number_fixed_size"], editable : true, sliding : false, sliding_dir : "h", slided : true}
	    },

	    rotation : {
		name : "Rotation",
		ui_opts: {sliding: false, sliding_dir:"h", slided : true, root_classes : ["inline"]},
		elements : {
		    angle : {
			name : "Angle",type : "angle", value : 0.0, min : -100.0, max : 100.0, step: 0.02,
			intro : "Rotation angle value, in radians, trigonometric counting",
			ui_opts : { editable : true,root_classes : [ "inline"] }
		    },

		    center : {
			name : "Center",
			intro : "Rotation center in image frame pixel units",
			type : "labelled_vector",
			value : [0,0],
			value_labels : ["Rx","Ry"],
			min : "-8192", 
			max : "8192", 
			step: "1",
			ui_opts: {
			    root_classes : [ "inline"],
			    editable: true, sliding : true, sliding_dir : "h", slided: false }
		    }
		}
	    },
	    
	    zoom : { name : "Scale", type: "double", min : 0.00001, max : 1000.0, step: 0.0001, value : 1.0, 
		     ui_opts : { editable : true, root_classes : ["inline"], sliding : false, sliding_dir : "h", slided : true} 
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
	type : "template",
	tpl_builder : "xd1_layer",
	ui_opts : { root_classes : ["inline"], child_classes : ["newline"], //name_classes : ["inline"], item_classes : ["inline"], 
		    //child_view_type : "tabbed", 
		    type : "short", sliding: false, slided : false, sliding_dir : "v", child_view_type : "bar" }, 
	
	elements : {
	    enable : {
		name : "Enable",
		type : "bool",
		value : true,
		ui_opts : {editable : true, label : true, type : "edit"}
	    }

	    /*,
	    image : {
		ui_opts : {  
		    sliding : true , sliding_dir : "h", slided : false, child_classes : ["newline"], child_view_type : "bar"
		},
		name : "Layer configuration",
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
	    }*/,
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
		name : "Colors/Levels",
		ui_opts : { type: "short", root_classes : ["inline"], 
			    sliding : true , sliding_dir : "v", slided : true,
			    child_view_type : "div" 
			  },
		//ui_opts : {child_classes : ["column"]},
		elements : {
		    lum :  {name : "Luminosity", type: "double", min : "0", max : "1.0", step: "0.01", value : ".1", 
			    ui_opts : {input_type : "range", editable: true , type : "short",  root_classes : ["inline"]} },
		    
		    // histo : {
		    // 	name : "Colors and cuts",
		    // 	ui_opts : { root_classes : ["inline"], child_classes : "inline", sliding : true , sliding_dir : "h", slided : false },
		    // 	elements : {
		    
		    
		    cuts : { name : "Value cuts", type : "template", template_name : "cuts", 
			     ui_opts: { sliding : false , sliding_dir : "h", slided : false, editable : true,  type : "short",  root_classes : ["inline"]}},
		    cmap : { 
			name : "Colormap", 
			type : "colormap",
			intro : "This is unstable (because of general questions of svg scaling and how to properly scale d3 plots). &#10; Used as sandbox. Should contain a list of «common» colormaps for straight use .and. these should come from the DB, generically.",
			ui_opts : {editable : true, sliding : false , sliding_dir : "h", slided : false,
				   root_classes : ["full"], item_classes : []
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
		    
		    histo : {
			name : "Histogram", 
			type : "vector",
			ui_opts : {width: 300, height: 200, margin : {top: 10, right: 15, bottom: 30, left: 70},
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
	name : "GL 2D View",
	ui_opts: {root_classes : ["inline"], item_classes : ["inline"], child_classes : ["inline"],  editable : false, sliding : false, sliding_dir : "h", slided : true, child_view_type : "tabbed"},
	//ui_opts: {sliding: true, sliding_dir:"h", root_classes : []},
	// elements : {
	//     layers : { 
	// 	name: "Layers", 
	elements : {
	    layers : {
		name : "Image Layers",
		ui_opts: {
		    sliding: false, sliding_dir:"h", slided : true, root_classes : ["inline"], child_classes : ["inline"],child_view_type : "tabbed"
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
		ui_opts : {editable: false, sliding : false, slided : false},
		intro : "Loads fits files from server using websocket in different layers of viewer",
		elements : {
		    
		    sadira : {
			intro : "Connexion to a <i>sadira</i> websocket server.",
			name : "Websocket link",
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

	//name : "XD-1",
	type : "template",
	tpl_builder : "xd1",
	//intro: "A multi-document, multi-layer FITS image viewer.",
	ui_opts: {child_view_type : "divider", root: true, divdir: false },
	
	elements : {
	    
	    ui : {
		
		ui_opts: {child_view_type : "tabbed", root_classes: []},
		
		elements : {
		    objects : { 
			name : "FITS images",
			type : "template",
			ui_opts: {render_name: false},
			template_name : "user_objects",
			elements : {}
		    },
		    
		    views : {
			name : "GL Views",
			type : "view_manager",
			ui_opts: {child_view_type : "tabbed", render_name: false},
			elements : {}
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
			intro : "Loads mutiband FITS images in different layers",
			tpl_builder : "demo_multilayer",
			elements : {
			    
			    cnx : {
				name : "Websocket",
				intro : "Link to a <i>sadira</i> websocket server",
				type : "template",
				template_name : "sadira"
				
			    },
			    demos : {
				intro : "Choose an image set",
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
		    about : { name : "About", type : "html", url : "about.html", ui_opts : {} }
		}
	    },
	    drawing : {
		//name : "GL 2D Screen",
		//intro  : "GL multiviews ...",
		//ui_opts : { root_classes : [], child_view_type : "tabbed" },
		//elements : {}
	    }
	}
    },
    
    

    gl_multilayer : {
	name : "GL Multilayer",
	type: "gl_multilayer",
	events : ["gl_ready"],
	ui_opts: {
	    child_view_type : "bar"
	},
	elements : {
	    geometry : {
		name : "View geometry",
		intro : "Change GL view's geometrical parameters",
		type : "template",
		template_name : "geometry",
		ui_opts: {
		    sliding: true, child_view_type : "div"
		}
	    },
	    cursor : {
		name : "Cursor",
		intro : "Display cursor position image information",
		template_name : "cursor_info",
		type : "template"
	    },
	    options : {
		name : "Options",
		intro : "GL display options",
		template_name : "options",
		type : "template"
	    },
	    layers : {
		name : "Image layers",
		ui_opts: {
		    sliding: true, child_view_type : "tabbed"
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
	    image : "sadira/icons/svg/mat_float.svg",
	    colormap : "sadira/icons/svg/colormap.svg",
	    object_editor : "sadira/icons/svg/root.svg",
	    gl_multilayer : "sadira/icons/svg/gl_viewport.svg",
	    gl_image_layer : "sadira/icons/svg/plot.svg",
	    view_manager : "sadira/icons/svg/plot.svg",
	};
    });
    

})();

