/**
 * Created by sakri on 2-2-14.
 */
(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;

    Sakri.MathUtil = {};


    //==================================================
    //======================::VERLET POINT::============
    //==================================================


    // VerletPoint extends Sakri.Geom.Point
    // constraint must be of type Sakri.Geom.Rectangle
   Sakri.VerletPoint = function(x, y, constraint) {
        //instanceof
        //console.log("Sakri.VerletPoint constructor ",x,y,constraint.toString());
        this.constraint = constraint;
        this.oldPoint = new Sakri.Geom.Point(x, y);
        this.tempPoint = new Sakri.Geom.Point();
        this.constraint = constraint;
        Sakri.Geom.Point.call(this, x, y); //call super constructor.
    };

    //subclass extends superclass
   Sakri.VerletPoint.prototype = Object.create(Sakri.Geom.Point.prototype);
   Sakri.VerletPoint.prototype.constructor = Sakri.Geom.Point;


   Sakri.VerletPoint.prototype.update = function(){
        this.tempPoint.x = this.x;
        this.tempPoint.y = this.y;
        this.x += (this.x - this.oldPoint.x);
        this.y += (this.y - this.oldPoint.y);
        this.oldPoint.x = this.tempPoint.x;
        this.oldPoint.y = this.tempPoint.y;
        this.constrain();
    };

   Sakri.VerletPoint.prototype.getMoveDistance = function(){
        return Math.max( Math.abs(this.x - this.oldPoint.x), Math.abs(this.y - this.oldPoint.y) );
    };

   Sakri.VerletPoint.prototype.constrain = function(){
        if(!this.constraint.containsPoint(this)){
            if(this.x < this.constraint.x)this.x = this.constraint.x;
            if(this.x > this.constraint.getRight())this.x = this.constraint.getRight();
            if(this.y < this.constraint.y)this.y = this.constraint.y;
            if(this.y > this.constraint.getBottom())this.y = this.constraint.getBottom();
        }
    };

   Sakri.VerletPoint.prototype.applyForce = function(x, y){
        this.x += x;
        this.y += y;
    };

   Sakri.VerletPoint.prototype.toString = function(){
        return "VerletPoint{x:" + this.x + " , y:" + this.y + "}";
    };

    //==================================================
    //======================::VERLET STICK::============
    //==================================================


    //a and b must be of type :VerletPoint instanceof
   Sakri.VerletStick = function(a, b){
        this.a = a;
        this.b = b;
        this.restLength = Sakri.Geom.Point.distanceBetweenTwoPoints(this.a, this.b);
        this.dampen = 0.1;//seems this can't be much bigger than .2
    };

   Sakri.VerletStick.prototype.update = function(){
        //console.log("VerletStick.update");
        this.a.update();
        this.b.update();
        this.xdelta = this.a.x - this.b.x;
        this.ydelta = this.a.y - this.b.y;
        var stickLength = Sakri.Geom.Point.distanceBetweenTwoPoints(this.a, this.b);
        var diff = (stickLength - this.restLength) / stickLength;
        var product = this.xdelta * this.dampen * diff;
        this.a.x -= product;
        this.b.x += product;
        product = this.ydelta * this.dampen * diff;
        this.a.y -= product;
        this.b.y += product;
        //console.log("\t",this.a.toString(),this.b.toString());
        //return Math.max(this.a.getMoveDistance(),this.b.getMoveDistance());
    };

   Sakri.VerletStick.prototype.applyForce = function(x, y){
        //console.log("VerletStick.applyForce",x,y);
        this.a.applyForce(x, y);
        this.b.applyForce(x, y);
    };

   Sakri.VerletStick.prototype.applyForceToEnd = function(x,y){
        this.pointB.applyForce(x, y);
    };

   Sakri.VerletStick.prototype.equals = function(stick){
        if(this.a.equals(stick.pointA)){
            return this.b.equals(stick.pointB);
        }
        if(this.b.equals(stick.pointA)){
            return this.a.equals(stick.pointB);
        }
        return false;
    };

   Sakri.VerletStick.prototype.renderToContext = function(context2d){
        context2d.moveTo(this.a.x, this.a.y);
        context2d.lineTo(this.b.x, this.b.y);
    };

   Sakri.VerletStick.prototype.toString = function(){
        return "VerletStick{a:"+this.a+" , b:"+this.b+"}";
    };


    //==================================================
    //======================::VERLET STAGE::============
    //==================================================


    // arena must be of typeSakri.Geom.Rectangle
   Sakri.VerletStage = function(context2d, arena, updateItems, autoStart, renderGraphics) {
        //instanceof
        //console.log("Sakri.Verlet.VerletStage constructor ");
        this.gravity = .01;
        this.context2d = context2d;
        this.arena = arena;
        this.updateItems = updateItems;
        this.running = false;
        this.renderGraphics = renderGraphics;
        //if(autoStart == true)this.start();
    };

   Sakri.VerletStage.prototype.update = function(){
       //console.log("Sakri.VerletStage.prototype.update" , this.renderGraphics);
        if(this.renderGraphics){
            this.updateAndRender();
            return;
        }
        for(var i = 0; i<this.updateItems.length; i++){
            this.updateItems[i].applyForce(0, this.gravity);
            this.updateItems[i].update();
        }
    };

   Sakri.VerletStage.prototype.updateAndRender = function(){
        //this.context2d.fillStyle = "#aaaaaa";
        //this.context2d.fillRect(this.arena.x,this.arena.y,this.arena.width,this.arena.height);
        this.context2d.strokeStyle = "#FF0000";
        this.context2d.beginPath();
        for(var i = 0; i<this.updateItems.length; i++){
            this.updateItems[i].applyForce(0, this.gravity);
            this.updateItems[i].update();
            this.updateItems[i].renderToContext(this.context2d);
        }
        this.context2d.stroke();
        this.context2d.closePath();
    };

   Sakri.VerletStage.prototype.start = function(){
        //console.log("VerletStage.start()");
        if(this.running){
            return;
        }
        this.gameLoop();
        this.running = true;
    };

   Sakri.VerletStage.prototype.gameLoop = function() {
        //console.log("Sakri.Verlet.VerletStage.gameLoop() ");
        var scope = this;
        window.setTimeout(function(){scope.gameLoop();}, 20);
        this.update();
    };

   Sakri.VerletStage.prototype.stop = function(){
        this.running = false;
    };


    //==================================================
    //======================::VERLET GRID::============
    //==================================================


   Sakri.VerletGrid = function(width,height,rows,columns,constrain){
        if(!rows || !columns){
            throw new Error("VerletSquare Error : a square cannot have 0 rows or columns");
        }
        this.gridWidth = width;
        this.gridHeight = height;
        //one cell is considered as a row or column
        this.rows = rows + 1;
        this.columns = columns + 1;
        this.constrain = constrain;
        this.lockedPoint = null;
        this.createVerletPoints();
        this.connectVerletSticks();
    };

   Sakri.VerletGrid.prototype.createVerletPoints = function(){
        var rect = new Sakri.Geom.Rectangle(0, 0, this.gridWidth / (this.columns - 1), this.gridHeight / (this.rows - 1) );
        var total = this.rows * this.columns;
        this.points = [];
        for(var i = 0;i<total;i++){
            this.points[i] = new Sakri.VerletPoint( (i % this.columns) * rect.width,Math.floor(i / this.columns) * rect.height , this.constrain);
            //trace(points[i],i,i/rows,Math.floor(i/rows),Math.floor(i/columns)*rect.height);
        }
    };

   Sakri.VerletGrid.prototype.connectVerletSticks = function(){
        this.sticks = [];
        this.connectHorizontalVerletSticks();
        this.connectVerticalVerletSticks();
        this.connectDiagonalVerletSticks();
    };

   Sakri.VerletGrid.prototype.connectHorizontalVerletSticks = function(){
        var total = this.points.length;
        var stick, pointB, i;
        var pointA = this.points[0];
        for(i = 1; i<total; i++){
            pointB = this.points[i];
            if(i % this.columns>0){
                this.sticks.push(new Sakri.VerletStick(pointA, pointB));
            }
            pointA = pointB;
        }
    };

   Sakri.VerletGrid.prototype.connectVerticalVerletSticks = function(){
        var total = this.points.length - this.columns;
        var stick, pointA, pointB, i;
        for(i = 0; i < total; i++){
            pointA = this.points[i];
            pointB = this.points[i + this.columns];
            this.sticks.push(new Sakri.VerletStick(pointA, pointB));
        }
    };

   Sakri.VerletGrid.prototype.connectDiagonalVerletSticks = function(){
        var total = this.points.length-this.columns;
        var stick, pointA, pointB, i;
        var skip = this.columns - 1;
        for(i = 0; i<total ;i++){
            if(i % this.columns == skip){
                continue;
            }
            pointA = this.points[i];
            pointB = this.points[i+ this.columns + 1];
            this.sticks.push(new Sakri.VerletStick(pointA, pointB));
        }
    };

}(window));
