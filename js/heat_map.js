/**
 * Created by wangchaowei on 2017/7/4.
 */

var heatMapDatas = [];
var nowTime = 9;

// 导入CSV文件，画出当前时间的柱状图
function drawHeatMapFromCSV() {
    var fileName = document.getElementById("filePath").value;
    var filePath = './csv/' + fileName;

    d3.csv(filePath, function(error, csvdata){
        if(error){
            alert("请输入正确的文件目录");
        }
        var indexCSV = 0;
        while (typeof csvdata[indexCSV] != "undefined"){
            var time = csvdata[indexCSV]["D"];
            var x = csvdata[indexCSV]["A"];
            var y = csvdata[indexCSV]["C"];
            var z = csvdata[indexCSV]["B"];
            for(var index=0; index < heatMapDatas.length; index += 1){
                if(heatMapDatas[index]["time"] == time){
                    heatMapDatas[index]["datas"].push([x, y, z]);
                    break;
                }
            }
            indexCSV += 1;
        }
        pressButton(nowTime);
    });

}

function pressButton(time){
    nowTime = time;
    buttonActive("button"+time);

    //清空现有的柱状图
    d3.selectAll(".heatMap").remove();
    d3.selectAll(".heatMapLabel").remove();

    //获取当前时间段的数据
    var datas = [];
    for(var index=0; index < heatMapDatas.length; index++){
        if (heatMapDatas[index]["time"] == nowTime){
            datas = heatMapDatas[index]["datas"];
            break;
        }
    }

    //画柱状图
    for(var index=0; index < datas.length; index++){
        drawHeatMap(datas[index][0], datas[index][1], datas[index][2]);
    }
}

function buttonActive(buttonId){
    d3.selectAll("button")
        .attr("class", "btn btn-default");
    d3.select("#"+buttonId)
        .attr("class", "btn btn-default active")
}

function getInput() {
    var x = document.getElementById('xInput').value;
    var y = document.getElementById('yInput').value;
    var z = document.getElementById('zInput').value;

    updataData(nowTime, x, y, z);
    drawHeatMap(x, y, z);
}

//更新已有的数据，如果不存在则添加，如果存在则更改
function updataData(time, x, y, z) {
    for(var index=0; index < heatMapDatas.length; index++){
        if (heatMapDatas[index]["time"] == nowTime){
            var datas = heatMapDatas[index]["datas"];
            for(var index2=0; index2<datas.length; index2++){
                if(datas[index2][0] == x && datas[index2][2] == z){

                    //清除之前的柱形图
                    d3.select("#x"+x+"z"+z+"box").remove();

                    //更新已有数据
                    heatMapDatas[index]["datas"][index2] = [x, y, z];
                    return null;
                }
            }
            //添加新数据
            heatMapDatas[index]["datas"].push([x, y, z]);
            break;
        }
    }
}

//鼠标放到柱形图上显示强度
function showIntensity(parent) {
    var translation = parent.getAttribute('translation');
    var data = translation.split(" ");
    var x = data[0];
    var y = data[1] * 800;
    var z = data[2];
    makeMark(x, y/400, z, y, "black", 0.4);
}

//鼠标移出柱形图时删除强度
function removeIntensity(parent) {
    var translation = parent.getAttribute('translation');
    var data = translation.split(" ");
    var x = data[0];
    var z = data[2];
    d3.select("#"+"x"+x+"z"+z+"intensity").remove();
}

function drawHeatMap(x, y, z) {
    if(y==0){
        d3.select("#x"+x+"z"+z+"mark").remove();
    }
    else {
        var scene = d3.select('scene');
        var rect = scene.append("transform")
            .attr("onmouseover", "showIntensity(this);")
            .attr("onmouseout", "removeIntensity(this)")
            .attr("id", "x"+x+"z"+z+"box")
            .attr("class", "heatMap");

        var heatMap = rect.append("shape");

        heatMap
            .append("appearance")
            .append("material")
            .attr("diffusecolor", coloring(y));
        heatMap
            .append("box");

        rect
            .attr("scale", "0.25 "+ 0 +" 0.25")
            .attr("translation", x + " " + y/800 + " " + z)
            .transition()
            .duration(2000)
            .ease("elastic")
            .attr("scale", "0.25 "+ y/800 +" 0.25")
            .attr("translation", x + " " + y/800 + " " + z);


        // 如果小雨300或者大于3000则在柱形图上标记个红叉
        if(y <= 300 || y > 3000){
            makeMark(x, y/400, z, "X");}
    }
}

function makeMark(x, y , z, mark, color, size) {
    var heatMapLabelShape = scene.append("transform")
        .attr("translation", function () {
            return x-0.25 + " " + (y+0.25) + " " + z
        })
        .attr("class", "heatMapLabel")
        .attr("id", mark=="X" ? "x"+x+"z"+z+"mark" : "x"+x+"z"+z+"intensity")
        .append("billboard")
        .attr("axisOfRotation", "0 0 0")
        .append("shape");
    heatMapLabelShape.append("appearance")
        .append("material")
        .attr("diffusecolor", color ? color : "#fb1d13")
    heatMapLabelShape.append("text")
        .attr("class", "heatMapLabelText")
        .attr("solid", "true")
        .attr("string", mark)
        .append("fontstyle")
        .attr("size", size ? size : 0.7)
        .attr("family", "SANS")
        .attr("justify", "END MIDDLE" )

}

