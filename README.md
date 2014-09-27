XD-1. A WebGL/JavaScript FITS viewer
============

You need a combination of device/browser that supports webgl : works on most pc/mac with recent version of chrome/firefox and on few mobile devices ( i*mac things don't handle webgl ). IE is not tested at all.

####Demos

The current version (unstable) 

* http://sadira.iasfbo.inaf.it/XD-1/  

Older demos are here :

* http://ross.iasfbo.inaf.it/~gloria/js9/ 
* http://ross.iasfbo.inaf.it/~gloria/xd1/  
* http://sadira.iasfbo.inaf.it/XD-1-0914/   


#####Installation 

This package depends on the sadira package https://github.com/Nunkiii/sadira. 

Download both the XD-1 and the sadira packages (download zip files or use git clone), then enter the `XD-1` directory and make symbolic links to access the sadira js resources. 

    /some/dir/XD-1$ ln -s /some/dir/sadira ./sadira
    /some/dir/XD-1$ ln -s /some/dir/sadira/www ./www/sadira

Then simply open the /some/dir/XD-1/www/index.html page with a browser. 

####SBIG camera frontend

The https://github.com/Nunkiii/node-sbig package must be installed for the SBIG camera interface to work. You also need node.js to handle the camera and communicate with the web interface. 

    /some/dir/XD-1$node sadira/sadira.js --cf sadira.conf.json 

###How does it work?
  
OpenGL 2.0 rendering is done in parallel for every pixel of the screen (in practice with webgl, the html <i>canvas</i> area) by programs called <i>shaders</i>, executed in the GPU by an increasingly big number of hard-silicium processing cores.

These little program's aim was originally to compute the specific colors of the pixels produced by (parts of) a given 3D scene (for examples, famous shaders to produce light and reflection (computing of normals), shadow or fire effects in 3D video games).

We would want, in theory, to use this additional processing power for whatever computing needs we want, and possibly not only for specific pixel color rendering; but the specific hardware, drivers, programming interface paradigm's lack made this impossible, until now. If you see and can manipulate the cat's eye nebula layer's colors above, then this is finally possible, even for a simple downloaded text-script on your browser. Unfortunately, now in 2014, only browsers with opengl interface capable of floating point textures will work. This will be standard soon.

###Fragment shader

https://github.com/Nunkiii/XD-1/blob/master/www/xd1.glsl

The fragment shader code is a glsl (gl shading language) pogram responsible of the image color and, on this special case, also for geometrical computations (there are only two triangles all the time taking all the screen). Optimization on memory use is done by using a single floating point rgba texture to store the data for up to 4 image layers. If more images need to be displayed, it is possible to add a new FP texture buffer that can contain four extra images and so on (to do). 

The four 'channels' of a pseudo-pixel element in the storage texture represent four different image layers. Geometrical transformations are computed by the algorithm using a single texture. Each of the (R,G,B,A) components can be used to store data for individual layers. This is why this rendering program handles at most four image layers.
