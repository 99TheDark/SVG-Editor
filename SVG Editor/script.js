var mouseX;
var mouseY;
var mouseDown = false;
var nodes = [];
var size = 100;
var mouseShapeOffsetX;
var mouseShapeOffsetY;
var selectedShape = undefined;

var distance = function(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

var getElementData = function(e){
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

var updateNodes = function(){
    var totalShapes = document.getElementById("svg").children.length;
    
    for(let i = 0; i < nodes.length; i++){
        var curNode = document.getElementById("nodes").children[i];
        if(distance(mouseX, mouseY, nodes[i].x, nodes[i].y) <= 9){
            curNode.setAttribute("r", 6);
            curNode.setAttribute("stroke-width", 3);
        } else {
            curNode.setAttribute("r", 4);
            curNode.setAttribute("stroke-width", 2);
        }
    }
    //Make it stay visible if selecting one of the nodes
    for(let i = 0; i < totalShapes; i++){
        var curShape = document.getElementById("svg-id" + (i + 1));
        var curShapeNodes = shapeNodes(curShape);
        if(mouseInShape(curShape) && !mouseDown){
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
    nodes.push({x: nodeX, y: nodeY});

    var shapeNum = document.getElementById("svg").children.length + 1;
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
    obj.setAttribute("id", "svg-id" + (document.getElementById("svg").children.length + 1).toString());
    
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
    document.getElementById("svg").appendChild(obj);
}

var updateShapePositions = function(){
    if(mouseDown && selectedShape !== undefined){
        if(selectedShape.nodeName === "rect"){
            selectedShape.setAttribute("x", mouseX + mouseShapeOffsetX);
            selectedShape.setAttribute("y", mouseY + mouseShapeOffsetY);
            for(let i = 0; i < shapeNodes(selectedShape).length; i++){
                shapeNodes(selectedShape)[i].setAttribute("cx", mouseX + mouseShapeOffsetX);
                shapeNodes(selectedShape)[i].setAttribute("cy", mouseY + mouseShapeOffsetY);
            }
            
            var curNode = shapeNodes(selectedShape)[1];
            curNode.setAttribute("cx", getElementData(curNode).cx + getElementData(selectedShape).width);
            var curNode = shapeNodes(selectedShape)[2];
            curNode.setAttribute("cy", getElementData(curNode).cy + getElementData(selectedShape).height);
            var curNode = shapeNodes(selectedShape)[3];
            curNode.setAttribute("cx", getElementData(curNode).cx + getElementData(selectedShape).width);
            curNode.setAttribute("cy", getElementData(curNode).cy + getElementData(selectedShape).height);
        }
        if(selectedShape.nodeName === "ellipse"){
            selectedShape.setAttribute("cx", mouseX + mouseShapeOffsetX);
            selectedShape.setAttribute("cy", mouseY + mouseShapeOffsetY);
            for(let i = 0; i < shapeNodes(selectedShape).length; i++){
                shapeNodes(selectedShape)[i].setAttribute("cx", mouseX + mouseShapeOffsetX);
                shapeNodes(selectedShape)[i].setAttribute("cy", mouseY + mouseShapeOffsetY);
            }

            var curNode = shapeNodes(selectedShape)[0];
            curNode.setAttribute("cx", getElementData(curNode).cx - getElementData(selectedShape).rx);
            var curNode = shapeNodes(selectedShape)[1];
            curNode.setAttribute("cx", getElementData(curNode).cx + getElementData(selectedShape).rx);
            var curNode = shapeNodes(selectedShape)[2];
            curNode.setAttribute("cy", getElementData(curNode).cy - getElementData(selectedShape).ry);
            var curNode = shapeNodes(selectedShape)[3];
            curNode.setAttribute("cy", getElementData(curNode).cy + getElementData(selectedShape).ry);
        }
    }
}

document.onmousemove = function(){
    mouseX = event.offsetX;
    mouseY = event.offsetY;
    //console.log("(" + mouseX + ", " + mouseY + ")");
    updateNodes();
    updateShapePositions();
}

document.onmousedown = function(){
    mouseDown = true;
    for(let i = document.getElementById("svg").children.length; i > 0; i--){
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
}

document.onmouseup = function(){
    mouseDown = false;
    selectedShape = undefined;
}

window.onkeypress = function(e){
    var key;
    if (window.event){
        key = String.fromCharCode(e.keyCode);
    } else if (e.which){
        key = String.fromCharCode(e.which);
    }

    //console.log(key);
    if (key === "r"){
        createObject("rect");
    }
    if (key === "c"){
        createObject("ellipse");
    }
}

var download = function(){
    var svg = document.getElementById("svg");
    var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.outerHTML.toString());
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "no-name.svg";
    downloadLink.click();

    //Base64 image link
    /*
    var svgWindow = window.open(url);
    svgWindow.document.write("<iframe src=\"" + url + "\" frameborder=\"0\" style=\"border: 0px; inset=0px; width: 100%; height: 100%;\" allowfullscreen></iframe>");
    */
}