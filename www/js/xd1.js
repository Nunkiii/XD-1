/*

  XD-1 - Qk/Sadira project
  Pierre Sprimont, INAF/IASF, Bologna, 2014
  
*/


function xdone() {
    this.title="XD-1";

    this.program=null;
    this.sz=0; 
    this.canvas=null;

    this.w=0;
    this.h=0;
    this.bbig=null;

    this.fv=null;
    this.nlayers=0;
    this.maxlayers=4;
    this.layers=[];
    this.texture=null;
    this.cmap_texture=null;
    this.cmap_texdata=null;
    this.cmap_frac=null;
    this.cmap_fracdata=null;
    this.ncolors=0;
    this.pvals=[];
    this.layer_enabled=[];
    this.ctx=null;
    this.p_layer_range=[];
    this.infs=true;
    this.selected_layer=null;
}

xdone.prototype.xdone_init=function(options, cb){

    var xd=this;    
    var server_root="";
    var xdone_node;

    if(typeof options != "undefined"){
	xd.options=options;
	if(typeof options.server_root != "undefined") server_root=options.server_root;
	if(typeof options.html_node != 'undefined') xdone_node  = xd.xdone_node=options.html_node;
    }

    if(typeof xdone_node=='undefined')
	xdone_node  = xd.xdone_node=document.getElementById("xdone");

    var bar_node  = cc("header", xdone_node); bar_node.id="gfx_bar"; 
    var gfx_node=cc("div",xdone_node); gfx_node.id="gfx";
    var drawing_node=cc("div", gfx_node); drawing_node.id="drawing";
    var divider = cc('div', xdone_node);

    divider.id = 'divider';

    var info_node =  cc("div", bar_node); info_node.id="drawing_info";
    var canvas_info  = cc("div",info_node); canvas_info.id="canvas_info";  
    var pointer_info  = cc("div",info_node); pointer_info.id="pointer_info";  //select(xdone_node,'#pointer_info');

    canvas_info.className="canvas_info";

    var glscreen=tmaster.build_template("glscreen"); 
    var glscreen_node =xd.canvas= create_ui({ type: "short", root_classes : [] }, glscreen,0 );

    drawing_node.appendChild(glscreen_node);

    var leftPercent = 50;
    
    function updateDivision() {
	divider.style.left = leftPercent + '%';
	bar_node.style.width = leftPercent + '%';
	gfx_node.style.width = (100 - leftPercent) + '%';
    }
    
    updateDivision();
    
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
	    console.log("Done move..."); xd.fullscreen(false);
	}
    }, false);
    
    
    //var glv_opts = this.glv_opts=tmaster.build_template("gl_view_2d"); 
    //bar_node.appendChild(create_ui({ type: "short", root_classes : [] } , glv_opts));
    
    var glv_opts = options.tpl;
    bar_node.appendChild(create_ui({ type: "short", root_classes : [] } ,glv_opts));

    glscreen.webgl_start({}, function(error, gl){
	
	if(error){
	    alert(error);
	    cb(error);
	    return;
	}

	console.log("Webgl started ok!");

	xd.gl=gl;

	var geo=glv_opts.elements.geometry.elements;
	
	var tr=xd.tr=geo.translation;
	var zm=xd.zm=geo.zoom; 
	var ag=xd.ag=geo.rotation.elements.angle; 
	var rc=xd.rc=geo.rotation.elements.center;
	
	
	tr.onchange = function(){
	    gl.uniform2fv(tr_loc, this.value);
	    xd.render();
	};

	zm.onchange=function(){
	    update_zoom();
	};

	ag.onchange=function(){
	    gl.uniform1f(angle_loc, ag.value);
	    xd.render();
	};
	
	rc.onchange=function(){
	    gl.uniform2fv(rotcenter_loc, rc.value);
	    xd.render();
	};


	
	xd.update_layer_ranges=function(){
	    var w=glscreen_node.clientWidth;
	    var h=glscreen_node.clientHeight;
	    
	    for(var l=0;l<xd.nlayers;l++){
		var lay=xd.layers[l];
		if(typeof lay!='undefined'){
		    xd.p_layer_range[2*lay.id]=lay.width*1.0/xd.w;
		    xd.p_layer_range[2*lay.id+1]=lay.height*1.0/xd.h;		
		}
	    }
	    console.log("setting new range " + JSON.stringify(xd.p_layer_range));
	    
    	    var rangeLocation = gl.getUniformLocation(xd.program, "u_layer_range");	
	    gl.uniform2fv(rangeLocation, xd.p_layer_range);
	}
	
	
	function update_zoom(){
	    xd.gl.uniform1f(zoom_loc, zm.value);
	    zm.set_value(Math.floor(zm.value*1000.0)/1000);
	    zm.ui.step=Math.floor(zm.value*100)/1000; 
	    xd.render();
	    
	}


	glscreen.listen("cursor_move", function(e){

	    var screen_pos=[e.cursor[0]+.5,glscreen_node.clientHeight-e.cursor[1]-.5];
	    pointer_info.innerHTML="Screen : (" +screen_pos[0]+"," +screen_pos[1] +") "; 

	    for(var l=0;l<xd.nlayers;l++)
		xd.layers[l].update_pointer_info(e.cursor);
	});
	
	
	glscreen.listen("wheel", function(e){
	    var delta=e.deltaY;
	    //console.log("wheel : " + delta);
	    
	    (delta > 0)? zm.value-=zm.value/10.0 : zm.value+=zm.value/10.0;
	    zm.set_value();
	    update_zoom();	    
	    
	});
	
	glscreen.listen("resize", function(sz){
	    var loc = gl.getUniformLocation(xd.program, "u_screen");
	    gl.uniform2f(loc, sz.w,sz.h );
	    xd.render();
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
	    gl.uniform2fv(tr_loc, tr.value);
	    xd.render();
	    
	});
	
	xd.render=function () {

	    //console.log("Rendering...");
	    
	    var positionLocation = gl.getAttribLocation(xd.program, "vPosition");
	    
	    //window.requestAnimationFrame(render, canvas);
	    
	    gl.clearColor(1.0, 1.0, 0.0, 1.0);
	    gl.clear(gl.COLOR_BUFFER_BIT);
	    
	    gl.enableVertexAttribArray(positionLocation);
	    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	    
	    gl.drawArrays(gl.TRIANGLES, 0, 6);
	    
	    for(var l=0;l<xd.nlayers;l++)
		if(xd.layer_enabled[l])
		    xd.layers[l].update_geometry();
	    
	}
	
	xd.fullscreen=function(on){
	    console.log("fullscreen");
 	    
	    glscreen.resize(drawing_node.clientWidth, drawing_node.clientHeight);
	    
 	    xd.infs=false;
 	}
	
	
	function create_vertex_buffer(){
	    
	    xd.buffer = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, xd.buffer);
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
	    
	    
	    var layer_enabled = xd.layer_enabled= new Int32Array([1,0,0,0]);
	    
	    xd.p_vals=new Float32Array(4*8);
	    xd.p_rotcenters=new Float32Array(4*2);
	    xd.p_layer_range=new Float32Array(4*2);
	    xd.ncolors=new Int32Array([0,0,0,0]);    
	    xd.cmap_texdata = new Float32Array(16*128);
	    xd.cmap_fracdata = new Float32Array(16*128);
	    
	    var texture = gl.createTexture();
	    var cmap_texture = gl.createTexture();
	    var cmap_frac = gl.createTexture();
	    
	    xd.texture=texture;
	    xd.cmap_texture=cmap_texture;
	    xd.cmap_frac=cmap_frac;
	    
	    var program = xd.program=gl.createProgram();
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
	    
	    resolutionLocation = gl.getUniformLocation(program, "u_resolution");
	    le_loc=gl.getUniformLocation(program, "u_layer_enabled");	
	    zoom_loc=gl.getUniformLocation(program, "u_zoom");
	    angle_loc=gl.getUniformLocation(program, "u_angle");
	    tr_loc=gl.getUniformLocation(program, "u_tr");
	    rotcenter_loc=gl.getUniformLocation(program, "u_rotc");
	    
	    gl.uniform4iv(le_loc, layer_enabled);
	    gl.uniform2f(resolutionLocation, glscreen_node.width, glscreen_node.height);
	    gl.uniform1f(zoom_loc, zm.value );
	    gl.uniform1f(angle_loc, ag.value);
	    gl.uniform2fv(tr_loc, tr.value);
	    gl.uniform2fv(rotcenter_loc, rc.value);
	    
	    
	    create_vertex_buffer();
	    
	    xd.fullscreen(false);
	    glscreen_node.focus();
	    cb(null,xd);
	});
	
	
    });
    
    
    
   
}
