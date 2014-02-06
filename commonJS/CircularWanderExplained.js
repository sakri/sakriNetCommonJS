/**
 * Created by sakri on 15-1-14.
 */

//has a dependency on MathUtil, Geom,

(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;


    //bounds is a Rectangle, startingPoint is a Point
    //TODO : speed should have some documentation? in pixels?
    Sakri.CircularWanderExp = function(bounds, speed, startingPoint, context ){
        this.minimumRadius = 10; //circles that particles travel along cannot be smaller than this
        this.minCircleRotation = Math.PI/3;//minimum number of radians that a particle travels along a circle before switching to a new one
        this.maxCircleRotation = Sakri.MathUtil.PI2;//max number of radians that a particle travels along a circle before switching to a new one
        this.updates = 0;//current number of "moves"
        this.bounds = bounds;
        this.speed = speed;
        this.currentCircle = new Sakri.Geom.Circle(startingPoint.x, startingPoint.y, 50);//TODO: random starting point ensuring circle is within bounds
        this.context = context;
        this.currentRadian = Math.random() * Sakri.MathUtil.PI2; // TODO: rename, not immediately clear what the purpose of this property is?
        this.position = new Sakri.Geom.Point(startingPoint.x, startingPoint.y);
        this.radiusLine = new Sakri.Geom.Line();//used for creating circles
        this.circleFinder = new Sakri.LargestCircleInBoundsForRadiusFinderExp();
        this.leftColor = "#FF0000";
        this.topColor = "#00FF00";
        this.rightColor = "#0000FF";
        this.bottomColor = "#00FFFF";
        this.createExplanationObjects();
        this.explanationObjectIndex = 0;
        this.setNextChangeTarget();
        this.updatesBeforeNextCircle = 80;
        this.startMovementAlongCircle();
    };

    Sakri.CircularWanderExp.prototype.createExplanationObjects = function(){
        this.nextCircleExp = new Sakri.Geom.Circle();
        this.nextCircleUseExp = new Sakri.Geom.Circle();
        this.explanationObjects = [];
        for(var i=0; i<4; i++){
            this.explanationObjects[i] = {circle:new Sakri.Geom.Circle()};
        }
    }

    Sakri.CircularWanderExp.prototype.startMovementAlongCircle = function(){
        var scope = this;
        this.moveIntervalId =  setInterval(function(){scope.update()}, 20);
    };

    Sakri.CircularWanderExp.prototype.stopMovementAlongCircle = function(){
        clearInterval(this.moveIntervalId);
    };


    Sakri.CircularWanderExp.prototype.setResumeTimeOut = function(){
        var scope = this;
        this.resumeTimeOutId =  setTimeout(function(){scope.startMovementAlongCircle()}, 100);
    };

    Sakri.CircularWanderExp.prototype.stopExplaining = function(){
        console.log("CircularWanderExp.stopExplaining()");
        clearInterval(this.moveIntervalId);
        clearTimeout(this.resumeTimeOutId);
        clearTimeout(this.renderExpObjTimeoutId);
    };

    Sakri.CircularWanderExp.prototype.update = function(){
        this.currentRadian += this.updateAngleIncrement;
        this.currentRadian = Sakri.MathUtil.constrainRadianTo2PI(this.currentRadian);
        this.position.x = this.currentCircle.x + Math.cos(this.currentRadian) * this.currentCircle.radius;
        this.position.y = this.currentCircle.y + Math.sin(this.currentRadian) * this.currentCircle.radius;
        if(this.shiftToCenter){
            this.currentCircle.radius.x += this.bounds.getCenterX() < this.position.x ? -2 : 2;
            this.currentCircle.radius.y += this.bounds.getCenterY() < this.position.y ? -2 : 2;
        }
        if(!this.bounds.containsPoint(this.position.x, this.position.y)){
            console.log("OUT OF BOUNDS!");
            this.stopExplaining();
            return;
        }
        this.updates++;

        this.context.clearRect(0,0,this.bounds.width, this.bounds.height);

        //render current circle
        this.context.lineWidth = 1;
        this.context.strokeStyle  = "#FFFF00";
        this.context.beginPath();
        this.context.arc(this.currentCircle.x, this.currentCircle.y, this.currentCircle.radius, 0, Sakri.MathUtil.PI2);
        this.context.closePath();
        this.context.stroke();

        this.renderCurrentPosition();

        if(this.updates >= this.updatesBeforeNextCircle){
            this.stopMovementAlongCircle();
            this.setNextCircle();
        }
    };

    Sakri.CircularWanderExp.prototype.renderCurrentPosition = function(){
        //render current position
        this.renderBorders();
        this.context.fillStyle = "#FF0000";
        this.context.beginPath();
        this.context.arc(this.position.x, this.position.y, 10, 0, Sakri.MathUtil.PI2);
        this.context.closePath();
        this.context.fill();
    }

    Sakri.CircularWanderExp.prototype.renderBorders = function(){
        this.renderTopBorder(1);
        this.renderRightBorder(1);
        this.renderBottomBorder(1);
        this.renderLeftBorder(1);
    }


    Sakri.CircularWanderExp.prototype.renderTopBorder = function(lineThickness){
        this.context.beginPath();
        this.context.strokeStyle = this.topColor;
        this.context.lineWidth = lineThickness;
        this.context.moveTo(this.bounds.x, this.bounds.y);
        this.context.lineTo(this.bounds.getRight(), this.bounds.y);
        this.context.closePath();
        this.context.stroke();
    }
    Sakri.CircularWanderExp.prototype.renderRightBorder = function(lineThickness){
        this.context.beginPath();
        this.context.strokeStyle = this.rightColor;
        this.context.lineWidth = lineThickness;
        this.context.moveTo(this.bounds.getRight(), this.bounds.y);
        this.context.lineTo(this.bounds.getRight(), this.bounds.getBottom());
        this.context.closePath();
        this.context.stroke();
    }
    Sakri.CircularWanderExp.prototype.renderBottomBorder = function(lineThickness){
        this.context.beginPath();
        this.context.strokeStyle = this.bottomColor;
        this.context.lineWidth = lineThickness;
        this.context.moveTo(this.bounds.getRight(), this.bounds.getBottom());
        this.context.lineTo(this.bounds.x, this.bounds.getBottom());
        this.context.closePath();
        this.context.stroke();
    }
    Sakri.CircularWanderExp.prototype.renderLeftBorder = function(lineThickness){
        this.context.beginPath();
        this.context.strokeStyle = this.leftColor;
        this.context.lineWidth = lineThickness;
        this.context.moveTo(this.bounds.x, this.bounds.getBottom());
        this.context.lineTo(this.bounds.x, this.bounds.y);
        this.context.closePath();
        this.context.stroke();
    }




    Sakri.CircularWanderExp.prototype.startExplanationRenders = function(){
        this.explanationObjectIndex = 0;
        this.renderNextExplanationObject();
    }

    Sakri.CircularWanderExp.prototype.renderNextExplanationObject = function(){
        if(this.explanationObjectIndex>=4){
            this.renderSelection1();
            return;
        }

        this.renderExplanationObject(this.explanationObjects[this.explanationObjectIndex]);
        var scope = this;
        this.renderExpObjTimeoutId = setTimeout(function(){scope.renderNextExplanationObject()}, 1000);
        this.explanationObjectIndex++;
    }
    Sakri.CircularWanderExp.prototype.renderSelection1 = function(){
        this.renderNextCircle();
    }

    Sakri.CircularWanderExp.prototype.setExplanationObject = function(vertexAngle, baseAngle, baseRadian, candidateDiameter, circle, radian, line, color){
        this.explanationObjects[this.explanationObjectIndex].circle.update(circle.x, circle.y, circle.radius);
        this.explanationObjects[this.explanationObjectIndex].vertexAngle = vertexAngle;
        this.explanationObjects[this.explanationObjectIndex].baseAngle = baseAngle;
        this.explanationObjects[this.explanationObjectIndex].baseRadian = baseRadian;
        this.explanationObjects[this.explanationObjectIndex].candidateDiameter = candidateDiameter;
        this.explanationObjects[this.explanationObjectIndex].radian = radian;
        this.explanationObjects[this.explanationObjectIndex].line = line;
        this.explanationObjects[this.explanationObjectIndex].color = color;
        this.explanationObjectIndex++;
    }

    Sakri.CircularWanderExp.prototype.renderExplanationObject = function(expObj){
        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.strokeStyle = expObj.color;
        this.context.arc(expObj.circle.x, expObj.circle.y, expObj.circle.radius, 0, Sakri.MathUtil.PI2);
        this.context.closePath();
        this.context.stroke();

        switch(expObj.color) {
            case this.topColor:
                this.renderTopBorder(8);
                break;
            case this.rightColor:
                this.renderRightBorder(8);
                break;
            case this.bottomColor:
                this.renderBottomBorder(8);
                break;
            case this.leftColor:
                this.renderLeftBorder(8);
                break;
        }

        this.context.beginPath();
        this.context.strokeStyle = "#FFFF00";
        this.context.lineWidth = 3;
        this.context.moveTo(expObj.line.pointA.x, expObj.line.pointA.y);
        this.context.lineTo(expObj.line.pointB.x, expObj.line.pointB.y);
        this.context.closePath();
        this.context.stroke();

        this.context.beginPath();
        this.context.strokeStyle = expObj.color;
        this.context.lineWidth = 1;
        this.context.moveTo(expObj.line.pointA.x, expObj.line.pointA.y);
        this.context.lineTo(expObj.line.pointB.x, expObj.line.pointB.y);
        this.context.lineTo(expObj.line.pointB.x + Math.cos(expObj.baseRadian) * expObj.candidateDiameter, expObj.line.pointB.y + Math.sin(expObj.baseRadian) * expObj.candidateDiameter);
        this.context.lineTo(expObj.circle.x, expObj.circle.y);
        this.context.closePath();
        this.context.stroke();

        this.renderCurrentPosition();
    }

    Sakri.CircularWanderExp.prototype.renderNextCircle = function(){
        for(var i = 0; i<4; i++){
            var expObj = this.explanationObjects[i];
            if(expObj.circle.equals(this.nextCircleExp)){
                this.context.beginPath();
                this.context.fillStyle =  expObj.color;
                this.context.arc(expObj.circle.x, expObj.circle.y, expObj.circle.radius, 0, Sakri.MathUtil.PI2);
                this.context.closePath();
                this.context.globalAlpha = .2;
                this.context.fill();
                this.context.globalAlpha = 1;
                break;
            }
        }

        var scope = this;
        this.renderExpObjTimeoutId = setTimeout(function(){scope.renderNextUseCircle()}, 1000);

        this.renderCurrentPosition();
    }

    Sakri.CircularWanderExp.prototype.renderNextUseCircle = function(){
        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.fillStyle = "#FFFFFF";
        this.context.strokeStyle = "#FFFF00";
        this.context.arc(this.nextCircleUseExp.x, this.nextCircleUseExp.y, this.nextCircleUseExp.radius, 0, Sakri.MathUtil.PI2);
        this.context.closePath();
        this.context.globalAlpha = .9;
        this.context.fill();
        this.context.globalAlpha = 1;
        this.context.stroke();
        var scope = this;
        this.renderExpObjTimeoutId = setTimeout(function(){scope.startMovementAlongCircle()}, 1000);

        this.renderCurrentPosition();
    }




    Sakri.CircularWanderExp.prototype.setNextCircle = function(){

        this.explanationObjectIndex = 0;

        this.radiusLine.pointA.update(this.currentCircle.x, this.currentCircle.y);
        this.radiusLine.pointB.update(this.position.x, this.position.y);
        this.radiusLine.updateLineProperties();

        var nextCircle = this.circleFinder.findLargestFittingCircle(this.bounds, this.radiusLine, this.currentRadian, this.context, this);

        //if the radius is too small, just keep rotating until an option big enough becomes available
        if(nextCircle.radius < this.minimumRadius){
            console.log("small radius");
            this.updatesBeforeNextCircle = 10;
            this.shiftToCenter = true;
            this.updates = 0;
            this.startMovementAlongCircle();
            return;
        }

        this.shiftToCenter = false;

         if(!nextCircle.containsPoint(this.currentCircle) && !this.currentCircle.containsPoint(nextCircle)){
            //console.log("switch speed : ", this.speed);
            this.speed *= -1;
            this.currentRadian -= Math.PI;
            this.currentRadian = Sakri.MathUtil.constrainRadianTo2PI(this.currentRadian);
         }

        this.nextCircleExp.update(nextCircle.x, nextCircle.y, nextCircle.radius);

        nextCircle.radius = Sakri.MathUtil.getRandomNumberInRange(this.minimumRadius, nextCircle.radius);
        //var angle = Math.atan2( this.position.y - nextCircle.y, this.position.x - nextCircle.x );
        var angle = Math.atan2( nextCircle.y-this.position.y, nextCircle.x - this.position.x );
        nextCircle.x = this.position.x + Math.cos(angle)*nextCircle.radius;
        nextCircle.y = this.position.y + Math.sin(angle)*nextCircle.radius;

        this.currentCircle.update(nextCircle.x, nextCircle.y, nextCircle.radius);
        this.nextCircleUseExp.update(nextCircle.x, nextCircle.y, nextCircle.radius);

        this.setNextChangeTarget();

        this.startExplanationRenders();
    };

    //TODO : this needs to be revisited... calculations seem a bit half baked...
    Sakri.CircularWanderExp.prototype.setNextChangeTarget = function(){
        var circumference = Math.PI * (this.currentCircle.radius * 2);
        var moveDistance = Sakri.MathUtil.getRandomNumberInRange(this.minCircleRotation, this.maxCircleRotation);
        var totalDist = (moveDistance / Sakri.MathUtil.PI2) * circumference;
        this.updatesBeforeNextCircle = Math.ceil(totalDist / Math.abs(this.speed));//number of moves before switching circles, TODO rename
        this.updateAngleIncrement = (moveDistance / this.updatesBeforeNextCircle) * (this.speed > 0 ? 1 : -1);
        this.updates = 0;
        //console.log("CircularWanderExp.setNextChangeTarget" , circumference, moveDistance, totalDist, this.updatesBeforeNextCircle, this.updateAngleIncrement);
    };

    //=============================================================================
    //=========================::AND NOW, SHOWING MY TRUE COLORS::=================
    //======================::IN THE ANCIENT ART OF CLASS NAMING,::================
    //==================================::I PRESENT::==============================
    //=============================================================================
    //===================::LARGEST CIRCLE IN BOUNDS FOR RADIUS FINDER::============
    //=============================================================================


    Sakri.LargestCircleInBoundsForRadiusFinderExp = function(){
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

    Sakri.LargestCircleInBoundsForRadiusFinderExp.prototype.findLargestFittingCircle = function(bounds, radiusLine, radian, context, wander){
        var nextCircle = this.findLargestFittingCircleForRadian(bounds, radiusLine, radian, context, wander);
        if(nextCircle){
            this.nextCircleOption1.update(nextCircle.x, nextCircle.y, nextCircle.radius);
        }else{
            this.nextCircleOption1.radius = 0;//0 is used to check if valid option TODO: change, not immediately clear why this is done
        }

        nextCircle = this.findLargestFittingCircleForRadian(bounds, radiusLine, Sakri.MathUtil.constrainRadianTo2PI(radian-Math.PI), context, wander);
        if(nextCircle){
            this.nextCircleOption2.update(nextCircle.x, nextCircle.y, nextCircle.radius);
        }else{
            this.nextCircleOption2.radius = 0;//0 is used to check if valid option
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

    Sakri.LargestCircleInBoundsForRadiusFinderExp.prototype.findLargestFittingCircleForRadian = function(bounds, radiusLine, radian, context, wander){
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
                wander.setExplanationObject(this.vertexAngle, this.baseAngle, this.baseRadian, this.candidateDiameter, this.candidateCircleA, radian, radiusLine, wander.rightColor);

                //Candidate from bottom wall
                this.vertexAngle = Sakri.MathUtil.HALF_PI + radian; //90 + radian
                this.baseAngle = (Math.PI - this.vertexAngle) / 2;//180 minus vertex angle divided by 2
                this.baseRadian = radian + this.baseAngle;
                this.candidateDiameter = (bounds.getBottom() - point.y) / Math.sin(this.baseRadian);
                this.candidateCircleB.x = point.x + Math.cos(this.baseRadian) * this.candidateDiameter;
                this.candidateCircleB.y = radiusLine.getYatX(this.candidateCircleB.x);
                this.candidateCircleB.radius = Sakri.Geom.Point.distanceBetweenTwoPoints(point, this.candidateCircleB);//Circle extends point
                wander.setExplanationObject(this.vertexAngle, this.baseAngle, this.baseRadian, this.candidateDiameter, this.candidateCircleB, radian, radiusLine, wander.bottomColor);
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
                wander.setExplanationObject(this.vertexAngle, this.baseAngle, this.baseRadian, this.candidateDiameter, this.candidateCircleA, radian, radiusLine, wander.leftColor);

                //Candidate from bottom wall
                this.vertexAngle = Math.PI-radian + Sakri.MathUtil.HALF_PI;
                this.baseAngle = (Math.PI - this.vertexAngle) / 2;//180 minus vertex angle divided by 2
                this.baseRadian = radian - this.baseAngle;
                this.candidateDiameter = (bounds.getBottom() - point.y) / Math.sin(this.baseRadian);
                this.candidateCircleB.x = point.x + Math.cos(this.baseRadian) * this.candidateDiameter;
                this.candidateCircleB.y = radiusLine.getYatX(this.candidateCircleB.x);
                this.candidateCircleB.radius = Sakri.Geom.Point.distanceBetweenTwoPoints(point, this.candidateCircleB);//Circle extends point
                wander.setExplanationObject(this.vertexAngle, this.baseAngle, this.baseRadian, this.candidateDiameter, this.candidateCircleB, radian, radiusLine, wander.bottomColor);
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
                wander.setExplanationObject(this.vertexAngle, this.baseAngle, this.baseRadian, this.candidateDiameter, this.candidateCircleA, radian, radiusLine, wander.leftColor);

                //Candidate from top wall
                this.vertexAngle = radian - Math.PI + Sakri.MathUtil.HALF_PI;
                this.baseAngle = (Math.PI - this.vertexAngle) / 2;//180 minus vertex angle divided by 2
                this.baseRadian = radian + this.baseAngle;
                this.candidateDiameter = (bounds.y - point.y) / Math.sin(this.baseRadian);
                this.candidateCircleB.x = point.x + Math.cos(this.baseRadian) * this.candidateDiameter;
                this.candidateCircleB.y = radiusLine.getYatX(this.candidateCircleB.x);
                this.candidateCircleB.radius = Sakri.Geom.Point.distanceBetweenTwoPoints(point, this.candidateCircleB);//Circle extends point
                wander.setExplanationObject(this.vertexAngle, this.baseAngle, this.baseRadian, this.candidateDiameter, this.candidateCircleB, radian, radiusLine, wander.topColor);
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
                wander.setExplanationObject(this.vertexAngle, this.baseAngle, this.baseRadian, this.candidateDiameter, this.candidateCircleA, radian, radiusLine, wander.rightColor);

                //Candidate from top wall
                this.vertexAngle = Sakri.MathUtil.PI2 - radian + Sakri.MathUtil.HALF_PI;
                this.baseAngle = (Math.PI - this.vertexAngle) / 2;//180 minus vertex angle divided by 2
                this.baseRadian = radian - this.baseAngle;
                this.candidateDiameter = (bounds.y - point.y) / Math.sin(this.baseRadian);
                this.candidateCircleB.x = point.x + Math.cos(this.baseRadian) * this.candidateDiameter;
                this.candidateCircleB.y = radiusLine.getYatX(this.candidateCircleB.x);
                this.candidateCircleB.radius = Sakri.Geom.Point.distanceBetweenTwoPoints(point, this.candidateCircleB);//Circle extends point
                wander.setExplanationObject(this.vertexAngle, this.baseAngle, this.baseRadian, this.candidateDiameter, this.candidateCircleB, radian, radiusLine, wander.topColor);
                break;
        }

        this.candidateCircleA.radius *= .95;//small margin to make sure the circle doesn't exceed borders
        this.candidateCircleB.radius *= .95;//small margin to make sure the circle doesn't exceed borders
        var containsA = Sakri.LargestCircleInBoundsForRadiusFinderExp.rectangleContainsCircle(bounds, this.candidateCircleA);
        var containsB = Sakri.LargestCircleInBoundsForRadiusFinderExp.rectangleContainsCircle(bounds, this.candidateCircleB);

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

    Sakri.LargestCircleInBoundsForRadiusFinderExp.rectangleContainsCircle = function(rectangle, circle){
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