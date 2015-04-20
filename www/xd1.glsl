/*

  This is the fragment shader code where all the color/geometry computations are done. Optimization on memory use is done by using a single floating point rgba texture to reprensent all the data. The four 'channels' of a pixel element represent four different image layers. Geometry transformations are computed by the algorithm using a single texture. Each of the (R,G,B,A) components can be used to store data for individual layers. This is why this rendering program handles at most four image layers.
  
*/

precision mediump float; //can change to higher precision here

uniform float u_zoom;  //the passed zoom value from the html ui
uniform float u_angle; //the passed rotation value from the html ui
uniform vec2 u_tr; //Translations (x,y) vector[2] from the html ui
uniform vec2 u_rotc;
uniform ivec4 u_layer_enabled; //Layer compute switch
uniform ivec4 u_switches; // 0 = Colormap interpolate switch, 1-> nothing
//uniform vec4 u_test[2];
uniform vec2 u_layer_range[4]; //The actual (x,y) fraction of the big texture this layer occupies
uniform vec4 u_pvals[8]; //Geometrical parameters for all layers (see other comments in JS code for description)
uniform vec2 u_rotcenters[4]; //Center of rotation for each layer in its own pixel frame

uniform ivec4 u_ncolors; //Number of colours (colormap size) for the 4 layers

uniform sampler2D u_image; //The float big texture containing the pixel values for the 4 layers stored in the (r,g,b,a) components.
uniform sampler2D u_cmap_fracs; //Float texture containing the positions of the colours on the colormap € [0,1] for each layer
uniform sampler2D u_cmap_colors;//Float texture containing 4 colour vectors rows representing the colormaps for each layer.
uniform vec2 u_resolution; //The actual size of the big texture (dimensions = powers of 2)
uniform vec2 u_screen; //The size of the GL canvas in pixels




//This subroutine was needed to avoid too deep "if" constructions not supported by some gpu drivers.

void get_color(in float c, in float lpos, in float upv, in int nc, inout vec4 cmap_col){

  //Computing this layer's contribution to the pixel color using the colormap data stored in two float textures.

  if(u_switches[0]==0){
    for(int i=0;i<256;i++){ 
      if(i==nc) break;
      if(texture2D(u_cmap_fracs, vec2((float(i)+.5)/256.0, lpos)).r > c){
	cmap_col+=texture2D(u_cmap_colors, vec2((float(i-1)+.5)/256.0, lpos))*upv; 
	break;
      } 
    }//end for (colours)
    return;
  }
  //Colormap has (now) a maximum of 256 colors.
    float frl=0.0,dc,frr; vec4 rc; vec4 lc; 
  for(int i=0;i<256;i++){ 

      if(i==nc) break;
      
      frr = texture2D(u_cmap_fracs, vec2((float(i)+.5)/256.0, lpos)).r; //Fractional positions of the colours inside the colormap.
      rc = texture2D(u_cmap_colors, vec2((float(i)+.5)/256.0, lpos)); //The actual colormap colors.

      if(frr>c){
	  dc=frr-frl;
	  rc=(c-frl)/dc*rc;
	  lc=(frr-c)/dc*lc;
	  //cmap_col+=(lc+rc)*u_pvals[2*l+1][2];
	  cmap_col+=(lc+rc)*upv;
	  break;
      } 
      frl=frr; lc=rc; 
    }//end for (colours)
}

