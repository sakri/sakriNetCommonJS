/**
 * Created by sakri on 15-1-14.
 */

//has a dependency on MathUtil, Geom,

(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;

    //TODO : THIS COULD EXTEND POINT?
    //bounds is a Rectangle
    Sakri.CircularWander = function(bounds, speed, context, startingPoint ){
        this.updates = 0;//current number of "moves"
        this.bounds = bounds;
        this.speed = speed;
        this.context = context;
        this.position = Sakri.CircularWander.createStartingPoint(this.bounds, startingPoint);
        this.previousPosition = this.position.clone();
        this.currentDegree = Math.random() * Sakri.MathUtil.PI2; // TODO: rename, not immediately clear what the purpose of this property is?
        this.currentRadius = Sakri.MathUtil.getRandomNumberInRange(Sakri.CircularWander.minimumRadius, Math.min(this.bounds.width*.25, this.bounds.height*.25));
        this.center = new Sakri.Geom.Point();
        this.center.x = this.position.x + Math.cos(this.currentDegree - Math.PI) * this.currentRadius;
        this.center.y = this.position.y + Math.sin(this.currentDegree - Math.PI) * this.currentRadius;
        this.setNextChangeTarget();
    };


    //circles that particles travel along cannot be smaller than this
    Sakri.CircularWander.minimumRadius = 10;

    //minimum number of degrees that a particle travels along a circle until switching to a new one (in radians)
    Sakri.CircularWander.minCircleRotation = Math.PI/10;

    //maximum number of degrees that a particle travels along a circle until switching to a new one (in radians)
    Sakri.CircularWander.maxCircleRotation = Sakri.MathUtil.PI2;


    //bounds is a Rectangle, startingPoint is a Point
    Sakri.CircularWander.createStartingPoint = function(bounds, startingPoint){
        if(startingPoint){
            return startingPoint;
        }
        var rect = bounds.clone();
        rect.inflate( -bounds.width*.5, -bounds.height*.5);
        return Sakri.Geom.RectangleUtil.createRandomPointInRect(rect);
    };

    Sakri.CircularWander.prototype.update = function(){
        this.currentDegree+=this.updateAngle;
        this.previousPosition.x = this.position.x;
        this.previousPosition.y = this.position.y;
        this.position.x = this.center.x + Math.cos(this.currentDegree) * this.currentRadius;
        this.position.y = this.center.y + Math.sin(this.currentDegree) * this.currentRadius;
        this.updates++;
        if(this.updates >= this.currentUpdateTarget){
            try{
                this.setNextCircle();
            }catch(err){
                console.log(err);
                if(this.breakOutFunction){
                    this.breakOutFunction();
                }
            }
            this.setNextChangeTarget();
            this.breakOutFunction(true);
        }
    };

    Sakri.CircularWander.prototype.setNextChangeTarget = function(){
        var circumference = Math.PI * (this.currentRadius * 2);
        var moveDegrees = Sakri.MathUtil.getRandomNumberInRange(Sakri.CircularWander.minCircleRotation, Sakri.CircularWander.maxCircleRotation);
        var totalDist = (moveDegrees / Sakri.MathUtil.PI2) * circumference;
        this.currentUpdateTarget = Math.ceil(totalDist / Math.abs(this.speed));//number of moves before switching circles, TODO rename
        this.updateAngle = moveDegrees / this.currentUpdateTarget * (this.speed > 0 ? 1 : -1);
        this.updates = 0;
        console.log("CircularWander.setNextChangeTarget" , circumference, moveDegrees, totalDist, this.currentUpdateTarget, this.updateAngle);
    };


    Sakri.CircularWander.uniqueAngle = 0;
    Sakri.CircularWander.isoscelesAngle = 0;
    Sakri.CircularWander.edgePoint = new Sakri.Geom.Point();
    Sakri.CircularWander.tempRadius = 0;
    Sakri.CircularWander.previousCenter = new Sakri.Geom.Point();
    Sakri.CircularWander.maxCircleCenter = new Sakri.Geom.Point();

    Sakri.CircularWander.fourthCircle = Sakri.MathUtil.HALF_PI + Math.PI;//used to calculate angle of line to boundary line

    //line is Geom.Line, point is geom.Point, bounds is geom.Rectangle -  returns a Circle
    Sakri.CircularWander.getBottomMaxCircle = function(angle, line, point, bounds){
        Sakri.CircularWander.uniqueAngle = Sakri.CircularWander.fourthCircle - angle;
        Sakri.CircularWander.isoscelesAngle = (Math.PI - Sakri.CircularWander.uniqueAngle) / 2;
        Sakri.CircularWander.edgePoint.y = bounds.bottom;
        Sakri.CircularWander.tempRadius = (bounds.bottom - point.y) / Math.sin(angle - Sakri.CircularWander.isoscelesAngle);
        Sakri.CircularWander.edgePoint.x = point.x + Math.cos(angle - Sakri.CircularWander.isoscelesAngle) * Sakri.CircularWander.tempRadius;
        Sakri.CircularWander.maxCircleCenter.update(Sakri.CircularWander.edgePoint.x , line.getYatX(Sakri.CircularWander.edgePoint.x));
        return new Sakri.Geom.Circle(   Sakri.CircularWander.maxCircleCenter.x,
                                        Sakri.CircularWander.maxCircleCenter.y,
                                        Sakri.CircularWander.maxCircleCenter.y - bounds.bottom);
    };

    Sakri.CircularWander.getTopMaxCircle = function(angle, line, point, bounds){
        Sakri.CircularWander.uniqueAngle = Sakri.CircularWander.fourthCircle - (angle - Math.PI);
        Sakri.CircularWander.isoscelesAngle = (Math.PI - Sakri.CircularWander.uniqueAngle) / 2;
        Sakri.CircularWander.edgePoint.y = bounds.y;
        Sakri.CircularWander.tempRadius = (bounds.y - point.y) / Math.sin(angle - Sakri.CircularWander.isoscelesAngle);
        Sakri.CircularWander.edgePoint.x = point.x + Math.cos(angle - Sakri.CircularWander.isoscelesAngle) * Sakri.CircularWander.tempRadius;
        Sakri.CircularWander.maxCircleCenter.update(Sakri.CircularWander.edgePoint.x, line.getYatX(Sakri.CircularWander.edgePoint.y));
        return new Sakri.Geom.Circle(   Sakri.CircularWander.maxCircleCenter.x,
                                        Sakri.CircularWander.maxCircleCenter.y,
                                        Math.abs(bounds.y - Sakri.CircularWander.maxCircleCenter.y));
    };

    Sakri.CircularWander.getRightMaxCircle = function(angle, line, point, bounds){
        Sakri.CircularWander.uniqueAngle = Math.PI - angle;
        Sakri.CircularWander.isoscelesAngle = (Math.PI - Sakri.CircularWander.uniqueAngle) / 2;
        Sakri.CircularWander.edgePoint.x = bounds.right;
        Sakri.CircularWander.tempRadius = (bounds.right - point.x) / Math.cos(angle - Sakri.CircularWander.isoscelesAngle);
        Sakri.CircularWander.edgePoint.y = point.y + Math.sin(angle - Sakri.CircularWander.isoscelesAngle) * Sakri.CircularWander.tempRadius;
        Sakri.CircularWander.maxCircleCenter.update(line.getXatY(Sakri.CircularWander.edgePoint.y), Sakri.CircularWander.edgePoint.y);
        return new Sakri.Geom.Circle(   Sakri.CircularWander.maxCircleCenter.x,
                                        Sakri.CircularWander.maxCircleCenter.y,
                                        Math.abs(bounds.right-Sakri.CircularWander.maxCircleCenter.x));
    };

    Sakri.CircularWander.getLeftMaxCircle = function(angle, line, point, bounds){
        Sakri.CircularWander.uniqueAngle = -angle;
        Sakri.CircularWander.isoscelesAngle = (Math.PI - Sakri.CircularWander.uniqueAngle) / 2;
        Sakri.CircularWander.edgePoint.x = bounds.x;
        Sakri.CircularWander.tempRadius = (bounds.x - point.x) / Math.cos(angle - Sakri.CircularWander.isoscelesAngle);
        Sakri.CircularWander.edgePoint.y = point.y + Math.sin(angle - Sakri.CircularWander.isoscelesAngle) * Sakri.CircularWander.tempRadius;
        Sakri.CircularWander.maxCircleCenter.update(line.getXatY(Sakri.CircularWander.edgePoint.y), Sakri.CircularWander.edgePoint.y);
        return new Sakri.Geom.Circle(   Sakri.CircularWander.maxCircleCenter.x,
                                        Sakri.CircularWander.maxCircleCenter.y,
                                        Math.abs(Sakri.CircularWander.maxCircleCenter.x-bounds.x));
    };

    Sakri.CircularWander.circleArray = [];// no need to store these?, store an array of methods instead?
    Sakri.CircularWander.smallestRadius = 0;
    Sakri.CircularWander.radiusIndex = 0;
    Sakri.CircularWander.radIter = 0;//what a stupid name

    //line is of type Line, bounds is Rectangle. returns a Circle
    Sakri.CircularWander.getCircleWithSmallestRadius = function(angle, line, point, bounds){
        console.log("CircularWander.getCircleWithSmallestRadius()");
        console.log("\tangle : ", angle);
        console.log("\tline : ", line.toString());
        console.log("\tpoint : ", point.toString());
        console.log("\tbounds : ", bounds.toString());
        Sakri.CircularWander.circleArray[0] = Sakri.CircularWander.getBottomMaxCircle(angle, line, point, bounds);
        Sakri.CircularWander.circleArray[1] = Sakri.CircularWander.getTopMaxCircle(angle, line, point, bounds);
        Sakri.CircularWander.circleArray[2] = Sakri.CircularWander.getRightMaxCircle(angle, line, point, bounds);
        Sakri.CircularWander.circleArray[3] = Sakri.CircularWander.getLeftMaxCircle(angle, line, point, bounds);
        Sakri.CircularWander.smallestRadius = Sakri.CircularWander.circleArray[0].radius;
        Sakri.CircularWander.radiusIndex = 0;
        for(Sakri.CircularWander.radIter = 1; Sakri.CircularWander.radIter<4; Sakri.CircularWander.radIter++){
            if(Sakri.CircularWander.circleArray[Sakri.CircularWander.radIter].radius < Sakri.CircularWander.smallestRadius){
                Sakri.CircularWander.smallestRadius = Sakri.CircularWander.circleArray[Sakri.CircularWander.radIter].radius;
                Sakri.CircularWander.radiusIndex = Sakri.CircularWander.radIter;
            }
        }
        return Sakri.CircularWander.circleArray[Sakri.CircularWander.radiusIndex];
    };


    Sakri.CircularWander.nextPosition = new Sakri.Geom.Point();
    Sakri.CircularWander.previousAngle = 0;
    Sakri.CircularWander.nextAngle = 0;
    Sakri.CircularWander.tempMinRadius = 0;
    Sakri.CircularWander.angleDifference = 0;

    Sakri.CircularWander.prototype.debugDrawPossibleCircles = function(color, width){
        if(!this.context){
            return;
        }
        this.context.fillStyle = -1;
        var i, circle;
        this.context.strokeStyle = color;//"#FF00FF";
        this.context.lineWidth = width;//"#FF00FF";
        for(i=0;i<4;i++){
            circle = Sakri.CircularWander.circleArray[i];
            console.log(i , circle.toString());
            context.beginPath();
            context.arc(circle.x, circle.y, circle.radius, 0, Sakri.MathUtil.PI2);
            context.stroke();
        }
    }

    Sakri.CircularWander.prototype.setNextCircle = function(){
        var angle1 = Math.atan2(this.position.y - this.center.y, this.position.x - this.center.x);
        var angle2 = angle1 + Math.PI;
        angle1 = Sakri.MathUtil.constrainRadianTo2PI(angle1);
        angle2 = Sakri.MathUtil.constrainRadianTo2PI(angle2);
        console.log("CircularWander.setNextCircle()", this.position.toString(), this.center.toString());
        console.log("\tangle1 : ", angle1, " , angle2 : " ,angle2);
        var line = new Sakri.Geom.Line(this.center, this.position);
        if(this.context){
            this.context.strokeStyle = "#00FFFF";
            this.context.beginPath();
            this.context.moveTo(this.center.x, this.center.y);
            this.context.lineTo(this.position.x, this.position.y);
            this.context.stroke();
            this.context.closePath();
        }
        console.log("\t line : ", line.toString());
        var circle1 = Sakri.CircularWander.getCircleWithSmallestRadius(angle1, line, this.position, this.bounds);
        this.debugDrawPossibleCircles("#0000FF" , 4);
        console.log("\t circle1 : ", circle1.toString());
        this.debugDrawPossibleCircles("#FFFFFF" , 2);
        var circle2 = Sakri.CircularWander.getCircleWithSmallestRadius(angle2, line, this.position, this.bounds);
        console.log("\t circle2 : ", circle2.toString());

        //TODO: weird conditional logic...
        var circle, angle;
        if(circle1.radius < Sakri.CircularWander.minimumRadius){
            circle = circle2;
            angle = angle2;
        }else if(circle2.radius < Sakri.CircularWander.minimumRadius){
            circle = circle1;
            angle = angle1;
        }else{
            if(Math.random() > .5){
                circle = circle1;
                angle = angle1;
            }else{
                circle = circle2;
                angle = angle2;
            }
        }
        console.log("\t circle : ", circle.toString(), " , angle : "+angle);
        console.log("\t this.position : ", this.position.toString(), " , circle.center : "+circle.toString());

        //if(Point.distance(this.position,circle.center)<Sakri.CircularWander.minimumRadius)AS3SimpleTraceBox.trace("TOOOO SMALLL!!!");
        Sakri.CircularWander.tempMinRadius = Sakri.CircularWander.minimumRadius / Sakri.Geom.Point.distanceBetweenTwoPoints(this.position, circle);
        console.log("\tCircularWander.tempMinRadius : ", Sakri.CircularWander.tempMinRadius);
        this.center = Sakri.Geom.Point.interpolate(this.position,circle, 1 - Sakri.MathUtil.getRandomNumberInRange(Sakri.CircularWander.tempMinRadius,.9));
        console.log("\tthis.center : ", this.center.toString());
        this.currentRadius = Sakri.Geom.Point.distanceBetweenTwoPoints(this.center, this.position);
        console.log("\tthis.currentRadius : ", this.currentRadius);
        //if(this.currentRadius<Sakri.CircularWander.minimumRadius)AS3SimpleTraceBox.trace("TOOOO SMALLL 2!!!");
        this.currentDegree = Sakri.MathUtil.constrainRadianTo2PI(this.currentDegree);
        console.log("\tthis.currentDegree : ", this.currentDegree);

        //this code pisses me off... I'm sure there is a mathematical way to decide the "speed" variable
        //with just one or two conditionals. Instead I have to bend over backwards to get the correct value...
        Sakri.CircularWander.previousCenter.x = this.center.x+Math.cos(this.currentDegree - this.updateAngle) * this.currentRadius;
        Sakri.CircularWander.previousCenter.y = this.center.y+Math.sin(this.currentDegree - this.updateAngle) * this.currentRadius;

        Sakri.CircularWander.nextPosition.x = this.center.x + Math.cos(this.currentDegree + this.updateAngle) * this.currentRadius;
        Sakri.CircularWander.nextPosition.y = this.center.y + Math.sin(this.currentDegree + this.updateAngle) * this.currentRadius;
        Sakri.CircularWander.previousAngle = Sakri.MathUtil.constrainRadianTo2PI(Math.atan2(this.position.y - Sakri.CircularWander.previousCenter.y, this.position.x - Sakri.CircularWander.previousCenter.x));
        Sakri.CircularWander.nextAngle = Sakri.MathUtil.constrainRadianTo2PI(Math.atan2(Sakri.CircularWander.nextPosition.y - this.position.y, Sakri.CircularWander.nextPosition.x - this.position.x));

        Sakri.CircularWander.angleDifference = Math.abs(Sakri.CircularWander.previousAngle - Sakri.CircularWander.nextAngle);

        if(Sakri.CircularWander.angleDifference<Math.PI + Sakri.MathUtil.HALF_PI){
            if(Sakri.CircularWander.angleDifference > Sakri.MathUtil.HALF_PI){
                this.speed *= -1;
            }
        }

        this.currentDegree = (angle==angle1 ? angle2 : angle1);

    };

}(window));