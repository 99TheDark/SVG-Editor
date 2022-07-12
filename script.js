var mouseX, mouseY;
var mouseDown = false;
var size = 100;
var mouseShapeOffsetX, mouseShapeOffsetY;
var selectedShape = undefined;
var selectedNode = undefined;
var svg = document.getElementById("svg");

var key = {};
updateKeys = function(e){
    e = e || event;
    key[e.key.toLowerCase()] = e.type == "keydown";
}

var distance = function(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

var getElementData = function(e){ //getProperty but converts to numbers, includes everything making it compact
    var shapeData = {};
    for(let i = 0; i < e.attributes.length; i++){
        var curAttribute = e.attributes[i];

        if(isNaN(curAttribute.nodeValue)){
            shapeData[curAttribute.nodeName] = curAttribute.nodeValue;
        } else {
            shapeData[curAttribute.nodeName] = Number(curAttribute.nodeValue);
        }
    }
    return shapeData;
}

var shapeNodes = function(e){
    var shapeNum = e.id.replace("svg-id", "");
    var nodesChildren = document.getElementById("nodes").children;
    var allNodes = [];
    for(let i = 0; i < nodesChildren.length; i++){
        if(nodesChildren[i].id.includes("svg-id" + shapeNum)){
            allNodes.push(nodesChildren[i]);
        }
    }
    return allNodes;
}

var nodeShape = function(e){
    var shapeNum = e.id.replace("svg-id", "").split("-node")[0];
    return document.getElementById("svg-id" + shapeNum);
}

var mouseInShape = function(e){
    var inShape = false;
    var shape = getElementData(e);
    if(e.nodeName === "rect" && mouseX <= shape.x + shape.width && mouseX >= shape.x && mouseY <= shape.y + shape.height && mouseY >= shape.y){
        inShape = true;
    } else if(e.nodeName === "ellipse" && Math.pow(mouseX - shape.cx, 2)/Math.pow(shape.rx, 2) + Math.pow(mouseY - shape.cy, 2)/Math.pow(shape.ry, 2) <= 1){
        inShape = true;
    }
    return inShape;
}

var updateNodePositions = function(shape, centerX, centerY){
    if(centerX === undefined || centerY === undefined){
        centerX = shape.getAttribute("x");
        centerY = shape.getAttribute("y");
    }
    for(let i = 0; i < shapeNodes(shape).length; i++){
        shapeNodes(shape)[i].setAttribute("cx", centerX);
        shapeNodes(shape)[i].setAttribute("cy", centerY);
    }
    if(shape.nodeName === "rect"){
        var curNode = shapeNodes(shape)[1];
        curNode.setAttribute("cx", getElementData(curNode).cx + getElementData(shape).width);
        var curNode = shapeNodes(shape)[2];
        curNode.setAttribute("cy", getElementData(curNode).cy + getElementData(shape).height);
        var curNode = shapeNodes(shape)[3];
        curNode.setAttribute("cx", getElementData(curNode).cx + getElementData(shape).width);
        curNode.setAttribute("cy", getElementData(curNode).cy + getElementData(shape).height);
    }
    if(shape.nodeName === "ellipse"){
        var curNode = shapeNodes(shape)[0];
        curNode.setAttribute("cx", getElementData(curNode).cx - getElementData(shape).rx);
        var curNode = shapeNodes(shape)[1];
        curNode.setAttribute("cx", getElementData(curNode).cx + getElementData(shape).rx);
        var curNode = shapeNodes(shape)[2];
        curNode.setAttribute("cy", getElementData(curNode).cy - getElementData(shape).ry);
        var curNode = shapeNodes(shape)[3];
        curNode.setAttribute("cy", getElementData(curNode).cy + getElementData(shape).ry);
    }
}

var updateNodes = function(){
    var totalShapes = svg.children.length;
    
    var nodes = document.getElementById("nodes").children;
    var mouseInNodeShapeIndex = undefined;
    for(let i = 0; i < nodes.length; i++){
        var curNode = document.getElementById("nodes").children[i];
        var inNode = distance(mouseX, mouseY, nodes[i].getAttribute("cx"), nodes[i].getAttribute("cy")) <= 10;
        if(inNode){
            curNode.setAttribute("r", 6);
            curNode.setAttribute("stroke-width", 3);
            mouseInNodeShapeIndex = Number(curNode.id.split("id")[1].split("-")[0]);
        } else {
            curNode.setAttribute("r", 4);
            curNode.setAttribute("stroke-width", 2);
        }
        if(mouseDown && inNode && (selectedShape === undefined || selectedNode !== undefined)){
            selectedNode = curNode;
            if(key.shift){
                //make it extra wide and move half that extra width towards 0, 0
            } else {
                curNode.setAttribute("x", mouseX);
                curNode.setAttribute("y", mouseY);
                var shape = nodeShape(curNode);
                var shapeData = getElementData(shape);
                var nodeData = getElementData(curNode);
                shape.setAttribute("width", Math.abs(nodeData.x - shapeData.x));
                shape.setAttribute("height", Math.abs(nodeData.y - shapeData.y));
                updateNodePositions(shape);
            }
        } else {
            selectedNode = undefined;
        }
    }

    for(let i = 0; i < totalShapes; i++){
        var curShape = document.getElementById("svg-id" + (i + 1));
        var curShapeNodes = shapeNodes(curShape);
        if((mouseInShape(curShape) || mouseInNodeShapeIndex === i + 1) && !mouseDown){
            for(let j = 0; j < curShapeNodes.length; j++){
                curShapeNodes[j].setAttribute("visibility", "visible");
            }
        } else {
            for(let j = 0; j < curShapeNodes.length; j++){
                curShapeNodes[j].setAttribute("visibility", "hidden");
            }
        }
    }
}

var addNode = function(x, y){
    var nodeX = mouseX + x;
    var nodeY = mouseY + y;

    var shapeNum = svg.children.length + 1;
    var nodesChildren = document.getElementById("nodes").children;
    var nodeNum = 1;
    for(let i = 0; i < nodesChildren.length; i++){
        if(nodesChildren[i].id.includes("svg-id" + shapeNum)){
            nodeNum++;
        }
    }
    var nodeObj = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    nodeObj.setAttribute("id", "svg-id" + shapeNum + "-node" + nodeNum);
    nodeObj.setAttribute("cx", nodeX);
    nodeObj.setAttribute("cy", nodeY);
    nodeObj.setAttribute("r", 4);
    nodeObj.setAttribute("stroke", "#b0cceb");
    nodeObj.setAttribute("stroke-width", "2");
    nodeObj.setAttribute("fill", "#ffffff");
    document.getElementById("nodes").appendChild(nodeObj);
}

var createObject = function (objectName){
    var obj = document.createElementNS("http://www.w3.org/2000/svg", objectName);
    obj.setAttribute("id", "svg-id" + (svg.children.length + 1).toString());
    
    if(objectName === "rect"){
        obj.setAttribute("x", mouseX - size/2);
        obj.setAttribute("y", mouseY - size/2);
        obj.setAttribute("width", size);
        obj.setAttribute("height", size);

        addNode(-size/2, -size/2);
        addNode(size/2, -size/2);
        addNode(-size/2, size/2);
        addNode(size/2, size/2);
    }
    if(objectName === "ellipse"){
        obj.setAttribute("cx", mouseX);
        obj.setAttribute("cy", mouseY);
        obj.setAttribute("rx", size/2);
        obj.setAttribute("ry", size/2);

        addNode(-size/2, 0);
        addNode(size/2, 0);
        addNode(0, -size/2);
        addNode(0, size/2);
    }
    obj.setAttribute("fill", "#ff0000");
    svg.appendChild(obj);
}

var updateShapePositions = function(){
    if(mouseDown && selectedShape !== undefined){
        if(selectedShape.nodeName === "rect"){
            selectedShape.setAttribute("x", mouseX + mouseShapeOffsetX);
            selectedShape.setAttribute("y", mouseY + mouseShapeOffsetY);
        }
        if(selectedShape.nodeName === "ellipse"){
            selectedShape.setAttribute("cx", mouseX + mouseShapeOffsetX);
            selectedShape.setAttribute("cy", mouseY + mouseShapeOffsetY);
        }
        updateNodePositions(selectedShape, mouseX + mouseShapeOffsetX, mouseY + mouseShapeOffsetY);
    }
}

document.onmousemove = function(){
    mouseX = event.clientX;
    mouseY = event.clientY - parseInt(getComputedStyle(svg).top);
    //console.log("(" + mouseX + ", " + mouseY + ")");
    updateNodes();
    updateShapePositions();
}

document.onmousedown = function(){
    mouseDown = true;
    for(let i = svg.children.length; i > 0; i--){
        var curShape = document.getElementById("svg-id" + i);
        if(mouseInShape(curShape)){
            selectedShape = curShape;
            if(curShape.nodeName === "rect"){
                mouseShapeOffsetX = getElementData(curShape).x - mouseX;
                mouseShapeOffsetY = getElementData(curShape).y - mouseY;
            }
            if(curShape.nodeName === "ellipse"){
                mouseShapeOffsetX = getElementData(curShape).cx - mouseX;
                mouseShapeOffsetY = getElementData(curShape).cy - mouseY;
            }
            break;
        }
    }

    if(selectedShape !== undefined){
        document.body.style.userSelect = "none";
    } else {
        document.body.style.userSelect = "text";
    }
}

document.onmouseup = function(){
    mouseDown = false;
    selectedShape = undefined;
}

window.onkeypress = function(){
    console.log(key);
    if(mouseX !== undefined && mouseY !== undefined){
        if (key.r){
            createObject("rect");
        }
        if (key.c){
            createObject("ellipse");
        }
    }
}

window.onkeydown = function(){
    updateKeys();
}

window.onkeyup = function(){
    updateKeys();
}

var download = function(){
    var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.outerHTML.toString());
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "no-name.svg";
    downloadLink.click();

    //Base64 image link
    /*
    var svgWindow = window.open(url);
    svgWindow.document.write("<iframe src=\"" + url + "\" frameborder=\"0\" style=\"border: 0px; inset: 0px; width: 100%; height: 100%;\" allowfullscreen></iframe>");
    */
}