void main() { //Beginning of shader program called to retrieve the colour of each screen pixel.
  
  vec4 cmap_col=vec4(0.0,0.0,0.0,1.0); //This is the final colour for this pixel, we set it initially to opaque black.
  mat2 rmg =mat2(cos(u_angle),sin(u_angle),-sin(u_angle),cos(u_angle)),rm;//Set up the global view rotation matrix
  float lpos,lzoom,alpha,c,lumi;
  vec2 trl,p;
  //gl_FragColor = vec4(1.0,0.0,1.0,1.0); //setting final fragment color

  //  return;

  for(int l=0; l<4; l++){ //Loop on the 4 layers (the rgba components of the 'big' data texture)
    
    if(u_layer_enabled[l]!=1)continue;//Continue loop on layers if this layer is not enabled ...
    
    //Computing this layer's pixel corresponding to the position of the screen pixel.
    
    lpos=(float(l)+.5)/4.0;
    lzoom=u_pvals[2*l+1][0]; //This layer's zoom level
    alpha=u_pvals[2*l+1][1];//this layer's angle
    trl=vec2(u_pvals[2*l][2],u_pvals[2*l][3]);//this layer's translation (x,y) vector
    rm =mat2(cos(alpha),sin(alpha),-sin(alpha),cos(alpha));//this layer's rotation matrix

    //Applying geometrical transformations

    p =rmg*((gl_FragCoord.xy-u_screen/2.0)/u_zoom+u_tr-u_rotc)+u_rotc;
    p = p/lzoom+trl-u_rotcenters[l];
    p = (rm*p+u_rotcenters[l])/u_resolution+u_layer_range[l]/2.0;

    //The point is outside the image?
    if(p[0]<0.0 || p[0]>=u_layer_range[l][0] || p[1]<0.0 || p[1]>=u_layer_range[l][1]) continue; 
    
    //This is the actual pixel intensity for this layer's pixel.
    c=(texture2D(u_image, p)[l]-u_pvals[2*l][0])/(u_pvals[2*l][1]-u_pvals[2*l][0]);
    lumi=u_pvals[2*l+1][2];
    //Value lower than low cut value ?
    if(c<=0.0){cmap_col+=lumi*texture2D(u_cmap_colors, vec2(0.5/256.0, lpos)); continue;} 
    //Value higher than high cut value ?
    if(c>=1.0){cmap_col+=lumi*texture2D(u_cmap_colors, vec2( (float(u_ncolors[l])-.5)/256.0, lpos));continue;} 
    //Computing color from colormap if value lies in the ]0,1[ range.

    if(u_switches[0]==0)
      cmap_col+=texture2D(u_cmap_colors, vec2(c, lpos))*lumi; //The actual colormap colors.
    else
      get_color(c,lpos,lumi, u_ncolors[l], cmap_col);


  }//end for (layers)
  //cmap_col[3]=1.0;
  for(int i=0;i<4;i++)if( cmap_col[i]>1.0)cmap_col[i]=1.0; //if the color is too bright, set to max.
  gl_FragColor = cmap_col; //setting final fragment color
} //end main



    /*    //Long explicit version:

    vec2 screen_center = u_screen/2.0; //Screen center
    vec2 image_tex_center = u_layer_range[l]/2.0; //The center of this layer image within the "whole" texture.

    vec2 p =(gl_FragCoord.xy-screen_center);
    
    p = p/u_zoom+u_tr-u_rotc;
    p = rmg*p+u_rotc;
    p = p/lzoom+trl-u_rotcenters[l];
    p = rm*p+u_rotcenters[l];
    p = p/u_resolution+image_tex_center;
    */

    /*
    vec4 pix=gl_FragCoord;
    
    p =rmg*((gl_FragCoord.xy-u_screen/2.0)/u_zoom+u_tr-u_rotc)+u_rotc;
    p = p/lzoom+trl-u_rotcenters[l];
    p = (rm*p+u_rotcenters[l])/u_resolution+u_layer_range[l]/2.0;

    //The point is outside the image?
    if(p[0]<0.0 || p[0]>=u_layer_range[l][0] || p[1]<0.0 || p[1]>=u_layer_range[l][1]) continue; 

    //This is the actual pixel intensity for this layer's pixel.
    float c=(texture2D(u_image, p)[l]-u_pvals[2*l][0])/(u_pvals[2*l][1]-u_pvals[2*l][0]);


    vec2 cornp[4]; 
    vec2 pxs=1.0/u_resolution;///lzoom/u_zoom;
    vec2 px=pxs;    
    vec2 py=pxs; 
    px[1]=0.0; 
    py[0]=0.0;

    cornp[0]=vec2(p-px);
    cornp[1]=vec2(p+px);
    cornp[2]=vec2(p-py);
    cornp[3]=vec2(p+py);

    vec4 corn;
    for(int i=0;i<4;i++){
      //cornp[i]=abs(cornp[i]);
      corn[i]=(texture2D(u_image, cornp[i])[l]-u_pvals[2*l][0])/(u_pvals[2*l][1]-u_pvals[2*l][0]);
      
    }
    
    //Value lower than low cut value ?
    //if(c<=0.0){cmap_col+=u_pvals[2*l+1][2]*texture2D(u_cmap_colors, vec2(0.5/256.0, lpos)); continue;} 
    //Value higher than high cut value ?
    //if(c>=1.0){cmap_col+=u_pvals[2*l+1][2]*texture2D(u_cmap_colors, vec2( (float(u_ncolors[l])-.5)/256.0, lpos));continue;} 

    //get_color(c,l,lpos,u_pvals[2*l+1][2], u_ncolors[l], cmap_col);

    vec4 corncol[4];
    float ltot; 
    float d[4],v;
    ltot=0.0;
    for(int i=0;i<4;i++){
      //      corncol[i]=vec4(0.0,0.0,0.0,1.0);
      //Value lower than low cut value ?
      //      if(corn[i]<=0.0){corncol[i]=u_pvals[2*l+1][2]*texture2D(u_cmap_colors, vec2(0.5/256.0, lpos)); continue;} 
      //Value higher than high cut value ?
      //      if(corn[i]>=1.0){corncol[i]=u_pvals[2*l+1][2]*texture2D(u_cmap_colors, vec2( (float(u_ncolors[l])-.5)/256.0, lpos));continue;} 
      //get_color(corn[i],l,lpos,u_pvals[2*l+1][2], u_ncolors[l], corncol[i]);
      cornp[i]=cornp[i]-p; 
      d[i]=length(cornp[i]);
      ltot+=d[i];
    }
    v=0.0;
    for(int i=0;i<4;i++){
      v+=d[i]/ltot*corn[i];
      //      cmap_col+=d[i]*corncol[i];
    }

    get_color(v,l,lpos,u_pvals[2*l+1][2], u_ncolors[l], cmap_col);
    */
