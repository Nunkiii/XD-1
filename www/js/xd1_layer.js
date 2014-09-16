/*
  
  XD-1  - LAYER CLASS

  Qk/Sadira project
  Pierre Sprimont, INAF/IASF, Bologna, 2014
  
*/

var gl_bbig = function (w,h) {

    function allocate_bbig(w,h){
	console.log("Allocating bbig");
	this.w=up2(w);
	this.h=up2(h);
	
	this.b=new ArrayBuffer(4*4*w*h);
	this.fv= new Float32Array(b);
    }
    
    function up2(x){
	var p2=1;
	while(p2 < x) p2*=2; 
	return p2;
    }
  
    this.setup_bbig=function (neww, newh){

	if(typeof neww == 'undefined' || 
	   typeof newh == 'undefined' )
	    return;
	
	console.log("Setup bbig for image size " + neww + ", " + newh);
	
	if(this.b!=null){ //A buffer is already allocated 

	    if(this.w>=neww && this.h>=newh){
		//Ok, the already allocated GL buffer is big enough to hold the 4-image layers data.
		console.log("Allocated buffer is already big enough : " + xd.w + ", " + xd.h);
		
	    }else{ //Allocating a bigger poweroftwo buffer ...
		
		var oldw=this.w;
		var oldh=this.h;

		//We need first to resize the GL Buffer...
		//Copy the old buffer data before allocating : 
		var oldb;
		memcpy(oldb, this.b);
		var oldfv=new Float32Array(oldb);

		this.allocate_bbig(neww,newh);
		
		console.log("Best pow2 size for a bbig buffer bigger than " 
			    + neww + " x "+newh + " is : " 
			    + this.w + " x "+ this.h + ". Was :  " 
			    + oldw + " x " + oldh + ".");

		//Copy the old buffer content into the corner of the newly allocated bigger buffer
		
		var fv= this.fv;
		//var fv=newbbig.fv;
		// var n=4*w*h;
		//for(var c=0;c<n;c++)newfv[c] = fv[c];
		
		for(var l=0;l<oldh;l++){
		    for(var c=0;c<4*oldw;c++){
			fv[4*l*w+c] = oldfv[4*l*oldw+c];
		    }
		}
	
		//delete xd.bbig;
		//delete xd.fv;
		
		//xd.fv=newfv;
		//xd.bbig=newbbig;
		//xd.w=w;
		//xd.h=h;
		
		//this=new_bbig;

		console.log("Resizing bbig buffer done");
	    }

	}else{
	    allocate_bbig(w,h);
	    /*
	      for(var i=0;i<this.fv.length;i++){
		fv[i]=0.0;
		}
	    */

	    // canvas_info.innerHTML="GL texture ("+ w + ", " + h + ")";
	    //xd.bbig=create_bbig_buffer(w,h);
	    //xd.fv=xd.bbig.fv;
	}
	
	this.trigger("resize");

	return this;
	

	var resolutionLocation = gl.getUniformLocation(xd.program, "u_resolution");
	gl.uniform2f(resolutionLocation, xd.w, xd.h);
	xd.update_layer_ranges();

    }

    this.bbig=null;
    new_event(this,"resize");
    return this.setup_bbig(w,h);


};

var def_parameters=[
    [0, //low cut
     5.0, //high cut
     0, //Tx
     0, //Ty
     1.0, //Scale
     0, //Rot
     .85, //Luminosity
     0
    ],
    [0, //low cut
     20.0, //high cut
     0, //Tx
     0, //Ty
     1.0, //Scale
     0, //Rot
     .85, //Luminosity
     0
    ],
    [0, //low cut
     5.0, //high cut
     0, //Tx
     0, //Ty
     1.0, //Scale
     0, //Rot
     .85, //Luminosity
     0
    ],
    [0, //low cut
     2.0, //high cut
     0, //Tx
     0, //Ty
     1.0, //Scale
     0, //Rot
     .85, //Luminosity
     0
    ]
];


