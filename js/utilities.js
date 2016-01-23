function guid() {
  return randomStringOf4() + randomStringOf4() + '-' + randomStringOf4() + '-' + randomStringOf4() + '-' +
    randomStringOf4() + '-' + randomStringOf4() + randomStringOf4() + randomStringOf4();
}

function ioid() {
  return randomStringOf4();
}

function randomStringOf4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function getHSL(hue, isDarker){
	var lightness = "55%";
	if (isDarker){
		lightness = "45%"
	}
	return "hsl(" + hue + ", 70%," + lightness + ")"
}

function isExistingWire(thisEndpoint, wiresObject){
	for (var wire in wiresObject) {
		var endpoint1 = wiresObject[wire]["endpoint-1"];
		var endpoint2 = wiresObject[wire]["endpoint-2"];
		
		if (_.isEqual(thisEndpoint, endpoint1) || _.isEqual(thisEndpoint, endpoint2)){
			return true;
		}
	}
}

function convertToGroup(componentID, interfaceID, selectedProjectView){
	if (componentID.indexOf('host') == 0){ //is an attachment wire
		return "interface-1"
	}
	else {
		var thisGroupData = selectedProjectView[componentID].groups;
		for (var group in thisGroupData) {
			var interfaceArray = Object.keys(thisGroupData[group]);
			if (interfaceArray.indexOf(interfaceID) > -1){
				return group
			}		
		}
	}		
}

function getInterfaceCoords (data, ifc){
	var returnValue = {};
	_.forEach(data.interfaceTokens, function(thisToken) {
		if (ifc){
			if (thisToken.id == ifc){
				returnValue = {
					x: thisToken.left,
					y: thisToken.top
				}
			}
		}
		else {
			returnValue = {
				x: thisToken.left,
				y: thisToken.top
			}
		}
	})
	return returnValue
}

function sortTokenArrays(tokenArrays){
	for (var tokenArray in tokenArrays) {
		thisTokenArray = tokenArrays[tokenArray];
		thisTokenArray.sort(function (x, y) {
		    var n = x.protocol.localeCompare(y.protocol);
		    if (n !== 0) {
		        return n;
		    }
		    return x.mode.localeCompare(y.mode);
		});
	}
	return tokenArrays
}

function positionTokens(component, ifcProps){
	var pitch = ifcProps.width + ifcProps.margin;
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

function getFaceString(firstObject, secondObject){
	//console.log(vector.y / vector.x, refVector);
	var refAngle = firstObject.height / firstObject.width;
	var vector = {
		x: (secondObject.left + (0.5 * secondObject.width)) - (firstObject.left + (0.5 * firstObject.width)),
		y: (secondObject.top + (0.5 * secondObject.height)) - (firstObject.top + (0.5 * firstObject.height)),
	}

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

function getOtherEndOfWire(componentID, interfaceID, selectedProject){
	var returnValue = false;

	if (componentID.indexOf('host') == 0){ //is an attachment wire
		var interfaceObject = {
			component: componentID
		};
	}

	else {
		//var refInterfaceID = Object.keys(selectedProject.view[componentID].groups[interfaceGroupID])[0];
		var interfaceObject = {
			component: componentID,
			ifc: interfaceID
		};
	}
	
	var wiresObject = selectedProject.topology.wires;
	for (var wire in wiresObject){
		var endpoint1 = wiresObject[wire][0];
		var endpoint2 = wiresObject[wire][1];

		if (_.isEqual(interfaceObject, endpoint1)){
			returnValue = endpoint2
			break;
		}

		if (_.isEqual(interfaceObject, endpoint2)){
			returnValue = endpoint1
			break;
		}
	}

	return returnValue
}

function defineSvgSize(componentsObject, cursorX, cursorY){
	var svgExtents = {
		width: 0,
		height: 0
	}

	var leftArray = [];
	var topArray = [];

	for(var component in componentsObject) {
		var componentInterfaceTokens = componentsObject[component].interfaceTokens;
		
		_.forEach(componentInterfaceTokens, function(thisToken, index) {
			leftArray.push(thisToken.left);
			topArray.push(thisToken.top);
		})
	}

	leftArray.push(cursorX);
	topArray.push(cursorY);

	svgExtents.width = Math.max.apply(Math, leftArray);
	svgExtents.height = Math.max.apply(Math, topArray);

	// Add a bit extra
	svgExtents.width += 30;
	svgExtents.height += 30;

	return svgExtents
}