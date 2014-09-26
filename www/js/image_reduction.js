

template_ui_builders.image_reduction=function(ui_opts, ired){
    
    var processing=ired.elements.processing.elements;
    var input=ired.elements.input.elements;
    var output=ired.elements.output.elements;
    
    var bias=input.bias;
    var flat=input.flat;
    var science=input.science;
    var out=output.reduced_science;
    
    var start=processing.start;
    var debias_flat=processing.debias_flat;
    var normalize_flat=processing.normalize_flat;
    var debias_flat=processing.debias_flat;
    
    start.listen("click", function(){
	out.copy_image(science);
	var dims=out.elements.dims.value;
	var length=science.fvp.length;
	var norm=1.0;

	
	console.log("Output " + dims[0] + ", " + dims[1]);
	/*
	for (var j=0;j<dims[1];j++)
	    for (var i=0;i<dims[0];i++){
		var k=j*dims[0]+i;
		out.fvp[k]=3.141592;//(science.fvp[k]-bias.fvp[k])/flat.fvp[k];
	    }
	return;
	*/

	function normalize(buf){

	    var ns=2000;
	    var ab=new ArrayBuffer(4*ns);
	    var fa=new Float32Array(ab);
	    var lo=0.01, hi=0.99;
	    
	    for (var i=0;i<fa.length;i++){
		var pix=Math.floor(Math.random()*length);
		fa[i]=buf[pix];
	    }
	    var sort=radixsort();
	    var sfa = sort(fa);
	    var norm=1.0*sfa[Math.floor(ns/2)];
	    
	    
	    console.log("Norm : " + norm);
	    for (var i=0;i<length;i++){
		buf[i]=buf[i]*1.0/norm;
	    }
	    
	  //  flat.update_extent();
	}
	
	if(debias_flat.value === true){
	    console.log("Debias flat " + length);
	    for (var j=0;j<length;j++){
		flat.fvp[j]=flat.fvp[j]-bias.fvp[j];
	    }
	}
	
	if(normalize_flat.value === true){
	    console.log("Normalize flat " + length);
	    normalize(flat.fvp);
	    
	}

	for (var j=0;j<length;j++)
	    if(flat.fvp[j]<=0) flat.fvp[j]=1.0;


	flat.update_extent();

	console.log("Output " + dims[0] + ", " + dims[1]);

	for (var j=0;j<dims[1];j++)
	    for (var i=0;i<dims[0];i++){
		var k=j*dims[0]+i;
		out.fvp[k]=(science.fvp[k]-bias.fvp[k])/flat.fvp[k];
	    }
	out.update_extent();
    });
    
    
}