function layer(xd, id, cb){

    var lay=this;
    var gl=xd.gl;

    this.xd=xd;
    this.id=id;

    var div=this.div=document.createElement("div"); 
    div.className="layer";

    this.p_values=def_parameters[id];
    this.rotcenter=[0,0];


    var layer_opts=this.layer_opts=tmaster.build_template("gl_image_layer"); 
    var depth=1;//layer_opts.depth+1;
    console.log("Hello");

    var cuts=layer_opts.elements.general.elements.cuts; 
    var histo_tpl=layer_opts.elements.general.elements.histo; 
    var cmap=this.cmap=layer_opts.elements.general.elements.cmap; 
    var lum=layer_opts.elements.general.elements.lum; 
    var tr=layer_opts.elements.geometry.elements.translation;
    var zm=layer_opts.elements.geometry.elements.zoom; 
    var ag=layer_opts.elements.geometry.elements.rotation.elements.angle; 
    var rc=layer_opts.elements.geometry.elements.rotation.elements.center;

    var image=layer_opts.elements.image;

    var fits_file=image.elements.source.elements.local_fits;
    var gloria=image.elements.source.elements.gloria;
    var sbig=image.elements.source.elements.sbig;

    var file_size=image.elements.info.elements.file_size;
    var image_size=image.elements.info.elements.size;
    var dims=image.elements.info.elements.dims;
    var bounds=image.elements.info.elements.bounds; 
    
    var nbins=512;
    var bsize=null; 
    var length;

    histo_tpl.on_slide=function(slided){
	console.log("Histo slide ! " + slided);
	if(slided){
	    //histo_tpl.ui_opts.width=
	    //histo_tpl.redraw(); 
	    compute_histogram(nbins, cuts.value);
	}
    }

    histo_tpl.selection_change=function(new_cuts){

	console.log("Histo selection change!"); 
	cuts.set_value(new_cuts);
	cuts.onchange();
    }

    histo_tpl.on_range_change=function(new_cuts){
	//console.log("Range change !, recomp histo");
	compute_histogram(nbins, new_cuts);
    }

    layer_opts.elements.enable.onchange = function(){
	//console.log("Change !!!");
	xd.layer_enabled[lay.id]=this.value;
	var le_loc=gl.getUniformLocation(xd.program, "u_layer_enabled");
	gl.uniform4iv(le_loc, xd.layer_enabled);
	xd.render();
    };

    cuts.onchange = function(){
	lay.p_values[0]=this.value[0];
	lay.p_values[1]=this.value[1];
	//console.log("Cuts changed to " + JSON.stringify(this.value));
	update_pvalues();
    };
    
    tr.onchange = function(){
	lay.p_values[2]=this.value[0];
	lay.p_values[3]=this.value[1];
	update_pvalues();
    };

    zm.onchange=function(){
	lay.p_values[4]=this.value;
	update_pvalues();
    }

    ag.onchange=function(){
	lay.p_values[5]=this.value;
	update_pvalues();
    }

    lum.onchange=function(){
	lay.p_values[6]=this.value;
	update_pvalues();
    }

    rc.onchange=function(){
	var rc_loc=gl.getUniformLocation(xd.program, "u_rotcenters");
	xd.p_rotcenters[2*lay.id]=this.value[0];
	xd.p_rotcenters[2*lay.id+1]=this.value[1];
	console.log("Setting rotcenter for layer " + lay.id + " : " + JSON.stringify(xd.p_rotcenters));
	gl.uniform2fv(rc_loc, xd.p_rotcenters);
	xd.render();
	
    }



    lay.load_fits_data=function(data_source){

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
	    console.log("FITS OK "+dataunit);
	    
	    var opts={ dataunit : dataunit };
	    
	    // Get pixels representing the image and pass callback with options
	    dataunit.getFrame(0, function(arr, opts){// Get dataunit, width, and height from options
		var dataunit = opts.dataunit;
		var w=lay.width = dataunit.width;
		var h=lay.height = dataunit.height;
		
		// Get the minimum and maximum pixels
		var extent = dataunit.getExtent(arr);
		
		layer_opts.set_title(fits_file.ui.files[0].name);
		file_size.value=fits_file.ui.files[0].size;

		//console.log("FF set_value is " + typeof(fits_file.elements.dims.set_value) );

		file_size.set_value();
		

		bounds.set_value(extent);
		console.log("Frame read : D=("+lay.width+","+lay.height+")  externt " + extent[0] + "," + extent[1]);
		//image_info.innerHTML="Dims : ("+lay.width+", "+lay.height+")";
		
		dims.set_value([w,h]);
		
		lay.arr=arr;
		lay.ext=extent;
		
		setup_bbig(w,h);
		
		image_size.set_title("pixel byte size " + arr.length*1.0/w/h + " PixType " + typeof(arr[0]));
		image_size.set_value(arr.length*4);

		var id=lay.id;
		
		console.log("Filling big array with layer  " + id + " : " + w + ", " + h + " global dims " + w + ", "+h);
		
		
		/*
		  var rangeLocation = gl.getUniformLocation(xd.program, "u_layer_range");
		  xd.p_layer_range[2*id]=lay.width*1.0/xd.w;
		  xd.p_layer_range[2*id+1]=lay.height*1.0/xd.h;		
		  gl.uniform2fv(rangeLocation, xd.p_layer_range);
		*/
		var fv=xd.fv;
		
		for(var i=0;i<h;i++){
		    for(var j=0;j<w;j++){
			fv[4*(i*xd.w+j)+id]=1.0*arr[i*w+j];
		    }
		}
		
		//lay.opts=opts;
		//console.log("Opts: " + JSON.stringify(lay.opts));
		setup_layer_data();
		
		
//		result_cb(null, { w : lay.width, h : lay.height, arr : arr, ext : extent});
		
		
	    }, opts);
	});
    }
    
    fits_file.onchange=function(evt){
	var file = evt.target.files[0]; // FileList object
	lay.load_fits_data(file);

    }

    lay.setup_dgram_layer=function(header, fvpin){

	var fvp;

	if(header.colormap)
	    cmap.set_value(header.colormap);
	
	if(fvpin.length){
	    fvp=fvpin;
	    length=fvp.length;
	}else{
	    fvp = new Float32Array(fvpin);
	    length = fvp.byteLength;
	}

	var w=lay.width=header.width;
	var h=lay.height=header.height;
	
	var extent = [1e20,-1e20];

	console.log("Setting layer data " + JSON.stringify(header) + " bytes : " + length + "data exts " + extent[0] + "," + extent[1]);

	for (var i=0;i<length;i++){
	    //if(i%500==0)console.log("fvp " + i + " : " + fvp[i]);
	    if(fvp[i]>extent[1])extent[1]=fvp[i];
	    if(fvp[i]<extent[0])extent[0]=fvp[i];
	}
	// Get the minimum and maximum pixels
	
	layer_opts.set_title(header.name);
	file_size.set_value(header.sz);

	//console.log("FF set_value is " + typeof(fits_file.elements.dims.set_value) );
	
	bounds.set_value(extent);
	console.log("Frame read : D=("+lay.width+","+lay.height+")  data exts " + extent[0] + "," + extent[1]);
	//image_info.innerHTML="Dims : ("+lay.width+", "+lay.height+")";
		
	dims.set_value([w,h]);
		
	lay.arr=fvp;
	lay.ext=extent;
	
	setup_bbig(w,h);
	
	image_size.set_title("pixel byte size " + length*1.0/w/h + " PixType " + typeof(fvp[0]));
	image_size.set_value(length*4);
	
	var id=lay.id;
	
	console.log("Filling big array with layer  " + id + " : " + w + ", " + h + " global dims " + w + ", "+h);
	/*
	var rangeLocation = gl.getUniformLocation(xd.program, "u_layer_range");
	xd.p_layer_range[2*id]=lay.width*1.0/xd.w;
	xd.p_layer_range[2*id+1]=lay.height*1.0/xd.h;
	gl.uniform2fv(rangeLocation, xd.p_layer_range);
	*/

	var fv=xd.fv;
	
	for(var i=0;i<h;i++){
	    for(var j=0;j<w;j++){

		fv[4*(i*xd.w+j)+id]=1.0*fvp[i*w+j];
	    }
	}
	
	setup_layer_data();

    }
    
    var canvas_info  = document.getElementById('canvas_info');
    
    //    var x_domain_full=null; //[low+.5*bsize,low+(nbins-.5)*bsize];

    function auto_cuts(){
	
	var histo=histo_tpl.value;
	var max=0,maxid=0, total=0, frac=.95, cf=0;

	//console.log("cuts.... ND=" + histo.length);

	for(var i=0;i<histo.length;i++){
	    var v=histo[i];
	    if(v>max){max=v;maxid=i;}
	    total+=v;
	}
	
	var i;
	for(i=0;i<histo.length;i++){
	    cf+=histo[i];
	    if(cf*1.0/total>=frac) break;
	}
	
	//if(maxid>0) maxid-=1;
	var autocouts=[histo_tpl.start+histo_tpl.step*maxid,histo_tpl.start+histo_tpl.step*i];

	console.log("cuts.... total " + total + " maxid " + maxid + " max " + max + " -> cuts " + JSON.stringify(autocouts));
	

	cuts.set_value(autocouts);
	cuts.onchange();
	console.log("cuts....done");
    }

    function reset_histogram(){

	var low=lay.ext[0];
	var high=lay.ext[1];

	//cuts.set_value([low+.5*bsize,low+(nbins-.5)*bsize]);
	//console.log("X DOM " + x_domain[0] + ", " + x_domain[1]);
	//bsize=(high-low)/nbins;
	compute_histogram(nbins,lay.ext);
	auto_cuts();

	//draw_histogram();
	
    }

    this.pointer_info  = document.createElement('div');
    this.pointer_info.className="pointer_info";

    this.width=0;
    this.height=0;

    this.g_tr=[0,0];
    this.g_mrot=[[1,0],[0,1]];
    this.g_screen_center=[0,0];
    this.g_scale=1.0;

    update_pvalues();	    
    

    cmap.update_callback=function(){

	var cmap_data=cmap.value;
	xd.ncolors[lay.id]=cmap_data.length;
	
	//console.log("Update Colormap ncolors: "+xd.ncolors[lay.id]+"  data :" + JSON.stringify(cmap_data));

	var of=128*4*lay.id;
	for(var cmi=0;cmi<cmap_data.length;cmi++){
	    var c=cmap_data[cmi];
	    for(var k=0;k<4;k++)
		xd.cmap_texdata[of+4*cmi+k]=c[k];
	    xd.cmap_fracdata[of+4*cmi]=c[4];
	}

	for(var cmi=cmap_data.length;cmi<128;cmi++){
	    for(var k=0;k<4;k++)
		xd.cmap_texdata[of+4*cmi+k]=-1.0;
	    xd.cmap_fracdata[of+4*cmi]=-1;
	}
	
	// for(var k=0;k<4;k++){
	//     console.log("Layer " + k + " nc=" + ncolors[k] );
	//     for(var cmi=0;cmi<ncolors[k];cmi++){
	// 	console.log("L"+k+" C"+cmi + "=" + cmap_texdata[k*128*4+cmi*4]+","+ cmap_texdata[k*128*4+cmi*4+1]+","+ cmap_texdata[k*128*4+cmi*4+2]+","+ cmap_texdata[k*128*4+cmi*4+3]+"" );
	//     }
	// }
	
	//console.log("NCOLORS="+JSON.stringify(ncolors));
	var ncolors_loc = gl.getUniformLocation(xd.program, "u_ncolors");
	gl.uniform4iv(ncolors_loc, xd.ncolors);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, xd.cmap_texture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 4, 0, gl.RGBA, gl.FLOAT, xd.cmap_texdata);
	gl.uniform1i(gl.getUniformLocation(xd.program, "u_cmap_colors"), 1);
	
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, xd.cmap_frac);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128,4, 0, gl.RGBA, gl.FLOAT, xd.cmap_fracdata);
	gl.uniform1i(gl.getUniformLocation(xd.program, "u_cmap_fracs"), 2);
	
	
	xd.render();
	
	//console.log("Update colormap for layer "+lay.id + "cm="+JSON.stringify(xd.cmap_fracdata) + " OK" );
	
    }
    

    function setup_bbig(w, h){

	console.log("Setup bbig for image size " + w + ", " + h);

	function up2(x){var p2=1;while(p2 < x) p2*=2; return p2;}

	function create_bbig_buffer(w,h){
	    var b=new ArrayBuffer(4*4*w*h);
	    var fv=b.fv = new Float32Array(b);
	    for(var i=0;i<fv.length;i++){
		fv[i]=0.0;
	    }
	    return b;
	}

	if(xd.bbig!=null){
	    if(xd.w>=w && xd.h>=h){
		console.log("Buffer big enough " + xd.w + ", " + xd.h);
		//return; //Ok, GL buffer is big enough
	    }else{

		//We need to resize the GL Buffer...
		console.log("Resizing bbig buffer");
		
		var w=up2(w);
		var h=up2(h);
		
		//Copy the actual content into the bigger buffer
		
		var newbbig=create_bbig_buffer(w,h);
		var newfv= newbbig.fv;
		var bbig=xd.bbig;
		var fv=xd.fv;
		
		var n=4*xd.w*xd.h;
      //for(var c=0;c<n;c++)newfv[c] = fv[c];
	
		  for(var l=0;l<xd.h;l++){
		  for(var c=0;c<4*xd.w;c++){
		  newfv[4*l*w+c] = fv[4*l*xd.w+c];
		  }
		  }
	
		delete xd.bbig;
		delete xd.fv;
		
		xd.fv=newfv;
		xd.bbig=newbbig;
		xd.w=w;
		xd.h=h;
		
		console.log("Resizing bbig buffer done");
	    }

	}else{
	    console.log("Creating initial bbig");
	    var w=xd.w=up2(w);
	    var h=xd.h=up2(h);

	    canvas_info.innerHTML="GL texture ("+ w + ", " + h + ")";
	    xd.bbig=create_bbig_buffer(w,h);
	    xd.fv=xd.bbig.fv;
	}

	var resolutionLocation = gl.getUniformLocation(xd.program, "u_resolution");
	gl.uniform2f(resolutionLocation, xd.w, xd.h);
	xd.update_layer_ranges();

    }
    
    function init_fits_source() {
    }

    //dinfo.innerHTML+="Requesting image binary data...<br/>";
    
    function draw_histogram(){
	
    }
    
    
    function compute_histogram(nbins, data_bounds){
	
	var data=lay.arr;
	var dl=data.length ? data.length : data.byteLength;

	var histo=histo_tpl.value=[];
	var step=histo_tpl.step=(data_bounds[1]-data_bounds[0])/nbins;
	var start=histo_tpl.start=data_bounds[0];//+.5*step;

	bsize=(histo_tpl.elements.selection.value[1]-histo_tpl.elements.selection.value[0])/nbins;

	for(var i=0;i<nbins;i++){
	    histo[i]=0;
	}
	
	console.log("Data bounds : " + lay.ext[0] + ", " + lay.ext[1], " bin size = " + bsize + " nbins " + nbins + " ndata=" + dl + " start " + start + " step " + step);
	
	
	for(var i=0;i<dl;i++){
	    var v=data[i];
	    if(v>=data_bounds[0]&&v<=data_bounds[1]){
		var bid=Math.floor( (v-data_bounds[0])/step);
		if(bid>=0&&bid<nbins)
		    histo[bid]++; 
	    }
	}
	
	histo_tpl.set_value();
	//console.log("Histo : " + JSON.stringify(lay.histo));
	
    }  
    
    function update_pvalues(){
	var pv_loc=gl.getUniformLocation(xd.program, "u_pvals");
	for(var p=0; p<8;p++) xd.p_vals[lay.id*8+p]=lay.p_values[p];
	//console.log("Setting parms for layer " + layer_id + " : " + JSON.stringify(p_vals));
	gl.uniform4fv(pv_loc, xd.p_vals);
	if(zm.ui)
	    zm.ui.step=zm.ui.value/10.0;
	//lay.update_geometry();
	xd.render();
    }

    
    function setup_layer_data(){
	
	var w=xd.w;
	var h=xd.h;

	console.log("Setting up layer " + lay.id + "... " + w + ", " + h);
	
	lay.p_values[0]=lay.ext[0];
	lay.p_values[1]=lay.ext[1];

	histo_tpl.min=lay.ext[0];
	histo_tpl.max=lay.ext[1];
	histo_tpl.step=(lay.ext[1]-lay.ext[0])/200.0;
	//x_domain_full=[lay.p_values[0]+.5*bsize,lay.p_values[0]+(nbins-.5)*bsize];

	//histo_tpl.ui_opts.width=histo_tpl.ui.clientWidth;
	//histo_tpl.ui_opts.heigth=histo_tpl.ui.clientHeight;


	compute_histogram(nbins, lay.ext);
	auto_cuts();
	histo_tpl.set_range(cuts.value);

	//if(bsize==null)

	console.log("Histo ui " + JSON.stringify(histo_tpl.ui_opts));
	histo_tpl.redraw();

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, xd.texture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.FLOAT, xd.fv);
	gl.uniform1i(gl.getUniformLocation(xd.program, "u_image"), 0);
	
	//reset_histogram();
	
	//cmap.create_colors(def_colormaps[lay.id]);
	//cmap.last.insert_color([0.0,0.4,0.0,1.0], 0.5);
	//cmap.select_element(cmap.elements[cmap.elements.length-1]);
	cmap.display({type : "edit"});
	
	xd.fullscreen(false);
	
	
    }

    this.ui=create_ui({type:"short" }, layer_opts, depth);
    gloria.lay=lay;
    

    init_cam_source(sbig.ui_root);


    cb(null,this);

}

