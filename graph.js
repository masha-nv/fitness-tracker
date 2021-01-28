const margin = { top: 40, right: 20, bottom: 50, left: 100 };
const graphWidth = 560 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", graphWidth + margin.left + margin.right)
  .attr("height", graphHeight + margin.top + margin.bottom);

const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xAxisGroup = graph
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append("g").attr("class", "y-axis");

//Add X scale --> it is a date format
const x = d3.scaleTime().range([0, graphWidth]);

//Add Y scale
const y = d3.scaleLinear().range([graphHeight, 0]);

//d3 line path generator
const line = d3
  .line()
  .x(function (d) {
    return x(new Date(d.date));
  })
  .y(function (d) {
    return y(d.distance);
  });

// line path elements
const path = graph.append("path");

// dotted lines
const dottedGroup = graph.append("g");
function horizontalLine(d) {
  return dottedGroup
    .append("line")
    .style("stroke-dasharray", 4)
    .attr("x1", 0)
    .attr("y1", () => y(d.distance))
    .attr("x2", x(new Date(d.date)))
    .attr("y2", () => y(d.distance))
    .attr("stroke", "#aaa");
}

function verticalLine(d) {
  return dottedGroup
    .append("line")
    .style("stroke-dasharray", 4)
    .attr("x1", x(new Date(d.date)))
    .attr("y1", () => y(d.distance))
    .attr("x2", x(new Date(d.date)))
    .attr("y2", graphHeight)
    .attr("stroke", "#aaa");
}

const tip = d3
  .tip()
  .attr("class", "d3-tip")
  .html(function (e) {
    const activity = e.target.__data__.name;
    const date = e.target.__data__.date;
    const distance = e.target.__data__.distance;
    return `<p>${activity} - ${distance} m; ${date}</p>`;
  });

const update = (data) => {
  data = data.filter((d) => d.name === activity);

  // sort data based on date object;
  data.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  y.domain([
    0,
    d3.max(data, function (d) {
      return d.distance;
    }),
  ]);
  x.domain(
    d3.extent(data, function (d) {
      return new Date(d.date);
    })
  );

  //update path data
  path
    .data([data])
    .attr("fill", "none")
    .attr("stroke", "#00bfa5")
    .attr("stroke-width", 2)
    .attr("d", line);

  //create axis
  xAxisGroup
    .call(d3.axisBottom(x).ticks(10))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .attr("text-anchor", "end");

  yAxisGroup.call(
    d3
      .axisLeft(y)
      .ticks(4)
      .tickFormat((d) => d + " m")
  );

  //create circles for objects;
  const circles = graph.selectAll("circle").data(data);

  circles.exit().remove();

  circles
    .enter()
    .append("circle")
    .merge(circles)
    .attr("cx", (d) => x(new Date(d.date)))
    .attr("cy", (d) => y(d.distance))
    .attr("r", 4)
    .attr("fill", "#ccc");

  graph.call(tip);

  graph
    .selectAll("circle")
    .on("mouseover", function (e) {
      d3.select(e.target)
        .transition()
        .duration(200)
        .attr("r", 6)
        .attr("fill", "#fff");
      horizontalLine(e.target.__data__);

      verticalLine(e.target.__data__);
      // tip.show(e);
    })
    .on("mouseleave", (e) => {
      // tip.hide();
      d3.select(e.target)
        .transition()
        .duration(500)
        .attr("r", 4)
        .attr("fill", "#ccc");
      dottedGroup.selectAll("line").remove();
    });
};

let data = [];
db.collection("workout").onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    console.log(change.type);
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const idx = data.findIndex((el) => el.id === change.doc.id);
        data[idx] = doc;
        break;
      case "removed":
        data = data.filter((el) => el.id !== change.doc.id);
        break;
      default:
        break;
    }
  });
  update(data);
});
