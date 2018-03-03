
// create canvas for chart
var svgWidth = 960;
var svgHeight = 500;

var margin = { top: 20, right: 40, bottom: 80, left: 100};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create SVG wrapper 
var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transorm", "translate(" + margin.left + "," + margin.top + ")");

// append SVG group
var chart = svg.append("g");

// append div to body to create tooltips
d3.select(".chart")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// retrieve data from CSV
d3.csv("data.csv", function(err, data) {
    if (err) throw err;

    data.forEach(function(data) {
        data.foodStampsHouseholds = +data.foodStampsHouseholds;
        data.children_3 = +data.children_3;
        data.no_children = +data.no_children;
        
    });

    // create scale functions
    var yLinearScale = d3.scaleLinear().range([height, 0]);

    var xLinearScale = d3.scaleLinear().range([0, width]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

     // These variables store the minimum and maximum values in a column in data.csv
    var xMin;
    var xMax;
    var yMax;
    
    // function that identifies min/max in csv
    function minMax(dataColumnX) {
        xmin = d3.min(data, function(data) {
            return +data[dataColumnX] * 0.8;
        });
        
        xmax = d3.max(data, function(data) {
            return +data[dataColumnX] * 1.1;
        });

        ymax = d3.max(data, function(data) {
            return +data.foodStampsHouseholds * 1.1;
        });
    }

    var currentAxisLabelX = "no_children";

    minMax(currentAxisLabelX);

    xLinearScale.domain([xmin, xmax]);
    yLinearScale.domain([0, ymax]);

    var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(data) {
        var state = +data.state;
        var foodStampHouse = +data.foodStampsHouseholds;
        var foodStampInfo = +data[currentAxisLabelX];
        var foodStampString;

        if (currentAxisLabelX === "no_children") {
            foodStampString = "Households with no children: ";
        }

        else {
            foodStampString = "Households with 3 children: ";
        }

        return state + 
            "<br>" +
            foodStampString +
            foodStampInfo +
            "<br> Household : " +
            foodStampHouse;
    });

    chart.call(toolTip);

    chart
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(data, index) {
            return xLinearScale(+data[currentAxisLabelX]);
        })
        .attr("cy", function(data, index) {
            return yLinearScale(data.foodStampsHouseholds);
        })
        .attr("r","20")
        .attr("fill", "#E75480")

        // display toolTip on click
        .on("click", function(data) {
            toolTip.show(data);
        })

        // hide toolTip
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        })

    // a-pend SVG group for x-axis and display
    chart
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x-axis")
        .call(bottomAxis);

    // append SVG group for y-axis and display
    chart
        .append("g")
        .call(leftAxis);

    // append y-axis label
    chart
        .append("text")
        .attr("tranform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .attr("class", "axis-text")
        .attr("data-axis-name", "foodStampsHouseholds")
        .text("Households that Receive Foodstamps with Children Under 18");

    // Append x-axis labels
  chart
  .append("text")
  .attr(
    "transform",
    "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
  )
  // This axis label is active by default
  .attr("class", "axis-text active")
  .attr("data-axis-name", "no_children")
  .text("Households with no children under 18");

chart
  .append("text")
  .attr(
    "transform",
    "translate(" + width / 2 + " ," + (height + margin.top + 45) + ")"
  )
  // This axis label is inactive by default
  .attr("class", "axis-text inactive")
  .attr("data-axis-name", "children_3")
  .text("Households with 3 children under 18");

 // Change an axis's status from inactive to active when clicked (if it was inactive)
  // Change the status of all active axes to inactive otherwise
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
    console.log("this axis is inactive", isClickedSelectionInactive)
    // Grab the data-attribute of the axis and assign it to a variable
    
    var clickedAxis = clickedSelection.attr("data-axis-name");
    console.log("current axis: ", clickedAxis);

    
    if (isClickedSelectionInactive) {
      // Assign the clicked axis to the variable currentAxisLabelX
      currentAxisLabelX = clickedAxis;
      // Call findMinAndMax() to define the min and max domain values.
      minMax(currentAxisLabelX);
      // Set the domain for the x-axis
      xLinearScale.domain([xmin, xmax]);
      // Create a transition effect for the x-axis
      svg
        .select(".x-axis")
        .transition()
        // .ease(d3.easeElastic)
        .duration(1800)
        .call(bottomAxis);
      // Select all circles to create a transition effect, then relocate its horizontal location
      // based on the new axis that was selected/clicked
      d3.selectAll("circle").each(function() {
        d3
          .select(this)
          .transition()
          // .ease(d3.easeBounce)
          .attr("cx", function(data) {
            return xLinearScale(+data[currentAxisLabelX]);
          })
          .duration(1800);
      });

      // Change the status of the axes. See above for more info on this function.
      labelChange(clickedSelection);
    }
  });
});
