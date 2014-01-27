/**
 * Created by sakri on 27-1-14.
 */
(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;

    Sakri.BitmapUtil = {};

    Sakri.BitmapUtil.getFirstNonTransparentPixel = function(image, direction){
        //returns a point
    };


    //TODO : move to a textUtil or so
    Sakri.BitmapUtil.createValidFontProperties = function(fontWeight, fontStyle, fontSize, fontFace){

        var fontProperites = {};

        switch (fontWeight){
            case "normal":
            case "bold":
            case "bolder":
            case "lighter":
                fontProperites.fontWeight = fontWeight;
                break;
            default:
                fontProperites.fontWeight = "normal";
        }

        switch (fontStyle){
            case "normal":
            case "italic":
            case "oblique":
                fontProperites.fontStyle = fontStyle;
                break;
            default:
                fontProperites.fontStyle = "normal";
        }

        if(fontSize && fontSize.indexOf && fontSize.indexOf("px")>-1){
            var size = fontSize.split("px")[0];
            fontProperites.fontSize = isNaN(size) ? 24 : size;//24 is just an arbitrary number
        }else{
            fontProperites.fontSize = isNaN(fontSize) ? 24 : fontSize;//24 is just an arbitrary number
        }

        fontProperites.fontFace = fontFace ? fontFace : "sans-serif";

        //console.log("BitmapUtil.createValidFontProperties()", fontProperites.fontWeight, fontProperites.fontStyle, fontProperites.fontSize, fontProperites.fontFace);

        return fontProperites;
    };


    //this method renders text into a canvas, then resizes the image by shrinkPercent
    //loops through the non transparent pixels of the resized image and returns those as an array
    Sakri.BitmapUtil.createTextParticles = function(text, shrinkPercent, fontSize, fontFace, fontWeight, fontStyle){
        var fontProps = Sakri.BitmapUtil.createValidFontProperties(fontWeight, fontStyle, fontSize, fontFace);
        var renderCanvas = document.createElement('canvas');
        var renderContext = renderCanvas.getContext('2d');

        //renderContext.font = "normal normal 120px sans-serif";
        var fontString = fontProps.fontWeight + " " + fontProps.fontStyle + " " + fontProps.fontSize + "px " + fontProps.fontFace;
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
        for(i = 0; i < data.length; i += 8) {
            if(data[i]>200){
                x = ((i/4)%shrunkenCanvas.width)/shrinkPercent;
                y = Math.floor((i/4)/shrunkenCanvas.width)/shrinkPercent;
                particles.push(new Sakri.Geom.Point(x, y));
            }
        }
        console.log("particles.length : ",particles.length);
        delete renderCanvas;
        delete shrunkenCanvas;
        return particles;
    };


    Sakri.BitmapUtil.createImagesFromString = function(string, fillStyle, fontSize, fontFace, fontWeight, fontStyle){
        var fontProps = Sakri.BitmapUtil.createValidFontProperties(fontWeight, fontStyle, fontSize, fontFace);
        var fontString = fontProps.fontWeight + " " + fontProps.fontStyle + " " + fontProps.fontSize + "px " + fontProps.fontFace;
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
            canvas.height = fontSize;//hardcoded, TODO : use getFirstNonTransparentPixel for dynamic sizing

            //these properties have to be set twice as they vanish after setting a canvas width and height
            context = canvas.getContext("2d");
            context.textBaseline = "top";
            context.font = fontString;
            context.fillStyle = fillStyle;

            image = new Image();
            image.width = canvas.width;
            image.height = canvas.height;

            context.fillStyle = fillStyle;
            context.fillText (character,0, 0);

            image.src = canvas.toDataURL();
            images[i] = image;
        }
        delete canvas;
        return images;
    };


}(window));
