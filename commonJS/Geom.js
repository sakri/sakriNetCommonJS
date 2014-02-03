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

    Sakri.Geom.Point.prototype.update = function(x, y){
        this.x = isNaN(x) ? this.x : x;
        this.y = isNaN(y) ? this.y : y;
    };

    Sakri.Geom.Point.prototype.add = function(x, y){
        this.x += isNaN(x) ? 0 : x;
        this.y += isNaN(y) ? 0 : y;
    };

    Sakri.Geom.Point.prototype.equals = function(point){
        return this.x==point.x && this.y==point.y;
    };

    Sakri.Geom.Point.prototype.toString = function(){
        return "{x:"+this.x+" , y:"+this.y+"}";
    };

    Sakri.Geom.Point.interpolate = function(pointA, pointB, normal){
        return new Sakri.Geom.Point(Sakri.MathUtil.interpolate(normal, pointA.x, pointB.x) , Sakri.MathUtil.interpolate(normal, pointA.y, pointB.y));
    };

    Sakri.Geom.Point.distanceBetweenTwoPoints = function( point1, point2 ){
        //console.log("Math.pow(point2.x - point1.x,2) : ",Math.pow(point2.x - point1.x,2));
        return Math.sqrt( Math.pow(point2.x - point1.x,2) + Math.pow(point2.y - point1.y,2) );
    };

    Sakri.Geom.Point.angleBetweenTwoPoints = function(p1,p2){
        return Math.atan2(p1.y-p2.y, p1.x-p2.x);
    };

    Sakri.Geom.mirrorPointInRectangle = function(point,rect){
        return new Sakri.Geom.Point(rect.width-point.x,rect.height-point.y);
    };

    Sakri.Geom.randomizePoint = function(point,randomValue){
        return new Sakri.Geom.Point(-randomValue+Math.random()*randomValue+point.x,-randomValue+Math.random()*randomValue+point.y);
    };


    //==================================================
    //=====================::LINE::====================
    //==================================================    

    Sakri.Geom.Line = function(pointA, pointB){
        this.pointA = pointA ? pointA : new Sakri.Geom.Point();
        this.pointB = pointB ? pointB : new Sakri.Geom.Point();
        this.updateLineProperties();
    };

    //=================:: Static methods

    //first check for horizontal+vertical lines? no division by 0?!
    Sakri.Geom.Line.getSlope = function(pointA,pointB){
        return (pointA.y - pointB.y) / (pointA.x - pointB.x);
    };

    Sakri.Geom.Line.getYIntercept = function(point,slope){
        //slope intercept : y = mx + b
        return point.y - point.x * slope;
    };

    //checks for parallel lines
    Sakri.Geom.Line.intersects = function(line1, line2){
        if(line1.isVertical() && line2.isVertical()){
            //if(line1.this.pointB.equals(line2.this.pointA))return  line1.this.pointB;
            //throw new Error("Line.getIntersection() ERROR Two vertical lines cannot intersect");
            console.log("Line.getIntersection() ERROR Two vertical lines cannot intersect");
            return false;
        }
        if(line1.isHorizontal() && line2.isHorizontal()){
            //if(line1.this.pointB.equals(line2.this.pointA))return  line1.this.pointB;
            //throw new Error("Line.getIntersection() ERROR Two horizontal lines cannot intersect");
            console.log("Line.getIntersection() ERROR Two horizontal lines cannot intersect");
            return false;
        }
        if(line1.slope == line2.slope){
            //throw new Error("Line.getIntersection() ERROR Two Parallel lines cannot intersect");
            console.log("Line.getIntersection() ERROR Two Parallel lines cannot intersect");
            return false;
        }
        return true;
    };

    //returns a Sakri.Geom.Point or null
    //TODO : create alternative where new Points are not instantiated on every call, maybe pass a Point as an arg?
    Sakri.Geom.Line.getIntersection = function(line1, line2){
        //slope intercept : y = mx + b
        //m1 * x + b1 - y = m2 * x + b2 - y
        //m1 * x + b1 - b2 = m2 * x;
        //m1 * x - m2 * x = b2 - b1;
        //x * (m1 - m2) = b2 - b1

        if(!Sakri.Geom.Line.intersects(line1, line2)){
            return null;
        }

        //PERPENDICULAR LINES
        if(line1.isHorizontal() && line2.isVertical()){
            return new Sakri.Geom.Point(line2.pointA.x, line1.pointA.y);
        }
        if(line2.isHorizontal() && line1.isVertical()){
            return new Sakri.Geom.Point(line1.pointA.x, line2.pointA.y);
        }

        //ONE HORIZONTAL OR VERTICAL
        if(line1.isHorizontal()){
            return new Sakri.Geom.Point(line2.getXatY(line1.pointA.y), line1.pointA.y);
        }
        if(line1.isVertical()){
            return new Sakri.Geom.Point(line1.pointA.x, line2.getYatX(line1.pointA.x));
        }

        if(line2.isHorizontal()){
            return new Sakri.Geom.Point(line1.getXatY(line2.pointA.y),line2.pointA.y);
        }
        if(line2.isVertical()){
            return new Sakri.Geom.Point(line2.pointA.x,line1.getYatX(line2.pointA.x));
        }

        var p = new Sakri.Geom.Point();
        //console.log("line1.slope : "+line1.slope);
        //console.log("line2.slope : "+line2.slope);
        p.x = (line2.yIntercept - line1.yIntercept) / (line1.slope - line2.slope);
        p.y = line1.getYatX(p.x);
        return p;
    };

    //=================:: public methods

    Sakri.Geom.Line.prototype.isHorizontal = function(){
        return this.pointA.y == this.pointB.y;
    };

    Sakri.Geom.Line.prototype.isVertical = function(){
        return this.pointA.x == this.pointB.x;
    };

    Sakri.Geom.Line.prototype.getYatX = function(x){
        if(this.isHorizontal()){
            return this.pointA.y;
        }
        if(this.isVertical()){
            return NaN;
        }//throw error?
        return this.slope * x + this.yIntercept;
    };

    Sakri.Geom.Line.prototype.getXatY = function(y){
        if(this.isVertical()){
            return this.pointA.x;
        }
        if(this.isHorizontal()){
            return NaN;
        }//throw error?
        return (y - this.yIntercept)/this.slope;
    };

    Sakri.Geom.Line.prototype.update = function(pointA, pointB){
        if(pointA){
            this.pointA.x = isNaN(pointA.x) ? this.pointA.x : pointA.x;
            this.pointA.y = isNaN(pointA.y) ? this.pointA.y : pointA.y;
        }
        if(pointB){
            this.pointB.x = isNaN(pointB.x) ? this.pointB.x : pointB.x;
            this.pointB.y = isNaN(pointB.y) ? this.pointB.y : pointB.y;
        }
        this.updateLineProperties();
    };

    Sakri.Geom.Line.prototype.updateLineProperties = function(){
        this.slope = Sakri.Geom.Line.getSlope(this.pointA, this.pointB);
        this.yIntercept = Sakri.Geom.Line.getYIntercept(this.pointA, this.slope);
    };

    Sakri.Geom.Line.prototype.toString = function(){
        return "Line{a : "+this.pointA.toString()+" , b : "+this.pointB.toString()+" , slope : "+this.slope+" , yIntercept : "+this.yIntercept+"}";
    };
    
    // ==================================================
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

    Sakri.Geom.Triangle.createRandomTriangleInRect = function(rect){
        var a = new Sakri.Geom.Point(rect.x + Math.random() * rect.width, rect.y + Math.random() * rect.height);
        var b = new Sakri.Geom.Point(rect.x + Math.random() * rect.width, rect.y + Math.random() * rect.height);
        var c = new Sakri.Geom.Point(rect.x + Math.random() * rect.width, rect.y + Math.random() * rect.height);
        return new Sakri.Geom.Triangle(a,b,c);
    }

    Sakri.Geom.Triangle.mirrorTriangleInRectangle = function(triangle, rect){
        //console.log("mirrorTriangleInRectangle() ",width,height);
        //console.log("\ttriangle : ",triangle.toString());
        var a = Sakri.Geom.Triangle.mirrorPointInRectangle(triangle.a, rect);
        var b = Sakri.Geom.Triangle.mirrorPointInRectangle(triangle.b, rect);
        var c = Sakri.Geom.Triangle.mirrorPointInRectangle(triangle.c, rect);
        return new Sakri.Geom.Triangle.Triangle(a, b, c);
        //console.log("\ttriangle : ",triangle.toString());
    }

    Sakri.Geom.Triangle.offsetTriangle = function(triangle, offset){
        triangle.a.x += offset;
        triangle.a.y += offset;
        triangle.b.x += offset;
        triangle.b.y += offset;
        triangle.c.x += offset;
        triangle.c.y += offset;
    }

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

    //TODO : doesn't work
    Sakri.Geom.Rectangle.prototype.inflate = function(x, y){
        this.x -= isNaN(x) ? 0 : x;
        this.y -= isNaN(y) ? 0 : y;
        this.width += isNaN(x) ? 0 : x * 2;
        this.height += isNaN(y) ? 0 : y * 2;
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

    Sakri.Geom.Rectangle.prototype.getCenter = function(){
        return new Sakri.Geom.Point(this.getCenterX(), this.getCenterY());
    };

    Sakri.Geom.Rectangle.prototype.getCenterX = function(){
        return this.x + this.width/2;
    };

    Sakri.Geom.Rectangle.prototype.getCenterY=function(){
        return this.y + this.height/2;
    };

    Sakri.Geom.Rectangle.prototype.containsPoint = function(x, y){
        return x >= this.x && y >= this.y && x <= this.getRight() && y <= this.getBottom();
    };
    Sakri.Geom.Rectangle.prototype.containsRect = function(rect){
        return this.containsPoint(rect.x, rect.y) && this.containsPoint(rect.getRight(), rect.getBottom());
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
    //=====================::CIRCLE::===================
    //==================================================

    Sakri.Geom.Circle = function (x,y,radius){
        Sakri.Geom.Point.call(this,x,y); //call super constructor.
        this.radius = isNaN(radius) ? 10 : radius;// not sure if this should just be 0?
    };

    //subclass extends superclass
    Sakri.Geom.Circle.prototype = Object.create(Sakri.Geom.Point.prototype);
    Sakri.Geom.Circle.prototype.constructor = Sakri.Geom.Point;

    Sakri.Geom.Circle.prototype.getRandomPointInCircle = function(){
        var radius = Math.random() * this.radius;
        var radian = Math.random() * SimpleGeometry.PI2;
        var x = this.x + Math.cos(radian) * radius;
        var y = this.y + Math.sin(radian) * radius;
        return new Sakri.Geom.Point(x, y);
    };

    Sakri.Geom.Circle.prototype.update = function(x,y,radius){
        this.x = isNaN(x) ? this.x : x;
        this.y = isNaN(y) ? this.y : y;
        this.radius = isNaN(radius) ? this.radius : radius;
    }

    Sakri.Geom.Circle.prototype.clone = function(){
        return new Sakri.Geom.Circle(this.x,this.y,this.radius);
    };

    Sakri.Geom.Circle.prototype.containsPoint = function(point){
        return Sakri.Geom.Point.distanceBetweenTwoPoints(point, this) <= this.radius;
    };

    Sakri.Geom.Circle.prototype.toString = function(){
        return "Circle{x : "+this.x+" , y : "+this.y+" , radius : "+this.radius+"}";
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