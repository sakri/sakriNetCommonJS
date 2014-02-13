/**
 * Created by sakri on 27-1-14.
 * has a dependecy on Sakri.Geom
 * has a dependecy on Sakri.BitmapUtil
 */

(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;

    Sakri.CanvasTextUtil = {};

    Sakri.CanvasTextUtil.resizeCanvasToString = function(canvas, string, fontProps){
        var context = canvas.getContext('2d');

        context.font = fontProps.getFontString();
        context.textBaseline = "top";

        var textWidth = context.measureText(string).width;
        canvas.width = textWidth;
        canvas.height = fontProps.fontSize * 1.5;//normally descenders shouldn't go below this

        //after a resize of a canvas, we have to reset these properties
        context.font =  fontProps.getFontString();
        context.textBaseline = "top";
        context.fillStyle = "#FF0000";
        context.fillText(string, 0, 0);

        var textHeight = Sakri.BitmapUtil.getFirstNonTransparentPixelBottomUp(canvas).y;//this returns a point
        canvas.width = textWidth;
        canvas.height = textHeight;
    }

    //this method renders text into a canvas, then resizes the image by shrinkPercent
    //loops through the non transparent pixels of the resized image and returns those as an array
    //fontProperties should be an object of type Sakri.CanvasTextProperties
    Sakri.CanvasTextUtil.createTextParticles = function(text, shrinkPercent, fontProps){
        var canvas = document.createElement('canvas');
        Sakri.CanvasTextUtil.resizeCanvasToString(canvas, text, fontProps);
        var context = canvas.getContext('2d');

        //after a resize of a canvas, we have to reset these properties
        context.font =  fontProps.getFontString();;
        context.textBaseline = "top";
        context.fillStyle = "#FF0000";
        context.fillText(text, 0, 0);

        var shrunkenCanvas = document.createElement('canvas');
        shrunkenCanvas.width = Math.round(canvas.width * shrinkPercent);
        shrunkenCanvas.height = Math.round(canvas.height * shrinkPercent);
        var shrunkenContext = shrunkenCanvas.getContext('2d');
        shrunkenContext.drawImage(canvas, 0, 0, shrunkenCanvas.width , shrunkenCanvas.height  );

        var pixels = shrunkenContext.getImageData(0, 0, shrunkenCanvas.width, shrunkenCanvas.height);
        var data = pixels.data;
        var particles = [];
        var i, x, y;
        for(i = 0; i < data.length; i += 4) {
            if(data[i]>200){
                x = ((i/4)%shrunkenCanvas.width)/shrinkPercent;
                y = Math.floor((i/4)/shrunkenCanvas.width)/shrinkPercent;
                particles.push(new Sakri.Geom.Point(x, y));
            }
        }
        delete canvas;//not sure if necessary?!
        delete shrunkenCanvas;
        return particles;
    };


    Sakri.CanvasTextUtil.createImagesFromString = function(string, fillStyle, strokeStyle, strokeWidth, fontProps){
        var fontString = fontProps.getFontString();
        var characters = string.split("");
        var images = [];
        var context, image, metrics, i, character;
        var canvas = document.createElement("canvas");

        for(i=0; i<characters.length; i++){
            character = characters[i];

            Sakri.CanvasTextUtil.resizeCanvasToString(canvas, character, fontProps);
            context = canvas.getContext("2d");

            //these properties have to be set twice as they vanish after setting a canvas width and height
            context = canvas.getContext("2d");
            context.textBaseline = "top";
            context.font = fontString;

            image = new Image();
            image.width = canvas.width;
            image.height = canvas.height;

            if(fillStyle){
                context.fillStyle = fillStyle;
                context.fillText (character,0, 0);
            }
            if(strokeStyle){
                context.strokeStyle = strokeStyle;
                context.lineWidth = strokeWidth;
                context.strokeText(character, 0, 0);
            }

            image.src = canvas.toDataURL();
            images[i] = image;
        }
        delete canvas;
        return images;
    };


    //TODO: implement
    Sakri.CanvasTextUtil.fitTextIntoRect = function(string, fontProps, rect, canvas, fillStyle){
        if(!canvas){
            var canvas = document.createElement("canvas");
        }
        if(!fillStyle){
            fillStyle = "#000000";
        }
        var context = canvas.getContext('2d');
        context.font = fontProps.getFontString();
        context.textBaseline = "top";

        var fontSize = fontProps.fontSize;
        context.font = "bold "+fontSize+"px sans-serif";
        var width = context.measureText(string).width;
        if(width < context.width){
            while(context.measureText(string).width < rect.width && rect < bounds.height){
                fontSize++;
                context.font = "bold "+fontSize+"px sans-serif";
            }
        }else if(width > context.width){
            while(context.measureText(string).width > rect.width && rect > bounds.height){
                fontSize--;
                context.font = "bold "+fontSize+"px sans-serif";
            }
        }

        canvas.width = context.measureText(string).width;
        canvas.height = fontSize * 1.5;//1.5 should be enough to cover all descenders
        context.font = "bold "+fontSize+"px sans-serif";
        context.textBaseline = "top";
        context.fillStyle = fillStyle;
        context.fillText(string, 0,0);

        return Sakri.BitmapUtil.createTrimmedCanvas(canvas);

    }

    //=========================================================================================
    //==============::CANVAS TEXT PROPERTIES::====================================
    //========================================================

    Sakri.CanvasTextProperties = function(fontWeight, fontStyle, fontSize, fontFace){
        this.setFontWeight(fontWeight);
        this.setFontStyle(fontStyle);
        this.setFontSize(fontSize);
        this.fontFace = fontFace ? fontFace : "sans-serif";
    };

    Sakri.CanvasTextProperties.NORMAL = "normal";
    Sakri.CanvasTextProperties.BOLD = "bold";
    Sakri.CanvasTextProperties.BOLDER = "bolder";
    Sakri.CanvasTextProperties.LIGHTER = "lighter";

    Sakri.CanvasTextProperties.ITALIC = "italic";
    Sakri.CanvasTextProperties.OBLIQUE = "oblique";


    Sakri.CanvasTextProperties.prototype.setFontWeight = function(fontWeight){
        switch (fontWeight){
            case Sakri.CanvasTextProperties.NORMAL:
            case Sakri.CanvasTextProperties.BOLD:
            case Sakri.CanvasTextProperties.BOLDER:
            case Sakri.CanvasTextProperties.LIGHTER:
                this.fontWeight = fontWeight;
                break;
            default:
                this.fontWeight = Sakri.CanvasTextProperties.NORMAL;
        }
    };

    Sakri.CanvasTextProperties.prototype.setFontStyle = function(fontStyle){
        switch (fontStyle){
            case Sakri.CanvasTextProperties.NORMAL:
            case Sakri.CanvasTextProperties.ITALIC:
            case Sakri.CanvasTextProperties.OBLIQUE:
                this.fontStyle = fontStyle;
                break;
            default:
                this.fontStyle = Sakri.CanvasTextProperties.NORMAL;
        }
    };

    Sakri.CanvasTextProperties.prototype.setFontSize = function(fontSize){
        if(fontSize && fontSize.indexOf && fontSize.indexOf("px")>-1){
            var size = fontSize.split("px")[0];
            fontProperites.fontSize = isNaN(size) ? 24 : size;//24 is just an arbitrary number
            return;
        }
        this.fontSize = isNaN(fontSize) ? 24 : fontSize;//24 is just an arbitrary number
    };

    Sakri.CanvasTextProperties.prototype.getFontString = function(){
        return this.fontWeight + " " + this.fontStyle + " " + this.fontSize + "px " + this.fontFace;
    };

}(window));