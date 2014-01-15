//has a dependency on Sakri.MathUtil

(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;

	Sakri.Geom = {};

    //==================================================
    //=====================::POINT::====================
    //==================================================

    Sakri.Geom.Point = function (x,y){
        this.x = isNaN(x) ? 0 : x;
        this.y = isNaN(y) ? 0 : y;
    };

    Sakri.Geom.Point.prototype.clone = function(){
        return new Sakri.Geom.Point(this.x,this.y);
    };

    Sakri.Geom.Point.prototype.equals = function(point){
        return this.x==point.x && this.y==point.y;
    };

    Sakri.Geom.Point.prototype.toString = function(){
        return "{x:"+this.x+" , y:"+this.y+"}";
    };

    Sakri.Geom.distanceBetweenTwoPoints = function( point1, point2 ){
        //console.log("Math.pow(point2.x - point1.x,2) : ",Math.pow(point2.x - point1.x,2));
        return Math.sqrt( Math.pow(point2.x - point1.x,2) + Math.pow(point2.y - point1.y,2) );
    };

    Sakri.Geom.angleBetweenTwoPoints = function(p1,p2){
        return Math.atan2(p1.y-p2.y, p1.x-p2.x);
    };

    Sakri.Geom.mirrorPointInRectangle = function(point,rect){
        return new Sakri.Geom.Point(rect.width-point.x,rect.height-point.y);
    };

    Sakri.Geom.randomizePoint = function(point,randomValue){
        return new Sakri.Geom.Point(-randomValue+Math.random()*randomValue+point.x,-randomValue+Math.random()*randomValue+point.y);
    };


    //==================================================
    //=====================::TRIANGLE::====================
    //==================================================

    Sakri.Geom.Triangle = function (a,b,c){
        this.a = a ? a : new Sakri.Geom.Point(0,0);
        this.b = b ? b : new Sakri.Geom.Point(0,0);
        this.c = c ? c : new Sakri.Geom.Point(0,0);
    };

    Sakri.Geom.Triangle.prototype.equals = function(triangle){
        return this.a.equals(triangle.a) && this.b.equals(triangle.b) && this.c.equals(triangle.c);
    };

    Sakri.Geom.Triangle.prototype.clone = function(){
        return new Sakri.Geom.Triangle(new Sakri.Geom.Point(this.a.x,this.a.y),new Sakri.Geom.Point(this.b.x,this.b.y),new Sakri.Geom.Point(this.c.x,this.c.y));
    };

    Sakri.Geom.Triangle.prototype.getSmallestX = function(){
        return Math.min(this.a.x,this.b.x,this.c.x);
    };
    Sakri.Geom.Triangle.prototype.getSmallestY = function(){
        return Math.min(this.a.y,this.b.y,this.c.y);
    };

    Sakri.Geom.Triangle.prototype.getBiggestX = function(){
        return Math.max(this.a.x,this.b.x,this.c.x);
    };
    Sakri.Geom.Triangle.prototype.getBiggestY = function(){
        return Math.max(this.a.y,this.b.y,this.c.y);
    };

    Sakri.Geom.Triangle.prototype.containsVertex = function(point){
        //console.log("Sakri.Geom.Triangle.containsVertex",this.toString(),point.toString());
        return (this.a.x==point.x && this.a.y==point.y) || (this.b.x==point.x && this.b.y==point.y) || (this.c.x==point.x && this.c.y==point.y);
    };

    Sakri.Geom.Triangle.prototype.toString = function(){
        return "toString() Triangle{a:"+this.a+" , b:"+this.b+" , c:"+this.c+"}";
    };

    Sakri.Geom.Triangle.prototype.containsVertex = function(point){
        return (this.a.x==point.x && this.a.y==point.y) || (this.b.x==point.x && this.b.y==point.y) || (this.c.x==point.x && this.c.y==point.y);
    };

    Sakri.Geom.Triangle.prototype.sharesEdge = function(triangle){
        //console.log("Sakri.Geom.Triangle.sharesEdge",this.toString(),triangle.toString());
        var sharedPoints=0;
        if(this.containsVertex(triangle.a)){
            sharedPoints++;
        }
        if(this.containsVertex(triangle.b)){
            sharedPoints++;
        }
        if(this.containsVertex(triangle.c)){
            sharedPoints++;
        }
        //console.log("sharesEdge()",sharedPoints);
        return sharedPoints==2;
    };
    
	//==================================================
	//===================::RECTANGLE::==================
	//==================================================

	Sakri.Geom.Rectangle = function (x, y, width, height){
		this.update(x, y, width, height);
	};
	
	Sakri.Geom.Rectangle.prototype.update = function(x, y, width, height){
		this.x = isNaN(x) ? 0 : x;
		this.y = isNaN(y) ? 0 : y;
		this.width = isNaN(width) ? 0 : width;
		this.height = isNaN(height) ? 0 : height;
	};
	
	Sakri.Geom.Rectangle.prototype.updateToRect = function(rect){
		this.x = rect.x;
		this.y = rect.y;
		this.width = rect.width;
		this.height = rect.height;
	};
	
	Sakri.Geom.Rectangle.prototype.scaleX = function(scaleBy){
		this.width *= scaleBy;
	};
	
	Sakri.Geom.Rectangle.prototype.scaleY = function(scaleBy){
		this.height *= scaleBy;
	};
	
	Sakri.Geom.Rectangle.prototype.scale = function(scaleBy){
		this.scaleX(scaleBy);
		this.scaleY(scaleBy);
	};

	Sakri.Geom.Rectangle.prototype.getRight = function(){
		return this.x + this.width;
	};
	
	Sakri.Geom.Rectangle.prototype.getBottom = function(){
		return this.y + this.height;
	};

    Sakri.Geom.Rectangle.prototype.getCenterX = function(){
        return this.x + this.width/2;
    };

    Sakri.Geom.Rectangle.prototype.containsPoint = function(x, y){
        return x >= this.x && y >= this.y && x <= this.getRight() && y <= this.getBottom();
    };
    Sakri.Geom.Rectangle.prototype.containsRect = function(rect){
        return this.containsPoint(rect.x, rect.y) && this.containsPoint(rect.getRight(), rect.getBottom());
    };
    //questionable... center should not be relative to canvas itself...
    Sakri.Geom.Rectangle.prototype.getCenter = function(){
        return new Sakri.Geom.Point(this.x+this.width/2,this.y+this.height/2);
    };

    Sakri.Geom.Rectangle.prototype.getCenterY=function(){
        return this.y + this.height/2;
    };
	Sakri.Geom.Rectangle.prototype.isSquare = function(){
		return this.width == this.height;
	};

	Sakri.Geom.Rectangle.prototype.isLandscape = function(){
		return this.width > this.height;
	};

	Sakri.Geom.Rectangle.prototype.isPortrait = function(){
		return this.width < this.height;
	};
	
	Sakri.Geom.Rectangle.prototype.getSmallerSide = function(){
		return Math.min(this.width, this.height);
	};
	
	Sakri.Geom.Rectangle.prototype.getBiggerSide = function(){
		return Math.max(this.width,this.height);
	};
	
	Sakri.Geom.Rectangle.prototype.getArea = function(){
		return this.width * this.height;
	};
	
	Sakri.Geom.Rectangle.prototype.floor = function(){
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.width = Math.floor(this.width);
		this.height = Math.floor(this.height);
	};
	
	Sakri.Geom.Rectangle.prototype.ceil = function(){
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		this.width = Math.ceil(this.width);
		this.height = Math.ceil(this.height);
	};

	Sakri.Geom.Rectangle.prototype.round = function(){
		this.x=Math.round(this.x);
		this.y=Math.round(this.y);
		this.width=Math.round(this.width);
		this.height=Math.round(this.height);
	};

	Sakri.Geom.Rectangle.prototype.roundIn = function(){
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		this.width = Math.floor(this.width);
		this.height = Math.floor(this.height);
	};

	Sakri.Geom.Rectangle.prototype.roundOut = function(){
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.width = Math.ceil(this.width);
		this.height = Math.ceil(this.height);
	};
	
	Sakri.Geom.Rectangle.prototype.clone = function(){
		return new Sakri.Geom.Rectangle(this.x, this.y, this.width, this.height);
	};
	
	Sakri.Geom.Rectangle.prototype.toString = function(){
		return "Rectangle{x:"+this.x+" , y:"+this.y+" , width:"+this.width+" , height:"+this.height+"}";
	};
	
	//==================================================
	//===========::ROUNDED RECTANGLE::==================
	//==================================================	

	Sakri.Geom.RoundedRectangle = function (x, y , width, height, radius){
        Sakri.Geom.Rectangle.call(this, x, y, width, height);
		this.radius = isNaN(radius) ? 5 : radius;
	};

    //subclass extends superclass
    Sakri.Geom.RoundedRectangle.prototype = Object.create(Sakri.Geom.Rectangle.prototype);
    Sakri.Geom.RoundedRectangle.prototype.constructor = Sakri.Geom.Rectangle;

    Sakri.Geom.RoundedRectangle.prototype.drawPathToContext = function(context){
        context.beginPath();
        context.moveTo(this.x, this.y+this.radius);
        context.arc(this.x+this.radius, this.y+this.radius, this.radius, Math.PI,Math.PI+SakriMathUtil.HALF_PI);
        context.lineTo(this.getRight()-this.radius, this.y);
        context.arc(this.getRight()-this.radius, this.y+this.radius, this.radius, Math.PI+SakriMathUtil.HALF_PI, SakriMathUtil.PI2 );
        context.lineTo(this.getRight(), this.getBottom()-this.radius);
        context.arc(this.getRight()-this.radius, this.getBottom()-this.radius, this.radius, 0, SakriMathUtil.HALF_PI );
        context.lineTo(this.x+this.radius, this.getBottom());
        context.arc(this.x+this.radius, this.getBottom()-this.radius, this.radius, SakriMathUtil.HALF_PI, Math.PI );
        context.lineTo(this.x, this.y+this.radius);
        context.closePath();
    }

	Sakri.Geom.RoundedRectangle.prototype.toString = function(){
		return "RoundedRectangle{x:"+this.x+" , y:"+this.y+" , width:"+this.width+" , height:"+this.height+" , radius:"+this.radius+"}";
	};
	
	Sakri.Geom.RoundedRectangle.prototype.clone = function(){
		return new Sakri.Geom.RoundedRectangle(this.x,this.y,this.width,this.height,this.radius);
	};


    //==================================================
    //=====================::TRANSFORM::===================
    //==================================================

    Sakri.Geom.setIdentityMatrixToContext = function(context){
        context.setTransform(1,0,0,1,0,0);
    };

    //(1,0,0,1,0,0);
    Sakri.Geom.Transform = function (scaleX, skewX, skewY, scaleY, tx, ty){
        this.update(isNaN(scaleX) ? 1 : scaleX, isNaN(skewX) ? 0 : skewX, isNaN(skewY) ? 0 : skewY,
            isNaN(scaleY) ? 1 : scaleY, isNaN( tx) ?  0 : tx, isNaN(ty) ? 0 : ty);
    };

    Sakri.Geom.Transform.prototype.update = function (scaleX, skewX, skewY, scaleY, tx, ty){
        this.scaleX = scaleX;
        this.skewX = skewX;
        this.skewY = skewY;
        this.scaleY = scaleY;
        this.tx = tx;
        this.ty = ty;
    };

    Sakri.Geom.Transform.prototype.toString = function() {
        return "SimpleGeometry.Transform{scaleX:"+this.scaleX+" ,skewX:"+this.skewX+" ,skewY:"+this.skewY+" ,scaleY:"+this.scaleY+" ,tx:"+this.tx+" ,ty:"+this.ty+"}";
    };
	
}(window));