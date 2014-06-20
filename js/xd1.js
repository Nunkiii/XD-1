var gl,glx=null, glx_canvas;

//simplest vertex shader for the box.
var vertex_shader_src="attribute vec4 vPosition; void main() {gl_Position = vPosition;}";


// creates a global "addWheelListener" method
// example: addWheelListener( elem, function( e ) { console.log( e.deltaY ); e.preventDefault(); } );
(function(window,document) {

    var prefix = "", _addEventListener, onwheel, support;

    // detect event model
    if ( window.addEventListener ) {
        _addEventListener = "addEventListener";
    } else {
        _addEventListener = "attachEvent";
        prefix = "on";
    }

    // detect available wheel event
    support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
    document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
    "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

    window.addWheelListener = function( elem, callback, useCapture ) {
        _addWheelListener( elem, support, callback, useCapture );

        // handle MozMousePixelScroll in older Firefox
        if( support == "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }
    };

    function _addWheelListener( elem, eventName, callback, useCapture ) {
        elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
            !originalEvent && ( originalEvent = window.event );

            // create a normalized event object
            var event = {
                // keep a ref to the original event object
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: "wheel",
                deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
                deltaX: 0,
                delatZ: 0,
                preventDefault: function() {
                    originalEvent.preventDefault ?
                        originalEvent.preventDefault() :
                        originalEvent.returnValue = false;
                }
            };
            
            // calculate deltaY (and deltaX) according to the event
            if ( support == "mousewheel" ) {
                event.deltaY = - 1/40 * originalEvent.wheelDelta;
                // Webkit also support wheelDeltaX
                originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
            } else {
                event.deltaY = originalEvent.detail;
            }

            // it's time to fire the callback
            return callback( event );

        }, useCapture || false );
    }
    
})(window,document);


// Returns a transformation matrix as a flat array with 16 components, given:
// ox, oy, oz: new origin (translation)
// rx, ry, rz: rotation angles (radians)
// s: scaling factor
// d: distance between camera and origin after translation,
//     if d <= -n skips projection completely
// f: z coordinate of far plane (normally positive)
// n: z coordinate of near plane (normally negative)
// ar: aspect ratio of the viewport (e.g. 16/9)
// exz: if true exchanges X and Z coords after projection
function getTransformationMatrix(ox, oy, oz, rx, ry, rz, s, d, f, n, ar, exz)
{
    // Pre-computes trigonometric values
    var cx = Math.cos(rx), sx = Math.sin(rx);
    var cy = Math.cos(ry), sy = Math.sin(ry);
    var cz = Math.cos(rz), sz = Math.sin(rz);
    
    // Tests if d is too small, hence making perspective projection not possible
    if (d <= -n)
    {
	// Transformation matrix without projection
	return new Float32Array([
	    (cy*cz*s)/ar,cy*s*sz,-s*sy,0,
	    (s*(cz*sx*sy-cx*sz))/ar,s*(sx*sy*sz+cx*cz),cy*s*sx,0,
	    (s*(sx*sz+cx*cz*sy))/ar,s*(cx*sy*sz-cz*sx),cx*cy*s,0,
	    (s*(cz*((-oy*sx-cx*oz)*sy-cy*ox)-(oz*sx-cx*oy)*sz))/ar,
	    s*(((-oy*sx-cx*oz)*sy-cy*ox)*sz+cz*(oz*sx-cx*oy)),
	    s*(ox*sy+cy*(-oy*sx-cx*oz)),1    
	]);
    }
    else
    {
	// Pre-computes values determined with wxMaxima
	var A=d;
	var B=(n+f+2*d)/(f-n);
	var C=-(d*(2*n+2*f)+2*f*n+2*d*d)/(f-n);
	
	// Tests if X and Z must be exchanged
	if(!exz)
	{
	    // Full transformation matrix
	    return new Float32Array([
		(cy*cz*s*A)/ar,cy*s*sz*A,-s*sy*B,-s*sy,
		(s*(cz*sx*sy-cx*sz)*A)/ar,s*(sx*sy*sz+cx*cz)*A,cy*s*sx*B,cy*s*sx,
		(s*(sx*sz+cx*cz*sy)*A)/ar,s*(cx*sy*sz-cz*sx)*A,cx*cy*s*B,cx*cy*s,
		(s*(cz*((-oy*sx-cx*oz)*sy-cy*ox)-(oz*sx-cx*oy)*sz)*A)/ar,
		s*(((-oy*sx-cx*oz)*sy-cy*ox)*sz+cz*(oz*sx-cx*oy))*A,
		C+(s*(ox*sy+cy*(-oy*sx-cx*oz))+d)*B,s*(ox*sy+cy*(-oy*sx-cx*oz))+d
	    ]);
	}
	else
	{
	    // Full transformation matrix with XZ exchange
	    return new Float32Array([
		    -s*sy*B,cy*s*sz*A,(cy*cz*s*A)/ar,-s*sy,
		cy*s*sx*B,s*(sx*sy*sz+cx*cz)*A,(s*(cz*sx*sy-cx*sz)*A)/ar,cy*s*sx,
		cx*cy*s*B,s*(cx*sy*sz-cz*sx)*A,(s*(sx*sz+cx*cz*sy)*A)/ar,cx*cy*s,
		C+(s*(ox*sy+cy*(-oy*sx-cx*oz))+d)*B,s*(((-oy*sx-cx*oz)*sy-cy*ox)*sz+cz*(oz*sx-cx*oy))*A,
		(s*(cz*((-oy*sx-cx*oz)*sy-cy*ox)-(oz*sx-cx*oy)*sz)*A)/ar,s*(ox*sy+cy*(-oy*sx-cx*oz))+d
	    ]);
	}
    }
}


