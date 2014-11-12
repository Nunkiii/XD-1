/*

  XD-1 - Qk/Sadira project
  Pierre Sprimont <sprimont@iasfbo.inaf.it>, INAF/IASF, Bologna, 2014
  
*/

template_ui_builders.xd1=function(ui_opts, xd){

    console.log("Hello xd1 constructor on node " + xd.xdone_node );

    xd.ui_root.removeChild(xd.ui_name);
    
    var server_root=xd.server_root;
    var xdone_node=xd.xdone_node;

    var bar_node  = cc("header", xd.xdone_node); bar_node.id="gfx_bar"; 
    var gfx_node=cc("div",xdone_node); gfx_node.id="gfx";
    var drawing_node=cc("div", gfx_node); drawing_node.id="drawing";
    var divider = cc('div', xdone_node);
    divider.id = 'divider';
    var mwl_demo=xd.elements.demo;

    mwl_demo.xd=xd;

    var leftPercent = 50;
    
    function updateDivision() {
	divider.style.left = leftPercent + '%';
	bar_node.style.width = leftPercent + '%';
	gfx_node.style.width = (100 - leftPercent) + '%';
    }
    
    divider.addEventListener('mousedown', function(e) {
	e.preventDefault();
	var lastX = e.pageX;
	document.documentElement.className += ' dragging';
	document.documentElement.addEventListener('mousemove', moveHandler, true);
	document.documentElement.addEventListener('mouseup', upHandler, true);

	function moveHandler(e) {
            e.preventDefault();
            e.stopPropagation();
            var deltaX = e.pageX - lastX;
            lastX = e.pageX;
            leftPercent += deltaX / parseFloat(document.defaultView.getComputedStyle(xdone_node).width) * 100;
            updateDivision();
	}

	function upHandler(e) {
            e.preventDefault();
            e.stopPropagation();
            document.documentElement.className = document.documentElement.className.replace(/\bdragging\b/, '');
            document.documentElement.removeEventListener('mousemove', moveHandler, true);
            document.documentElement.removeEventListener('mouseup', upHandler, true);
	    console.log("Done move..."); 
	    xd.gl_views.forEach(function(v){
		v.fullscreen(false);
	    });
	    //glm.fullscreen(false);
	}
    }, false);

    var views=xd.elements.views;

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
	//console.log("Selected !! " + e.name);
	xd.select_view(e);
    });
    
    xd.create_image_view=function(image){
	var glm=tmaster.build_template("gl_multilayer");
	glm.name=image.name;
	glm.drawing_node=drawing_node;

	glm.listen("gl_ready", function(){
	    glm.create_layer(image);
	    xd.select_view(glm);
	});

	var glmui = create_ui({}, glm);
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
	return glm;

    }
    
    updateDivision();

    console.log("Adding xdroot :  " + xd.ui_root);
    bar_node.appendChild(xd.ui_root);
}


template_ui_builders.gl_multilayer=function(ui_opts, glm){

    var glscreen=glm.glscreen=tmaster.build_template("glscreen"); 
    create_ui({ type: "short", root_classes : [] }, glscreen,0 );
    glm.canvas=glscreen.canvas;
    var ctx2d=glm.ctx2d=glscreen.canvas2d.getContext("2d");
    var server_root="";
    var layer_objects=glm.elements.layers;

    if(typeof glm.drawing_node === 'undefined')
	glm.drawing_node=glm.ui_root;

    glm.drawing_node.appendChild(glscreen.ui);
    
    glm.pvals=[];
    glm.nlayers=0;
    glm.maxlayers=4;
    glm.layers=[];
    glm.layer_enabled=[];
    //glm.p_layer_range=[];
    
    var cursor=glm.elements.cursor; 
    var options_tpl=glm.elements.options; 

    var layer_ci=[];
    var cil = cursor.elements.layers;

    for(var l=0;l<4;l++){
	layer_ci[l]=tmaster.build_template("cursor_layer_info"); 
	var lui=create_ui({},layer_ci[l]);
	cil.ui_childs.add_child(layer_ci[l], lui);
    }


    var layer_enabled = glm.layer_enabled= new Int32Array([1,0,0,0]);
    
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

	var geo=glm.elements.geometry.elements;
	var tr=glm.tr=geo.translation;
	var zm=glm.zm=geo.zoom; 
	var ag=glm.ag=geo.rotation.elements.angle; 
	var rc=glm.rc=geo.rotation.elements.center;

	
	tr.onchange = function(){
	    gl.uniform2fv(tr_loc, this.value);
	    glm.render();
	};

	zm.onchange=function(){
	    update_zoom();
	};

	ag.onchange=function(){
	    update_angle();
	    glm.render();
	};
	
	rc.onchange=function(){
	    gl.uniform2fv(rotcenter_loc, rc.value);
	    glm.render();
	};


	
	glm.update_layer_ranges=function(){
	    var w=glscreen.canvas.clientWidth;
	    var h=glscreen.canvas.clientHeight;
	    
	    for(var l=0;l<glm.nlayers;l++){
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
	    
	    for(var l=0;l<glm.nlayers;l++)
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

	    //console.log("Rendering...");
	    
	    var positionLocation = gl.getAttribLocation(glm.program, "vPosition");
	    
	    //window.requestAnimationFrame(render, canvas);
	    
	    gl.clearColor(1.0, 1.0, 0.0, 1.0);
	    gl.clear(gl.COLOR_BUFFER_BIT);

	    ctx2d.clearRect(0,0,glm.canvas.clientWidth,glm.canvas.clientHeight);
	    
	    gl.enableVertexAttribArray(positionLocation);
	    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	    
	    gl.drawArrays(gl.TRIANGLES, 0, 6);
	    

	    for(var l=0;l<glm.nlayers;l++)
		if(glm.layer_enabled[l])
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
	    //console.log("fullscreen");
 	    
	    glscreen.resize(glm.drawing_node.clientWidth, glm.drawing_node.clientHeight);
	    
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
	
	
	xhr_query(server_root+"xd1.glsl", function (error, shader_src) {
	    
	    if(error!=null){
		console.log("Error (Bug?) downloading shader " + error);
		cb(error);
		return;
	    }
	    
	    
	    
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
	    
	    glm.fullscreen(false);
	    glscreen.canvas.focus();
	    
	    glm.trigger("gl_ready");
	    //cb(null,glm);
	});
	
	
	
	glm.create_layer=function(image){
	    if(glm.nlayers<glm.maxlayers){
		
		var layer=tmaster.build_template("gl_image_layer"); 
		layer.name=image.name;
		image.listen("name_changed", function(n){
		    layer.name=n;
		});
		var lay_ui=create_ui({type:"short" }, layer, 0);

		layer.xd1_attach(glm, glm.nlayers);
		
		layer.container=layer_objects.ui_childs;
		layer_objects.ui_childs.add_child(layer,lay_ui);
		
		glm.layers[glm.nlayers]=layer;
		glm.layer_enabled[glm.nlayers]=1;
		//var le_loc=gl.getUniformLocation(glm.program, "u_layer_enabled");
		gl.uniform4iv(glm.le_loc, glm.layer_enabled);
		
		glm.nlayers++;

		if(typeof image != 'undefined'){
		    layer.setup_image(image);
		}
		
		glm.fullscreen(false);
		return layer;
		//  });
		
	    }else alert("Max 4 layers!");
	    return undefined;
	}
	    
    });

}
