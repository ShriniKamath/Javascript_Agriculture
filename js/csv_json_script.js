function GraphDraw(filename){
  var margin = {top: 20, right: 20, bottom: 150, left: 80},
  width = 1200 - margin.left - margin.right,
  height = 550 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
  .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
  .rangeRound([height, 0]);

  var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .tickFormat(d3.format(".2s"));

  var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  var color = d3.scale.ordinal()
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  d3.json(filename, function(error, data) {
    if (error) throw error;

    if(filename!="../json/commercialCropsData.json"){
      data.sort(function (a, b) {
        return b.value - a.value;
      });
    }

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "key"; }));
    data.forEach(function(d) {
      var y0 = 0;
      d.state = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
      d.total = d.state[d.state.length - 1].y1;
    });

    x.domain(data.map(function(d) { return d.key; }));
    y.domain([0, d3.max(data, function(d) { return d.total; })]);

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("transform","rotate(-60)")
    .attr("dx","-.8em")
    .attr("dy",".25em")
    .style("text-anchor","end");

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Production in Ton");

    var key = svg.selectAll(".key")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform", function(d) { return "translate(" + x(d.key) + ",0)"; });

    key.selectAll("rect")
    .data(function(d) { return d.state; })
    .enter().append("rect")
    .attr("width", x.rangeBand())
    .transition().duration(1000)
    .delay(function(d,i){return i*20;})
    .attr("y", function(d) { return y(d.y1); })
    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
    .style("fill", function(d) { return color(d.name); });

    if (filename=="../json/riceVolumeData.json") {
      var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

      legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
    }
  });
}
