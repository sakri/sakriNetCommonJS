/**
 * Created by @sakri on 28-1-14.
 *
 * Somewhat Naive implementation in that there are cases where the edge detection gets stuck in an eternal loop.
 * This is currently "handled" by a MAX_POINTS variable.
 * This implementation is "good enough" for most use cases though.
 *
 */
(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;

    Sakri.MarchingSquares = {};

    //Update this when working with large shapes (large bitmaps)
    //the "edge detection loop" stops at this figure. This is in place in the event that an infinite loop somehow appears (Should never happen).
    Sakri.MarchingSquares.MAX_POINTS = 10000;

    //This is a lookup table of all possible 4 pixel grids, used to decide "scanning positions" during the edge detection process
    //Zeros represent transparent pixels, Ones represent a non transparent pixel
    Sakri.MarchingSquares.possibleGrids = {
        "0011":new Sakri.Geom.Point(1,0),
        "1011":new Sakri.Geom.Point(1,0),
        "0001":new Sakri.Geom.Point(1,0),
        "1001":new Sakri.Geom.Point(1,0),

        "0100":new Sakri.Geom.Point(0,-1),
        "0101":new Sakri.Geom.Point(0,-1),
        "0111":new Sakri.Geom.Point(0,-1),
        "0110":new Sakri.Geom.Point(0,-1),

        "1100":new Sakri.Geom.Point(-1,0),
        "1000":new Sakri.Geom.Point(-1,0),
        "1101":new Sakri.Geom.Point(-1,0),



        "1110":new Sakri.Geom.Point(0,1),
        "1010":new Sakri.Geom.Point(0,1),
        "0010":new Sakri.Geom.Point(0,1)

    };


    /**
     * Apparently there were (are?) cases where duplicate points are registered along horizontal or vertical sets
     * of adjacent points.  I haven't been able to reproduce this, but have left this option in place for now.
     */
    Sakri.MarchingSquares.getUniquePoints = function(points){
        console.log("MarchingSquares.getUniquePoints() points.length : ",points.length);
        var unique = {};
        var uniquePoints = [];
        var pointString, p, i;
        for(i=0; i < points.length; i++){
            p = points[i];
            pointString = p.x+":"+p.y;
            if(unique[pointString] == null){
                unique[pointString] = true;
                uniquePoints.push(p);
            }
        }
        console.log("MarchingSquares.getUniquePoints() uniquePoints.length : ",uniquePoints.length);
        return uniquePoints;
    };

    //source can be a Canvas or an img element. See comment above getUniquePoints concerning the checkUnique flag
    Sakri.MarchingSquares.getBlobOutlinePoints = function(source, checkUnique){
        //Create a copy with a one pixel blank "border" in case source image/canvas has pixels which touch the border
        //The edge scan operates with an offset of -1,-1 meaning the returned points are accurate
        var canvas = document.createElement("canvas");
        canvas.width = source.width + 2;
        canvas.height = source.height + 2;
        var context = canvas.getContext("2d");
        context.drawImage(source,1,1);

        if(checkUnique){
            return Sakri.MarchingSquares.getUniquePoints(Sakri.MarchingSquares.scanOutlinePoints(canvas));
        }else{
            return Sakri.MarchingSquares.scanOutlinePoints(canvas);
        }
     };

    //this should be private, should not be called directly
    Sakri.MarchingSquares.scanOutlinePoints = function(canvas){
        var points = [];
        points[0] = Sakri.BitmapUtil.getFirstNonTransparentPixelTopDown(canvas);
        if(points[0] == null){
            return points;
        }
        points[0].add(-1, -1);//in order for the lookup to work, we move the position up and back one
        var context = canvas.getContext("2d");
        var currentPosition = points[0];
        var gridString = Sakri.MarchingSquares.getGridStringFromPoint(context, currentPosition);
        var next, i;
        for(i=1; i<Sakri.MarchingSquares.MAX_POINTS; i++){
            next = Sakri.MarchingSquares.getNextEdgePoint(currentPosition, gridString);
            if(next.equals(points[0])){
                break;
            }
            points[i] = next;
            currentPosition = next;
            gridString = Sakri.MarchingSquares.getGridStringFromPoint(context, currentPosition);
        }
        //Failsafe when the marching squares get stuck in an eternal loop. See note at the top.
        if(i >= Sakri.MarchingSquares.MAX_POINTS){
            console.log("MarchingSquares.scanOutlinePoints Sakri.MarchingSquares.MAX_POINTS reached");
            return [];
        }
        return points;
    };

    Sakri.MarchingSquares.getGridStringFromPoint = function(context, point){
        var gridString = "";
        var data = context.getImageData(point.x, point.y, 2, 2).data;
        for(i=0; i<16; i+=4){
            gridString += (data[i+0] + data[i+1] + data[i+2] + data[i+3] > 0 ? "1" : "0");
        }
        return gridString;
    };

    Sakri.MarchingSquares.getNextEdgePoint = function(point, gridString){
        var offsetPoint = Sakri.MarchingSquares.possibleGrids[gridString];
        if(point==null){
            throw new Error("MarchingSquares Error : gridString:"+gridString+" , not found in possibleGrids");
        }
        return new Sakri.Geom.Point(point.x + offsetPoint.x, point.y + offsetPoint.y);
    };

}(window));