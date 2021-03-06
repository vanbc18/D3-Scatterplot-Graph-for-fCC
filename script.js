//use Profile lookup to get all the infos I need ===> let array = [ {prop1: "foo"} ]; array[0]["prop1"]; // "foo"

let w = 1000;
let h = 600;
let padding = 50;

//my chart will be displayed here
const svg = d3.select("#dataviz").
append("svg").
attr("width", w).
attr("height", h);

//d3.json() is how to get API working with our chart
d3.json(
"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json").
then(dataset => {
  //All my variables
  let seconds = dataset.map(d => d["Seconds"]);
  function secondsFormat(seconds) {
    let getMinutes = Math.floor(seconds / 60);
    let getSeconds = Math.round((seconds / 60 - Math.floor(seconds / 60)) * 60);
    //thanks to https://fr.wikihow.com/convertir-des-secondes-en-minutes
    let result = getMinutes + ":" + getSeconds;
    let regExp = /:0{1}$/i;
    if (result.match(regExp)) {
      return result + "0";
    }
    return result;
  };
  let year = dataset.map(d => d["Year"]);


  //my tooltip
  let tooltip = d3.select("body").
  append("div").
  attr("id", "tooltip");

  //xScale & yScale help us get the min max values of both axes
  const xScale = d3.scaleLinear().
  range([0, w - padding]).
  domain([d3.min(year) - 1, d3.max(year) + 2]);
  const yScale = d3.scaleTime().
  range([h - padding, 0]).
  domain([d3.max(seconds) + 3, d3.min(seconds) - 15]);

  let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
  let yAxis = d3.axisLeft(yScale).ticks(9).tickFormat(d => secondsFormat(d));

  //need to append "g"s in order to display x & y axes, don't forget to call them too
  svg.append("g").
  call(xAxis).
  attr("id", "x-axis").
  attr("transform", "translate(50," + (h - padding) + ")");

  svg.append("g").
  call(yAxis).
  attr("id", "y-axis").
  attr("transform", "translate(50, 0)");

  let legendBox = svg.append("g").
  attr("id", "legend");

  let legend = legendBox.selectAll("#legend").
  data(dataset).
  enter().
  append("g");

  legend.append("rect").
  attr("x", w - 25).
  attr("y", 200).
  attr("width", 15).
  attr("height", 15).
  style("fill", "#1ED92B");

  legend.append("rect").
  attr("x", w - 25).
  attr("y", 180).
  attr("width", 15).
  attr("height", 15).
  style("fill", "#D92E27");

  legend.
  append("text").
  attr("x", w - 180).
  attr("y", 212).
  attr("class", "legend-label").
  text("No doping allegations");

  legend.
  append("text").
  attr("x", w - 180).
  attr("y", 192).
  attr("class", "legend-label").
  text("Doping allegations");


  svg.selectAll("circle").
  data(dataset).
  enter().
  append("circle").
  attr("class", "dot").
  attr("opacity", 0.8).
  attr("fill", function (d) {
    if (d["Doping"] === "") {
      return "#1ED92B";
    } else {
      return "#D92E27";
    }
  }).
  attr("cx", d => xScale(d["Year"]) + padding).
  attr("cy", d => yScale(d["Seconds"])).
  attr("r", 6).
  attr("data-xvalue", d => d["Year"]).
  attr("data-yvalue", d => {
    let timeFormat = d["Time"].split(":");
    return new Date(Date.UTC(1970, 0, 1, 0, timeFormat[0], timeFormat[1]));
    //Syntax : Date.UTC(year, month, day, hour, minute, second); It returns the number of milliseconds since January 1, 1970
  }).
  on("mouseover", (event, d) => tooltip.
  transition().
  style("opacity", 1).
  style("cursor", "default").
  style("left", event.pageX + 10 + "px").
  style("top", event.pageY - 50 + "px").
  attr("data-year", d["Year"]).
  text(() =>
  {if (d["Doping"] === "") {
      return "Time : " + d["Time"] + ", Place : " + d["Place"] + ", Cyclist : " + d["Name"] + ", Year : " + d["Year"];
    } else {
      return "Time : " + d["Time"] + ", Place : " + d["Place"] + ", Cyclist : " + d["Name"] + ", Year : " + d["Year"] + ", Doping Status : " + d["Doping"];
    }
  })).
  on("mouseout", () => tooltip.style("opacity", 0));
});