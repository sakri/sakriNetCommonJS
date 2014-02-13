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
        for(y = canvas.height - 1; y>-1; y--){
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
        var context = canvas.getContext("2d");
        var x, i, colData;
        for(x = 0; x < canvas.width; x++){
            colData = context.getImageData(x, 0, 1, canvas.height).data;
            for(i=0; i<colData.length; i+=4){
                if(colData[i+0] + colData[i+1] + colData[i+2] + colData[i+3] > 0){
                    return new Sakri.Geom.Point(x, i/4);
                }
            }
        }
        return null;
    };

    Sakri.BitmapUtil.getFirstNonTransparentPixelRightToLeft = function(canvas){
        var context = canvas.getContext("2d");
        var x, i, colData;
        for(x = canvas.width-1; x >-1; x--){
            colData = context.getImageData(x, 0, 1, canvas.height).data;
            for(i=0; i<colData.length; i+=4){
                if(colData[i+0] + colData[i+1] + colData[i+2] + colData[i+3] > 0){
                    return new Sakri.Geom.Point(x, i/4);
                }
            }
        }
        return null;
    };

    //cuts out rows and columns of pixels without color data from the top, bottom, left and right
    Sakri.BitmapUtil.trimImage = function(image){
        var trimCanvas = Sakri.BitmapUtil.createTrimmedCanvas(image);
        image.src = trimCanvas.toDataURL();
    };

    Sakri.BitmapUtil.trimCanvas = function(canvas){
        console.log("trimCanvas()", canvas.width, canvas.height);
        var trimCanvas = Sakri.BitmapUtil.createTrimmedCanvas(canvas);
        canvas.width = trimCanvas.width;
        canvas.height = trimCanvas.height;
        console.log("\t=>" , canvas.width, canvas.height);
        var context = canvas.getContext("2d");
        context.drawImage(trimCanvas, 0, 0);
    };

    Sakri.BitmapUtil.getCanvasTrimRectangle = function(canvas){
        var rect = new Sakri.Geom.Rectangle();
        rect.x = Sakri.BitmapUtil.getFirstNonTransparentPixelLeftToRight(canvas).x;
        rect.y = Sakri.BitmapUtil.getFirstNonTransparentPixelTopDown(canvas).y;
        rect.width = Sakri.BitmapUtil.getFirstNonTransparentPixelRightToLeft(canvas).x -  rect.x + 1;
        rect.height = Sakri.BitmapUtil.getFirstNonTransparentPixelBottomUp(canvas).y - rect.y + 1;
        return rect;
    }

    Sakri.BitmapUtil.createTrimmedCanvas = function(imageOrCanvas){
        var trimCanvas = document.createElement("canvas");
        var trimContext = trimCanvas.getContext("2d");
        trimCanvas.width = imageOrCanvas.width;
        trimCanvas.height = imageOrCanvas.height;
        trimContext.drawImage(imageOrCanvas, 0, 0);
        var rect = Sakri.BitmapUtil.getCanvasTrimRectangle(trimCanvas);
        //console.log("createTrimmedCanvas() ", rect.toString());
        trimCanvas.width = rect.width;
        trimCanvas.height = rect.height;
        trimContext = trimCanvas.getContext("2d");
        trimContext.drawImage(imageOrCanvas, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
        return trimCanvas;
    };

    //capture rect is the content on canvas to be reflected, border defines the space between the original content and the reflection
    //captureRect must contain the properties x, y, width, height
    //For more interesting results add a gradient on top of the reflection
    Sakri.BitmapUtil.renderReflection = function(canvas, captureRect, border){
        if(!border){
            border = 5;
        }
        var context = canvas.getContext("2d");
        context.save();
        //move and flip vertically
        context.translate(captureRect.x, captureRect.y + captureRect.height*2 + border);
        context.scale(1, -1);

        context.drawImage(	canvas, captureRect.x, captureRect.y, captureRect.width, captureRect.height,
            0, 0, captureRect.width, captureRect.height);//img,sx,sy,swidth,sheight,x,y,width,height

        context.restore();

    };

}(window));
