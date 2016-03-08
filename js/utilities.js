var headerHeight = 40;
var minPolicyDim = 40;


function getInterfaceArray(policy, components, hostComponents){
	var policyLeft = policy.left;
	var policyRight = policyLeft + policy.width;
	var policyTop = policy.top;
	var policyBottom = policyTop + policy.height

	var interfaceArray = [];

	_.forEach(components, function(componentObject, componentID){
		var interfaces = componentObject.interfaces;
		_.forEach(interfaces, function(interfaceObject, interfaceID){
			var thisInterfaceLeft = interfaceObject.left;
			var thisInterfaceTop = interfaceObject.top;
			if (_.inRange(thisInterfaceLeft, policyLeft, policyRight) && _.inRange(thisInterfaceTop, policyTop, policyBottom)){
				interfaceArray.push({"id": componentID, "ifc": interfaceID})
			}
		})
	})

	_.forEach(hostComponents, function(hostComponentObject, hostComponentID){
		var thisInterfaceLeft = hostComponentObject.ifcLeft;
		var thisInterfaceTop = hostComponentObject.ifcTop;
		if (_.inRange(thisInterfaceLeft, policyLeft, policyRight) && _.inRange(thisInterfaceTop, policyTop, policyBottom)){
			interfaceArray.push({"id": hostComponentID, "ifc": false})
		}
	})
	return interfaceArray
}

function guid() {
  return randomStringOf4() + randomStringOf4() + '-' + randomStringOf4() + '-' + randomStringOf4() + '-' +
    randomStringOf4() + '-' + randomStringOf4() + randomStringOf4() + randomStringOf4();
}

function ioid() {
  return new Date().getTime() + "-" + randomStringOf4();
}

function randomStringOf4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function getHSL(hue, modification, opacity){
	var lightness = "50%";
	var thisOpacity = opacity || 1;
	if (modification == "darker"){
		lightness = "40%"
	}
	if (modification == "lighter"){
		lightness = "65%"
	}
	return "hsla(" + hue + ", 70%," + lightness + ", " + thisOpacity + ")"
}

function checkTypeValidity(protocol1, mode1, protocol2, mode2){
	var isValid = false;
	
	if (protocol1 != protocol2){
		isValid = false
	}
	else {
		if (mode1 == "bi" || mode2 == "bi"){
			isValid = true
		}
		else if (mode1 == "in" && mode2 == "out" || mode1 == "out" && mode2 == "in"){
			isValid = true
		}
		else {
			isValid = false
		}
	}
	return isValid
}


function sortTokenArrays(tokenArrays){
	_.forEach(tokenArrays, function(tokenArray){
		tokenArray.sort(function (tokenA, tokenB) {
			if(!tokenA.wireTo || !tokenB.wireTo){
				var l = 0
			}
			else if (tokenA.face == "left" || tokenA.face == "right"){
				var delta = tokenA.wireTo.vector.y - tokenB.wireTo.vector.y;
				var l;
				if (delta < 0){l = -1}
				else if (delta > 0){l = 1}
				else {l = 0}
			}
			else if (tokenA.face == "top" || tokenA.face == "bottom") {
				var delta = tokenA.wireTo.vector.x - tokenB.wireTo.vector.x;
				var l;
				if (delta < 0){l = -1}
				else if (delta > 0){l = 1}
				else {l = 0}
			}

			if (l !== 0){
				return l
			}
			else {
			    var n = tokenA.protocol.localeCompare(tokenB.protocol);
			    if (n !== 0) {
			        return n;
			    }
			    else {
			    	var p = tokenA.mode.localeCompare(tokenB.mode);
			    	if (tokenB.face == "right" || tokenB.face == "bottom"){
			    		p = -p //reverse order
			    	}
			    	return p;
			    }
			}
		});
	})	
	return tokenArrays
}

