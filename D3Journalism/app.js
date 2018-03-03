// SVG Canvas
var svgWidth = 960;
var svgHeight = 500;

var margin = { top: 20, right: 40, bottom: 80, left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Append SVG group
var chart = svg.append("g");

// Append a div to the body to create tooltips and assign it a class
d3.select(".chart")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Retrieve data from the CSV file
d3.csv("foodStampData.csv", function(err, foodStampData) {
  if (err) throw err;

  foodStampData.forEach(function(data) {
    data.children_3 = +data.children_3;
    data.foodStampsHousehold = +data.foodStampsHousehold;
    data.children_4 = +data.children_4;
  });

  // Create scale functions
  var yLinearScale = d3.scaleLinear().range([height, 0]);

  var xLinearScale = d3.scaleLinear().range([0, width]);

  // Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // store the minimum and maximum values in a column from csv
  var xMin;
  var xMax;
  var yMax;

  // This function identifies the minimum and maximum values to define axises
  function findMinAndMax(dataColumnX) {
    xMin = d3.min(foodStampData, function(data) {
      return +data[dataColumnX] * 0.8;
    });

    xMax = d3.max(foodStampData, function(data) {
      return +data[dataColumnX] * 1.1;
    });

    yMax = d3.max(foodStampData, function(data) {
      return +data.foodStampsHousehold * 1.1;
    });
  }

  // Default x-axis is 'children_3'
  var currentAxisLabelX = "children_3";

  // Call findMinAndMax() with 'children_3' as default
  findMinAndMax(currentAxisLabelX);

  // Set the domain of an axis to extend from the min to the max value
  xLinearScale.domain([xMin, xMax]);
  yLinearScale.domain([0, yMax]);

  // Initialize tooltip
  var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    
    .html(function(data) {
      var state = data.state;
      var houseHolds = +data.foodStampsHousehold;
      var childrenInfo = +data[currentAxisLabelX];
      var houseHoldInfo;
      // Tooltip text depends on which axis is active/has been clicked
      if (currentAxisLabelX === "children_3") {
        houseHoldInfo = "3 Child Household Data Value: ";
      }
      else {  
        houseHoldInfo = "4 Child Household Data Value: ";
      }
      return state +
        "<br>" +
        houseHoldInfo +
        childrenInfo +
        "<br>Foodstamp Households: " +
        houseHolds;
    });

  // Create tooltip
  chart.call(toolTip);

  chart
    .selectAll("circle")
    .data(foodStampData)
    .enter()
    .append("circle")
    .attr("cx", function(data, index) {
      return xLinearScale(+data[currentAxisLabelX]);
    })
    .attr("cy", function(data, index) {
      return yLinearScale(data.foodStampsHousehold);
    })
    .attr("r", "10")
    .attr("fill", "#1a7916")
    // display tooltip on click
    .on("click", function(data) {
      toolTip.show(data);
    })
    // hide tooltip on mouseout
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  // Append an SVG group for the x-axis, then display the x-axis
  chart
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "x-axis")
    .call(bottomAxis);

  // Append a group for y-axis, then display it
  chart.append("g").call(leftAxis);

  // Append y-axis label
  chart
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .attr("class", "axis-text")
    .attr("data-axis-name", "foodStampsHousehold")
    .text("Households receiving Foodstamps with children under 18");

  // Append x-axis labels
  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
    )
    
    .attr("class", "axis-text active")
    .attr("data-axis-name", "children_3")
    .text("Households with 3 children");

  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 45) + ")"
    )
    
    .attr("class", "axis-text inactive")
    .attr("data-axis-name", "children_4")
    .text("Households with 4 children");

  // change between two x-axis options
  function labelChange(clickedAxis) {
    d3
      .selectAll(".axis-text")
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    clickedAxis.classed("inactive", false).classed("active", true);
  }

  d3.selectAll(".axis-text").on("click", function() {
    // Assign a variable to current axis
    var clickedSelection = d3.select(this);
    // "true" or "false" based on whether the axis is currently selected
    var isClickedSelectionInactive = clickedSelection.classed("inactive");
    var clickedAxis = clickedSelection.attr("data-axis-name");
    console.log("current axis: ", clickedAxis);
if (isClickedSelectionInactive) {
      // Assign the clicked axis to the variable currentAxisLabelX
      currentAxisLabelX = clickedAxis;
      // Call findMinAndMax() to define the min and max domain values.
      findMinAndMax(currentAxisLabelX);
      // Set the domain for the x-axis
      xLinearScale.domain([xMin, xMax]);
      // Create a transition effect for the x-axis
      svg
        .select(".x-axis")
        .transition()
        .duration(2000)
        .call(bottomAxis);

      d3.selectAll("circle").each(function() {
        d3
          .select(this)
          .transition()
          .attr("cx", function(data) {
            return xLinearScale(+data[currentAxisLabelX]);
          })
          .duration(2000);
      });

      // Change the status of the axes
      labelChange(clickedSelection);
    }
  });
});
