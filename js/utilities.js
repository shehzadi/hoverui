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

function getFaceString(vector, refVector){
	//console.log(vector.y / vector.x, refVector);
	var refMultiplier = refVector;
	var interfaceSide = "";

	if ((vector.x * refMultiplier) <= vector.y){
		if ((vector.x * -refMultiplier) < vector.y){
			interfaceSide = "bottom";
		}
		else {
			interfaceSide = "left";
		}
	}

	else {
		if ((vector.x * -refMultiplier) > vector.y){
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