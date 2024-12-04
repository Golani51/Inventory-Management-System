// Initialize Google Chart
function chartBuilder() {
    // Load the Google Charts library
    google.charts.load('current', { packages: ['corechart'] });

    // Callback to draw the chart after the library is loaded
    google.charts.setOnLoadCallback(drawOrderChart);

    drawOrderChart();
    loadAndRenderPieChart();
    loadAndRenderMonthlyOrderChart();
}

// Helper function for chartBuilder function
function drawOrderChart() {
    // Fetch data from the /Orders API endpoint
    fetch('/Orders')
      .then(response => response.json())
      .then(data => {
  
        if (!data || !data.length) {
          document.getElementById('google_chart').innerText = 'No data available for chart';
          return;
        }
  
        // Transform the fetched data into a format suitable for Google Charts
        const chartData = [['Employee', 'Quantity']]; // Header row
        const aggregatedData = {};
  
        // Aggregate the data by employee
        data.forEach(order => {
          const employeeName = `${order.FirstName} ${order.LastName}`;
          if (!aggregatedData[employeeName]) {
              aggregatedData[employeeName] = 0;
          }
          aggregatedData[employeeName] += order.Quantity;
        });
  
        // Populate the chart data array
        for (const [employee, quantity] of Object.entries(aggregatedData)) {
          chartData.push([employee, quantity]);
        }
  
        // Create a DataTable for the chart
        const dataTable = google.visualization.arrayToDataTable(chartData);
  
        // Define chart options
        const options = {
          title: 'Orders by Employees',
          width: 800,
          height: 600,
          legend: { position: 'none' },
          hAxis: { title: 'Employees' },
          vAxis: { title: 'Quantity Ordered' }
        };
  
        // Draw the chart
        const chart = new google.visualization.ColumnChart(document.getElementById('google_chart'));
        chart.draw(dataTable, options);
      })
      .catch(error => {
        console.error('Error fetching order data:', error);
        document.getElementById('google_chart').innerText = 'Error loading chart';
      });
  }
  
  function loadAndRenderPieChart() {
      // Load the Google Charts library
      google.charts.load('current', { packages: ['corechart'] });
  
      // Set a callback to draw the pie chart after the library is loaded
      google.charts.setOnLoadCallback(async () => {
          try {
              // Fetch the data for the pie chart
              const response = await fetch('/chart-data-pie');
              const chartData = await response.json();
  
              // Convert the fetched data to a DataTable format
              const data = google.visualization.arrayToDataTable(chartData);
  
              // Define chart options
              const options = {
                  title: 'Items Ordered by Product',
                  is3D: true,
                  width: 800,
                  height: 600,
              };
  
              // Render the pie chart
              const chart = new google.visualization.PieChart(
                  document.getElementById('pie-chart')
              );
              chart.draw(data, options);
          } catch (error) {
              console.error('Error rendering pie chart:', error);
              document.getElementById('pie-chart').textContent =
                  'Error loading pie chart. Please try again.';
          }
      });
  }
  function loadAndRenderMonthlyOrderChart() {
      // Load the Google Charts library
      google.charts.load('current', { packages: ['corechart'] });
  
      // Set a callback to draw the chart after the library is loaded
      google.charts.setOnLoadCallback(async () => {
          try {
              // Fetch the data for the monthly order chart
              const response = await fetch('/chart-data-monthly-orders');
              const chartData = await response.json();
  
              // Convert the fetched data to a DataTable format
              const data = google.visualization.arrayToDataTable(chartData);
  
              // Define chart options
              const options = {
                  title: 'Monthly Order Trends',
                  hAxis: { title: 'Month' },
                  vAxis: { title: 'Total Orders' },
                  width: 800, 
                  height: 600,
                  chartArea: { width: '70%', height: '70%' }, // Area for drawing the chart
                  legend: { position: 'none' },
              };
  
              // Render the chart as a bar or line chart
              const chart = new google.visualization.LineChart(
                  document.getElementById('monthly-order-chart')
              );
              chart.draw(data, options);
          } catch (error) {
              console.error('Error rendering monthly order chart:', error);
              document.getElementById('monthly-order-chart').textContent =
                  'Error loading monthly order chart. Please try again.';
          }
      });
  }