function coloring(lux){
    var colors = [
        "#702200", // 0~300 3001~~~
        "#FFD1BD",
        "#FFBFA3",
        "#FFAD8A",
        "#FF9B70",
        "#FF8957",
        "#FF773D",
        "#FF6524",
        "#FF540A",
        "#fd3d2b",
        "#fb220e",
        "#f01400",
        "#c71100",
        "#8A2900",

    ];
    if(lux <= 300 || lux >= 3000){
        return colors[0];
    }
    return colors[parseInt(lux/193)];
}

function heatMap3d(parent) {
    var x3d = parent
        .append("x3d")
        .style( "width", parseInt(parent.style("width"))+"px" )
        .style( "height", parseInt(parent.style("height"))+"px" )
        .style( "border", "none" );

    var scene = x3d.append("scene");
    this.scene = scene;

    scene.append("orthoviewpoint")
        .attr( "centerOfRotation", [5, 5, 5])
        .attr( "fieldOfView", [-5, -5, 15, 15])
        .attr( "orientation", [-0.5, 1, 0.2, 1.12*Math.PI/4])
        .attr( "position", [15, 8, 10]);

    var rows = initializeDataGrid();
    var axisRange = [0, 20];
    var scales = [];
    var initialDuration = 2000;
    var axisKeys = ["x", "y", "z"];

    function initializeDataGrid() {
        var rows = [];
        // Follow the convention where y(x,z) is elevation.
        for (var x=-5; x<=5; x+=1) {
            for (var z=-5; z<=5; z+=1) {
                rows.push({x: x, y: 0, z: z});
            }
        }
        return rows;
    }

    function axisName( name, axisIndex ) {
        return ['x','y','z'][axisIndex] + name;
    }

    function constVecWithAxisValue( otherValue, axisValue, axisIndex ) {
        var result = [otherValue, otherValue, otherValue];
        result[axisIndex] = axisValue;
        return result;
    }

    // Used to make 2d elements visible 设定形状下的样式
    function makeSolid(selection, color) {
        selection.append("appearance")
            .append("material")
            .attr("diffuseColor", color||"black"); //样式颜色默认是黑色
        return selection;
    }

    // Initialize the axes lines and labels.
    function initializePlot() {
        initializeAxis(0);
        initializeAxis(1);
        initializeAxis(2);
    }

    function initializeAxis( axisIndex ) {
        var key = axisKeys[axisIndex];
        drawAxis( axisIndex, initialDuration );

        var scaleMin = axisRange[0];
        var scaleMax = axisRange[1];

        // the axis line
        var newAxisLine = scene.append("transform")
            .attr("class", axisName("Axis", axisIndex))
            // .attr("rotation", [0,1,0,-Math.PI/2])
            .attr("rotation", ([[0,0,0,0],[0,0,1,Math.PI/2],[0,1,0,-Math.PI/2]][axisIndex]))
            .append("shape");
        newAxisLine
            .append("appearance")
            .append("material")
            .attr("emissiveColor", "lightgray");
        newAxisLine
            .append("polyline2d")
            .attr("usegeocache", "false")
            .attr("lineSegments", "0 0,10 0");

        var newAxisLabel = scene.append("transform")
            .attr("class", axisName("AxisLabel", axisIndex))
            .attr("translation", constVecWithAxisValue( 0, axisIndex==1 ? 11 : 21, axisIndex ));

        var newAxisLabelShape = newAxisLabel
            .append("billboard")
            .attr("axisOfRotation", "0 0 0")
            .append("shape")
            .call(makeSolid);

        var labelFontSize = 0.6;

        newAxisLabelShape
            .append("text")
            .attr("class", axisName("AxisLabelText", axisIndex))
            .attr("solid", "true")
            .attr("string", key) //"x,y,z"
            .append("fontstyle")  //字体样式
            .attr("size", labelFontSize)
            .attr("family", "SANS")
            .attr("justify", "END MIDDLE" );

    }

    function drawAxis( axisIndex, duration ){
        var NUMTICKS = 20;
        var scale = d3.scale.linear()
            .domain( axisIndex==1 ? [0, 4000] : [0,NUMTICKS] )
            .range( axisIndex==1 ? [0,10] : axisRange );

        scales[axisIndex] = scale;

        var numTicks = NUMTICKS;
        var tickSize = 0.1;
        var tickFontSize = 0.5;

        var ticks = scene.selectAll( "."+axisName("Tick", axisIndex) )
            .data( scale.ticks( axisIndex==1 ? 8 : numTicks ));
        var newTicks = ticks.enter()
            .append("transform")
            .attr("class", axisName("Tick", axisIndex));
        newTicks.append("shape").call(makeSolid)
            .append("box")
            .attr("size", tickSize + " " + tickSize + " " + tickSize);
        //过渡效果
        ticks.transition().duration(duration)
            .attr("translation", function(tick) {
                return constVecWithAxisValue( 0, scale(tick), axisIndex ); });
        ticks.exit().remove();

        var tickLabels = ticks.selectAll("billboard shape text")
            .data(function(d) { return [d]; });
        var newTickLabels = tickLabels.enter()
            .append("billboard")
            .attr("axisOfRotation", "0 0 0")
            .append("shape")
            .call(makeSolid);
        newTickLabels.append("text")
            .attr("string", scale.tickFormat( axisIndex==1 ? 8 : NUMTICKS))
            .attr("solid", "true")
            .append("fontstyle")
            .attr("size", tickFontSize)
            .attr("family", "SANS")
            .attr("justify", "END MIDDLE" );
        tickLabels
            .attr("string", scale.tickFormat(axisIndex==1 ? 8 : NUMTICKS));
        tickLabels.exit().remove();

        if (axisIndex==0 || axisIndex==2) {

            var gridLines = scene.selectAll( "."+axisName("GridLine", axisIndex))
                .data(scale.ticks( numTicks ));
            gridLines.exit().remove();

            var newGridLines = gridLines.enter()
                .append("transform")
                .attr("class", axisName("GridLine", axisIndex))
                .attr("rotation", axisIndex==0 ? [0,1,0, -Math.PI/2] : [0,0,0,0]) //[x,y,z,angle]
                .append("shape");
            newGridLines.append("appearance")
                .append("material")
                .attr("emissiveColor", "gray");
            newGridLines.append("polyline2d"); //绘制的线条

            gridLines.selectAll("shape polyline2d").transition().duration(duration)
                .attr("lineSegments", "0 0, " + axisRange[1] + " 0");

            gridLines.transition().duration(duration)
                .attr("translation", axisIndex==0
                    ? function(d) { return scale(d) + " 0 0"; }
                    : function(d) { return "0 0 " + scale(d); }
                );
        }
        else {

            var gridLines = scene.selectAll( "."+axisName("GridLine", axisIndex))
                .data(scale.ticks( 1 ));
            gridLines.exit().remove();

            for(var yTick=500; yTick <= 4000; yTick+=500 ){
                // Z，Y面线
                var newGridLines = gridLines.enter()
                    .append("transform")
                    .attr("class", axisName("GridLine", axisIndex))
                    .attr("rotation", [0,0,0,0]) //[x,y,z,angle]
                    .append("shape");
                newGridLines.append("appearance")
                    .append("material")
                    .attr("emissiveColor", "gray");
                newGridLines.append("polyline2d"); //绘制的线条

                gridLines.selectAll("shape polyline2d").transition().duration(duration)
                    .attr("lineSegments", "0 0, " + axisRange[1] + " 0");

                gridLines.transition().duration(duration)
                    .attr("translation", "0 " + yTick/400 + " 0");

                // X，Y面线
                var newGridLines = gridLines.enter()
                    .append("transform")
                    .attr("class", axisName("GridLine", axisIndex))
                    .attr("rotation", [0,1,0,-Math.PI/2]) //[x,y,z,angle]
                    .append("shape");
                newGridLines.append("appearance")
                    .append("material")
                    .attr("emissiveColor", "gray");
                newGridLines.append("polyline2d"); //绘制的线条

                gridLines.selectAll("shape polyline2d").transition().duration(duration)
                    .attr("lineSegments", "0 0, " + axisRange[1] + " 0");

                gridLines.transition().duration(duration)
                    .attr("translation", "0 " + yTick/400 + " 0");
            }

            var newAxisLine = scene.append("transform")
                .attr("class", axisName("Axis", axisIndex))
                .attr("rotation", ([0,0,0,0]))
                .append("shape");
            newAxisLine
                .append("appearance")
                .append("material")
                .attr("emissiveColor", "lightgray");
            newAxisLine
                .append("polyline2d")
                .attr("usegeocache", "false")
                .attr("lineSegments", "20 10, 20 0");

            var newAxisLine = scene.append("transform")
                .attr("class", axisName("Axis", axisIndex))
                .attr("rotation", [0,1,0,-Math.PI/2])
                .append("shape");
            newAxisLine
                .append("appearance")
                .append("material")
                .attr("emissiveColor", "lightgray");
            newAxisLine
                .append("polyline2d")
                .attr("usegeocache", "false")
                .attr("lineSegments", "20 10, 20 0");
        }

    }
    
    function drawButton() {
        var timeRange = [9, 15];
        var buttonGruop = d3.select("#butoonGruop");
        for(var time=timeRange[0]; time <= timeRange[1]; time +=1 ){
            buttonGruop
                .append("button")
                .attr("type", "button")
                .attr("id", "button"+time)
                .attr("class", time==timeRange[0] ? "btn btn-default active" : "btn btn-default")
                .attr("onclick", "pressButton("+time+")")
                .text(time+":00");
        }
        initHeatMapDatas(timeRange);
    }

    function initHeatMapDatas(timeRange) {
        for(var time=timeRange[0]; time <= timeRange[1]; time += 1){
            heatMapDatas.push({"time": time, "datas":[]});
        }
    }
    initializePlot();
    drawButton();
}