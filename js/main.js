window.onload = () => {

  const endpoint = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
  const tooltip = d3.select('.tooltip');
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  const colors = [
    '#073780',
    '#0e58c7',
    '#2b7bf3',
    '#66a2fd',
    '#90bcff',
    '#bdcfea',
    '#ffc7b9',
    '#ffaa95',
    '#f98569',
    '#ff6843',
    '#e64f29',
    '#DD2C00'
  ];

  // Gives relevant color to the temperature bar sitting in certain range
  function colorMe(value, ranges) {
    for (let i = 0; i <= ranges.length; i++) {
      if (value <= ranges[i]) {
        if (i === 0) {
          return colors[i];
        } else {
          return colors[i - 1];
        }
      }
    }
  }

  function handleData(response) {
    const baseTemp = response.baseTemperature;
    const dataset = response.monthlyVariance;
    const width = 1550;
    const height = 580;
    const padding = {
      top: 30,
      right: 50,
      bottom: 120,
      left: 120
    }

    dataset.forEach(d => d.temp = baseTemp + d.variance);

    // Adding main SVG element
    const svg = d3.select('.container')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Setting scales
    const xScale = d3.scaleLinear()
      .domain([1753, 2015])
      .range([padding.left, width - padding.right]);

    const yScale = d3.scaleBand()
      .domain(months)
      .range([padding.top, height - padding.bottom]);

    // Adding axes
    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${height - padding.bottom})`)
      .call(d3.axisBottom(xScale)
        .ticks(20)
        .tickFormat(d3.format('d'))
        .tickSizeOuter(0))
      .append('text')
      .attr('class', 'label')
      .text('Years')
      .attr('x', 770)
      .attr('y', 50);

    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${padding.left}, 0)`)
      .call(d3.axisLeft(yScale).tickSizeOuter(0))
      .append('text')
      .attr('class', 'label')
      .text('Months')
      .attr('x', -190)
      .attr('y', -80)
      .attr('transform', 'rotate(-90)');

    // Computing width of a single bar
    const barWidth = (width - padding.left - padding.right) * months.length / dataset.length;

    // Computing color-temperature ratio values
    const [minTemp, maxTemp] = d3.extent(dataset, d => d.temp);
    const step = (maxTemp - minTemp) / colors.length;

    let tempRanges = [];
    for (let i = minTemp; i <= maxTemp; i += step) {
      tempRanges.push(i.toFixed(1));
    }

    // Rendering data in SVG element
    svg.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => d.temp)
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(months[d.month - 1]))
      .attr('width', barWidth)
      .attr('height', (height - padding.top - padding.bottom) / 12)
      .style('fill', d => colorMe(d.temp, tempRanges))
      .on('mouseover', d => {
        tooltip.attr('data-year', d.year);
        tooltip.attr('data-month', months[d.month]);
        tooltip.attr('data-temp', d.temp);
        tooltip.style('left', d3.event.pageX - 80 + 'px');
        tooltip.style('top', d3.event.pageY - 130 + 'px');
        tooltip.html(
          `
          <p class="info">${months[d.month - 1]} ${d.year}</p>
          <p class="info">Temperature: ${d.temp.toFixed(1)} ℃</p>
          <p class="info">Variance: ${d.variance.toFixed(2)} ℃</p>
          `
        );
        tooltip.classed('visible', true);
      })
      .on('mouseout', () => {
        tooltip.classed('visible', false);
      });

    // Adding legend
    const offsetX = 1140;
    const offsetY = 500;
    const legendBarWidth = 30;
    const legendBarHeight = 30;

    let legendTickPositions = [];
    for (let i = 0; i < tempRanges.length * legendBarWidth; i += legendBarWidth) {
      legendTickPositions.push(i);
    }

    const legend = svg.append('g')
      .attr('id', 'legend')
      .attr('x', offsetX)
      .attr('y', offsetY);

    // Setting legend scale
    const legendScale = d3.scaleOrdinal()
      .domain(tempRanges)
      .range(legendTickPositions);

    // Adding legend axis
    svg.select('#legend')
      .append('g')
      .attr('transform', `translate(${offsetX}, ${offsetY + legendBarHeight})`)
      .call(d3.axisBottom(legendScale).tickSizeOuter(0))
      .append('text')
      .text('Temperature ℃')
      .attr('class', 'label')
      .attr('x', 180)
      .attr('y', 40);

    legend.selectAll('rect')
      .data(colors)
      .enter()
      .append('rect')
      .attr('x', (d, i) => offsetX + i * legendBarWidth)
      .attr('y', offsetY)
      .attr('width', legendBarWidth)
      .attr('height', legendBarHeight)
      .style('fill', d => d);
  }

  fetch(endpoint)
    .then(response => response.json())
    .then(jsonResponse => handleData(jsonResponse))
    .catch(error => console.log(error));
};