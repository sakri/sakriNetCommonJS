/**
 * Created by sakri on 15-1-14.
 */

//has a dependency on MathUtil, Geom,

(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;


    //bounds is a Rectangle, startingPoint is a Point
    //TODO : speed should have some documentation? in pixels?
    Sakri.CircularWander = function(bounds, speed, startingPoint, context ){
        this.minimumRadius = 10; //circles that particles travel along cannot be smaller than this
        this.minCircleRotation = Math.PI/10;//minimum number of radians that a particle travels along a circle before switching to a new one
        this.maxCircleRotation = Sakri.MathUtil.PI2;//max number of radians that a particle travels along a circle before switching to a new one
        this.updates = 0;//current number of "moves"
        this.bounds = bounds;
        this.speed = speed;
        this.currentCircle = new Sakri.Geom.Circle(startingPoint.x, startingPoint.y, this.minimumRadius);//TODO: random starting point ensuring circle is within bounds
        this.context = context;
        this.currentRadian = Math.random() * Sakri.MathUtil.PI2; // TODO: rename, not immediately clear what the purpose of this property is?
        this.position = new Sakri.Geom.Point();
        this.radiusLine = new Sakri.Geom.Line();//used for creating circles
        this.circleFinder = new Sakri.LargestCircleInBoundsForRadiusFinder();
        this.setNextChangeTarget();
    };
    
    Sakri.CircularWander.prototype.update = function(){
        this.currentRadian += this.updateAngleIncrement;
        this.currentRadian = Sakri.MathUtil.constrainRadianTo2PI(this.currentRadian);
        this.position.x = this.currentCircle.x + Math.cos(this.currentRadian) * this.currentCircle.radius;
        this.position.y = this.currentCircle.y + Math.sin(this.currentRadian) * this.currentCircle.radius;
        if(!this.bounds.containsPoint(this.position.x, this.position.y)){
            console.log("OUT OF BOUNDS!");
            if(this.breakOutFunction){
                this.breakOutFunction();
            }
            return;
        }
        this.updates++;
        if(this.updates >= this.updatesBeforeNextCircle){
            this.setNextCircle();
            /*
            try{
                this.setNextCircle();
            }catch(err){
                console.log(err);
                if(this.breakOutFunction){
                    this.breakOutFunction();
                }
            }
            */
        }
    };

    Sakri.CircularWander.prototype.setNextCircle = function(){
        this.radiusLine.pointA.update(this.currentCircle.x, this.currentCircle.y);
        this.radiusLine.pointB.update(this.position.x, this.position.y);
        this.radiusLine.updateLineProperties();

        var nextCircle = this.circleFinder.findLargestFittingCircle(this.bounds, this.radiusLine, this.currentRadian, this.context);

        var context = this.context;

        context.beginPath();
        context.strokeStyle = "#150d49";
        context.lineWidth = 5;
        context.arc(nextCircle.x, nextCircle.y, nextCircle.radius, 0, Sakri.MathUtil.PI2);
        context.closePath();
        context.stroke();

        context.beginPath();
        context.strokeStyle = "#02feff";
        context.lineWidth = 2;
        context.arc(nextCircle.x, nextCircle.y, nextCircle.radius, 0, Sakri.MathUtil.PI2);
        context.closePath();
        context.stroke();

         if(!nextCircle.containsPoint(this.currentCircle) && !this.currentCircle.containsPoint(nextCircle)){
            console.log("switch speed : ", this.speed);
            this.speed *= -1;
            this.currentRadian -= Math.PI;
            this.currentRadian = Sakri.MathUtil.constrainRadianTo2PI(this.currentRadian);
         }

        nextCircle.radius = Sakri.MathUtil.getRandomNumberInRange(this.minimumRadius, nextCircle.radius);
        //var angle = Math.atan2( this.position.y - nextCircle.y, this.position.x - nextCircle.x );
        var angle = Math.atan2( nextCircle.y-this.position.y, nextCircle.x - this.position.x );
        nextCircle.x = this.position.x + Math.cos(angle)*nextCircle.radius;
        nextCircle.y = this.position.y + Math.sin(angle)*nextCircle.radius;

        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = "#92b1ff";
        context.arc(nextCircle.x, nextCircle.y, nextCircle.radius, 0, Sakri.MathUtil.PI2);
        context.closePath();
        context.stroke();

        this.currentCircle.update(nextCircle.x, nextCircle.y, nextCircle.radius);
        this.setNextChangeTarget();
    };

    //TODO : this needs to be revisited... calculations seem a bit half baked...
    Sakri.CircularWander.prototype.setNextChangeTarget = function(){
        var circumference = Math.PI * (this.currentCircle.radius * 2);
        var moveDistance = Sakri.MathUtil.getRandomNumberInRange(this.minCircleRotation, this.maxCircleRotation);
        var totalDist = (moveDistance / Sakri.MathUtil.PI2) * circumference;//TODO : This will cause problems if this.maxCircleRotation is not 360
        this.updatesBeforeNextCircle = Math.ceil(totalDist / Math.abs(this.speed));//number of moves before switching circles, TODO rename
        this.updateAngleIncrement = moveDistance / this.updatesBeforeNextCircle * this.speed;
        this.updates = 0;
        //console.log("CircularWander.setNextChangeTarget" , circumference, moveDistance, totalDist, this.updatesBeforeNextCircle, this.updateAngleIncrement);
    };

    //=============================================================================
    //=========================::AND NOW, SHOWING MY TRUE COLORS::=================
    //======================::IN THE ANCIENT ART OF CLASS NAMING,::================
    //==================================::I PRESENT::==============================
    //=============================================================================
    //===================::LARGEST CIRCLE IN BOUNDS FOR RADIUS FINDER::============
    //=============================================================================


    Sakri.LargestCircleInBoundsForRadiusFinder = function(){
        //these should be private variables. The idea is to not have to instantiate these variables on every single call
        //originally I had these as Static variables, which they could still be given a situation where there are a lot of wanderers
        this.nextCircleOption1 = new Sakri.Geom.Circle();
        this.nextCircleOption2 = new Sakri.Geom.Circle();
        this.candidateCircleA= new Sakri.Geom.Circle();
        this.candidateCircleB = new Sakri.Geom.Circle();
        this.angleZone = 0;//all options can be calculated within 90° "zones"
        this.vertexAngle = 0;//isosceles triangles have one unique angle called the vertex angle
        this.baseAngle = 0;//isosceles triangles have two equal angles called the base angles
        this.baseRadian = 0;//angle of isosceles triangle base line, used to calculate intersection with a boundary wall
        this.candidateDiameter = 0;//diameter of maximum size circle between "point" and a wall
        this.smaller = 0;
    };

    Sakri.LargestCircleInBoundsForRadiusFinder.prototype.findLargestFittingCircle = function(bounds, radiusLine, radian, context){
        var nextCircle = this.findLargestFittingCircleForRadian(bounds, radiusLine, radian, context);
        if(nextCircle){
            this.nextCircleOption1.update(nextCircle.x, nextCircle.y, nextCircle.radius);
        }else{
            this.nextCircleOption1.radius = 0;//0 is used to check if valid option
        }

        nextCircle = this.findLargestFittingCircleForRadian(bounds, radiusLine, Sakri.MathUtil.constrainRadianTo2PI(radian-Math.PI), context);
        if(nextCircle){
            this.nextCircleOption2.update(nextCircle.x, nextCircle.y, nextCircle.radius);
        }else{
            this.nextCircleOption2.radius = 0;//0 is used to check if valid option
        }

        if(context && this.nextCircleOption1 && this.nextCircleOption2){
            /*
            context.beginPath();
            context.strokeStyle = "#FF0000";
            context.lineWidth = 1;
            context.moveTo(radiusLine.pointA.x, radiusLine.pointA.y);
            context.lineTo(radiusLine.pointB.x, radiusLine.pointB.y);
            context.closePath();
            context.stroke();*/

            context.beginPath();
            context.strokeStyle = "#dd77cc";
            context.arc(this.nextCircleOption1.x, this.nextCircleOption1.y, this.nextCircleOption1.radius, 0, Sakri.MathUtil.PI2);
            context.closePath();
            context.stroke();

            context.beginPath();
            context.strokeStyle = "#ccbbff";
            context.arc(this.nextCircleOption2.x, this.nextCircleOption2.y, this.nextCircleOption2.radius, 0, Sakri.MathUtil.PI2);
            context.closePath();
            context.stroke();
        }
        if(!this.nextCircleOption1.radius && !this.nextCircleOption2.radius){
            throw new Error("NO CIRCLE CANDIDATES AVAILABLE?!");//obviously this should never happen. If it does then I have some bug huntin' to do
        }
        if(!this.nextCircleOption1.radius){
            return this.nextCircleOption2;
        }
        if(!this.nextCircleOption2.radius){
            return this.nextCircleOption1;
        }
        return this.nextCircleOption1.radius>this.nextCircleOption2.radius ? this.nextCircleOption1 : this.nextCircleOption2;//bigger one
        //return Math.random()>.5 ? this.nextCircleOption1 : this.nextCircleOption2;//either one
    }

    Sakri.LargestCircleInBoundsForRadiusFinder.prototype.findLargestFittingCircleForRadian = function(bounds, radiusLine, radian, context){
        //console.log("findLargestFittingCircleAndUpdate() ", bounds.toString(), radiusLine.toString(), radian);
        var point = radiusLine.pointB;//pointB is travelling particle, pointA is the current center Point

        //HORIZONTAL AND VERTICAL CASES
        switch(radian){
            //horizontal
            case 0:
                this.candidateCircleA.x = point.x + (bounds.getRight() - point.x)/2;
                this.candidateCircleA.y = point.y;
                this.candidateCircleA.radius = bounds.getRight() - this.candidateCircleA.x;
                return;
            case Math.PI:
                this.candidateCircleA.x = bounds.x + (point.x-bounds.x)/2;
                this.candidateCircleA.y = point.y;
                this.candidateCircleA.radius = this.candidateCircleA.x-bounds.x;
                return;
            //vertical
            case Sakri.MathUtil.HALF_PI:
                this.candidateCircleA.x = point.x;
                this.candidateCircleA.y = point.y + (bounds.getBottom() - point.y)/2;
                this.candidateCircleA.radius = bounds.getBottom() - this.candidateCircleA.y;
                return;
            case Sakri.MathUtil.PI_AND_HALF:
                this.candidateCircleA.x = point.x;
                this.candidateCircleA.y = bounds.y + (point.y-bounds.y)/2;
                this.candidateCircleA.radius = this.candidateCircleA.y - bounds.y;
                return;
        }

        //ALL OTHER ANGLES
        this.angleZone = Math.floor(radian / Sakri.MathUtil.HALF_PI);//all options can be calculated within 90° "zones"
        //console.log("\tthis.angleZone : ", this.angleZone);

        switch(this.angleZone){
            case 0:
                //Candidate from right wall
                this.vertexAngle = Math.PI - radian; //180 - radian
                this.baseAngle = (Math.PI - this.vertexAngle) / 2;//180 minus vertex angle divided by 2
                this.baseRadian = radian - this.baseAngle;
                this.candidateDiameter = (bounds.getRight() - point.x) / Math.cos(this.baseRadian);
                this.candidateCircleA.y = point.y + Math.sin(this.baseRadian) * this.candidateDiameter;
                this.candidateCircleA.x = radiusLine.getXatY(this.candidateCircleA.y);
                this.candidateCircleA.radius = Sakri.Geom.Point.distanceBetweenTwoPoints(point, this.candidateCircleA);//Circle extends point

                //Candidate from bottom wall
                this.vertexAngle = Sakri.MathUtil.HALF_PI + radian; //90 + radian
                this.baseAngle = (Math.PI - this.vertexAngle) / 2;//180 minus vertex angle divided by 2
                this.baseRadian = radian + this.baseAngle;
                this.candidateDiameter = (bounds.getBottom() - point.y) / Math.sin(this.baseRadian);
                this.candidateCircleB.x = point.x + Math.cos(this.baseRadian) * this.candidateDiameter;
                this.candidateCircleB.y = radiusLine.getYatX(this.candidateCircleB.x);
                this.candidateCircleB.radius = Sakri.Geom.Point.distanceBetweenTwoPoints(point, this.candidateCircleB);//Circle extends point
                break;
            case 1:
                //Candidate from left wall
                this.vertexAngle = radian;
                this.baseAngle = (Math.PI - this.vertexAngle) / 2;//180 minus vertex angle divided by 2
                this.baseRadian = radian + this.baseAngle;
                this.candidateDiameter = (bounds.x - point.x) / Math.cos(this.baseRadian);
                this.candidateCircleA.y = point.y + Math.sin(this.baseRadian) * this.candidateDiameter;
                this.candidateCircleA.x = radiusLine.getXatY(this.candidateCircleA.y);
                this.candidateCircleA.radius = Sakri.Geom.Point.distanceBetweenTwoPoints(point, this.candidateCircleA);//Circle extends point

                //Candidate from bottom wall
                this.vertexAngle = Math.PI-radian + Sakri.MathUtil.HALF_PI;
                this.baseAngle = (Math.PI - this.vertexAngle) / 2;//180 minus vertex angle divided by 2
                this.baseRadian = radian - this.baseAngle;
                this.candidateDiameter = (bounds.getBottom() - point.y) / Math.sin(this.baseRadian);
                this.candidateCircleB.x = point.x + Math.cos(this.baseRadian) * this.candidateDiameter;
                this.candidateCircleB.y = radiusLine.getYatX(this.candidateCircleB.x);
                this.candidateCircleB.radius = Sakri.Geom.Point.distanceBetweenTwoPoints(point, this.candidateCircleB);//Circle extends point
                break;
            case 2:
                //Candidate from left wall
                this.vertexAngle = Sakri.MathUtil.PI2 - radian;//360 - angle
                this.baseAngle = (Math.PI - this.vertexAngle) / 2;//180 minus vertex angle divided by 2
                this.baseRadian = radian - this.baseAngle;
                this.candidateDiameter = (bounds.x - point.x) / Math.cos(this.baseRadian);
                this.candidateCircleA.y = point.y + Math.sin(this.baseRadian) * this.candidateDiameter;
                this.candidateCircleA.x = radiusLine.getXatY(this.candidateCircleA.y);
                this.candidateCircleA.radius = Sakri.Geom.Point.distanceBetweenTwoPoints(point, this.candidateCircleA);//Circle extends point

                //Candidate from top wall
                this.vertexAngle = radian - Math.PI + Sakri.MathUtil.HALF_PI;
                this.baseAngle = (Math.PI - this.vertexAngle) / 2;//180 minus vertex angle divided by 2
                this.baseRadian = radian + this.baseAngle;
                this.candidateDiameter = (bounds.y - point.y) / Math.sin(this.baseRadian);
                this.candidateCircleB.x = point.x + Math.cos(this.baseRadian) * this.candidateDiameter;
                this.candidateCircleB.y = radiusLine.getYatX(this.candidateCircleB.x);
                this.candidateCircleB.radius = Sakri.Geom.Point.distanceBetweenTwoPoints(point, this.candidateCircleB);//Circle extends point
                break;
            case 3:
                //Candidate from right wall
                this.vertexAngle = Math.PI - (Sakri.MathUtil.PI2-radian);
                this.baseAngle = (Math.PI - this.vertexAngle) / 2;//180 minus vertex angle divided by 2
                this.baseRadian = radian + this.baseAngle;
                this.candidateDiameter = (bounds.getRight() - point.x) / Math.cos(this.baseRadian);
                this.candidateCircleA.y = point.y + Math.sin(this.baseRadian) * this.candidateDiameter;
                this.candidateCircleA.x = radiusLine.getXatY(this.candidateCircleA.y);
                this.candidateCircleA.radius = Sakri.Geom.Point.distanceBetweenTwoPoints(point, this.candidateCircleA);//Circle extends point

                //Candidate from top wall
                this.vertexAngle = Sakri.MathUtil.PI2 - radian + Sakri.MathUtil.HALF_PI;
                this.baseAngle = (Math.PI - this.vertexAngle) / 2;//180 minus vertex angle divided by 2
                this.baseRadian = radian - this.baseAngle;
                this.candidateDiameter = (bounds.y - point.y) / Math.sin(this.baseRadian);
                this.candidateCircleB.x = point.x + Math.cos(this.baseRadian) * this.candidateDiameter;
                this.candidateCircleB.y = radiusLine.getYatX(this.candidateCircleB.x);
                this.candidateCircleB.radius = Sakri.Geom.Point.distanceBetweenTwoPoints(point, this.candidateCircleB);//Circle extends point
                break;
        }

        /*
        if(context){

            context.beginPath();
            context.strokeStyle = "#FFFF00";
            context.lineWidth = 1;
            context.moveTo(radiusLine.pointA.x, radiusLine.pointA.y);
            context.lineTo(radiusLine.pointB.x, radiusLine.pointB.y);
            context.closePath();
            context.stroke();

            context.beginPath();
            context.strokeStyle = "#00FF00";
            context.arc(this.candidateCircleA.x, this.candidateCircleA.y, this.candidateCircleA.radius, 0, Sakri.MathUtil.PI2);
            context.closePath();
            context.stroke();

            context.beginPath();
            context.strokeStyle = "#FF00FF";
            context.arc(this.candidateCircleB.x, this.candidateCircleB.y, this.candidateCircleB.radius, 0, Sakri.MathUtil.PI2);
            context.closePath();
            context.stroke();
        }*/

        this.candidateCircleA.radius *= .95;//small margin to make sure the circle doesn't exceed borders
        this.candidateCircleB.radius *= .95;//small margin to make sure the circle doesn't exceed borders
        var containsA = Sakri.LargestCircleInBoundsForRadiusFinder.rectangleContainsCircle(bounds, this.candidateCircleA);
        var containsB = Sakri.LargestCircleInBoundsForRadiusFinder.rectangleContainsCircle(bounds, this.candidateCircleB);

        if(!containsA && !containsB){
            return null;
        }
        if(!containsA){
            return this.candidateCircleB;
        }
        if(!containsB){
            return this.candidateCircleA;
        }

        return this.candidateCircleA.radius > this.candidateCircleB.radius ? this.candidateCircleA : this.candidateCircleB;
    };

    Sakri.LargestCircleInBoundsForRadiusFinder.rectangleContainsCircle = function(rectangle, circle){
        //0°
        if(!rectangle.containsPoint(circle.x+circle.radius, circle.y)){
            return false;
        }
        //90°
        if(!rectangle.containsPoint(circle.x, circle.y+circle.radius)){
            return false;
        }
        //180°
        if(!rectangle.containsPoint(circle.x-circle.radius, circle.y)){
            return false;
        }
        //270°
        if(!rectangle.containsPoint(circle.x, circle.y-circle.radius)){
            return false;
        }
        return true;
    }


}(window));