function scatter_plot(file_name) {
    document.getElementById("pca3").innerHTML = '';
    document.getElementById("graph").innerHTML = '';

    file_name = "./data/processed/"+file_name;
    color = ["Green","Red"];

    var margin = {top: 20, right: 20, bottom: 30, left: 100},
        width = 1020 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scale.linear().range([0, width]);
    var yScale = d3.scale.linear().range([height, 0]);
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    d3.csv(file_name, function(data) {
      data.forEach(function(d) {
                d.PC1 = Number(d.PC1);
                d.PC2 = Number(d.PC2);
                d.type = Number(d.type);
            });

      xScale.domain([d3.min(data, function(d){return d.PC1;})-1, d3.max(data, function(d){return d.PC1;})+1]);
      yScale.domain([d3.min(data, function(d){return d.PC2;})-1, d3.max(data, function(d){return d.PC2;})+1]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("Component 1");

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
          .attr("class", "label")
          .attr("x",1)
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "start")
          .text("Component 2");

      svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("class", "dot")
          .attr("r", 3)
          .attr("cx", function(d){
                return xScale(d.PC1);
            })
          .attr("cy", function(d){
                return yScale(d.PC2);
            })
          .style("fill", function(d) { return color[d.type-1];})
          .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("("+ d.col1.toPrecision(4) + ", " + d.col2.toPrecision(4) + ")")
                   .style("font-weight","bold")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", 0);
          });

      svg.append("text")
          .attr("transform", "translate(" + (width-200) + "," + 10 + ")")
          .attr("dy", ".35em")
          .attr("text-anchor", "start")
          .style("fill", "Green")
          .text("Random");

      svg.append("text")
          .attr("transform", "translate(" + (width-100) + "," + 10 + ")")
          .attr("dy", ".35em")
          .attr("text-anchor", "start")
          .style("fill", "Red")
          .text("Stratified");
    });
}

function pca3(file_name) {
    document.getElementById("pca3").innerHTML = '';
    document.getElementById("graph").innerHTML = '';

    var file_name = "./data/processed/"+file_name;
    var color = ['Green','Red']

    var width = 650,
        size = 200,
        padding = 25;

    var x = d3.scale.linear()
        .range([padding / 2, size - padding / 2]);

    var y = d3.scale.linear()
        .range([size - padding / 2, padding / 2]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(6);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(6);

    d3.csv(file_name, function(error, data) {
      if (error) throw error;

      var domainByTrait = {},
          traits = d3.keys(data[0]).filter(function(d) { return d !== "type"; }),
          n = traits.length;

      traits.forEach(function(trait) {
        domainByTrait[trait] = d3.extent(data, function(d) { return Number(d[trait]); });
      });

      xAxis.tickSize(size * n);
      yAxis.tickSize(-size * n);

      var svg = d3.select("#pca3").append("svg")
          .attr("width", size * n + padding)
          .attr("height", size * n + padding)
          .append("g")
          .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

      svg.selectAll(".x.axis")
          .data(traits)
          .enter().append("g")
          .attr("class", "x axis")
          .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
          .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

      svg.selectAll(".y.axis")
          .data(traits)
          .enter().append("g")
          .attr("class", "y axis")
          .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
          .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

      var cell = svg.selectAll(".cell")
          .data(cross(traits, traits))
          .enter().append("g")
          .attr("class", "cell")
          .attr("transform", function(d) {
            // console.log(d);
            return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")";
          })
          .each(plot);

      cell.filter(function(d) { return d.i === d.j; }).append("text")
          .attr("x", padding)
          .attr("y", padding)
          .attr("dy", ".71em")
          .text(function(d) { return d.x; });

      function plot(p) {
        var cell = d3.select(this);

        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);

        cell.append("rect")
            .attr("class", "frame")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", size - padding)
            .attr("height", size - padding);

        cell.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", function(d) { return x(d[p.x]);})
            .attr("cy", function(d) { return y(d[p.y]); })
            .attr("r", 3)
            .style("fill", function(d) {
              // console.log(d);
              return color[Number(d.type)-1];
            });
      }
    });

    function cross(a, b) {
      var c = [], n = a.length, m = b.length, i, j;
      for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
      return c;
    }
}

