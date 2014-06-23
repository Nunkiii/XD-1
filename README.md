XD-1. A WebGL/JavaScript FITS viewer and more.
============

This is an experimental project. 

###Installation 

This package depends on the sadira package https://github.com/Nunkiii/sadira. 

Download both the XD-1 and the sadira packages (download zip files or use git clone), then enter the `XD-1` directory and make symbolic links to access the sadira js resources. 

    /some/dir/XD-1$ ln -s /some/dir/sadira ./sadira
    /some/dir/XD-1$ ln -s /some/dir/sadira/www ./www/sadira

Then simply open the `xd1.html` file with a web browser to view your local FITS files. Additional features and code/gui improvements are on developpement. 

The code published here may be highly unstable, see online web demos for more "stable" versions.

http://ross.iasfbo.inaf.it/~gloria/xd1/

####Starting the sadira server (To handle experimental SBIG camera support)

The https://github.com/Nunkiii/node-sbig package must be installed for the SBIG camera interface to work. 

    /some/dir/XD-1$node sadira/sadira.js --cf sadira.conf.json 