//Returns a dom object present in this widget's HTML dom structure based on a selector.

function select(node, selector){
    var tmp_objects=node.querySelectorAll(selector);
    for(var i=0;i<tmp_objects.length;i++) 
	if(tmp_objects[i].dataset)
	    return tmp_objects[i];
    return null;
}

//Returns a dom object present in this widget's HTML dom structure based on a selector.

function select_all(node, selector){
    return node.querySelectorAll(selector);
}


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

    initGL(glx_canvas);
    initShaders();

}


window.onload = function(){
    glx_canvas=select(document, "#glxline");       
    //var shad_script=document.getElementById("shader-xd1");
    var xd1= new xdone();

    

    //  window.sadira=new sadira({}, function(error){}, function(connected){
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
    
    var xd=this;

    var resolutionLocation;
    var le_loc;
    var zoom_loc;
    var angle_loc;
    var tr_loc;
    var rotcenter_loc;

    
    function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
	    x: evt.clientX - rect.left,
	    y: evt.clientY - rect.top
	};
    }
    
    this.selected_layer=null;
    
    var pointer_info  = document.getElementById('pointer_info');
    var cmap_el=document.getElementById('cuts');
    var canvas_info  = document.getElementById('canvas_info');

    this.layer_nav=cmap_el.appendChild(document.createElement("nav"));
    this.layer_view=cmap_el.appendChild(document.createElement("div"));

    this.layer_view.className="layer_view";
    this.layer_nav.className="layer_nav";
    canvas_info.className="canvas_info";
    

    
    xd.canvas        = document.getElementById('glscreen');
    xd.gl            = xd.canvas.getContext('experimental-webgl');
    gl=xd.gl;
    //xd.ctx    = xd.canvas.getContext('2d');
    
    var mouseon = false;
    var mouse_start={};
    var t_start=[];

    xd.canvas.onmousedown = function(e){
	mouseon = true;
	
	mouse_start.x=e.screenX;
	mouse_start.y=e.screenY;

	t_start[0]=xd.tr[0];
	t_start[1]=xd.tr[1];
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
	zm.step=Math.floor(zm.value*100)/1000; 
	
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
	
	//canvas.style.width = Math.max(sq.zoom, Math.min(sq.nw, canvas.width + (sq.zoom * delta))) + "px";

	e.preventDefault();
    }


    addWheelListener( xd.canvas, mouse_wheel);

    
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

    document.getElementById("fullscreen").onclick=function(){ xd.fullscreen(xd.infs?false:true);};

    var layer_enabled = new Int32Array([1,0,0,0]);
    this.layer_enabled=layer_enabled;
    //var layers =[];
    //var nlayers=1;

    this.p_vals=new Float32Array(4*8);
    this.p_rotcenters=new Float32Array(4*2);
    this.p_layer_range=new Float32Array(4*2);
    this.ncolors=new Int32Array([0,0,0,0]);    
    this.cmap_texdata = new Float32Array(16*128);
    this.cmap_fracdata = new Float32Array(16*128);

    //gl.uniform2f(resolutionLocation, canvas.width, canvas.height);


    var texture = gl.createTexture();
    var cmap_texture = gl.createTexture();
    var cmap_frac = gl.createTexture();

    this.texture=texture;
    this.cmap_texture=cmap_texture;
    this.cmap_frac=cmap_frac;


    xd.zoom=1.0;
    xd.angle=0.0;
    xd.tr=[0,0];
    xd.rotcenter=[0,0];

    var zm=document.getElementById('zoom');
    var tx=document.getElementById('tx');
    var ty=document.getElementById('ty');
    var rx=document.getElementById('rx');
    var ry=document.getElementById('ry');

    var ag=document.getElementById('angle');
    
    tx.value=xd.tr[0];
    ty.value=xd.tr[1];
    rx.value=xd.rotcenter[0];
    ry.value=xd.rotcenter[1];

    ag.value=xd.angle;    
    zm.value=xd.zoom;

    webGLStart(document.getElementById('glxline'));

    zm.onchange=function(){
	xd.zoom=this.value;
	update_zoom();
    }

    ag.onchange=function(){
	xd.angle=this.value;
	gl.uniform1f(angle_loc, xd.angle);
	xd.render();
    }

    tx.onchange=function(){
	xd.tr[0]=this.value;
	gl.uniform2fv(tr_loc, xd.tr);
	xd.render();
    }
    ty.onchange=function(){
	xd.tr[1]=this.value;
	gl.uniform2fv(tr_loc, xd.tr);
	xd.render();
    }
    rx.onchange=function(){
	xd.rotcenter[0]=this.value;
	gl.uniform2fv(rotcenter_loc, xd.rotcenter);
	xd.render();
    }
    ry.onchange=function(){
	xd.rotcenter[1]=this.value;
	gl.uniform2fv(rotcenter_loc, xd.rotcenter);
	xd.render();
    }
    
    //    for(var i=0;i <4;i++) 

    //var opts = {source : "sadira"};
    var opts = {source : "fits"};

    var newlayer=document.getElementById("newlayer");

    
    
    newlayer.onclick=function(){
	if(xd.nlayers<xd.maxlayers){
	    var l=new layer(xd, xd.nlayers,opts,
			    function(p_values, layer_id){
			    },
			    function(cmap_data, layer_id){
			    }
			   );
	    
	    

	    xd.layers[xd.nlayers]=l;
	    xd.layer_enabled[xd.nlayers]=1;
	    var le_loc=gl.getUniformLocation(xd.program, "u_layer_enabled");
	    gl.uniform4iv(le_loc, layer_enabled);

	    l.li_layer=document.createElement("li");

	    var check_enabled=document.createElement("input");
	    check_enabled.style.display="inline-block";
	    check_enabled.type="checkbox";
	    check_enabled.checked=true;
	    var check_caption=document.createElement("span");
	    check_caption.innerHTML+=" Visible "; //+l.div.innerHTML;
	    l.layer_head.appendChild(check_caption);
	    l.layer_head.appendChild(check_enabled);
	    

	    
	    check_enabled.addEventListener("click",function(){
		//console.log("Check Click !!!");
		xd.layer_enabled[l.id]=this.checked;
		
		var le_loc=gl.getUniformLocation(xd.program, "u_layer_enabled");
		gl.uniform4iv(le_loc, xd.layer_enabled);
		
		//alert(this.checked + " lid= "+l.id  + " : " + layer_enabled[l.id]);
		xd.render();
	    }, true);

	    //    check_enabled.="Hide layer";
	    //l.li_layer.appendChild(check_enabled);
	    

	    l.li_layer.innerHTML+="Layer "+xd.nlayers; 
	    l.li_layer.appendChild(l.pointer_info);
	    l.li_layer.layer=l;
	    xd.layer_nav.appendChild(l.li_layer);
	    
	    l.li_layer.addEventListener("click",function(){
		console.log("li clicked!");
		xd.display_layer_ui(this.layer);
		
	    }, true);
	    
	    xd.display_layer_ui(l);
	    xd.nlayers++;
	    xd.fullscreen(false);
	}else alert("Max 4 layers!");
    }


    
    xhr_query("xd1.glsl", function (error, shader_src) {

	if(error!=null){
	    console.log("Error " + error);
	    return;
	}

	//console.log("Got the shader script !!!! " + shader_src);
	var program = xd.program=gl.createProgram();

	var xd1_fragment_shader = create_shader(gl, shader_src);    
	//    console.log("Got the shader ["+xd1_shader+"]");
	//    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	//gl.shaderSource(fragmentShader, xd1_shader);
	//gl.shaderSource(fragmentShader, fragment_shader_src);
	//    gl.shaderSource(fragmentShader, ss);
	//    gl.compileShader(fragmentShader);
	

	
	
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
	gl.uniform2fv(tr_loc, xd.tr);
	gl.uniform2fv(rotcenter_loc, xd.rotcenter);
	
	xd.canvas.addEventListener("mousemove", function(e){
	    if(!mouseon) return;

	    var mouse_delta=[e.screenX-mouse_start.x,e.screenY-mouse_start.y];
	    
	    xd.tr[0]=t_start[0]-mouse_delta[0]/xd.zoom;
	    xd.tr[1]=t_start[1]+mouse_delta[1]/xd.zoom;
	    
	    tx.value=mouse_delta[0];
	    ty.value=mouse_delta[1];
	    
	    gl.uniform2fv(tr_loc, xd.tr);
	    xd.render();
	    return false;
	});
	
	xd.fullscreen(false);
	xd.canvas.focus();
    });

    var hostname="ws://192.168.1.134:9999";
    //="ws://localhost:9999";
    xd.sadira=new sadira({ server : hostname}, function(error){
	console.log("Error sadira init : " + JSON.stringify(error));
	return;
    }, function(connected){
	console.log("Connected !");
    });
    
    
}



