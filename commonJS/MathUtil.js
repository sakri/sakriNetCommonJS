(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;
    
	Sakri.MathUtil = {};
	
	//used for radiansToDegrees and degreesToRadians
	Sakri.MathUtil.PI_180 = Math.PI/180;
	Sakri.MathUtil.ONE80_PI = 180/Math.PI;
	
	//precalculations for values of 90, 270 and 360 in radians
	Sakri.MathUtil.PI2 = Math.PI*2;
	Sakri.MathUtil.HALF_PI = Math.PI/2;
	Sakri.MathUtil.PI_AND_HALF = Math.PI+ Math.PI/2;
	Sakri.MathUtil.NEGATIVE_HALF_PI = -Math.PI/2;

    //keep degrees between 0 and 360
    Sakri.MathUtil.constrainDegreeTo360 = function(degree){
        return (360 + degree % 360) % 360;//hmmm... looks a bit weird?!
    };

    Sakri.MathUtil.constrainRadianTo2PI = function(rad){
        return (Sakri.MathUtil.PI2 + rad % Sakri.MathUtil.PI2) % Sakri.MathUtil.PI2;//equally so...
    };

    Sakri.MathUtil.radiansToDegrees = function(rad){
        return rad*Sakri.MathUtil.ONE80_PI;
    };

    Sakri.MathUtil.degreesToRadians = function(degree){
        return degree * Sakri.MathUtil.PI_180;
    };

	//return number between 1 and 0
	Sakri.MathUtil.normalize = function(value, minimum, maximum){
		return (value - minimum) / (maximum - minimum);
	};

	//map normalized number to values
	Sakri.MathUtil.interpolate = function(normValue, minimum, maximum){
		return minimum + (maximum - minimum) * normValue;
	};

	//map a value from one set to another
	Sakri.MathUtil.map = function(value, min1, max1, min2, max2){
		return Sakri.MathUtil.interpolate( Sakri.MathUtil.normalize(value, min1, max1), min2, max2);
	};




    Sakri.MathUtil.clamp = function(min,max,value){
        if(value < min){
            return min;
        }
        if(value > max){
            return max;
        }
        return value;
    };

    Sakri.MathUtil.clampRGB = function(value){
        return Sakri.MathUtil.clamp(0, 255, value);
    };

	Sakri.MathUtil.getRandomNumberInRange = function(min, max){
		return min + Math.random() * (max - min);
	};
	
	Sakri.MathUtil.getRandomIntegerInRange = function(min, max){
		return Math.round(Sakri.MathUtil.getRandomNumberInRange(min, max));
	};

    //Move to geom?
	Sakri.MathUtil.getCircumferenceOfEllipse = function(width,height){
		return ((Math.sqrt(.5 * ((width * width) + (height * height)))) * (Math.PI * 2)) / 2;
	};


    //from : http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    Sakri.MathUtil.rgbToHex = function(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    Sakri.MathUtil.hexToRgb = function(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

	
}(window));