layer.prototype.update_geometry=  function (){
    var xd=this.xd;

    var alpha_l=-1.0*this.p_values[5];
    var alpha=-1.0*xd.angle;

    this.g_lzoom=1.0*this.p_values[4]; //*xd.zoom;

    this.g_trl=[1.0*this.p_values[2],1.0*this.p_values[3]]; //xd.tr[]
    this.g_rm=[[Math.cos(alpha_l),Math.sin(alpha_l)],
	       [-1.0*Math.sin(alpha_l),Math.cos(alpha_l)]];
    this.g_rmg=[[Math.cos(alpha),Math.sin(alpha)],
		[-1.0*Math.sin(alpha),1.0*Math.cos(alpha)]];
    this.g_screen_center=[xd.canvas.width/2.0, xd.canvas.height/2.0];
    this.g_rotc=[1.0*xd.p_rotcenters[2*this.id],1.0*xd.p_rotcenters[2*this.id+1]];
    this.g_texc=[this.width/xd.w/2.0, this.height/xd.h/2.0];


    //console.log("ROTC = " + JSON.stringify(this.g_rotc) + "TEXC " + JSON.stringify(this.g_texc)+ "TR " + JSON.stringify(this.g_trl) + " scale " + this.g_lzoom);
    
}

layer.prototype.get_image_pixel= function(screen_pixel) {
    if(typeof this.g_trl=="undefined") return [0,0];

    var xd=this.xd;
    var ipix=[
	(screen_pixel[0]-this.g_screen_center[0])/xd.zm.value+xd.tr.value[0]-xd.rc.value[0],
	(screen_pixel[1]-this.g_screen_center[1])/xd.zm.value+xd.tr.value[1]-xd.rc.value[1]
    ];
    
    ipix= numeric.dot(this.g_rmg,ipix);
    
    ipix[0]=((ipix[0]+xd.rc.value[0])/this.g_lzoom+this.g_trl[0]-this.g_rotc[0]);
    ipix[1]=((ipix[1]+xd.rc.value[1])/this.g_lzoom+this.g_trl[1]-this.g_rotc[1]);

    ipix= numeric.dot(this.g_rm,ipix);

//    ipix[0]=(((ipix[0]+this.g_rotc[0])/xd.w+.5)*this.width);
//    ipix[1]=(((ipix[1]+this.g_rotc[1])/xd.h+.5)*this.height);

    ipix[0]=(ipix[0]+this.g_rotc[0])+this.width/2.0;///xd.w+this.g_texc[0];
    ipix[1]=(ipix[1]+this.g_rotc[1])+this.height/2.0;///xd.h+this.g_texc[1];
//    console.log("P="+JSON.stringify(ipix));
    return ipix;
}

layer.prototype.update_pointer_info=function(screen_pixel){

    if(typeof this.arr=='undefined') return;

    var ipix=this.get_image_pixel(screen_pixel);
    
    if(ipix[0]<0 || ipix[0]>=this.width || ipix[1]<0 || ipix[1]>=this.height){
	this.pointer_info.innerHTML="outside<br/>image";
	return;
    }

    ipix[0]=Math.floor(ipix[0]);
    ipix[1]=Math.floor(ipix[1]);

    var pos=ipix[1]*this.width+ ipix[0];
    var pixel_value = this.arr[pos];

    this.pointer_info.innerHTML="("+ipix[0]+","+ipix[1]+")<br/>" + Math.floor(pixel_value*1000)/1000.0;
    //POS " +pos + " L= " + this.arr.length + 
    //	" D : " + this.width + "," + this.height ;
    
}

