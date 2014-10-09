template_ui_builders.sbig_control=function(ui_opts, sbig){

    var expo=sbig.elements.exposure.elements;
    var cooling=sbig.elements.cooling.elements;
    var actions=sbig.elements.actions.elements;
    var exptime=expo.exptime;
    var nexpo=expo.nexpo;
    var messages=sbig.elements.messages;
    
    var start_camera=actions.start_camera;
    var start_exposure=actions.start_exposure;
    
    var expo_progress=start_exposure.elements.expo_progress;
    var grab_progress=start_exposure.elements.grab_progress;
    var enable_cooling=cooling.enable;
    var cooling_setpoint=cooling.setpoint;
    var temp=cooling.temp;
    var ambient_temp=cooling.ambient_temp;
    var pow=cooling.pow;

    var temp_max_points=300;
    var temp_data=[];

    start_camera.listen("click", function(){
	
	var sadira=xd.elements.setup.elements.sadira;
	var d= sadira.dialogs.create_dialog({ handler : "sbig.drive"});
	
	d.listen("expo_progress", function(dgram){
	    //console.log("EXPO Head" + JSON.stringify(dgram.header));
	    expo_progress.set_value(dgram.header.value*1.0);
	});

	d.listen("grab_progress", function(dgram){
	    //console.log("GRAB Head" + JSON.stringify(dgram.header));
	    grab_progress.set_value(dgram.header.value*1.0);
	});


	var iv;
	d.listen("cooling_info", function(dgram){
	    var temp_info = dgram.header.cooling_info;
	    temp_data.push(temp_info);
	    if(temp_data.length>temp_max_points)
		temp_data.splice(0,1);
	    temp.set_value(temp_info.ccd_temp);
	    ambient_temp.set_value(temp_info.ambient_temp);
	    pow.set_value(temp_info.cooling_power);
	    //messages.append(JSON.stringify(temp_info,null,3));
	    //console.log("Cooling info " + JSON.stringify(temp_info));
	    //draw_ccd_temperature();
	});
	
	
	d.listen("cam_status", function(dgram){
	    var m=dgram.header.status;
	    
	    messages.append(JSON.stringify(m,null,5));
	    
	    if(m.ready) {
		
		start_exposure.listen("click",function(){
		    d.send_datagram({ type : "start_expo", exptime : exptime.value, nexpo : nexpo.value },null,function(error){} );
		});
		
		iv=setInterval(function(){

		    d.send_datagram({ type : "get_cooling_info"},null,function(error){} );
		    
		    //console.log("NS= "+ ns +" Cam temperature = " + JSON.stringify(cam.get_temp()));
		    //clearInterval(iv);
		    
		    
		}, 1000);
		
		enable_cooling.listen("change", function(enabled){
		    var setpoint=temp_setpoint.value; 
		    console.log("Setting temp ["+enabled+"] setpoint " + setpoint);
		    d.send_datagram({ type : "set_cooling", enabled : enabled*1.0, setpoint: setpoint},null,function(error){} );

		});
		

	    }
	    if(m.info) {
		
	    }
	    if(m.error){
	    }
	    
	});
	
	d.lay_id=this.id;

	d.srz_request=function(dgram,  calb){
	    console.log("SRZ req called...");

	    var w=lay.width = dgram.header.width;
	    var h=lay.height =dgram.header.height;
	    
	    var sz=dgram.header.sz;
	    
	    console.log("Ready to receive "+sz +" bytes. Image ["+dgram.header.name+"] size will be : " + w + ", " + h);
	    camera_status.innerHTML+="Ready to receive "+sz +" bytes. Image ["+dgram.header.name+"] size will be : " + w + ", " + h + "<br/>";
	    
	    setup_bbig(w,h);
	    
	    // if(bbig==null){
	    
	    // 	sz=dgram.header.sz;
	    // 	w=
	    // 	h=
	    
	    // 	bbig=new ArrayBuffer(4*sz);
	    // 	fv = new Float32Array(bbig);
	    // 	for(var i=0;i<fv.length/4;i++){
	    // 	    fv[4*i]=0.0;
	    // 	    fv[4*i+1]=0.0;
	    // 	    fv[4*i+2]=0.0;
	    // 	    fv[4*i+3]=1.0;
	    // 	}
	    // }
	    
	    status.innerHTML+=dgram.header.name;

	    console.log("X");
	    var b=new ArrayBuffer(sz);
	    console.log("X");
	    var fvp = new Float32Array(b);
	    //console.log("AB: = "+ fv.length +" =? "+sz/4+" first elms : " + fv[0] + ", " + fv[1] );
	    var sr=new srz_mem(b);

	    lay.arr=fvp;
	    sr.lay_id=d.lay_id;
	    
	    console.log("X");

	    sr.on_chunk=function(dgram){
		//console.log("Fetching data chunk...");

		p_fetch.value=(Math.floor(100*( (dgram.header.cnkid*sr.chunk_size)/sr.sz_data)));

		//status.innerHTML="Fetching data for " + dgram.header.name +
	    	//" : "+(Math.floor(100*( (dgram.header.cnkid*sr.chunk_size)/sr.sz_data)))+" %";
	    }

	    console.log("XXX w,h = " + w + ", " + h);
	    
	    sr.on_done=function(){

		console.log("Fetch image done !");
		p_fetch.value=100.0;
		var lid=lay.id;
		var fv=xd.fv;
		var min=1e20,max=-1e20;
		
		var rangeLocation = gl.getUniformLocation(xd.program, "u_layer_range");
		
		xd.p_layer_range[2*lid]=lay.width/xd.w;
		xd.p_layer_range[2*lid+1]=lay.height/xd.h;
		
		gl.uniform2fv(rangeLocation, xd.p_layer_range);
		var fv=xd.fv;
		console.log("Filling texture ("+xd.w+","+xd.h+") with image ("+w +","+h+")"  );

		for(var i=0;i<h;i++){
		    for(var j=0;j<w;j++){
			var v=fvp[i*w+j]*1.0;
			fv[4*(i*xd.w+j)+lid]=1.0*v;
			if(v>max)max=v; else if(v<min)min=v;
		    }
		}

		console.log("Setting up layer data...");
		lay.ext=[min,max];
		setup_layer_data();
		
	    };

	    console.log("XXX");

	    console.log("calling cb");
	    calb(null, sr);
	    console.log("calling cb done");
	};
	

	d.connect(function(error, init_dgram){
	    if(error)
		messages.append("Init data error= " + error + " init datagram = <pre> " + JSON.stringify(init_dgram,null,4));
	    else{
		
		messages.append("Dialog handshake OK");
		
		start_camera.listen("click",function(){
		    
		    d.send_datagram({type : "start_camera"},null,function(error){
			
			if(error){
			    messages.append("ERROR: "+error);
			}
		    });
		});
		
	    }
	    
	    
	}); 

    });
    
}

