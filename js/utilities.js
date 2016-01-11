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
};

function getOtherEndOfWire(componentID, interfaceID, selectedProject){
	var returnValue = false;

	if (componentID.indexOf('host') == 0){ //is an attachment wire
		var interfaceObject = {
			component: componentID,
			ifc: "interface-1"
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

function defineSvgSize(interfaceGroupCoordinates, cursorX, cursorY){
	var svgExtents = {
		width: 0,
		height: 0
	}

	var leftArray = [];
	var topArray = [];

	for(var component in interfaceGroupCoordinates) {
		var thisComponentInterfaceGroups = interfaceGroupCoordinates[component].interfaceGroups;
		
		
		for(var group in thisComponentInterfaceGroups) {
			var thisGroup = thisComponentInterfaceGroups[group];
			leftArray.push(thisGroup.left);
			topArray.push(thisGroup.top);
		}
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