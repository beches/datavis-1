var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.format("d"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.temperature); });
    
var area = d3.svg.area()
	.interpolate("basis")
	.x(function(d) { return x(d.year); })
    .y0(function(d) { return y(d.temperature); })
    .y1(function(d) { return y(d.temperature_global); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data.csv", function(error, data) {
  if (error) throw error;

  color.domain(d3.keys(data[0]).filter(function(key) { return (key == "EQU-24N") || (key == "Global");  }));
  
  var regions = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {year: d.Year, temperature: +d[name], temperature_global: +d["Global"]};
      })
    };
  });
  

  x.domain(d3.extent(data, function(d) { return d.Year; }));

  y.domain([
    d3.min(regions, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
    d3.max(regions, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("x", width)
      .attr("y", -12)
      .attr("dy", ".71em")
      .style("text-anchor","end")
      .text("Year");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Temperature Deviation (0.01 Kelvin)");

  var city = svg.selectAll(".city")
      .data(regions)
    .enter().append("g")
      .attr("class", "city");

  city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });
      
  city.append("path")
      .attr("class", "area")
      .attr("d", function(d) { return area(d.values); });
     // .style("stroke", function(d) { return color(d.name); });
      
  city.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.temperature) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .attr("fill", function(d) { return color(d.name); })
      .text(function(d) { return d.name; });
});