xdone.prototype.display_layer_ui= function (layer){
    if(this.selected_layer!=null)
	this.layer_view.removeChild(this.selected_layer.div);
    
    this.selected_layer=layer;
    this.layer_view.appendChild(this.selected_layer.div);
    
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

    var xd=this;
    var gfx_bar=document.getElementById("gfx_bar");

    var footer=select(document, "footer");    
    var di=select(document, "#drawing_info");    
    var la=select(document, "#cuts");    
    var bo=select(document, "#bottom");    
    var xline=glx_canvas;

    if(on==false){
	//console.log("GF height = " + footer.clientHeight);
	xd.resize_canvas(bo.clientWidth-la.clientWidth-10,window.innerHeight-
			 gfx_bar.clientHeight-footer.clientHeight-di.clientHeight-xline.clientHeight-10);

//	xline.width=bo.clientWidth-la.clientWidth-10;
	
	//gfx_bar.style.width=xd.canvas.style.width;
	xd.infs=false;
	xd.render();
	render_line();
	return;
    }
    
    //var bd=[document.body.clientWidth,document.body.clientHeight];
    var bd=[window.innerWidth,window.innerHeight];
    var drawing_info=document.getElementById("drawing_info");
    gfx_bar.style.width=bd[0];
    
    console.log("doc body  d = " + bd[0] + ","+bd[1]);
    
    xd.resize_canvas(bd[0]-30, //document.width is obsolete
		     bd[1]-30-gfx_bar.style.height - drawing_info.style.height); //document.height is obsolete
    
    xd.infs=true;
    xd.render();
}



