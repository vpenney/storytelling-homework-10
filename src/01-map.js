import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .style('background', 'black')
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let colorScale = d3
  .scaleSequential(d3.interpolateCool)
  .domain([0, 400000])
  .clamp(true)

let projection = d3.geoMercator()
let graticule = d3.geoGraticule()

let path = d3.geoPath().projection(projection)

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/world-cities.csv'))
]).then(ready)

function ready([json, datapoints]) {
  // console.log(json.objects)
  // Convert to geojson
  let countries = topojson.feature(json, json.objects.countries)
  console.log(countries)

  // Set domain for colorScale based on population
  let pop = datapoints.map(d => +d.population)
  // Highest high temperature
  let popMax = d3.max(pop)
  console.log(popMax)
  // Max is around 221 million
  // Lowest population
  let popMin = d3.min(pop)
  console.log(popMin)
  // Min is ... 0? Should have seen this coming.

  var xExtent = d3.extent(datapoints, d => +d.lat)
  var yExtent = d3.extent(datapoints, d => +d.lng)

  let xPositionScale = d3.scaleLinear().domain(xExtent).range([0, width])
  let yPositionScale = d3.scaleLinear().domain(yExtent).range([height, 0])

  // Here are some countries (not outlined)
  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', 'black')
    .lower()

  // Here are some cities
  svg
    .selectAll('.cities')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('d', path)
    .attr('class', 'cities')
    .attr('r', 1)
    .attr('transform', d => `translate(${projection([d.lng, d.lat])})`)
    .attr('fill', d => colorScale(d.population))

  // Here's a grid
  svg
    .append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('stroke', 'grey')
    .lower()
}
