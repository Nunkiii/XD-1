var gl,glx=null,glx_canvas;

//simplest vertex shader for the unique fullscreen box.
var vertex_shader_src="attribute vec4 vPosition; void main() {gl_Position = vPosition;}";

function create_shader(gldev, shader_source, type) {
    var shader;
    if (typeof type == 'undefined')
	shader = gldev.createShader(gldev.FRAGMENT_SHADER);
    else
	if (type == "x-shader/x-fragment") {
	    shader = gldev.createShader(gldev.FRAGMENT_SHADER);
	} else if (type == "x-shader/x-vertex") {
	    shader = gldev.createShader(gldev.VERTEX_SHADER);
	} else {
	    shader = gldev.createShader(gldev.FRAGMENT_SHADER);
	}
    
    gldev.shaderSource(shader, shader_source);
    gldev.compileShader(shader);

    if (!gldev.getShaderParameter(shader, gldev.COMPILE_STATUS)) {
	alert(gldev.getShaderInfoLog(shader));
	return null;
    }
    return shader;
}


function get_shader(gldev, script_node) {

    if (typeof script_node == 'undefined') {
	console.log("Shader-script dom-element ["+""+"] not found!");
	return null;
    }
    var str = "";

    var k = script_node.firstChild;
    
    while (k) {
	if (k.nodeType == 3) {
	    str += k.textContent;
	}
	k = k.nextSibling;
    }

    //    str=script_node.innerHTML;
    //    console.log("Got shader code ["+str+"]");
    return create_shader(gldev, str, script_node.type); 

}


var shaderProgram;
var pMatrix = mat4.create();

function initGL(canvas) {
    glx = WebGLUtils.setupWebGL(canvas);
    if (!glx) {
	return;
    }
}


function initShaders() {

    var fragmentShader = get_shader(glx, document.getElementById("shader-fs"));
    var vertexShader = get_shader(glx, document.getElementById("shader-vs"));

    shaderProgram = glx.createProgram();
    glx.attachShader(shaderProgram, vertexShader);
    glx.attachShader(shaderProgram, fragmentShader);
    glx.linkProgram(shaderProgram);

    if (!glx.getProgramParameter(shaderProgram, glx.LINK_STATUS)) {
	alert("Could not initialise shaders");
    }

    glx.useProgram(shaderProgram);

    shaderProgram.vertexPositionLoc = glx.getAttribLocation(shaderProgram, "aVertexPosition");
    glx.enableVertexAttribArray(shaderProgram.vertexPositionLoc);
    shaderProgram.pMatrixLoc = glx.getUniformLocation(shaderProgram, "uPMatrix");

}

var pointsBuffer=null;



function initBuffers() {

    var vertices = linePoints();

    

    pointsBuffer = glx.createBuffer();

    glx.bindBuffer(glx.ARRAY_BUFFER, pointsBuffer);
    glx.bufferData(glx.ARRAY_BUFFER, new Float32Array(vertices), glx.STATIC_DRAW);

    

    pointsBuffer.itemSize = 3;
    pointsBuffer.numItems = vertices.length / 3;

}



function linePoints() {
    if(glx==null) return;

    var res = [];

    var n=500;
    var a = (glx.viewportWidth) / n;

    var b = 10;

    var c = (glx.viewportHeight) / 210;

    var d = 10 - 220 * c;

    

    for (var x = 0; x < n; x += .1) {

	var y = 300 - 100 * Math.cos(2.0 * Math.PI * x / 100.0) + 30 * Math.cos(4.0 * Math.PI * x / 100.0) + 6 * Math.cos(6.0 * Math.PI * x / 100.0);

	res.push(x * a , 30*Math.cos(x/5.0)+35, 0);
	//	res.push(x*a, 10, 0.0);

    }

    

    //console.log(JSON.stringify(res));
    
    return res;

}



