/*

  XD-1 - Qk/Sadira project
  Pierre Sprimont <sprimont@iasfbo.inaf.it>, INAF/IASF, Bologna, 2014
  
*/



template_ui_builders.xd1=function(ui_opts, xd){

    console.log("Hello xd1 constructor on node " + xd.xdone_node );
    
    //xd.ui_root.removeChild(xd.ui_name);
    
    var server_root=xd.server_root;
    var xdone_node=xd.xdone_node;

//    var bar_node  = cc("header", xd.xdone_node); bar_node.id="gfx_bar"; 
//    var gfx_node=cc("div",xdone_node); gfx_node.id="gfx";


    //for(var p in xd.elements ) console.log("xdp = " + p);
    var mwl_demo=xd.elements.demo;

    var user_objects=xd.elements.objects;
    var drawing_widget=xd.elements.drawing.elements.screen;

    drawing_widget.ui_root.style.overflow="hidden";

    user_objects.xd=xd;

    var drawing_node=cc("div", drawing_widget.ui_root);
    drawing_node.add_class("drawing_node");
    //drawing_widget.ui_root.

    
    

    
    
    xd.listen("view_update", function(){
	console.log("XD1 view update !");
    });
    
    //    console.log("drawing node is " + drawing_node);
    mwl_demo.xd=xd;

    /*
    xd.ui_childs.divider.listen("drag", function(){
	this.update();
    });
    */

    if(è(xd.ui_childs.divider))
	xd.ui_childs.divider.listen("drag_end", function(){
	    xd.gl_views.forEach(function(v){
		v.fullscreen(false);
	    });
	});
  
    
    var views=xd.elements.drawing.elements.views;
    
    xd.gl_views=[];
    xd.selected_view=null;
    
    xd.select_view=function(v){
	if(xd.selected_view!=null){
	    xd.selected_view.glscreen.ui.style.display="none";
	}
	xd.selected_view=v;
	xd.selected_view.glscreen.ui.style.display="block";
    }

    views.listen("element_selected", function(e){
	console.log("Selected !! " + e.name);
	xd.select_view(e);
    });
    

    xd.create_view=function(cb, opts){
	var glm=tmaster.build_template("gl_multilayer");
	
	
	//glm.parent=views;
	var glmui = create_ui({}, glm);

	glm.set_drawing_node(drawing_node);
	
	glm.listen("gl_ready", function(){
	    
	    var iv=setInterval(function(){
		var w=drawing_widget.ui_root.clientWidth;
		//console.log("W=" + drawing_widget.ui_root.clientWidth);
		if(w>0){
	
		    glm.trigger("view_update");
		    clearInterval(iv);
		}
		//drawing_node.style.height=drawing_widget.ui_root.clientWidth+"px";
	    }, 200);

	    
	    
	    cb(null,glm);
	});

	
	if(è(opts))
	    if(è(opts.name))
		glm.set_title(opts.name);

	console.log("Attach view...");

	var i=0; var vn=0;
	
	while( typeof views.elements["IV"+vn] != 'undefined'){
	    //console.log("Exists : " + views.elements["IV"+vn]);
	    vn++;
	    
	}
	console.log("Attach view...OK");
	views.elements["IV"+vn]=glm;
	views.ui_childs.add_child(glm, glmui);
	xd.gl_views.push(glm);

	xd.select_view(glm);
	
    }

    xd.create_image_view=function(image, cb, opts){

	xd.create_view(function(error, glm){
	    if(error!=null) return cb(error);
	    var l=glm.create_layer(image);

	    //glm.set_title(image.name);
	    cb(null,glm);

	}, opts);

    }
    
    //d.update();

    //console.log("Adding xdroot :  " + xd.ui_root);
    //bar_node.appendChild(xd.ui_root);
    //return xd.ui_root;
}

template_ui_builders.cursor_layer_info=function(ui_opts, cli){
    console.log("Building cursor info ....");
    var pxv=cli.elements.pixval;
    var cmdiv=cli.cmdiv=cc("div", pxv.ui_root); cmdiv.className="colormap";
    cmdiv.style.width="10em";
    cmdiv.style.height="1em";
}