function eigen_plot() {
    document.getElementById("pca3").innerHTML = '';
    document.getElementById("graph").innerHTML = '';

    file_name = "./data/processed/pca_eigens.csv";
    color = ["Green","Red"];

    var margin = {top: 20, right: 20, bottom: 30, left: 100},
        width = 1020 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.linear().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(36);
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

    var colLine1 = d3.svg.line()
        .x(function(d) { return x(d.variable); })
        .y(function(d) { return y(d.col1); });

    var colLine2 = d3.svg.line()
        .x(function(d) { return x(d.variable); })
        .y(function(d) { return y(d.col2); });

    d3.csv(file_name, function(error, data) {
        data.forEach(function(d) {
            d.variable = +d.variable;
            d.col1 = +d.col1;
            d.col2 = +d.col2;
        });

        x.domain([0, d3.max(data, function(d) { return d.variable; })]);
        y.domain([0, d3.max(data, function(d) { return Math.max(d.col1, d.col2); })]);

        svg.append("path")
            .attr("class", "line")
            .attr("d", colLine1(data));

        svg.append("path")
            .attr("class", "line")
            .style("stroke", "Red")
            .attr("d", colLine2(data));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("PCA Components");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -75)
            .attr("x",0 - (height / 2))
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Eigen Value");

        svg.append("text")
            .attr("transform", "translate(" + (width-200) + "," + 10 + ")")
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", "Green")
            .text("Random");

        svg.append("text")
            .attr("transform", "translate(" + (width-100) + "," + 10 + ")")
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", "Red")
            .text("Stratified");

    });
}

function loading_plot() {
    document.getElementById("pca3").innerHTML = '';
    document.getElementById("graph").innerHTML = '';

    file_name = "./data/processed/scree_loadings.csv";
    color = ["Green","Red"];

    var margin = {top: 20, right: 20, bottom: 150, left: 100},
        width = 1020 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.ordinal().rangeRoundPoints([0 , width]);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");

    var colLine1 = d3.svg.line()
        .x(function(d) { return x(d.variable); })
        .y(function(d) { return y(d.col1); })
        .interpolate("linear");

    var colLine2 = d3.svg.line()
        .x(function(d) { return x(d.variable); })
        .y(function(d) { return y(d.col2); })
        .interpolate("linear");

    d3.csv(file_name, function(error, data) {
        data.forEach(function(d) {
            d.variable = d.variable;
            d.col1 = +d.col1;
            d.col2 = +d.col2;
        });
        console.log(data);

        x.domain(data.map(function(d) { return d.variable; }));
        y.domain([0, d3.max(data, function(d) { return Math.max(d.col1, d.col2); })]);

        svg.append("path")
            .attr("class", "line")
            .attr("d", colLine1(data));

        svg.append("path")
            .attr("class", "line")
            .style("stroke", "Red")
            .attr("d", colLine2(data));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)")
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -75)
            .attr("x",0 - (height / 2))
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Loadings");

        svg.append("text")
            .attr("transform", "translate(" + (width-200) + "," + 10 + ")")
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", "Green")
            .text("Random");

        svg.append("text")
            .attr("transform", "translate(" + (width-100) + "," + 10 + ")")
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", "Red")
            .text("Stratified");

    });
}

function kmean_plot() {
    document.getElementById("pca3").innerHTML = '';
    document.getElementById("graph").innerHTML = '';

    file_name = "./data/processed/kmean.csv";

    var margin = {top: 20, right: 20, bottom: 30, left: 100},
        width = 1020 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.linear().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(10);
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

    var colLine = d3.svg.line()
        .x(function(d) { return x(d.cluster_size); })
        .y(function(d) { return y(d.value); });

    d3.csv(file_name, function(error, data) {
        data.forEach(function(d) {
            d.cluster_size = +d.cluster_size;
            d.value = +d.value;
        });

        x.domain([0, d3.max(data, function(d) { return d.cluster_size; })]);
        y.domain([0, d3.max(data, function(d) { return d.value; })]);

        svg.append("path")
            .attr("class", "line")
            .style("stroke", "steelblue")
            .attr("d", colLine(data));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Cluster Size");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("x",1)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Squared Sum Error");

        svg.append("text")
            .attr("transform", "translate(" + (width-200) + "," + 10 + ")")
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", "steelblue")
            .text("Elbow Plot");

    });
}