function render_line() {
    if(glx==null) return;

    glx.clearColor(0.0, 0.0, 0.0, 1.0);
    glx.viewportWidth = glx_canvas.width;
    glx.viewportHeight = glx_canvas.height;
    //console.log("viewport " + glx.viewportWidth + ", " + glx.viewportHeight);
    initBuffers();

    glx.lineWidth(1.0);

    mat4.ortho(0, glx.viewportWidth, glx.viewportHeight, 0, -10, 10, pMatrix);

    glx.clear(glx.COLOR_BUFFER_BIT);

    glx.bindBuffer(glx.ARRAY_BUFFER, pointsBuffer);
    glx.vertexAttribPointer(shaderProgram.vertexPositionLoc, pointsBuffer.itemSize, glx.FLOAT, false, 0, 0);
    glx.uniformMatrix4fv(shaderProgram.pMatrixLoc, 0, pMatrix);
    glx.drawArrays(glx.LINE_STRIP, 0, pointsBuffer.numItems);
    glx.flush();
}



function webGLStart() {

    //    initGL(glx_canvas);
    //    initShaders();

}




/*

  XD-1 OBJECT

*/


var def_colormaps=[
    [[0,0,0,1,0],[0.8,0.2,0.8,1.0,0.5],[1,1,1,1,1]],
    [[0,0,0,1,0],[0.2,0.8,0.1,1.0,0.5],[1,1,1,1,1]],
    [[0,0,0,1,0],[0.1,0.2,0.8,1.0,0.5],[1,1,1,1,1]],
    [[0,0,0,1,0],[0.1,0.8,0.2,1.0,0.5],[1,1,1,1,1]]
];


var def_parameters=[
    [0, //low cut
     5.0, //high cut
     0, //Tx
     0, //Ty
     1.0, //Scale
     0, //Rot
     1.0, //Luminosity
     0
    ],
    [0, //low cut
     20.0, //high cut
     0, //Tx
     0, //Ty
     1.0, //Scale
     0, //Rot
     1.0, //Luminosity
     0
    ],
    [0, //low cut
     5.0, //high cut
     0, //Tx
     0, //Ty
     1.0, //Scale
     0, //Rot
     1.0, //Luminosity
     0
    ],
    [0, //low cut
     2.0, //high cut
     0, //Tx
     0, //Ty
     1.0, //Scale
     0, //Rot
     1.0, //Luminosity
     0
    ]
];




function xdone() {


    this.title="XD-1";

    var xd=this;    

    this.gl=null;
    this.canvas=null;
    this.program=null;
    this.sz=0; 
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
    this.zoom=0;
    this.tr=[0,0];
    this.angle=0;
    this.rotcenter=[0,0];
    this.infs=true;

    if(typeof sadira != 'undefined') this.sadira=sadira;
    
    var resolutionLocation;
    var le_loc;
    var zoom_loc;
    var angle_loc;
    var tr_loc;
    var rotcenter_loc;

//    xd.xdone_init();
}


xdone.prototype.xdone_init=function(options){
    
    var server_root="";
    
    if(typeof options != "undefined"){
	if(typeof options.server_root != "Undefined") server_root=options.server_root;
    }
    var xd=this;

    //console.log("sr " + server_root);
    
    function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
	    x: evt.clientX - rect.left,
	    y: evt.clientY - rect.top
	};
    }
    
    this.selected_layer=null;
    
    var xdone_node  = document.getElementById("xdone");
    var bar_node  = cc("header", xdone_node); bar_node.id="gfx_bar"; //select(xdone_node,"#gfx_bar");
