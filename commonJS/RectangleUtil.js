/**
 * Created by sakri on 15-1-14.
 */
//has a dependency on Sakri.MathUtil and Sakri.Geom

(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;
    Sakri.Geom = Sakri.Geom || {};

    Sakri.Geom.RectangleUtil=function (){};

    Sakri.Geom.RectangleUtil.getBiggerRectangle = function(rectA, rectB){
        return rectA.getArea() > rectB.getArea() ? rectA : rectB;
    };

    Sakri.Geom.RectangleUtil.getSmallerRectangle = function(rectA, rectB){
        return (rectA.getArea() < rectB.getArea() ? rectA : rectB);
    };

    Sakri.Geom.RectangleUtil.isBiggerThan = function(rectA, rectB){
        return rectA.getArea() > rectB.getArea();
    };

    Sakri.Geom.RectangleUtil.isBiggerThanOrEqual = function(rectA, rectB){
        return rectA.getArea() >= rectB.getArea();
    };

    Sakri.Geom.RectangleUtil.isSmallerThan = function(rectA, rectB){
        return rectA.getArea() < rectB.getArea();
    };

    Sakri.Geom.RectangleUtil.isSmallerThanOrEqual = function(rectA, rectB){
        return rectA.getArea() <= rectB.getArea();
    };

    Sakri.Geom.RectangleUtil.isEqual = function(rectA, rectB){
        return Sakri.Geom.RectangleUtil.hasEqualPosition(rectA,rectB) && Sakri.Geom.RectangleUtil.hasEqualSides(rectA,rectB);
    };

    Sakri.Geom.RectangleUtil.hasEqualPosition = function(rectA, rectB){
        return rectA.x==rectB.x && rectA.y==rectB.y;
    };

    Sakri.Geom.RectangleUtil.hasEqualSides = function(rectA, rectB){
        return rectA.width==rectB.width && rectA.height==rectB.height;
    };

    Sakri.Geom.RectangleUtil.hasEqualArea = function(rectA,rectB){
        return rectA.getArea() == rectB.getArea();
    };

    Sakri.Geom.RectangleUtil.getCenterX = function(rect){
        return rect.x+rect.width/2;
    };

    Sakri.Geom.RectangleUtil.getCenterY=function(rect){
        return rect.y+rect.height/2;
    };

    Sakri.Geom.RectangleUtil.createRandomXIn = function(rect){
        return Sakri.MathUtil.getRandomNumberInRange(rect.x, rect.getRight());
    };

    Sakri.Geom.RectangleUtil.createRandomYIn = function(rect){
        return SakriMathUtil.getRandomNumberInRange(rect.y,rect.getBottom());
    };

    Sakri.Geom.RectangleUtil.createRandomPointInRect = function(rect){
        return new Sakri.Geom.Point(Sakri.Geom.RectangleUtil.createRandomXIn(rect), Sakri.Geom.RectangleUtil.createRandomXIn(rect));
    };

    Sakri.Geom.RectangleUtil.rectanglesIntersect = function(rectA, rectB){
        return  rectA.containsPoint(rectB.x, rectB.y) ||
            rectA.containsPoint(rectB.getRight(), rectB.y) ||
            rectA.containsPoint(rectB.getRight(), rectB.getBottom()) ||
            rectA.containsPoint(rectB.x, rectB.getBottom());
    };

    Sakri.Geom.RectangleUtil.getIntersectingRectangle = function(rectA, rectB){
        //console.log("Sakri.Geom.RectangleUtil.getIntersectingRectangle()", rectA.toString(), rectB.toString());
        if(!Sakri.Geom.RectangleUtil.rectanglesIntersect(rectA,rectB)){
            console.log("\tno intersection found");
            return null;
        }
        if(rectA.containsRect(rectB)){
            return rectB;
        }
        if(rectB.containsRect(rectA)){
            return rectA;
        }

        var x1 = Math.max(rectA.x, rectB.x),
            y1 = Math.max(rectA.y, rectB.y),
            x2 = Math.min(rectA.getRight(), rectB.getRight()),
            y2 = Math.min(rectA.getBottom(), rectB.getBottom());
        return new Sakri.Geom.Rectangle(x1, y1, x2 - x1, y2 - y1);
    };

    Sakri.Geom.RectangleUtil.createRandomRectangleIn = function(rect){
        var w = Math.random()*rect.width;
        var h = Math.random()*rect.height;
        var x = Math.random()*(rect.width-w);
        var y = Math.random()*(rect.height-h);
        return new Sakri.Geom.Rectangle(rect.x+x,rect.y+y,w,h);
    };

    Sakri.Geom.RectangleUtil.createRandomIntegerRectangleIn = function(rect){
        var randomRect = Sakri.Geom.RectangleUtil.createRandomRectangleIn(rect);
        randomRect.round();
        return randomRect;
    };

    Sakri.Geom.RectangleUtil.horizontalAlignLeft = function(staticRect,rectToAlign){
        rectToAlign.x = staticRect.x;
    };

    Sakri.Geom.RectangleUtil.horizontalAlignMiddle = function(staticRect, rectToAlign){
        rectToAlign.x = Sakri.Geom.RectangleUtil.getCenterX(staticRect) - rectToAlign.width/2;
    };

    Sakri.Geom.RectangleUtil.horizontalAlignRight = function(staticRect,rectToAlign){
        rectToAlign.x = staticRect.getRight() - rectToAlign.width;
    };

    Sakri.Geom.RectangleUtil.verticalAlignTop = function(staticRect, rectToAlign){
        rectToAlign.y = staticRect.y;
    };

    Sakri.Geom.RectangleUtil.verticalAlignMiddle = function(staticRect, rectToAlign){
        rectToAlign.y = Sakri.Geom.RectangleUtil.getCenterY(staticRect) - rectToAlign.height/2;
    };

    Sakri.Geom.RectangleUtil.verticalAlignBottom = function(staticRect, rectToAlign){
        rectToAlign.y = staticRect.getBottom() - rectToAlign.height;
    };

    Sakri.Geom.RectangleUtil.scaleRectToPortraitFit = function(staticRect, rectToScale){
        Sakri.Geom.RectangleUtil.scaleRectToHeight(rectToScale, staticRect.height);
    };

    Sakri.Geom.RectangleUtil.scaleRectToLandscapeFit = function(staticRect, rectToScale){
        Sakri.Geom.RectangleUtil.scaleRectToWidth(rectToScale, staticRect.width);
    };

    Sakri.Geom.RectangleUtil.scaleRectToHeight = function(rect, height){
        rect.width *= (height/rect.height);
        rect.height = height;
    };

    Sakri.Geom.RectangleUtil.scaleRectToWidth = function(rect, width){
        rect.height *= (width/rect.width);
        rect.width = width;
    };

    Sakri.Geom.RectangleUtil.scaleRectToBestFit = function(staticRect, rectToScale){
        var copy = rectToScale.clone();
        Sakri.Geom.RectangleUtil.scaleRectToPortraitFit(staticRect, copy);
        if(copy.width > staticRect.width){
            Sakri.Geom.RectangleUtil.scaleRectToLandscapeFit(staticRect, rectToScale);
        }else{
            rectToScale.updateToRect(copy);
        }
    };

    Sakri.Geom.RectangleUtil.scaleRectInto = function(staticRect,rectToScale){
        Sakri.Geom.RectangleUtil.scaleRectToBestFit(staticRect,rectToScale);
        Sakri.Geom.RectangleUtil.verticalAlignMiddle(staticRect,rectToScale);
        Sakri.Geom.RectangleUtil.horizontalAlignMiddle(staticRect,rectToScale);
    };

}(window));