function positionTokens(component, ifcProps){
	var pitch = ifcProps.pitch;
	var tokenArrays = component.tokenArrays;
	for (var tokenArray in tokenArrays) {
		thisTokenArray = tokenArrays[tokenArray];
		var faceCenter = {};
		var isHorizontal = true;
		var startPoint = ((thisTokenArray.length - 1) * pitch * -1) / 2;
		if (tokenArray == "top"){
			faceCenter.x = component.left + (component.width / 2);
			faceCenter.y = component.top;
		}
		if (tokenArray == "right"){
			faceCenter.x = component.left + component.width;
			faceCenter.y = component.top + (component.height / 2);
			isHorizontal = false;
		}
		if (tokenArray == "bottom"){
			faceCenter.x = component.left + (component.width / 2);
			faceCenter.y = component.top + component.height;
		}
		if (tokenArray == "left"){
			faceCenter.x = component.left;
			faceCenter.y = component.top + (component.height / 2);
			isHorizontal = false;
		}

		_.forEach(thisTokenArray, function(thisToken, i) {
			var nudgeFromCenter = startPoint + (i * pitch);
			if (isHorizontal){
				thisToken["left"] = faceCenter.x + nudgeFromCenter;
				thisToken["top"] = faceCenter.y;
			}
			else {
				thisToken["left"] = faceCenter.x;
				thisToken["top"] = faceCenter.y + nudgeFromCenter;
			}
		})			
	}
}

function getVector(firstObject, secondObject){
	var vector = {
		x: (secondObject.left + (0.5 * secondObject.width)) - (firstObject.left + (0.5 * firstObject.width)),
		y: (secondObject.top + (0.5 * secondObject.height)) - (firstObject.top + (0.5 * firstObject.height)),
	}
	return vector
}

function getFaceString(firstObject, secondObject){
	var refAngle = firstObject.height / firstObject.width;
	var vector = getVector(firstObject, secondObject);

	var interfaceSide = "";

	if ((vector.x * refAngle) <= vector.y){
		if ((vector.x * -refAngle) < vector.y){
			interfaceSide = "bottom";
		}
		else {
			interfaceSide = "left";
		}
	}
	else {
		if ((vector.x * -refAngle) > vector.y){
			interfaceSide = "top";
		}
		else {
			interfaceSide = "right";
		}
	}
	return interfaceSide
}

function getTokenForOtherEnd(startToken, componentData, hostComponentData){
	var startComponent = startToken.wireTo.component;
	var startInterface = startToken.wireTo.ifc;
	if (startInterface){
		var endToken = componentData[startComponent].interfaces[startInterface];
	}
	else {
		var endToken = hostComponentData[startComponent];
	}
	
	return endToken
}

function defineSvgSize(componentData, hostComponentData, instrumentData, cursorX, cursorY){
	var svgExtents = {
		width: 0,
		height: 0
	}

	var leftArray = [];
	var topArray = [];

	for(var component in componentData) {
		var componentInterfaces = componentData[component].interfaces;		
		_.forEach(componentInterfaces, function(thisInterface) {
			leftArray.push(thisInterface.left);
			topArray.push(thisInterface.top);
		})

		var otherInterfaces = componentData[component].ioCapability;		
		_.forEach(otherInterfaces, function(thisInterface) {
			leftArray.push(thisInterface.left || 0);
			topArray.push(thisInterface.top || 0);
		})
	}

	for(var hostComponent in hostComponentData) {
		var thisComponent = hostComponentData[hostComponent];
		leftArray.push(thisComponent.ifcLeft);
		topArray.push(thisComponent.ifcTop);
	}

	_.forEach(instrumentData, function(instrument){
		//center of instrument will do because if a wire exists,
		//it is connected to an interface and already covered.
		leftArray.push(instrument.left);
		topArray.push(instrument.top);
	});

	leftArray.push(cursorX);
	topArray.push(cursorY);

	svgExtents.width = Math.max.apply(Math, leftArray);
	svgExtents.height = Math.max.apply(Math, topArray);

	// Add a bit extra
	svgExtents.width += 30;
	svgExtents.height += 30;

	return svgExtents
}