const w = 1600;
const h = 1600;

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

const treemap = d3
  .treemap()
  .size([w - 200, h - 200])
  .paddingInner(1);

// Build up the color scale
const colorScale = d3.scaleOrdinal(d3["schemeCategory10"]);

// Define the datasets
const movies = {
  url:
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json",
  title: "Movie Sales"
};

const kickstarters = {
  url:
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json",
  title: "Kickstarter Pledges"
};

const videogames = {
  url:
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json",
  title: "Video Game Sales"
};

let dataset_name;

// Set dataset & reload when links are clicked; Store dataset_name
$(document).ready(function() {
  $("a").click(function() {
    dataset_name = $(this).data("dataset");
    sessionStorage.setItem("dataset_name", dataset_name);
    location.reload(false);
  });
});

dataset_name = sessionStorage.getItem("dataset_name");

if (dataset_name == null) {
  dataset_name = "movies";
}

let dataset;

switch (dataset_name) {
  case "movies":
    dataset = movies;
    break;
  case "kickstarters":
    dataset = kickstarters;
    break;
  case "videogames":
    dataset = videogames;
    break;
  default:
    break;
}

// Visualize the data
d3.json(dataset.url).then(function(data) {
  // Title and description
  d3.select("#titlebox")
    .append("h1")
    .attr("id", "title")
    .html(dataset.title);
  d3.select("#titlebox")
    .append("h2")
    .attr("id", "description")
    .html("Top 100 Grouped By Genre");

  let root = d3.hierarchy(data);

  root
    .sum(function(d) {
      return d.value;
    })
    .sort(function(a, b) {
      return b.value - a.value;
    });

  treemap(root);

  // Categories are needed for the coloring
  let categories = [
    ...new Set(root.leaves().map(leave => leave.data.category))
  ];

  d3.select("svg")
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return d.x0;
    })
    .attr("y", function(d) {
      return d.y0;
    })
    .attr("width", function(d) {
      return d.x1 - d.x0;
    })
    .attr("height", function(d) {
      return d.y1 - d.y0;
    })
    .attr("class", "tile")
    .attr("fill", function(d) {
      name = d.parent.data.name;
      colorIndex =
        categories.findIndex(function(category) {
          return category == name;
        }) + 1;
      return colorScale(colorIndex);
    })
    .attr("data-name", d => d.data.name)
    .attr("data-category", d => d.data.category)
    .attr("data-value", d => d.data.value)
    .on("mousemove", function(d) {
      // show information box
      d3.select("#tooltip")
        .attr("data-value", () => d.data.value)
        .html(
          "Name: " +
            d.data.name +
            "<br>" +
            "Category: " +
            d.data.category +
            "<br>" +
            "Value: " +
            d.data.value
        )
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 20 + "px")
        .classed("hidden", false);
    })
    .on("mouseout", function(d) {
      // hide information box
      d3.select("#tooltip").classed("hidden", true);
    });

  // Set position for the text
  let nodes = d3
    .select("svg")
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", function(d) {
      return "translate(" + [d.x0, d.y0] + ")";
    });

  // Append the text, use tspan to wrap
  nodes
    .append("text")
    .selectAll("tspan")
    .data(function(d) {
      return d.data.name.split(/(?=[A-Z][^A-Z]\w)/g);
    })
    .enter()
    .append("tspan")
    .attr("x", 2)
    .attr("y", (d, i) => 12 + i * 13)
    .attr("font-size", 12)
    .text(d => d);

  // Create & append the legend with text
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", "translate(20,1420)")
    .attr("height", 100)
    .attr("width", 400);

  legend
    .selectAll("rect")
    .data(categories)
    .enter()
    .append("rect")
    .attr("y", (d, i) => i * 20)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", (d, i) => colorScale(i + 1))
    .attr("class", "legend-item");

  legend
    .selectAll("text")
    .data(categories)
    .enter()
    .append("text")
    .attr("y", (d, i) => i * 20 + 14)
    .attr("x", 20)
    .text(d => d);
});
