// Show the inventory list by default
document.addEventListener('DOMContentLoaded', () => {
    showSection('inventory_list');
    checkSession();
});

// Check current website page (section) to toggle inventory filters and order list
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('#inventory_list, #orders_section, #chart_section');
    sections.forEach(section => section.style.display = 'none');

    // Hide the category filter by default
    document.getElementById('inventory_filter').style.display = 'none';

    // Show the selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';

        // Show category filter only for inventory
        if (sectionId === 'inventory_list') {
            document.getElementById('inventory_filter').style.display = 'block';
        }
        else if (sectionId === 'orders_section') {
            fetchOrders();
        }
        else if (sectionId === 'chart_section'){
            chartBuilder();
        }
    }
}

// Check session on page load to show/hide sections based on user role
async function checkSession() {
    const response = await fetch('/check-session');
    const inventoryDiv = document.getElementById('inventory_list');
    const inventoryFilter = document.getElementById('inventory_filter');

    if (response.ok) {
        const data = await response.json();
        showUserInfo(data);
        fetchCategories(); // Fetch categories for the dropdown
        fetchInventory();  // Fetch inventory after login
        inventoryFilter.style.display = 'block';

    } else {
        // Hide inventory if user is not logged in
        inventoryDiv.style.display = 'none';
        inventoryFilter.style.display = 'none';
    }
}

// Display user info and controls based on role
function showUserInfo(data) {
    // Log-in form disappears
    document.getElementById('loginForm').style.display = 'none';

    // Log-out button appears
    document.getElementById('logoutButton').style.display = 'inline';

    // User info appears
    document.getElementById('user_info').style.display = 'block';
    document.getElementById('user_info').textContent = `Logged in as ${data.username} (${data.role})`;
    
    // Inventory appears
    document.getElementById('inventory_list').style.display = 'block';
    document.getElementById('inventory_filter').style.display = 'block';

    // When user role is admin do something
    if (data.role === 'admin') {
    }
}

// Login form submission handler
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get username and password
    const loginData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(loginData)
        });

        // If username and password are found in the database,
        // show user info and inventory
        if (response.ok) {
            const data = await response.json();
            showUserInfo(data);
            fetchInventory();
            fetchCategories(); 
            showSection('inventory_list');

        } else {
            alert('Login failed');
        }

    } catch (error) {
        alert('Error logging in');
    }
});

// Logout handler
document.getElementById('logoutButton').addEventListener('click', async function() {
    await fetch('/logout');
    location.reload();
});

