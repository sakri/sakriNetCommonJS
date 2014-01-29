/**
 * Created by sakri on 27-1-14.
 */
(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;

    Sakri.CanvasTextUtil = {};


    //this method renders text into a canvas, then resizes the image by shrinkPercent
    //loops through the non transparent pixels of the resized image and returns those as an array
    //fontProperties should be an object of type Sakri.CanvasTextProperties
    Sakri.CanvasTextUtil.createTextParticles = function(text, shrinkPercent, fontProps){
        var renderCanvas = document.createElement('canvas');
        var renderContext = renderCanvas.getContext('2d');

        var fontString = fontProperties.getFontString();
        //console.log(fontString);
        renderContext.font = fontString;
        renderContext.textBaseline = "top";
        //console.log(renderContext.measureText(text).width);
        renderCanvas.width = renderContext.measureText(text).width;
        renderCanvas.height = fontProps.fontSize + 10;//TODO : Need to implement getFirstNonTransparentPixel()

        //after a resize of a canvas, we have to reset these properties
        renderContext.font =  fontString;
        renderContext.textBaseline = "top";
        //console.log(renderCanvas.width, renderCanvas.height);
        renderContext.fillStyle = "#FF0000";
        renderContext.fillText(text, 0, 0);

        var shrunkenCanvas = document.createElement('canvas');
        shrunkenCanvas.width = Math.round(renderCanvas.width*shrinkPercent);
        shrunkenCanvas.height = Math.round(renderCanvas.height*shrinkPercent);
        var shrunkenContext = shrunkenCanvas.getContext('2d');
        shrunkenContext.drawImage(renderCanvas, 0, 0, shrunkenCanvas.width , shrunkenCanvas.height  );

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
        delete renderCanvas;
        delete shrunkenCanvas;
        return particles;
    };


    Sakri.CanvasTextUtil.createImagesFromString = function(string, fillStyle, strokeStyle, strokeWidth, fontProps){
        var fontString = fontProps.getFontString();
        var characters = string.split("");
        var images = [];
        var canvas, context, image, metrics, i,character;
        canvas = document.createElement("canvas");

        for(i=0; i<characters.length; i++){
            character = characters[i];

            context = canvas.getContext("2d");
            context.textBaseline = "top";
            context.font = fontString;
            metrics = context.measureText(character);
            canvas.width = metrics.width;
            canvas.height = fontProps.fontSize;// TODO : use getFirstNonTransparentPixel for dynamic sizing

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
