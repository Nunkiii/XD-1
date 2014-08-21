XD-1. A WebGL/JavaScript FITS viewer and more.
============

This is an experimental project. 

###How does it work?
  
  
OpenGL 2.0 rendering is done in parallel for every pixel of the screen (in practice with webGL, the html <i>canvas</i> area) by programs called <i>shaders</i>, executed in the GPU by an increasingly big number of hard-silicium processing cores.

These little program's aim was originally to compute the specific colors of the pixels produced by (parts of) a given 3D scene (for examples, famous shaders to produce light and reflection (computing of normals), shadow or fire effects in 3D video games).

We would want, in theory, to use this additional processing power for whatever computing needs we want, and possibly not only for specific pixel color rendering; but the specific hardware, drivers, programming interface paradigm's lack made this impossible, until now. If you see and can manipulate the cat's eye nebula layer's colors above, then this is finally possible, even for a simple downloaded text-script on your browser. Unfortunately, now in 2014, only browsers with openGL interface capable of floating point textures will work. This will be standard soon.

###Fragment shader

The fragment shader code is a GLSL pogram responsible of the image color and geometrical computations. Optimization on memory use is done by using a single floating point rgba texture to store the data for up to 4 image layers. If more images need to be displayed, it is possible to add a new FP texture buffer that can contain four extra images. 

The four 'channels' of a pseudo-pixel element in the storage texture represent four different image layers. Geometrical transformations are computed by the algorithm using a single texture. Each of the (R,G,B,A) components can be used to store data for individual layers. This is why this rendering program handles at most four image layers.
    


###Installation 

This package depends on the sadira package https://github.com/Nunkiii/sadira. 

Download both the XD-1 and the sadira packages (download zip files or use git clone), then enter the `XD-1` directory and make symbolic links to access the sadira js resources. 

    /some/dir/XD-1$ ln -s /some/dir/sadira ./sadira
    /some/dir/XD-1$ ln -s /some/dir/sadira/www ./www/sadira

Then simply open the `xd1.html` file with a web browser to view your local FITS files. Additional features and code/gui improvements are on developpement. 

The code published here may be highly unstable, see online web demos for more "stable" versions.

* http://ross.iasfbo.inaf.it/~gloria/js9/ (oldest)
* http://ross.iasfbo.inaf.it/~gloria/xd1/  (older)
* http://sadira.iasfbo.inaf.it/~pg/XD-1/   (newest)

####Starting the sadira server (To handle experimental SBIG camera support)

The https://github.com/Nunkiii/node-sbig package must be installed for the SBIG camera interface to work. 

    /some/dir/XD-1$node sadira/sadira.js --cf sadira.conf.json 