// Show an inventory list
async function fetchInventory(category = '') {
    try {
        const response = await fetch(`/Inventory?category=${encodeURIComponent(category)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const inventoryDiv = document.getElementById('inventory_list');
        inventoryDiv.innerHTML = '';

        if (data.length > 0) {
            if (currentViewMode === 'product') {
                renderGroupedByProduct(data, inventoryDiv);
            } else if (currentViewMode === 'location') {
                renderGroupedByLocation(data, inventoryDiv);
            }
        } else {
            inventoryDiv.textContent = 'No inventory items found.';
        }

    } catch (error) {
        alert('Error fetching inventory');
        document.getElementById('inventory_list').textContent = 'Error loading inventory';
    }
}

// Helper function to group the inventory by locations
function renderGroupedByLocation(data, inventoryDiv) {
    const groupedData = data.reduce((groups, item) => {
        if (!groups[item.location]) {
            groups[item.location] = {
                state: item.state,
                items: []
            };
        }
        groups[item.location].items.push(item);
        return groups;
    }, {});

    // Create a table
    const table = document.createElement('table');
    table.setAttribute('border', '1');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // Table Header
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Inventory List</th>
    `;
    table.appendChild(headerRow);

    // Render grouped inventory
    for (const [location, group] of Object.entries(groupedData)) {
        
        // Collapsible row for each location
        const locationRow = document.createElement('tr');
        locationRow.innerHTML = `
            <td>
                <strong>Location: ${location} (State: ${group.state})</strong>
            </td>
        `;

        // Toggle dropdown visibility
        const dropdownRow = document.createElement('tr');
        dropdownRow.style.display = 'none';
        locationRow.addEventListener('click', () => {
            const visibility = dropdownRow.style.display === 'none' ? 'table-row' : 'none';
            dropdownRow.style.display = visibility;
        });

        table.appendChild(locationRow);

        // Dropdown rows for inventory items
        const dropdownCell = document.createElement('td');
        dropdownCell.setAttribute('colspan', '2');
        dropdownCell.style.padding = '0';

        const dropdownTable = document.createElement('table');
        dropdownTable.style.width = '100%';
        dropdownTable.setAttribute('border', '1');

        // Add header to the dropdown table
        const dropdownHeader = document.createElement('tr');
        dropdownHeader.innerHTML = `
            <th>Inventory ID</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Current Quantity</th>
            <th>Max Quantity</th>
            <th>Adjustment</th>
            <th>Stock Status</th>
        `;
        dropdownTable.appendChild(dropdownHeader);

        // Add inventory details
        group.items.forEach((item) => {
            const row = document.createElement('tr');
            row.setAttribute('data-threshold', item.thres); // Store threshold for adjustQuantity

            const stockButton = document.createElement('button');
            stockButton.classList.add('stock-button');

            // Calculate stock status
            if (1 - item.quantity / item.maxqt > item.thres) {
                stockButton.textContent = 'Low Stock';
                stockButton.classList.add('low');
            } else {
                stockButton.textContent = 'Enough Stock';
                stockButton.classList.add('enough');
            }

            // Dropdown contents
            row.innerHTML = `
                <td>${item.InventoryID}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td id="quantity-${item.InventoryID}">${item.quantity}</td>
                <td>${item.maxqt}</td>
                <td>
                    <input type="number" id="adjustment-${item.InventoryID}" value="1" style="width: 50px;">
                    <button onclick="adjustQuantity(${item.InventoryID}, 'add')">+</button>
                    <button onclick="adjustQuantity(${item.InventoryID}, 'subtract')">-</button>
                </td>
            `;

            const stockStatusCell = document.createElement('td');
            stockStatusCell.appendChild(stockButton);
            row.appendChild(stockStatusCell);
            dropdownTable.appendChild(row);
        });

        dropdownCell.appendChild(dropdownTable);
        dropdownRow.appendChild(dropdownCell);
        table.appendChild(dropdownRow);
    }

    inventoryDiv.appendChild(table);
}

// Helper function to group the inventory by products
function renderGroupedByProduct(data, inventoryDiv) {
    const groupedData = data.reduce((groups, item) => {
        if (!groups[item.ProductID]) {
            groups[item.ProductID] = {
                name: item.name,
                items: []
            };
        }
        groups[item.ProductID].items.push(item);
        return groups;
    }, {});

    // Create a table
    const table = document.createElement('table');
    table.setAttribute('border', '1');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // Table Header
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Inventory List</th>
    `;
    table.appendChild(headerRow);

    // Render grouped inventory
    for (const [productID, group] of Object.entries(groupedData)) {
        
        // Collapsible row for each product
        const productRow = document.createElement('tr');
        productRow.innerHTML = `
            <td>
                <strong>Product ID: ${productID} - ${group.name}</strong>
            </td>
        `;

        // Toggle dropdown visibility
        const dropdownRow = document.createElement('tr');
        dropdownRow.style.display = 'none';
        productRow.addEventListener('click', () => {
            const visibility = dropdownRow.style.display === 'none' ? 'table-row' : 'none';
            dropdownRow.style.display = visibility;
        });

        table.appendChild(productRow);

        // Dropdown rows for inventory items
        const dropdownCell = document.createElement('td');
        dropdownCell.setAttribute('colspan', '2');
        dropdownCell.style.padding = '0';

        const dropdownTable = document.createElement('table');
        dropdownTable.style.width = '100%';
        dropdownTable.setAttribute('border', '1');

        // Add header to the dropdown table
        const dropdownHeader = document.createElement('tr');
        dropdownHeader.innerHTML = `
            <th>Inventory ID</th>
            <th>Location</th>
            <th>State</th>
            <th>Current Quantity</th>
            <th>Max Quantity</th>
            <th>Adjustment</th>
            <th>Stock Status</th>
        `;
        dropdownTable.appendChild(dropdownHeader);

        // Add inventory details
        group.items.forEach((item) => {
            const row = document.createElement('tr');
            row.setAttribute('data-threshold', item.thres); // Store threshold for adjustQuantity

            const stockButton = document.createElement('button');
            stockButton.classList.add('stock-button');

            // Calculate stock status
            if (1 - item.quantity / item.maxqt > item.thres) {
                stockButton.textContent = 'Low Stock';
                stockButton.classList.add('low');
            } else {
                stockButton.textContent = 'Enough Stock';
                stockButton.classList.add('enough');
            }

            // Dropdown contents
            row.innerHTML = `
                <td>${item.InventoryID}</td>
                <td>${item.location}</td>
                <td>${item.state}</td>
                <td id="quantity-${item.InventoryID}">${item.quantity}</td>
                <td>${item.maxqt}</td>
                <td>
                    <input type="number" id="adjustment-${item.InventoryID}" value="1" style="width: 50px;">
                    <button onclick="adjustQuantity(${item.InventoryID}, 'add')">+</button>
                    <button onclick="adjustQuantity(${item.InventoryID}, 'subtract')">-</button>
                </td>
            `;

            const stockStatusCell = document.createElement('td');
            stockStatusCell.appendChild(stockButton);
            row.appendChild(stockStatusCell);
            dropdownTable.appendChild(row);
        });

        dropdownCell.appendChild(dropdownTable);
        dropdownRow.appendChild(dropdownCell);
        table.appendChild(dropdownRow);
    }

    inventoryDiv.appendChild(table);
}

// Add/Subtract current quantity based on user requests
async function adjustQuantity(inventoryID, action) {
    try {
        // Get the adjustment value from the input field
        const adjustmentInput = document.getElementById(`adjustment-${inventoryID}`);
        const adjustmentValue = parseInt(adjustmentInput.value, 10);

        if (isNaN(adjustmentValue) || adjustmentValue <= 0) {
            alert('Invalid adjustment value. Please enter a positive number.');
            return;
        }

        // Fetch current quantity and max quantity from the DOM
        const currentQuantityCell = document.getElementById(`quantity-${inventoryID}`);
        const currentQuantity = parseInt(currentQuantityCell.textContent, 10);
        const currentRow = currentQuantityCell.parentElement;
        const maxQuantity = parseInt(currentRow.children[4].textContent, 10);

        // Determine the resulting quantity after adjustment
        const resultingQuantity = action === 'add'
            ? currentQuantity + adjustmentValue
            : currentQuantity - adjustmentValue;

        // Validate the resulting quantity
        if (resultingQuantity < 0) {
            alert('Invalid operation. Quantity cannot be less than zero.');
            return;
        }
        
        if (resultingQuantity > maxQuantity) {
            alert('Invalid operation. Quantity cannot exceed the maximum capacity.');
            return;
        }

        // Send the request to the backend
        const adjustment = action === 'add' ? adjustmentValue : -adjustmentValue;
        const response = await fetch('/update-quantity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ InventoryID: inventoryID, adjustment })
        });

        if (response.ok) {
            // Update the quantity in the DOM
            currentQuantityCell.textContent = resultingQuantity;

            // Fetch the threshold for stock status update
            const threshold = parseFloat(currentRow.getAttribute('data-threshold'));
            const stockStatusCell = currentRow.children[6]; // Stock Status cell index
            const stockButton = stockStatusCell.querySelector('button');

            // Update the stock status
            if (1 - resultingQuantity / maxQuantity > threshold) {
                stockButton.textContent = 'Low Stock';
                stockButton.classList.remove('enough');
                stockButton.classList.add('low');

            } else {
                stockButton.textContent = 'Enough Stock';
                stockButton.classList.remove('low');
                stockButton.classList.add('enough');
            }

        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        alert('Error updating quantity');
    }
}

// Get Orders and OrderDetails tables from backend to display order list
async function fetchOrders() {
    try {
        const response = await fetch('/Orders');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const ordersDiv = document.getElementById('orders_table');

        // Clear previous content
        ordersDiv.innerHTML = '';

        // Create the table
        const table = document.createElement('table');
        table.setAttribute('border', '1');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';

        // Add the header row
        table.innerHTML = `
            <tr>
                <th>Order Number</th>
                <th>Ordered Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Amount</th>
                <th>Requester</th>
                <th>Requested Date</th>
                <th>Assigned Location</th>
            </tr>
        `;

        // Populate rows with data
        data.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.OrderID}</td>
                <td>${order.ProductName}</td>
                <td>${order.Quantity}</td>
                <td>${order.UnitPrice}</td>
                <td>${order.TotalAmount}</td>
                <td>${order.FirstName} ${order.LastName}</td>
                <td>${order.OrderDate}</td>
                <td>${order.AssignedLocation}, ${order.LocationState}</td>
            `;
            table.appendChild(row);
        });

        // Append the table to the orders section
        ordersDiv.appendChild(table);
    } catch (error) {
        const ordersDiv = document.getElementById('orders_table');
        ordersDiv.textContent = 'Error loading orders.';
    }
}

// Get categories from backend and make a dropdown category filter
async function fetchCategories() {
    try {
        const response = await fetch('/categories');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const categoryFilter = document.getElementById('categoryFilter');

        if (!categoryFilter) {
            alert('Error: categoryFilter element not found.');
            return;
        }

        // Populate dropdown with categories
        data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.Category;
            option.textContent = category.Category;
            categoryFilter.appendChild(option);
        });

    } catch (error) {
        alert('Error fetching categories');
    }
}

// View mode change handler
function changeViewMode() {
    currentViewMode = document.getElementById('viewMode').value;
    fetchInventory();
}

// Category filter handler
async function filterInventoryByCategory() {
    const category = document.getElementById('categoryFilter').value;
    fetchInventory(category); 
}

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
                chartArea: { width: '70%', height: '70%' },
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

// Initialize page
checkSession();
let currentViewMode = 'product'; 
fetchInventory();