function init_cam_source(cam_source_div) {
    
    var table=document.createElement("table");
    
    var tr1=table.appendChild(document.createElement("tr"));
    var tr2=table.appendChild(document.createElement("tr"));
    var tr3=table.appendChild(document.createElement("tr"));
    var tr4=table.appendChild(document.createElement("tr"));
    var tr5=table.appendChild(document.createElement("tr"));
    var tr6=table.appendChild(document.createElement("tr"));
    var tr7=table.appendChild(document.createElement("tr"));
    var tr8=table.appendChild(document.createElement("tr"));
    var tr9=table.appendChild(document.createElement("tr"));
    var tr10=table.appendChild(document.createElement("tr"));
    var tr11=table.appendChild(document.createElement("tr"));
    
    
    var dialog_button = document.createElement("button");	
    dialog_button.innerHTML="Start ws dialog";
    var start_stop_button = document.createElement("button");	
    start_stop_button.innerHTML="Start camera";
    
    var start_expo = document.createElement("button");
    start_expo.innerHTML="Start exposure";
    
    
    var status = document.createElement("div");
    status.style.overflow="scroll";
    
    var exptime = document.createElement("input");
    
    exptime.type="number";
    exptime.value=1.0;
    exptime.step=1.0;
    exptime.min=0.000;
    exptime.max=10000;
    
    var temp_setpoint = document.createElement("input");
    
    temp_setpoint.type="number";
    temp_setpoint.value=-10.0;
    temp_setpoint.step=1.0;
    temp_setpoint.min=-100.000;
    temp_setpoint.max=30.0;
    
    
    var temp_regulation_enable = document.createElement("input");
    temp_regulation_enable.type="checkbox";
    temp_regulation_enable.checked="false";
    
    var set_temp_regulation = document.createElement("button");
    set_temp_regulation.innerHTML="Set temp. regulation";
    
    tr4.appendChild(document.createElement("th")).innerHTML="Temp. Regulation";
    tr4.appendChild(document.createElement("th")).innerHTML="Temp. Setpoint(C)";
    
    td=tr5.appendChild(document.createElement("td"));
    td.colSpan=1;
    td.appendChild(temp_regulation_enable);
    
    td=tr5.appendChild(document.createElement("td"));
    td.colSpan=1;
    td.appendChild(temp_setpoint);

    td=tr5.appendChild(document.createElement("td"));
    td.colSpan=1;
    td.appendChild(set_temp_regulation);

    var nexpo = document.createElement("input");
    
    nexpo.type="number";
    nexpo.value=1;
    nexpo.step=1;
    nexpo.min=0;
    nexpo.max=100;
    
    var camera_status = document.createElement("div");
    
    camera_status.className="camera_status";
    
    cam_source_div.appendChild(table);
    cam_source_div.appendChild(status);
    var td;
    
    td=tr1.appendChild(document.createElement("td"));
    td.appendChild(dialog_button);
    td.appendChild(start_stop_button);
    
    td=tr1.appendChild(document.createElement("td"));
    td.appendChild(start_expo);
    
    td=tr2.appendChild(document.createElement("th"));
    td.innerHTML="Expo time(s)";
    td=tr2.appendChild(document.createElement("th"));
    td.innerHTML="Nexpo";
    
    td=tr3.appendChild(document.createElement("td"));
    td.appendChild(exptime);
    td=tr3.appendChild(document.createElement("td"));
    td.appendChild(nexpo);
    
    

    var p_expo=document.createElement("progress");
    var p_read=document.createElement("progress");
    var p_fetch=document.createElement("progress");
    
    p_expo.value=0.0;
    p_read.value=0.0;
    p_fetch.value=0.0;
    
    p_expo.min=0.0;
    p_expo.max=100.0;
    
    p_read.min=0.0;
    p_read.max=100.0;
    
    p_fetch.min=0.0;
    p_fetch.max=100.0;
    
    tr6.appendChild(document.createElement("th")).innerHTML="Exposition";
    tr7.appendChild(document.createElement("th")).innerHTML="CCD reading";
    tr8.appendChild(document.createElement("th")).innerHTML="Data fetching";
    

    td=tr6.appendChild(document.createElement("td"));
    td.colSpan=2;
    td.appendChild(p_expo);
    
    td=tr7.appendChild(document.createElement("td"));
    td.colSpan=2;
    td.appendChild(p_read);

    td=tr8.appendChild(document.createElement("td"));
    td.colSpan=2;
    td.appendChild(p_fetch);
    
    
    td=tr9.appendChild(document.createElement("td"));
    td.colSpan=2;
    td.appendChild(camera_status);
    
    td_cooling_info=tr10.appendChild(document.createElement("td"));
    td_cooling_info.colSpan=4;
    //camera_status.innerHTML="Not connected";
    
    var temp_td=tr11.appendChild(document.createElement("td"));
    temp_td.colSpan=4;
    
    var temp_max_points=300;
    var temp_data=[];
    
    
    function add_temperature(){
	
    }
    
    function draw_ccd_temperature(){
	
	var margin = {top: 20, right: 20, bottom: 30, left: 50},
	width = 350 - margin.left - margin.right,
	height = 200 - margin.top - margin.bottom;
	
	var x = d3.scale.linear()
	    .range([0, width]);
	
	var y = d3.scale.linear()
	    .range([height, 0]);
	
	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");
	
	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");
	
	var line = d3.svg.line()
	    .x(function(d,i) { return x(i); })
	    .y(function(d) { return y(d.ccd_temp*1.0); });
	
	temp_td.innerHTML="";
	
	var svg = d3.select(temp_td)
	    .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	x.domain(d3.extent(temp_data, function(d,i) { return i;  }));
	y.domain(d3.extent(temp_data, function(d) {
	    //console.log("CCDT = " + d.ccd_temp);
	    return d.ccd_temp*1.0; 
	}));

	// x.domain([0,300]);
	// y.domain([-30,30]);

	
	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);
	
	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	    .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("Temperature");
	
	svg.append("path")
	    .datum(temp_data)
	    .attr("class", "tline")
	    .attr("d", line);
    }
    
    dialog_button.onclick=function(){
	var d= xd.sadira.dialogs.create_dialog({ handler : "sbig.drive"});


	d.listen("expo_progress", function(dgram){
	    //console.log("EXPO Head" + JSON.stringify(dgram.header));
	    p_expo.value=dgram.header.value*1.0;
	});

	d.listen("grab_progress", function(dgram){
	    //console.log("GRAB Head" + JSON.stringify(dgram.header));
	    p_read.value=dgram.header.value*1.0;
	});


	var iv;


	d.listen("cooling_info", function(dgram){
	    var temp_info = dgram.header.cooling_info;
	    temp_data.push(temp_info);
	    if(temp_data.length>temp_max_points)
		temp_data.splice(0,1);

	    td_cooling_info.innerHTML="<pre>"+JSON.stringify(temp_info,null,3)+"</pre>";
	    //console.log("Cooling info " + JSON.stringify(temp_info));
	    draw_ccd_temperature();
	});
	
	
	d.listen("cam_status", function(dgram){
	    var m=dgram.header.status;
	    
	    camera_status.innerHTML+=JSON.stringify(m)+"<br/>";
	    camera_status.scrollTop = camera_status.scrollHeight;

	    if(m.ready) {
		
		start_expo.onclick=function(){
		    d.send_datagram({ type : "start_expo", exptime : exptime.value, nexpo : nexpo.value },null,function(error){} );
		}
		
		iv=setInterval(function(){

		    d.send_datagram({ type : "get_cooling_info"},null,function(error){} );
		    
		    //console.log("NS= "+ ns +" Cam temperature = " + JSON.stringify(cam.get_temp()));
		    //clearInterval(iv);
		    
		    
		}, 1000);
		
		set_temp_regulation.onclick=function(){
		    var enabled=temp_regulation_enable.checked*1.0;
		    var setpoint=temp_setpoint.value; 
		    
		    console.log("Setting temp ["+enabled+"] setpoint " + setpoint);
		    
		    d.send_datagram({ type : "set_cooling", enabled : enabled, setpoint: setpoint},null,function(error){} );
		    
		}
		

	    }
	    if(m.info) {
		
	    }
	    if(m.error){
	    }
	    
	});
	
	d.lay_id=this.id;

	d.srz_request=function(dgram,  calb){
	    console.log("SRZ req called...");

	    var w=lay.width = dgram.header.width;
	    var h=lay.height =dgram.header.height;
	    
	    var sz=dgram.header.sz;
	    
	    console.log("Ready to receive "+sz +" bytes. Image ["+dgram.header.name+"] size will be : " + w + ", " + h);
	    camera_status.innerHTML+="Ready to receive "+sz +" bytes. Image ["+dgram.header.name+"] size will be : " + w + ", " + h + "<br/>";
	    
	    setup_bbig(w,h);
	    
	    // if(bbig==null){
	    
	    // 	sz=dgram.header.sz;
	    // 	w=
	    // 	h=
	    
	    // 	bbig=new ArrayBuffer(4*sz);
	    // 	fv = new Float32Array(bbig);
	    // 	for(var i=0;i<fv.length/4;i++){
	    // 	    fv[4*i]=0.0;
	    // 	    fv[4*i+1]=0.0;
	    // 	    fv[4*i+2]=0.0;
	    // 	    fv[4*i+3]=1.0;
	    // 	}
	    // }
	    
	    status.innerHTML+=dgram.header.name;

	    console.log("X");
	    var b=new ArrayBuffer(sz);
	    console.log("X");
	    var fvp = new Float32Array(b);
	    //console.log("AB: = "+ fv.length +" =? "+sz/4+" first elms : " + fv[0] + ", " + fv[1] );
	    var sr=new srz_mem(b);

	    lay.arr=fvp;
	    sr.lay_id=d.lay_id;
	    
	    console.log("X");

	    sr.on_chunk=function(dgram){
		//console.log("Fetching data chunk...");

		p_fetch.value=(Math.floor(100*( (dgram.header.cnkid*sr.chunk_size)/sr.sz_data)));

		//status.innerHTML="Fetching data for " + dgram.header.name +
	    	//" : "+(Math.floor(100*( (dgram.header.cnkid*sr.chunk_size)/sr.sz_data)))+" %";
	    }

	    console.log("XXX w,h = " + w + ", " + h);
	    
	    sr.on_done=function(){

		console.log("Fetch image done !");
		p_fetch.value=100.0;
		var lid=lay.id;
		var fv=xd.fv;
		var min=1e20,max=-1e20;
		
		var rangeLocation = gl.getUniformLocation(xd.program, "u_layer_range");
		
		xd.p_layer_range[2*lid]=lay.width/xd.w;
		xd.p_layer_range[2*lid+1]=lay.height/xd.h;
		
		gl.uniform2fv(rangeLocation, xd.p_layer_range);
		var fv=xd.fv;
		console.log("Filling texture ("+xd.w+","+xd.h+") with image ("+w +","+h+")"  );
		for(var i=0;i<h;i++){
		    for(var j=0;j<w;j++){
			var v=fvp[i*w+j]*1.0;
			fv[4*(i*xd.w+j)+lid]=1.0*v;
			if(v>max)max=v; else if(v<min)min=v;
		    }
		}

		console.log("Setting up layer data...");
		lay.ext=[min,max];
		setup_layer_data();
		
	    };

	    console.log("XXX");

	    console.log("calling cb");
	    calb(null, sr);
	    console.log("calling cb done");
	};
	

	d.connect(function(error, init_dgram){
	    if(error)
		status.innerHTML+="Init data error= " + error + " init datagram = <pre> " + JSON.stringify(init_dgram,null,4)+" </pre><br/>";
	    else{
		
		status.innerHTML+="Dialog handshake OK <br/>";
		
		
		start_stop_button.onclick=function(){
		    
		    d.send_datagram({type : "start_camera"},null,function(error){
			
			if(error){
			    camera_status.innerHTML+="ERROR"+error+" <br/>";
			    camera_status.scrollTop = camera_status.scrollHeight;
			}
		    });
		    
		}
		
	    }
	    
	    
	}); 
	
	
    };	
    
}