//    var bottom_node=cc("div", xdone_node); bottom_node.id="bottom";
//    var cuts_node=cc("div", bottom_node); cuts_node.id="cuts";
    var gfx_node=cc("div",xdone_node); gfx_node.id="gfx";
    var drawing_node=cc("div", gfx_node); drawing_node.id="drawing";
    
    //var cuts_node  = select(xdone_node,"#cuts");
    //var dbv = new db_view(tmaster.templates["gl_view_2d"]);
    //xdone_node.appendChild(dbv.widget_div);
    // var layer_view= new db.object(tmaster.templates["gl_view_2d"]);
    // layer_view.create({}, function() {
    // 	xdone_node.appendChild(layer_view.odiv);
    // } );
    
    
    var glv_opts = this.glv_opts=tmaster.build_template("gl_view_2d"); 
    //console.log("xd1 template " + JSON.stringify(glv_opts));
    
    var tr=glv_opts.elements.geometry.elements.translation;
    var zm=glv_opts.elements.geometry.elements.zoom; 
    var ag=glv_opts.elements.geometry.elements.rotation.elements.angle; 
    var rc=glv_opts.elements.geometry.elements.rotation.elements.center;

    var newlayer=glv_opts.elements.layer_objects.elements.newlayer;
    var layer_objects=glv_opts.elements.layers_objects;

    tr.onchange = function(){
	// xd.tr[0]=this.value[0];
	// xd.tr[1]=this.value[1];
	//console.log("Tx changed " + JSON.stringify(xd.tr));
	gl.uniform2fv(tr_loc, this.value);
	xd.render();
    };

    zm.onchange=function(){
	xd.zoom=this.value;
	update_zoom();
    };

    ag.onchange=function(){
	xd.angle=this.value;
	gl.uniform1f(angle_loc, xd.angle);
	xd.render();
    };

    rc.onchange=function(){
	xd.rotcenter[0]=this.value[0];
	xd.rotcenter[1]=this.value[1];
	gl.uniform2fv(rotcenter_loc, xd.rotcenter);
	xd.render();
    };
    

    bar_node.appendChild(create_ui({ type: "short", root_classes : ["flat"] } , glv_opts));


    //var layer_tabs=new tab_widget();
    //cuts_node.appendChild(layer_tabs.div);

    // var mb=new menu_item(); mb.set_root();    
    // var xdm=mb.add_item("XD-1");
    // xdm.add_item("Add layer", function(e){
    
    newlayer.onclick=function(){
	if(xd.nlayers<xd.maxlayers){
	    var layer_opts = tmaster.build_template("gl_image_layer"); 
	    var lui=create_ui({type:"short" }, layer_opts, glv_opts.depth+1);
	    
	    var l=new layer(xd, xd.nlayers,layer_opts,
			    function(p_values, layer_id){
			    },
			    function(cmap_data, layer_id){
			    }
			   );
	    
	    
	    //var ui=create_ui(global_ui_opts,e, depth+1 );
	    //glv_opts.elements.layers.elements.layer_objects.ui_childs=e;
	    //console.log("ch" + typeof(glv_opts.elements.layers.ui_childs));

	    //console.log("ch" + typeof(e.container.add_child));
	    //e.container.add_child(e,e.ui_root);
	    layer_opts.container=glv_opts.elements.layer_objects.ui_childs;
	    glv_opts.elements.layer_objects.ui_childs.add_child(layer_opts,lui);

	    xd.layers[xd.nlayers]=l;
	    xd.layer_enabled[xd.nlayers]=1;
	    var le_loc=gl.getUniformLocation(xd.program, "u_layer_enabled");
	    gl.uniform4iv(le_loc, layer_enabled);
	    
	    
	    /*
	    l.li_layer=layer_tabs.add_frame("Layer "+xd.nlayers);
	    console.log("Setting bg to " + l.cmap.gradient_css_string);
	    l.li_layer.style.background=l.cmap.gradient_css_string;

	    l.li_layer.appendChild(l.pointer_info);
	    l.li_layer.div.appendChild(l.div);
	    */

	    xd.nlayers++;
	    xd.fullscreen(false);
	}else alert("Max 4 layers!");

    };

    // xdm.add_item("About XD-1", function(e){});    
    // attach_menu(glv_opts, mb);

    var info_node =  cc("div", gfx_node); info_node.id="drawing_info";
    var canvas_info  = cc("div",info_node); canvas_info.id="canvas_info";  
    var pointer_info  = cc("div",info_node); pointer_info.id="pointer_info";  //select(xdone_node,'#pointer_info');

