/*

  This is the fragment shader code where all the color/geometry computations are done. Optimization on memory use is done by using a single floating point rgba texture to reprensent all the data. The four 'channels' of a pixel element represent four different image layers. Geometry transformations are computed by the algorithm using a single texture. Each of the (R,G,B,A) components can be used to store data for individual layers. This is why this rendering program handles at most four image layers.
  
*/

    precision mediump float; //can change to higher precision here

    uniform float u_zoom;  //the passed zoom value from the html ui
    uniform float u_angle; //the passed rotation value from the html ui
    uniform vec2 u_tr; //Translations (x,y) vector[2] from the html ui
    uniform vec2 u_rotc;
    uniform ivec4 u_layer_enabled; //4 layers
    uniform vec4 u_test[2];
    uniform vec2 u_layer_range[4]; //The actual (x,y) fraction of the big texture this layer occupies
    uniform vec4 u_pvals[8]; //Geometrical parameters for all layers (see other comments in JS code for description)
    uniform vec2 u_rotcenters[4]; //Center of rotation for each layer in its own pixel frame

    uniform ivec4 u_ncolors; //Number of colours (colormap size) for the 4 layers

    uniform sampler2D u_image; //The float big texture containing the pixel values for the 4 layers stored in the (r,g,b,a) components.
    uniform sampler2D u_cmap_fracs; //Float texture containing the positions of the colours on the colormap € [0,1] for each layer
    uniform sampler2D u_cmap_colors;//Float texture containing 4 colour vectors rows representing the colormaps for each layer.
    uniform vec2 u_resolution; //The actual size of the big texture (dimensions = powers of 2)
    uniform vec2 u_screen; //The size of the GL canvas in pixels

    void main() { //Beginning of program

      vec4 cmap_col=vec4(0.0,0.0,0.0,1.0); //This is the final colour for this pixel, we set it initially to opaque black.
      mat2 rmg =mat2(cos(u_angle),sin(u_angle),-sin(u_angle),cos(u_angle));//Set up the global view rotation matrix

      for(int l=0; l<4; l++){ //Loop on the 4 layers (the rgba components of the 'big' data texture)

        if(u_layer_enabled[l]!=1)continue;//Continue loop on layers if this layer is not enabled ...

	//Computing this layer's pixel corresponding to the position of the screen pixel.
	
        float lpos=(float(l)+.5)/4.0;
        float alpha=u_pvals[2*l+1][1];//this layer's angle
        mat2 rm =mat2(cos(alpha),sin(alpha),-sin(alpha),cos(alpha));//this layer's rotation matrix
        vec2 trl=vec2(u_pvals[2*l][2],u_pvals[2*l][3]);//this layer's translation (x,y) vector
        float lzoom=u_pvals[2*l+1][0]; //This layer's zoom level
        vec2 screen_center = u_screen/2.0; //Screen center
        vec2 image_tex_center = u_layer_range[l]/2.0; //The center of this layer image within the "whole" texture.

        vec2 p =(gl_FragCoord.xy-screen_center);
	
	p = p/u_zoom+u_tr-u_rotc;
	p = rmg*p+u_rotc;
	p = p/lzoom+trl-u_rotcenters[l];
	p = rm*p+u_rotcenters[l];
	p = p/u_resolution+image_tex_center;
	
	//The point is outside the image?
	if(p[0]<0.0 || p[0]>=u_layer_range[l][0] || p[1]<0.0 || p[1]>=u_layer_range[l][1]) continue; 

	//This is the actual pixel intensity for this layer's pixel.
	float c=(texture2D(u_image, p)[l]-u_pvals[2*l][0])/(u_pvals[2*l][1]-u_pvals[2*l][0]);
        
	//Value lower than low cut value ?
	if(c<=0.0){cmap_col+=u_pvals[2*l+1][2]*texture2D(u_cmap_colors, vec2(0.5/128.0, lpos)); continue;} 
	//Value higher than high cut value ?
	if(c>=1.0){cmap_col+=u_pvals[2*l+1][2]*texture2D(u_cmap_colors, vec2( (float(u_ncolors[l])-.5)/128.0, lpos));continue;} 

	//Computing this layer's contribution to the pixel color using the colormap data stored in two float textures.
        float frl=0.0,frr; vec4 rc; vec4 lc;
	
        for(int i=0;i< 128 ;i++){ 
              if(i==u_ncolors[l]){ break;}
              frr = texture2D(u_cmap_fracs, vec2((float(i)+.5)/128.0, lpos)).r; //Fractional positions of the colours inside the colormap.
              rc = texture2D(u_cmap_colors, vec2((float(i)+.5)/128.0, lpos)); //The actual colormap colors.
              if(frr>c){
                float dc=frr-frl;
                rc=(c-frl)/dc*rc;
                lc=(frr-c)/dc*lc;
                cmap_col+=(lc+rc)*u_pvals[2*l+1][2];
                break;
              } frl=frr; lc=rc; 
        }//end for
     }//end for
     cmap_col[3]=.5;
     for(int i=0;i<3;i++)if( cmap_col[i]>1.0)cmap_col[i]=1.0; //if the color is too bright, set to max.
     gl_FragColor = cmap_col; //setting final fragment color
   } //end main
