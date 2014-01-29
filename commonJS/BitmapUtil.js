/**
 * Created by sakri on 27-1-14.
 */
(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;

    Sakri.BitmapUtil = {};

    //TODO : rename "canvas" to "source", if it's an img, create a canvas and draw the img into it
    Sakri.BitmapUtil.getFirstNonTransparentPixelTopDown = function(canvas){
        var context = canvas.getContext("2d");
        var y, i, rowData;
        for(y=0; y<canvas.height; y++){
            rowData = context.getImageData(0, y, canvas.width, 1).data;
            for(i=0; i<rowData.length; i+=4){
                if(rowData[i+0] + rowData[i+1] + rowData[i+2] + rowData[i+3] > 0){
                    return new Sakri.Geom.Point(i/4, y);
                }
            }
        }
        return null;
    };

    Sakri.BitmapUtil.getFirstNonTransparentPixelBottomUp = function(canvas){
        var context = canvas.getContext("2d");
        var y, i, rowData;
        for(y=canvas.height-1; y>-1; y--){
            rowData = context.getImageData(0, y, canvas.width, 1).data;
            for(i=0; i<rowData.length; i+=4){
                if(rowData[i+0] + rowData[i+1] + rowData[i+2] + rowData[i+3] > 0){
                    return new Sakri.Geom.Point(i/4, y);
                }
            }
        }
        return null;
    };

    Sakri.BitmapUtil.getFirstNonTransparentPixelLeftToRight = function(canvas){
        //not implemented yet
        //returns a point
    };

    Sakri.BitmapUtil.getFirstNonTransparentPixelRightToLeft = function(canvas){
        //not implemented yet
        //returns a point
    };






}(window));