//    var cmap_el=select(xdone_node,'#cuts');
//    var canvas_info  = select(xdone_node,'#canvas_info');
//    glx_canvas=select(xdone_node,"#glxline");       


    // this.layer_nav=cc("nav", cuts_node); 
    // this.layer_view=cc("div", cuts_node); 
    
    // this.layer_view.className="layer_view";
    // this.layer_nav.className="layer_nav";
    canvas_info.className="canvas_info";

    
    xd.canvas        = cc("canvas", drawing_node); xd.canvas.id="glscreen";// select(xdone_node,'#glscreen');

    xd.gl            = xd.canvas.getContext('experimental-webgl');

    //xd.ctx    = xd.canvas.getContext('2d');
    
    var mouseon = false;
    var mouse_start={};
    var t_start=[];

    xd.canvas.onmousedown = function(e){

	mouseon = true;
	
	mouse_start.x=e.screenX;
	mouse_start.y=e.screenY;

	t_start[0]=tr.value[0];
	t_start[1]=tr.value[1];
    }

    xd.canvas.onmouseup = function(e){
	//if(mouseon) mouseClick(e);
	mouseon = false;
    }

    // canvas.onmousemove = function(e){
    xd.canvas.addEventListener("mousemove", function(e){
	var screen_pix=[];
	if(e.offsetX) {
	    screen_pix=[e.offsetX, 
			e.offsetY
		       ];
	}
	else if(e.layerX) {
	    screen_pix=[e.layerX, 
			e.layerY
		       ];
	}

	screen_pix[0]+=.5;
	screen_pix[1]=xd.canvas.height -screen_pix[1] -.5;

	pointer_info.innerHTML="Screen : (" +screen_pix[0]+"," +screen_pix[1] +") "; 
	
	for(var l=0;l<xd.nlayers;l++)
	    xd.layers[l].update_pointer_info(screen_pix);
	
	//var ipx=layers[0].get_image_pixel(screen_pix);
	//pointer_info.innerHTML+="Image : (" + Math.floor(ipx[0]*10)/10+"," +Math.floor(ipx[1]*10)/10 +") "; 

	return false;
    });

    
    
    
    function update_zoom(){
	xd.gl.uniform1f(zoom_loc, xd.zoom);
	xd.zoom=Math.floor(xd.zoom*1000.0)/1000;
	zm.ui.step=Math.floor(zm.value*100)/1000; 
	xd.render();

    }

    function mouse_wheel(e) {

	var e = window.event || e;

	//var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	var delta=e.deltaY;
	//console.log("wheel : " + delta);

	(delta > 0)?xd.zoom-=xd.zoom/10.0 : xd.zoom+=xd.zoom/10.0;
	update_zoom();	    
	zm.value=xd.zoom;
	zm.set_value();
	
	//canvas.style.width = Math.max(sq.zoom, Math.min(sq.nw, canvas.width + (sq.zoom * delta))) + "px";

	e.preventDefault();
    }


    addWheelListener( xd.canvas, mouse_wheel);

    
    gl=xd.gl;
    
    if(!gl){
	alert("WebGL support lacking on your browser, you cannot use this application, sorry!");
	return;
    }

    var available_extensions = xd.gl.getSupportedExtensions();
    //glexts.innerHTML="<pre>"+JSON.stringify(available_extensions,null,4)+"</pre>";
    
    var floatTextures = xd.gl.getExtension('OES_texture_float');
    if (!floatTextures) {
	alert('No floating point texture support !\n\n :< \n\nTry with another video device &| drivers!');
	return;
    }
    
    var buffer = xd.gl.createBuffer();
    gl.bindBuffer(xd.gl.ARRAY_BUFFER, buffer);
    
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


    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertex_shader_src);
    gl.compileShader(vertexShader);

/*    
    var fs_but=cc("button",drawing_node); fs_but.innerHTML="Fullscreen";
    fs_but.onclick=function(){ xd.fullscreen(xd.infs?false:true);};
*/

    var layer_enabled = this.layer_enabled= new Int32Array([1,0,0,0]);

    this.p_vals=new Float32Array(4*8);
    this.p_rotcenters=new Float32Array(4*2);
    this.p_layer_range=new Float32Array(4*2);
    this.ncolors=new Int32Array([0,0,0,0]);    
    this.cmap_texdata = new Float32Array(16*128);
    this.cmap_fracdata = new Float32Array(16*128);

    var texture = gl.createTexture();
    var cmap_texture = gl.createTexture();
    var cmap_frac = gl.createTexture();

    this.texture=texture;
    this.cmap_texture=cmap_texture;
    this.cmap_frac=cmap_frac;

    //webGLStart(select(xdone_node,'#glxline'));

    xd.zoom=1.0;
    xd.angle=0.0;
    tr.value=[0,0];
    xd.rotcenter=[0,0];

    var opts = {source : "fits"};

    xhr_query(server_root+"xd1.glsl", function (error, shader_src) {

	if(error!=null){
	    console.log("Error " + error);
	    return;
	}

	var program = xd.program=gl.createProgram();
	var xd1_fragment_shader = create_shader(gl, shader_src);    
	
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
	gl.uniform2f(resolutionLocation, xd.canvas.width, xd.canvas.height);
	gl.uniform1f(zoom_loc, xd.zoom );
	gl.uniform1f(angle_loc, xd.angle);
	gl.uniform2fv(tr_loc, tr.value);
	gl.uniform2fv(rotcenter_loc, xd.rotcenter);
	
	xd.canvas.addEventListener("mousemove", function(e){
	    if(!mouseon) return;

	    var mouse_delta=[e.screenX-mouse_start.x,e.screenY-mouse_start.y];
	    
	    tr.value[0]=t_start[0]-mouse_delta[0]/xd.zoom;
	    tr.value[1]=t_start[1]+mouse_delta[1]/xd.zoom;

	    tr.set_value();
	    
	    gl.uniform2fv(tr_loc, tr.value);
	    xd.render();
	    return false;
	});
	
	xd.fullscreen(false);
	xd.canvas.focus();
    });

    
}

