/**
 * Created by sakri on 27-1-14.
 */
(function (window){

    //INCOMPLETE!  DOES NOT WORK AS IS!


    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;

    Sakri.MarchingSquares9Grid = {};

    //update this when working with large shapes (large bitmaps)
    //the "edge detection loop" stops at this figure. This is in place in the event that an infinite loop somehow appears (Should never happen).
    Sakri.MarchingSquares9Grid.MAX_POINTS = 10000;

    Sakri.MarchingSquares9Grid.possible9Grids = {
        "000110110":new Sakri.Geom.Point(0,1),
        "111110000":new Sakri.Geom.Point(-1,0),
        "111011011":new Sakri.Geom.Point(0,-1),
        "111111110":new Sakri.Geom.Point(0,1),
        "100111111":new Sakri.Geom.Point(1,0),
        "011011011":new Sakri.Geom.Point(0,-1),
        "011011000":new Sakri.Geom.Point(0,-1),
        "110111111":new Sakri.Geom.Point(1,0),
        "011011111":new Sakri.Geom.Point(0,-1),
        "000111111":new Sakri.Geom.Point(1,0),
        "110110100":new Sakri.Geom.Point(-1,0),
        "111111000":new Sakri.Geom.Point(-1,0),
        "111111001":new Sakri.Geom.Point(-1,0),
        "111110100":new Sakri.Geom.Point(-1,0),
        "100110110":new Sakri.Geom.Point(0,1),
        "100110111":new Sakri.Geom.Point(0,1),
        "000110111":new Sakri.Geom.Point(0,1),
        "011111111":new Sakri.Geom.Point(0,-1),
        "000011011":new Sakri.Geom.Point(1,0),
        "110110110":new Sakri.Geom.Point(0,1),
        "110110111":new Sakri.Geom.Point(0,1),
        "011011001":new Sakri.Geom.Point(0,-1),
        "111011000":new Sakri.Geom.Point(0,-1),
        "111111011":new Sakri.Geom.Point(-1,0),
        "000011111":new Sakri.Geom.Point(1,0),
        "111110110":new Sakri.Geom.Point(0,1),
        "110110000":new Sakri.Geom.Point(-1,0),
        "001011111":new Sakri.Geom.Point(1,0),
        "001111111":new Sakri.Geom.Point(1,0),
        "111011001":new Sakri.Geom.Point(0,-1),
        "001011011":new Sakri.Geom.Point(1,0),
        "111111100":new Sakri.Geom.Point(-1,0),
        "001110110":new Sakri.Geom.Point(0,1),
        "110110001":new Sakri.Geom.Point(-1,0),
        "100011011":new Sakri.Geom.Point(1,0),
        "011011100":new Sakri.Geom.Point(0,-1)
    };


    Sakri.MarchingSquares9Grid.gridScanPoints = [
        new Sakri.Geom.Point(-1,-1),
        new Sakri.Geom.Point(0,-1),
        new Sakri.Geom.Point(1,-1),
        new Sakri.Geom.Point(-1,0),
        new Sakri.Geom.Point(0,0),
        new Sakri.Geom.Point(1,0),
        new Sakri.Geom.Point(-1,1),
        new Sakri.Geom.Point(0,1),
        new Sakri.Geom.Point(1,1)
    ];

    Sakri.MarchingSquares9Grid.getBlobOutlinePoints = function(source){

        //create a copy with a one pixel blank "border" in case source image/canvas has pixels which touch the border
        var canvas = document.createElement("canvas");
        canvas.width = source.width + 2;
        canvas.height = source.height + 2;
        var context = canvas.getContext("2d");
        context.drawImage(source,1,1);

        var firstNonTransparentPoint = Sakri.BitmapUtil.getFirstNonTransparentPixelTopDown(canvas);
        var points = [];
        if(firstNonTransparentPoint==null){
            return points;
        }
        var position = firstNonTransparentPoint.clone();
        var gridString = Sakri.MarchingSquares9Grid.getGridStringFromPoint(context, position);
        points[0] = firstNonTransparentPoint;
        var next, i = 0;
        while(++i < Sakri.MarchingSquares9Grid.MAX_POINTS){
            next = Sakri.MarchingSquares9Grid.getNextEdgePoint(position, gridString);
            if(next.equals(firstNonTransparentPoint)){
                break;
            }
            points[i] = next;
            position = next;
            gridString = Sakri.MarchingSquares9Grid.getGridStringFromPoint(context, position);
        }
        if(i >= Sakri.MarchingSquares9Grid.MAX_POINTS){
            throw new Error("MarchingSquares9Grid Error : iterated over limit MAX_POINTS : "+MAX_POINTS+" apologies :( ");
        }
        //adjust the offset caused by the one pixel transparent border
        for(i=0;i<points.length;i++){
            points[i].x -= 1;
            points[i].y -= 1;
        }
        return points;
    }

    Sakri.MarchingSquares9Grid.getGridStringFromPoint = function(context, position){
        var gridString = "";
        var p, i;
        var data = context.getImageData(position.x-1, position.y-1, 3, 3).data;
        for(i=0; i<36; i+=4){
            gridString += (data[i+0] + data[i+1] + data[i+2] + data[i+3] > 0 ? "1" : "0");
        }
        return gridString;
    }

    Sakri.MarchingSquares9Grid.getNextEdgePoint = function(position, gridString){
        var p = Sakri.MarchingSquares9Grid.possible9Grids[gridString];
        if(p==null){
            throw new Error("MarchingSquares Error : gridString:"+gridString+" , not found in possible9Grids");
        }
        return new Sakri.Geom.Point(position.x+p.x, position.y+p.y);
    }


}(window));
