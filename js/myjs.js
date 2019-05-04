var dimensions = [
    "Surface area (sq. km)",
    "Arable land (% of land area)",
    "Population density (people per sq. km of land area)",
    "Rural population","  Population- female (% of total)  ",
    "Population growth (annual %)","  Population- total  ",
    "  Labor force- total  ","  Labor force- female (% of total labor force)  ",
    "Armed forces personnel (% of total labor force)",
    "  Unemployment- total (% of total labor force) (modeled ILO estimate)  ",
    "  Unemployment- female (% of female labor force) (modeled ILO estimate)  ",
    "GDP growth (annual %)","GDP (current US$)",
    "GDP per capita growth (annual %)","GDP per capita (current US$)",
    "Internet users (per 100 people)"
];
var short=[
    "Surface area",
    "Arable land",
    "Population density",
    "Rural population","Population-female","Population growth","Population",
    "Labor force","Labor force-female","Armed forces",
    "Unemployment","Unemployment-female",
    "GDP growth","GDP","GDP per capita growth","GDP per capita",
    "Internet user"
];

function add_country(select) {
    $.getJSON("data/data.json",function (result) {
        var oldcountryname=" ";
        var data=new Array(0);
        var cnt=0;
        $.each(result,function (i,item) {
            if(i==0){
                oldcountryname=item.CountryName;
                data[cnt]= oldcountryname;
                cnt++;
            }
            else{
                if(oldcountryname!=item.CountryName){
                    oldcountryname=item.CountryName;
                    data[cnt]= oldcountryname;
                    cnt++;
                }
            }
        });
        for(var i=0;i<data.length;i++){
            if(i==0) $("#"+select).append("<option selected=selected value="+data[i]+">"+data[i]+"</option>");
            else $("#"+select).append("<option value="+data[i]+">"+data[i]+"</option>");
        }

    })
}
add_country("country");
function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.4, // ems
            y = text.attr("y"),
            x = text.attr("x"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

var list=new Array(9);

current_country_name="China", current_series_name="Internet users (per 100 people)", current_year="2011";

function DrawMap(seriesname,index){
    $.getJSON("data/data.json",function (result) {
        var div=document.getElementById("map");
        var oldsvgs=div.getElementsByTagName("svg");
        for(var i=oldsvgs.length-1;i>=0;i--){
            div.removeChild(oldsvgs[i]);
        }
        var oldtooltip=div.getElementsByClassName("tooltip");
        for(var i=oldtooltip.length-1;i>=0;i--){
            div.removeChild(oldtooltip[i]);
        }

        var p=document.getElementById("map_p");
        p.innerHTML=current_series_name+","+current_year;

        index=parseInt(index);

        index-=2006;
        var mydata={};
        var min=0,max=0;

        $.each(result,function (i,item) {

            list[0]=item.CountryName;
            list[1]=item.CountryCode;
            list[2]=item.SeriesName;
            list[3]=item.SeriesCode;
            list[4]=item._2010;
            list[5]=item._2011;
            list[6]=item._2012;
            list[7]=item._2013;
            list[8]=item._2014;

            if(seriesname==list[2] && list[index]!=".. " &&list[index]!=".."){
                mydata[list[0]]=list[index];
                if(i==0){
                    min=parseFloat(list[index]);
                    max=parseFloat(list[index]);
                }
                else{
                    var num=parseFloat(list[index]);
                    if(num>max) max=num;
                    if(num<min) min=num;
                }
            }
        });


        var margin = {top: 5, right: 5, bottom: 5, left: 5},
            width = 700 - margin.left - margin.right,
            height = 460 - margin.top - margin.bottom;

        var svg = d3.select("body")
            .select("#map")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        //document.write(min.toString()+" "+max.toString());
        var color1=d3.rgb(255,200,200);
        var color2=d3.rgb(255,50,50);
        var compute=d3.interpolate(color1,color2);
        var linear=d3.scaleLinear()
            .domain([min,max])
            .range([0,1]);

// Map and projection
        var projection = d3.geoNaturalEarth()
            .scale(width / 1.3 / Math.PI)
            .translate([width / 2, height / 2]);

// Load external data and boot
        d3.json("data/world.geojson", function (data) {

            var tooltip=svg
                .append("text")
                .attr("x",5)
                .attr("y",height-45)
                .attr("font-size",20)
                .attr("fill","black")
                .style("opacity", 0)
                .attr("class", "tooltip");
            // .style("background-color", "white")
            // .style("border", "solid")
            // .style("border-width", "1px")
            // .style("border-radius", "5px")
            // .style("padding", "10px");
            // Draw the map
            svg.append("g")
                .selectAll(".Mycountry")
                .data(data.features)
                .enter()
                .append("path")
                .attr("class","Mycountry")
                .attr("fill", function (d) {
                    var countryname=d.properties.name;
                    if(mydata.hasOwnProperty(countryname)){
                        if(mydata[countryname]==".. "||mydata[countryname]=="..")
                            return "lightgrey";
                        else return compute(linear(parseFloat(mydata[countryname])));
                    }

                    else
                        return "lightgrey";
                })
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .style("stroke", function (d,i) {
                    if(d.properties.name==current_country_name)
                        return "grey";
                    else return "white";
                })
                .style("stroke-opacity",function (d,i) {
                    if(d.properties.name==current_country_name)
                        return 1;
                    else return 1;
                })
                .style("stroke-width",function (d,i) {
                    if(d.properties.name==current_country_name)
                        return 3;
                    else return 1;
                })
                .style("opacity",1)
                .on("mouseover",function (d,i) {
                    //console.log(d.properties.name);
                    var countryname=d.properties.name;
                    var text="NAN";
                    if(mydata.hasOwnProperty(countryname)){
                        if(mydata[countryname]!=".. "&&mydata[countryname]!="..")
                            text=mydata[countryname].toString();
                    }
                    tooltip.text("Counrty:"+d.properties.name+"\tdata:"+text)
                        .style("opacity",1);
                    if(text=="NAN") return ;
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style("opacity",0.6);
                })
                .on("mouseout",function(d,i){
                    tooltip.style("opacity",0);
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("opacity",1);
                })
                .on("click",function (d,i) {
                    var countryname=d.properties.name;
                    current_country_name=countryname;
                    var text="NAN";
                    if(mydata.hasOwnProperty(countryname)){
                        if(mydata[countryname]!=".. "&&mydata[countryname]!="..")
                            text=mydata[countryname].toString();
                    }
                    tooltip.text("counrty name:"+d.properties.name+"\tdata:"+text)
                        .style("opacity",1);
                    if(text=="NAN") return ;
                    d3.selectAll(".Mycountry")
                        .style("stroke-width",function (dd,i) {
                            if(dd.properties.name==countryname)
                                return "3px";
                            else return "1px";
                        })
                        .style("stroke",function (dd,i) {
                            if(dd.properties.name==countryname)
                                return "grey";
                            else return "white";
                        });
                    DrawAllM();

                });
        });

    });
}
function DrawParallel(index) {
    $.getJSON("data/data.json",function(result){
        index=parseInt(index);
        var div=document.getElementById("parallel");
        var oldsvgs=div.getElementsByTagName("svg");
        for(var i=oldsvgs.length-1;i>=0;i--){
            div.removeChild(oldsvgs[i]);
        }

        var margin = {top: 30, right: 10, bottom: 10, left: 30},
            width = 1580 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        var svg=d3.select("body")
            .select("#parallel")
            .append("svg")
            .attr("width", width+margin.left+margin.right)
            .attr("height",height+margin.top+margin.bottom)
            .append("g")
            .attr("transform","translate("+margin.left+","+margin.top+")");



        var country_index=-1;
        var data=new Array(17);
        var cnt=new Array(17);
        var signal=new Array(0);
        var signal_cnt=0;

        for(var i=0;i<17;i++){
            data[i]=new Array(0);
            cnt[i]=0;
        }



        index-=2006;
        var flag=-1;

        $.each(result,function (i,item) {
            list[0]=item.CountryName;
            list[1]=item.CountryCode;
            list[2]=item.SeriesName;
            list[3]=item.SeriesCode;
            list[4]=item._2010;
            list[5]=item._2011;
            list[6]=item._2012;
            list[7]=item._2013;
            list[8]=item._2014;

            for(var i=0;i<17;i++){
                if(list[2]==dimensions[i]){
                    if(list[index]==".. "||list[index]==".."){
                        data[i][cnt[i]]=0;
                        //if(signal_cnt>0 && signal[signal_cnt-1]!=cnt[i]){
                        signal[signal_cnt]=cnt[i];
                        signal_cnt++;//}
                    }
                    else {
                        data[i][cnt[i]]=parseFloat(list[index]);
                    }
                    if(country_index==-1 && list[0]==current_country_name)
                        country_index=cnt[i];
                    cnt[i]++;
                }
            }
        });

        var dataset=new Array(0);
        var dataset_cnt=0;
        var country_flag=0;
        signal_cnt=0;
        for(var i=0;i<data[0].length;i++){
            if(signal_cnt<signal.length && signal[signal_cnt]==i){
                signal_cnt++;
                while(signal[signal_cnt]==signal[signal_cnt-1]) signal_cnt++;
                continue;
            }
            if(country_index==i){
                country_index=dataset_cnt;
                country_flag=1;
            }
            dataset[dataset_cnt]=new Array(17);
            for(var j=0;j<17;j++){
                dataset[dataset_cnt][j]=data[j][i];
            }
            dataset_cnt++;
        }

        var y={};
        for(var i=0;i<17;i++){
            var name=dimensions[i];
            y[name]=d3.scaleLinear()
                .domain([d3.min(data[i]),d3.max(data[i])])
                .range([height,30]);
        }


        var x=d3.scalePoint()
            .range([0,width-80])
            .domain(dimensions);

        var color1=d3.rgb(180,180,180);
        var color2=d3.rgb(180,180,255);
        var compute=d3.interpolate(color1,color2);
        var linear=d3.scaleLinear()
            .domain([0,dataset.length])
            .range([0,1]);


        function path(d) {
            var path=d3.path();
            path.moveTo(x(dimensions[0]),y[dimensions[0]](d[0]));
            for(var i=1;i<d.length;i++){
                if(i==1) path.lineTo(x(dimensions[i])+20,y[dimensions[i]](d[i]));
                else path.lineTo(x(dimensions[i]),y[dimensions[i]](d[i]));
            }
            //path.closePath();
            return path;
        }

        svg
            .selectAll(".myPath")
            .data(dataset)
            .enter().append("path")
            .attr("class","myPath")
            .attr("d",  path)
            .style("fill", "none")
            .style("stroke-width",function (d,i) {
                if(country_flag&& i==country_index)
                    return 3;
                else return 0.5;
            })
            .style("stroke", function (d,i) {
                if(country_flag && i==country_index)
                    return "#FF6464";
                return compute(linear(i));
            })
            .style("opacity", function (d,i) {
                if(country_flag&& i==country_index)
                    return 1;
                else return 0.4;
            });

        svg.selectAll(".myAxis")
        // For each dimension of the dataset I add a 'g' element:
            .data(dimensions).enter()
            .append("g")
            .attr("class","myAxis")
            // I translate this element to its right position on the x axis
            .attr("transform", function(d,i){
                if(i==1) return "translate("+(x(d)+20).toString()+")";
                else return "translate("+x(d)+")";
            })
            // And I build the axis with the call function
            .each(function(d) { d3.select(this).call(d3.axisLeft()
                .scale(y[d]))
                .style("font-size",8)
                .on("mouseover",function (d,i) {
                    d3.select(this)
                        .style("stroke-width",1.5)
                        .style("font-size",10);
                })
                .on("mouseout",function (d,i) {
                    d3.select(this)
                        .style("stroke-width",1)
                        .style("font-size",8);
                })
                .on("click",function (d,i) {
                    current_series_name=d;
                    DrawAll();
                }); })

            // Add axis title
            .append("text")
            .attr("class","parallel_text")
            .attr("y", 25)
            .text(function(d,i) { return d; })
            .style("font-size",8)
            .on("mouseover",function () {
                d3.select(this)
                    .style("font-size",12);
            })
            .on("mouseout",function () {
                d3.select(this)
                    .style("font-size",8);
            })
            .attr("transform", "rotate(-7)")
            .style("text-anchor", "start")
            .style("fill", "black");


    })
}
function DrawRadar(countryname){
    $.getJSON("data/data.json",function (result) {
        var margin = {top: 20, right: 70, bottom: 70, left: 70},
            width = 400-margin.right-margin.left,
            height = 380-margin.top-margin.bottom;
        var div=document.getElementById("radar");
        var oldsvgs=div.getElementsByTagName("svg");
        for(var i=oldsvgs.length-1;i>=0;i--){
            div.removeChild(oldsvgs[i]);
        }
        var p=document.getElementById("radar_p");
        p.innerHTML=current_country_name+","+current_year;

        var data=new Array(17);
        for(var i=0;i<17;i++){
            data[i]=new Array(5);
        }
        $.each(result, function (i,item) {
            list[0]=item.CountryName;
            list[1]=item.CountryCode;
            list[2]=item.SeriesName;
            list[3]=item.SeriesCode;
            list[4]=item._2010;
            list[5]=item._2011;
            list[6]=item._2012;
            list[7]=item._2013;
            list[8]=item._2014;

            if(countryname==list[0]){
                for(var j=0;j<5;j++){
                    var tmp=list[4+j];
                    var k=0;
                    for(var l=0;l<17;l++)
                    {
                        if(dimensions[l]==list[2])
                        {
                            k=l;
                            break;
                        }
                    }
                    if(tmp==".."||tmp==".. "){
                        data[k][j]=NaN;
                        continue;
                    }
                    data[k][j]=parseFloat(tmp);
                }
            }
        });

        var svg = d3.select("body")
            .select("#radar")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        var g = svg.append("g")
            .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")");

        var filter=g.append("defs").append("filter").attr("id","glow"),
            feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
            feMerge = filter.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');
        var radius=Math.min(width,height)/2;
        var total=17;
        var levels=5;
        var angleSlice=Math.PI*2/total;
        var axisGrid=g.append("g").attr("class","axisWrapper");
        axisGrid.selectAll(".levels")
            .data(d3.range(1,levels+1).reverse())
            .enter()
            .append("circle")
            .attr("class","gridCircle")
            .attr("r",function (d,i) {
                return radius/levels*d;
            })
            .style("fill","#CDCDCD")
            .style("stroke","#CDCDCD")
            .style("fill-opacity",0.2)
            .style("filter","url(#glow)");
        var max=new Array(17);
        var min=new Array(17);
        var rScale=new Array(17);
        for(var i=0;i<17;i++){
            max[i]=d3.max(data[i]);
            min[i]=d3.min(data[i])
            rScale[i]=d3.scaleLinear()
                .range([50,radius-20])
                .domain([min[i],max[i]]);
        }

        var axis=axisGrid.selectAll(".axis")
            .data(data)
            .enter()
            .append("g")
            .attr("class","axis");
        axis.append("line")
            .attr("x1",0)
            .attr("y1",0)
            .attr("x2",function (d,i) {
                return radius*1.1*Math.cos(angleSlice*i-Math.PI/2);
            })
            .attr("y2",function (d,i) {
                return radius *1.1* Math.sin(angleSlice*i - Math.PI/2);
            })
            .attr("class","line")
            .style("stroke","white")
            .style("stroke-width","2px");

        axis.append("text")
            .attr("class","legend")
            .style("font-size",10)
            .attr("text-anchor","middle")
            .attr("dy","0.35em")
            .attr("x",function (d,i) {
                return radius*1.2 * Math.cos(angleSlice*i - Math.PI/2);
            })
            .attr("y",function (d,i) {
                return radius*1.2 * Math.sin(angleSlice*i - Math.PI/2);
            })
            .text(function (d,i) {
                return short[i];
            })
            .on("mouseover",function () {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .style("font-size",15);
            })
            .on("mouseout",function(){
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("font-size",10);
            })
            .on("click",function(d,i){
                current_series_name=dimensions[i];
                DrawAll();
            })
            .call(wrap, 60);

        var index=0;
        // var radarLine=new Array(17);
        // for(var m=0;m<17;m++){
        var radarLine= d3.lineRadial()
            .curve(d3.curveNatural)
            .radius(function(d,i) {
                if(isNaN(d))
                    return 45;
                return rScale[i](d);
            })
            .angle(function(d,i) {	return i*angleSlice; });
        // }
        var dataset=new Array(5);
        for(var i=0;i<5;i++){
            dataset[i]=new Array(17);
            for(var j=0;j<17;j++){
                dataset[i][j]=data[j][i];
            }
        }

        var blobWrapper = g.selectAll(".radarWrapper")
            .data(dataset)
            .enter().append("g")
            .attr("class", "radarWrapper");

        var color1=d3.rgb(255,100,100);
        var color2=d3.rgb(100,100,255);
        var compute=d3.interpolate(color1,color2);
        var linear=d3.scaleLinear()
            .domain([0,4])
            .range([0,1]);


        blobWrapper
            .append("path")
            .attr("class", "radarArea")
            .attr("d", function(d,i) { return radarLine(d); })
            .style("fill", function(d,i) { return "lightgrey"; })
            .style("fill-opacity", 0.1)
            .style("stroke",function (d,i) {
                return compute(linear(i));
            })
            .style("stroke-width",2)
            .style("opacity",0.4)
            .on('mouseover', function (d,i){
                //Dim all blobs
                d3.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("opacity",0.2)
                    .style("fill-opacity", 0.05);
                //Bring back the hovered over blob
                d3.select(this)
                    .transition().duration(200)
                    .style("opacity",0.7)
                    .style("fill-opacity", 0.7);
            })
            .on('mouseout', function(){
                //Bring back all blobs
                d3.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("opacity",0.4)
                    .style("fill-opacity", 0.1);
            });


    })

}
function DrawLine(countryname,seriesname){
    $.getJSON("data/data.json",function (result) {
        var div=document.getElementById("line_chart");
        var oldsvgs=div.getElementsByTagName("svg");
        for(var i=oldsvgs.length-1;i>=0;i--){
            div.removeChild(oldsvgs[i]);
        }
        var p=document.getElementById("line_p");
        p.innerHTML=current_country_name+","+current_series_name;
        var data=new Array(5);
        var signal=new Array(5);
        var min,max;
        $.each(result,function (i,item) {
            list[0]=item.CountryName;
            list[1]=item.CountryCode;
            list[2]=item.SeriesName;
            list[3]=item.SeriesCode;
            list[4]=item._2010;
            list[5]=item._2011;
            list[6]=item._2012;
            list[7]=item._2013;
            list[8]=item._2014;

            if((list[2]==seriesname)&&(list[0]==countryname) ) {
                for (var j = 0; j < 5; j++) {
                    if (list[j + 4] == ".. "||list[j+4]=="..") {
                        data[j]=NaN;
                        signal[j]=1;
                    }
                    else {
                        data[j] = parseFloat(list[j + 4]);
                        signal[j]=0;
                    }
                }
            }
        });
        var margin = {top: 20, right: 40, bottom: 20, left: 40},
            width = 400 - margin.left - margin.right,
            height = 100 - margin.top - margin.bottom;

        var svg = d3.select("body")
            .select("#line_chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var years=["2010","2011","2012","2013","2014"];
        var x=d3.scalePoint()
            .domain(years)
            .range([70,width]);
        svg.append("g")
            .attr("transform","translate(0,"+height+")")
            .call(d3.axisBottom(x));

        var y=d3.scaleLinear()
            .domain([d3.min(data),d3.max(data)])
            .range([height,0]);
        svg.append("g")
            .call(d3.axisLeft(y).ticks(4))
            .attr("transform","translate(70,0)");

        function path(d) {
            var path=d3.path();
            path.moveTo(x(years[0]),y(d[0]));
            for(var i=1;i<d.length;i++){
                if(signal[i]==1) continue;
                path.lineTo(x(years[i]),y(d[i]));
            }
            //path.closePath();
            return path;
        }
        svg.append("path")
            .datum(data)
            .attr("fill","none")
            .attr("stroke","#FF6464")
            .attr("stroke-width",3)
            .attr("opacity",0.6)
            .attr("d",path);

        var tooltip=svg.append("text")
            .attr("font-size",14)
            .style("opacity",0);

        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx",function (d,i) {
                return x(years[i]);
            })
            .attr("cy",function (d,i) {
                if(isNaN(d)) return height;
                return y(d);
            })
            .attr("r",8)
            .attr("fill","#FF6464")
            .style("opacity",0.4)
            .on("mouseover",function (d,i) {

                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r",12);
                tooltip.attr("x",function () {
                    return x(years[i])+10;
                })
                    .attr("y",function () {
                        if(isNaN(d)) return height-5;
                        return y(d);
                    })
                    .text(d.toString())
                    .style("opacity",1);
            })
            .on("mouseout",function(d,i){
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r",8);
                tooltip.style("opacity",0);
            });

    })
}
function DrawScatterplot(seriesname,index){
    $.getJSON("data/data.json",function (result) {
        var div=document.getElementById("scatter_plot");
        var oldsvgs=div.getElementsByTagName("svg");
        for(var i=oldsvgs.length-1;i>=0;i--){
            div.removeChild(oldsvgs[i]);
        }
        var oldtooltip=div.getElementsByClassName("tooltip");
        for(var i=oldtooltip.length-1;i>=0;i--){
            div.removeChild(oldtooltip[i]);
        }
        var p=document.getElementById("scatter_plot_p");
        p.innerHTML=current_series_name+","+current_year;
        var data=new Array(0);
        var cnt=0;
        index=parseInt(index);
        index-=2006;
        $.each(result, function(i, item){
            list[0]=item.CountryName;
            list[1]=item.CountryCode;
            list[2]=item.SeriesName;
            list[3]=item.SeriesCode;
            list[4]=item._2010;
            list[5]=item._2011;
            list[6]=item._2012;
            list[7]=item._2013;
            list[8]=item._2014;

            if(list[2]==seriesname && list[index]!=".." && list[index]!=".. "){
                data[cnt]=new Object();
                data[cnt]["data"]=parseFloat(list[index]);
                data[cnt]["country"]=list[0];
                cnt++;
            }
        });

        var margin = {top: 20, right: 40, bottom: 20, left: 40},
            width = 400 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var svg = d3.select("body")
            .select("#scatter_plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleLinear()
            .domain([-5,data.length])
            .range([ 70, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom().scale(x).ticks(5));
        var min,max;
        for(var i=0;i<data.length;i++){
            if(i==0) {
                min=data[i]["data"];
                max=data[i]["data"];
            }
            else{
                var t_data=data[i]["data"];
                if(t_data<min)  min=t_data;
                if(t_data>max) max=t_data;
            }
        }

        var y = d3.scaleLinear()
            .domain([min,max])
            .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft().scale(y))
            .attr("transform","translate(70,0)")
        ;

        var color1=d3.rgb(255,100,100);
        var color2=d3.rgb(100,100,255);
        var compute=d3.interpolate(color1,color2);
        var linear=d3.scaleLinear()
            .domain([0,data.length])
            .range([0,1]);

        var tooltip = d3.select("#scatter_plot")
            .append("div")
            .style("opacity", 0)
            .attr("width","300px")
            .attr("height","30px")
            .style("font-size","18px")
            .attr("class", "tooltip")
            .style("padding", "10px");


        svg.append('g')
            .selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d,i) { return x(i); } )
            .attr("cy", function (d,i) { return y(d.data); } )
            .attr("r", 6)
            .attr("class","dot")
            .attr("stroke-width",function (d,i) {
                if(d.country==current_country_name)
                    return "3px";
                else return null;
            })
            .attr("stroke",function (d,i) {
                if(d.country==current_country_name)
                    return "black";
                else return null;
            })
            .style("fill", function (d,i) {
                return compute(linear(i));
            })
            .style("opacity",0.4)
            .on("mouseover",function (d) {
                tooltip
                    .html("Country:"+d.country+"\ndata:"+d.data.toString())
                    .style("left", (d3.mouse(this)[0]+20) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                    .style("top", (d3.mouse(this)[1]) + "px")
                    .style("opacity",1);
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r",10)
                    .style("opacity",0.8);
            })
            .on("click",function(d){
                current_country_name=d.country;
                DrawAll();
            })
            .on("mouseout",function (d) {
                tooltip
                    .style("opacity", 0);
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r",6)
                    .style("opacity",0.4);
            });

    })
}
function DrawHistogram(seriesname,index){

    $.getJSON("data/data.json",function (result) {
        var div=document.getElementById("histogram");
        var oldsvgs=div.getElementsByTagName("svg");
        for(var i=oldsvgs.length-1;i>=0;i--){
            div.removeChild(oldsvgs[i]);
        }
        var margin = {top: 10, right: 40, bottom: 30, left: 40},
            width = 1100 - margin.left - margin.right,
            height = 90 - margin.top - margin.bottom;

        index=parseInt(index)-2006;
        var data=new Array(0);
        var cnt=0;
        var countryname=new Array(0);
        $.each(result,function (i,item) {
            list[0]=item.CountryName;
            list[1]=item.CountryCode;
            list[2]=item.SeriesName;
            list[3]=item.SeriesCode;
            list[4]=item._2010;
            list[5]=item._2011;
            list[6]=item._2012;
            list[7]=item._2013;
            list[8]=item._2014;

            if(list[2]==seriesname && list[index]!=".." && list[index]!=".. "){
                data[cnt]=new Object();
                data[cnt].country=list[0];
                data[cnt].data=parseFloat(list[index]);
                countryname[cnt]=list[1];
                cnt++;
            }
        });

// append the svg object to the body of the page
        var svg = d3.select("#histogram")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        var x = d3.scalePoint()
            .domain(countryname)     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
            .range([70, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom().scale(x))
            .selectAll("text")
            .attr("opacity",0);


        var min=data[0].data,max=data[0].data;
        for(var i=1;i<data.length;i++){
            if(data[i].data<min)
                min=data[i].data;
            if(data[i].data>max)
                max=data[i].data;
        }
        var y = d3.scaleLinear()
            .range([height, 0]);
        y.domain([min,max]);   // d3.hist has to be called before the Y axis obviously
        svg.append("g")
            .call(d3.axisLeft(y).ticks(4))
            .attr("transform","translate(70,0)");

        // append the bar rectangles to the svg element
        var rectwidth=(width-72)/data.length-2;
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x",function (d,i) {
                return i*(rectwidth+2)+2+70;
            })
            .attr("y",function (d,i) {
                return y(d.data);
            })
            .attr("width", rectwidth)
            .attr("height", function(d) { return height-y(d.data); })
            .style("fill", function(d){
                if(d.country==current_country_name)
                    return "#6464FF";
                else return "#FF6464";
            })
            .style("opacity",0.8);
    });
}
function DrawAll(){
    //document.getElementById("select").getElementsByTagName("p").innerHTML=current_country_name+" "+current_series_name+ " "+current_year;
    var p=document.getElementById("title");
    p.innerHTML="Country:"+current_country_name+", Series:"+current_series_name+", Year:"+current_year;
    DrawHistogram(current_series_name,current_year);
    DrawParallel(current_year);
    DrawScatterplot(current_series_name,current_year);
    DrawLine(current_country_name,current_series_name);
    DrawMap(current_series_name,current_year);
    DrawRadar(current_country_name);
}
function DrawAllM(){
    //document.getElementById("select").getElementsByTagName("p").innerHTML=current_country_name+" "+current_series_name+ " "+current_year;
    var p=document.getElementById("title");
    p.innerHTML="Country:"+current_country_name+", Series:"+current_series_name+", Year:"+current_year;
    DrawHistogram(current_series_name,current_year);
    DrawParallel(current_year);
    DrawScatterplot(current_series_name,current_year);
    DrawLine(current_country_name,current_series_name);
    //DrawMap(current_series_name,current_year);
    DrawRadar(current_country_name);
}
// function DrawCountry() {
//     DrawLine(current_country_name,current_series_name);
//     DrawMap(current_series_name,current_year);
//     DrawRadar(current_country_name);
// }
//     function DrawCountryM() {
//         DrawLine(current_country_name,current_series_name);
//         //DrawMap(current_series_name,current_year);
//         DrawRadar(current_country_name);
//     }
function DrawYear() {
    DrawHistogram(current_series_name,current_year);
    DrawParallel(current_year);
    DrawScatterplot(current_series_name,current_year);
    DrawMap(current_series_name,current_year);
}
DrawAll();
function select_year(value){
    current_year=value;
    DrawAll();
}
function select_country(value){
    current_country_name=value;
    DrawAll();
}
function select_series(value){
    current_series_name=value;
    DrawAll();
}