xdone.prototype.resize_canvas=function(nw,nh){
    var xd=this;
    xd.canvas.width  = nw;
    xd.canvas.height = nh;
    var loc = xd.gl.getUniformLocation(xd.program, "u_screen");
    xd.gl.uniform2f(loc, nw,nh );
    xd.gl.viewport(0, 0, xd.gl.drawingBufferWidth, xd.gl.drawingBufferHeight);
}


xdone.prototype.render=function () {
    var gl=this.gl;
    var xd=this;
    //window.requestAnimationFrame(render, canvas);

    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var positionLocation = gl.getAttribLocation(xd.program, "vPosition");
    //    var positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // gl.uniform3fv(gl.getUniformLocation(program, "colors"), colors);
    // var translation=[0,0,0];
    // var matrix_loc = gl.getUniformLocation(xd.program, "u_matrix");

    
    // gl.uniformMatrix4fv(matrix_loc, false, getTransformationMatrix(translation[0], translation[1], translation[2], 0, 0.0, 0, 1.0, 5.0, 15.0, -2.0, 1.0, false));

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    for(var l=0;l<xd.nlayers;l++)
	if(xd.layer_enabled[l])
	    xd.layers[l].update_geometry();

    //webGLStart();    
    /*

      var data   = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
      '<foreignObject width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
      '<em>I</em> like <span style="color:white; text-shadow:0 0 2px blue;">cheese</span>' +
      '</div>' +
      '</foreignObject>' +
      '</svg>';

      var DOMURL = window.URL || window.webkitURL || window;

      var img = new Image();
      var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
      var url = DOMURL.createObjectURL(svg);

      img.onload = function () {
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);
      }

      img.src = url;
    */

}


xdone.prototype.fullscreen=function(on){
    
    //var bo=select(document, "#drawing");    
    //this.resize_canvas(.clientWidth,bo.clientHeight);


    var xd=this;
    //var gfx_bar=select(xdone_node,"#gfx_bar");

    var footer=select(document, "footer");    
    var di=select(document, "#drawing_info");    
    var dr=select(document, "#gfx");    
    var la=select(document, "header");    
    //var bo=select(document, "#bottom");    
    var xline=glx_canvas;

    if(on==false){
	//console.log("GF height = " + footer.clientHeight);
	xd.resize_canvas( dr.clientWidth-20, //-la.clientWidth-10,
			 window.innerHeight
			 //-gfx_bar.clientHeight
			 //-footer.clientHeight
			 //-la.clientHeight
			 -75);

	//	xline.width=bo.clientWidth-la.clientWidth-10;
	
	//gfx_bar.style.width=xd.canvas.style.width;
	xd.infs=false;
	xd.render();
	//render_line();
	return;
    }
    
    //var bd=[document.body.clientWidth,document.body.clientHeight];
    var bd=[window.innerWidth,window.innerHeight];
    var drawing_info=select(xdone_node,"#drawing_info");
    gfx_bar.style.width=bd[0];
    
    console.log("doc body  d = " + bd[0] + ","+bd[1]);
    
    xd.resize_canvas(bd[0]-30, //document.width is obsolete
		     bd[1]-30-gfx_bar.style.height - drawing_info.style.height); //document.height is obsolete
    
    xd.infs=true;
    xd.render();
}