template_ui_builders.gl_multilayer=function(ui_opts, glm){

    var glscreen=glm.glscreen;

    if(ù(glscreen)){
	glscreen=glm.glscreen=tmaster.build_template("glscreen"); 
	create_ui({}, glscreen,0 );
    }

    glm.canvas=glscreen.canvas;
    var ctx2d=glm.ctx2d=glscreen.canvas2d.getContext("2d");
    var server_root=è(glm.server_root) ? glm.server_root : "";
    var layer_objects=glm.elements.layers;
    
    
    var geo=glm.elements.geometry.elements;

    var tr=glm.tr=geo.translation;
    var zm=glm.zm=geo.zoom; 
    var ag=glm.ag=geo.rotation.elements.angle; 
    var rc=glm.rc=geo.rotation.elements.center;

    var topng=glm.elements.iexport.elements.topng;

    
    // if(typeof glm.drawing_node === 'undefined'){
    // 	console.log("No drawing node specified...");
    // 	glm.drawing_node=glm.ui_root;
    // }
    //
    
    glm.listen("close", function(){
	console.log("GLM close !");
	glm.drawing_node.removeChild(glscreen.ui);
	delete glm;
    });

    
    
    glm.pvals=[];
    glm.maxlayers=4;
    glm.layers=[];
    //glm.layer_enabled=[];
    //glm.p_layer_range=[];
    
    var cursor=glm.elements.cursor; 
    var options_tpl=glm.elements.options; 

    var layer_ci=[];
    var cil = cursor.elements.layers;

    for(var l=0;l<4;l++){
	layer_ci[l]=tmaster.build_template("cursor_layer_info"); 
	var lui=create_ui({},layer_ci[l]);
	cil.ui_childs.add_child(layer_ci[l], lui);
	lui.add_class("disabled");
    }


    var layer_enabled = glm.layer_enabled= new Int32Array([0,0,0,0]);
    
    glm.p_vals=new Float32Array(4*8);
    glm.p_rotcenters=new Float32Array(4*2);
    glm.p_layer_range=new Float32Array(4*2);
    glm.ncolors=new Int32Array([0,0,0,0]);    
    glm.cmap_texdata = new Float32Array(16*128);
    glm.cmap_fracdata = new Float32Array(16*128);
    
    glscreen.webgl_start({}, function(error, gl){
	
	if(error){
	    alert(error);
	    cb(error);
	    return;
	}

	console.log("Webgl started ok!");

	glm.gl=gl;

	tr.listen("change",function(){
	    //console.log("TR changed ! " + this.value[0]);
	    gl.uniform2fv(glm.tr_loc, this.value);
	    glm.render();
	});
		  
	zm.listen("change",function(){
	    update_zoom();
	});

	ag.listen("change",function(){
	    update_angle();
	    glm.render();
	});
	
	rc.listen("change",function(){
	    gl.uniform2fv(glm.rotcenter_loc, rc.value);
	    glm.render();
	});
	
	glm.set_drawing_node=function(node){
	    glm.drawing_node=node;
	    glm.drawing_node.appendChild(glscreen.ui);

	    glm.listen("view_update", function() {
		//console.log("glm view update");
		glm.glscreen.resize(glm.drawing_node.clientWidth, glm.drawing_node.clientHeight);
		glm.glscreen.canvas.focus();
		glm.render();
		//glm.ui_childs.add_child(glscreen.ui, glscreen);
		//var ov={w:0,h:0};//
		//var ov=get_overflow(glm.drawing_node);
		//var sz={w: parseFloat(ov.sty.width)-ov.w, h: parseFloat(ov.sty.height)-ov.h};
		
		//var sz={ w : glm.drawing_node.clientWidth, h: glm.drawing_node.clientHeight};
		//glscreen.resize(sz.w, sz.h);
	    });
	    
	    topng.listen("click", function(){
		var w=window.open(glm.glscreen.canvas.toDataURL("image/png"));
		//w.document.write("<img src='"+d+"' alt='from canvas'/>");
		
	    });

	    
	}

	glm.update_layer_ranges=function(){
	    var w=glscreen.canvas.clientWidth;
	    var h=glscreen.canvas.clientHeight;
	    
	    for(var l=0;l<glm.layers.length;l++){
		var lay=glm.layers[l];
		if(typeof lay!='undefined'){
		    glm.p_layer_range[2*lay.id]=lay.width*1.0/glm.w;
		    glm.p_layer_range[2*lay.id+1]=lay.height*1.0/glm.h;		
		}
	    }
	    console.log("setting new range " + JSON.stringify(glm.p_layer_range));
	    
    	    var rangeLocation = gl.getUniformLocation(glm.program, "u_layer_range");	
	    gl.uniform2fv(rangeLocation, glm.p_layer_range);
	}
	

	function update_angle(){
	    var alpha=1.0*glm.ag.value;
	    gl.uniform1f(glm.angle_loc, alpha);
	    glm.g_rmg=[[Math.cos(alpha),Math.sin(alpha)],[-1.0*Math.sin(alpha),1.0*Math.cos(alpha)]];
	    glm.g_rmgi=[[glm.g_rmg[0][0],-glm.g_rmg[0][1]],[-glm.g_rmg[1][0],glm.g_rmg[1][1]]];
	}
	
	function update_zoom(){
	    glm.gl.uniform1f(glm.zoom_loc, zm.value);
	    zm.set_value(Math.floor(zm.value*1000.0)/1000);
	    zm.ui.step=Math.floor(zm.value*100)/1000; 
	    glm.render();
	    
	}

	glscreen.listen("cursor_move", function(e){
	    
	    var screen_pos=[e.cursor[0]+.5,glscreen.canvas.clientHeight-e.cursor[1]-.5];
	    var cursor_size=[40, 20]; //pixels...

	    //pointer_info.innerHTML="Screen : (" +screen_pos[0]+"," +screen_pos[1] +") "; 
	    cursor.elements.screen.set_value(screen_pos);
	    //console.log("clear " + glscreen.canvas.clientWidth + " " + glscreen.canvas.clientHeight);
	    ctx2d.clearRect(0,0,glscreen.canvas.clientWidth, glscreen.canvas.clientHeight);
	    
	    for(var l=0;l<glm.layers.length;l++)
		if(glm.layer_enabled[l])
		    glm.layers[l].update_pointer_info(e.cursor, layer_ci[l]);

	    //var ctx2d=this.glm.ctx2d;
	    /*
	    var tcenter=e.cursor;
	    
	    ctx2d.beginPath();
	    ctx2d.moveTo(tcenter[0]-cursor_size[0],tcenter[1]);
	    ctx2d.lineTo(tcenter[0]+cursor_size[0],tcenter[1]);
	    ctx2d.lineWidth = 2;
	    ctx2d.strokeStyle = 'red';
	    ctx2d.stroke();
	    ctx2d.closePath();
	    

	    ctx2d.beginPath();
	    ctx2d.moveTo(tcenter[0],tcenter[1]-cursor_size[1]);
	    ctx2d.lineTo(tcenter[0],tcenter[1]+cursor_size[1]);
	    ctx2d.lineWidth = 2;
	    ctx2d.strokeStyle = 'red';
	    ctx2d.stroke();
	    ctx2d.closePath();
	    */
	});
	
	
	glscreen.listen("wheel", function(e){
	    var delta=e.deltaY;
	    //console.log("wheel : " + delta);
	    
	    (delta > 0)? zm.value-=zm.value/10.0 : zm.value+=zm.value/10.0;
	    zm.set_value();
	    update_zoom();	    
	    
	});
	
	glscreen.listen("resize", function(sz){
	    if(ù(glm.program)) return;
	    var loc = gl.getUniformLocation(glm.program, "u_screen");
	    gl.uniform2f(loc, sz.w,sz.h );
	    glm.render();
	});

	var trstart;

	glscreen.listen("drag_begin", function(e){
	    trstart=[tr.value[0], tr.value[1]];
	});

	glscreen.listen("dragging", function(e){
	    var mouse_delta=[e.cursor[0]-e.from[0],e.cursor[1]-e.from[1]];
	    //console.log("canvas dragging... delta " + JSON.stringify(mouse_delta));

	    tr.value[0]=trstart[0]-mouse_delta[0]/zm.value;
	    tr.value[1]=trstart[1]+mouse_delta[1]/zm.value;
	    
	    tr.set_value();
	    gl.uniform2fv(glm.tr_loc, tr.value);
	    glm.render();
	    
	});
	


	glm.render=function () {

	    var positionLocation = gl.getAttribLocation(glm.program, "vPosition");

	    //console.log("Render vp " + glm.drawing_node.clientWidth + " , " +  glm.drawing_node.clientHeight);
	    //gl.viewport(0, 0, glm.drawing_node.clientWidth, glm.drawing_node.clientHeight);

	    
	    //window.requestAnimationFrame(render, canvas);
	    
	    gl.clearColor(1.0, 1.0, 0.0, 1.0);
	    gl.clear(gl.COLOR_BUFFER_BIT);

	    ctx2d.clearRect(0,0,glm.canvas.clientWidth,glm.canvas.clientHeight);
	    
	    gl.enableVertexAttribArray(positionLocation);
	    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	    
	    gl.drawArrays(gl.TRIANGLES, 0, 6);
	    

	    for(var l=0;l<glm.layers.length;l++)
		if(glm.layer_enabled[glm.layers[l].id])
		    glm.layers[l].update_geometry();
	    
	    
	    //ctx2d.fillStyle = "#FF0000";
	    //ctx2d.fillRect(0,0,150,75);
	    /*
	    p =rmg*((gl_FragCoord.xy-u_screen/2.0)/u_zoom+u_tr-u_rotc)+u_rotc;
	    p = p/lzoom+trl-u_rotcenters[l];
	    p = (rm*p+u_rotcenters[l])/u_resolution+u_layer_range[l]/2.0;
	    */

	}
	
	glm.fullscreen=function(on){


	    

	    
 	    //glm.infs=false;
 	}
	
	
	function create_vertex_buffer(){
	    
	    glm.buffer = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, glm.buffer);
	    gl.enableVertexAttribArray(0);
	    gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);
	    
	    gl.bufferData(
		gl.ARRAY_BUFFER, 
		new Float32Array([
			-1.0, -1.0,
		    1.0, -1.0, 
			-1.0,  1.0, 
			-1.0,  1.0, 
		    1.0, -1.0, 
		    1.0,  1.0]), 
		gl.STATIC_DRAW
	    );
	}

	
	//var glsl_loc="./"+server_root+"/xd1.glsl";
	var glsl_loc="/XD-1/xd1.glsl";
	console.log("Downloading glsl [" + glsl_loc+"]" );
	xhr_query(glsl_loc, function (error, shader_src) {
	    
	    if(error!=null){
		console.log("Error downloading XD1 shader code " + error);
		glm.abort_error("Error while downloading XD1 shader code : "+error);
		return;
	    }
	    
	    console.log("GLM linking programs...");
	    
	    var texture = gl.createTexture();
	    var cmap_texture = gl.createTexture();
	    var cmap_frac = gl.createTexture();
	    
	    glm.texture=texture;
	    glm.cmap_texture=cmap_texture;
	    glm.cmap_frac=cmap_frac;
	    
	    var program = glm.program=gl.createProgram();
	    var xd1_fragment_shader = create_shader(gl, shader_src);    

	    //Simplest vertex shader for the unique "static" screen box : all geometry is done in the fragment shader.
	    var vertex_shader_src="attribute vec4 vPosition; void main() {gl_Position = vPosition;}";
	    
	    vertexShader = gl.createShader(gl.VERTEX_SHADER);
	    gl.shaderSource(vertexShader, vertex_shader_src);
	    gl.compileShader(vertexShader);
	    
	    gl.attachShader(program, vertexShader);
	    gl.attachShader(program, xd1_fragment_shader);
	    
	    gl.linkProgram(program);
	    gl.useProgram(program);
	    
	    glm.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
	    glm.le_loc=gl.getUniformLocation(program, "u_layer_enabled");	
	    glm.zoom_loc=gl.getUniformLocation(program, "u_zoom");
	    glm.angle_loc=gl.getUniformLocation(program, "u_angle");
	    glm.tr_loc=gl.getUniformLocation(program, "u_tr");
	    glm.rotcenter_loc=gl.getUniformLocation(program, "u_rotc");
	    
	    gl.uniform4iv(glm.le_loc, layer_enabled);
	    gl.uniform2f(glm.resolutionLocation, glscreen.canvas.clientWidth, glscreen.canvas.clientHeight);
	    gl.uniform1f(glm.zoom_loc, zm.value );
	   // gl.uniform1f(angle_loc, ag.value);
	    gl.uniform2fv(glm.tr_loc, tr.value);
	    gl.uniform2fv(glm.rotcenter_loc, rc.value);
	    
	    update_angle();

	    create_vertex_buffer();

	    glm.trigger("gl_ready");


	    console.log("GLM : program ready");

	    //cb(null,glm);
	});

	glm.get_layer=function(lid){
	    for(var l=0;l<glm.layers.length;l++)
		if(glm.layers[l].id === lid) return l;
	    return undefined;
	}
	
	glm.delete_layer=function(lid){
	    var lay=glm.get_layer(lid);
	    
	    if(ù(lay)) {
		console.log("No such layer " + lid);
		return;
	    }
	    
	    glm.layer_enabled[lid]=0;
	    //var le_loc=gl.getUniformLocation(glm.program, "u_layer_enabled");
	    gl.uniform4iv(glm.le_loc, glm.layer_enabled);
	    //glm.nlayers--;
	    glm.layers.splice(lay,1);
	    
	    layer_ci[lid].ui_root.add_class("disabled");
	    
	    console.log("After delete : NLAYERS = " + glm.layers.length);
	    
	    glm.trigger("view_update");

	}

	glm.create_layer=function(image, lid){
	    if(ù(lid)){
		lid=glm.maxlayers+1;
		for(var l=0;l<4;l++)
		    if(glm.layer_enabled[l]===0){
			lid=l; break;
		    }
	    }
	    
	    if(lid<0 || lid>=glm.maxlayers){
		alert("["+lid+"]All four layers already active, please remove one before adding a new one.");
		return undefined;
		
	    }

	    var ex_lay=glm.get_layer(lid);
	    if(è(ex_lay)){
		glm.layers[ex_lay].trigger("close");
		//glm.delete_layer(lid);
	    }

	    console.log("Creating new layer at position " + lid);
	    
	    var layer=tmaster.build_template("gl_image_layer"); 

	    var lay_ui=create_ui({}, layer, 0);
	    layer.xd1_attach(glm, lid);

	    
	    layer.listen("name_changed", function(n){
		console.log("Layer name changed");
		layer_ci[this.id].set_title(n);
	    });

	    	    
	    layer.set_title(image.name);

	    layer.cmap.listen("colormap_changed", function(cm){
		layer_ci[lid].cmdiv.style.background=cm.css_color_gradient;
	    });

	    
	    
	    layer.container=layer_objects.ui_childs;
	    layer_objects.ui_childs.add_child(layer,lay_ui);
	    //layer.view_update_childs();
	    
	    glm.layers.push(layer);
	    glm.layer_enabled[lid]=1;
	    //var le_loc=gl.getUniformLocation(glm.program, "u_layer_enabled");
	    gl.uniform4iv(glm.le_loc, glm.layer_enabled);

	    
	    layer_ci[lid].ui_root.remove_class("disabled");
	    
	    //glm.nlayers++;
	    
	    if(typeof image != 'undefined'){
		layer.setup_image(image);
	    }

	    glm.trigger("view_update");
	    layer.cmap.trigger("colormap_changed", layer.cmap);
	    
	    return layer;

	}
	    
    });

    //return drawing_node;
    
}
