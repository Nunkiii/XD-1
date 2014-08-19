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
		name : "Data colors and cuts",
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


(function(){
  window.tmaster=new local_templates();
  
  tmaster.add_templates(xd1_templates);
  tmaster.add_templates(image_db_browser_templates);

})();

