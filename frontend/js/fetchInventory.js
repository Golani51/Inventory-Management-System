let inputValues = {}; // Global store for user input values

document.getElementById('searchProduct').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchByProductId();
    }
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
    const headerTable = document.createElement('table');
    headerTable.setAttribute('border', '1');
    headerTable.style.width = '100%';
    headerTable.style.borderCollapse = 'collapse';
    headerTable.className = 'inventory-location-table-header';

    // Table Header
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Inventory List</th>
    `;
    headerTable.appendChild(headerRow);

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

        headerTable.appendChild(locationRow);

        // Dropdown rows for inventory items
        const dropdownCell = document.createElement('td');
        dropdownCell.setAttribute('colspan', '2');
        dropdownCell.style.padding = '0';

        const dropdownTable = document.createElement('table');
        dropdownTable.style.width = '100%';
        dropdownTable.setAttribute('border', '1');
        dropdownTable.className = 'inventory-location-table';

        // Add header to the dropdown table
        const dropdownHeader = document.createElement('tr');

        if (userRole === 'admin') {
            dropdownHeader.innerHTML = `
                <thead>
                <th>Select</th>
                <th>Inventory ID</th>
                <th>Product Name</th>
                <th>Item Category</th>
                <th>Current Quantity</th>
                <th>Max Quantity</th>
                <th>Adjustment</th>
                <th>Stock Status</th>
                </thead>
            `;
        } else {
            dropdownHeader.innerHTML = `
                <thead>
                <th>Select</th>
                <th>Inventory ID</th>
                <th>Product Name</th>
                <th>Item Category</th>
                <th>Current Quantity</th>
                <th>Max Quantity</th>
                <th>Stock Status</th>
                </thead>
            `;
        }
        dropdownTable.appendChild(dropdownHeader);

        // Add inventory details
        group.items.forEach((item) => {
            const row = document.createElement('tr');
            row.setAttribute('data-threshold', item.thres);

            const stockButton = document.createElement('button');
            stockButton.classList.add('stock-button');

            // Calculate stock status
            if (item.stat === 'Low') {
                stockButton.textContent = 'Low Stock';
                stockButton.classList.add('low');
            } else {
                stockButton.textContent = 'Enough Stock';
                stockButton.classList.add('enough');
            }

            // Dropdown contents

            if (userRole === 'admin') {
                row.innerHTML = `
                    <tbody>
                    <td><input type="checkbox" class="item-checkbox" data-id="${item.InventoryID}"></td>
                    <td>${item.InventoryID}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td id="quantity-${item.InventoryID}">${item.quantity}</td>
                    <td id="maxQuantity-${item.InventoryID}">${item.maxqt}</td>
                    <td>
                        <input type="number" id="adjustment-${item.InventoryID}" value="1" style="width: 50px; border-radius: 20px; border: 1px solid black;">
                        <label>
                        <input type="radio" name="action-${item.InventoryID}" value="add" checked>
                        Add
                        </label>
                        <label>
                            <input type="radio" name="action-${item.InventoryID}" value="subtract">
                            Subtract
                        </label>    
                    </td>
                    </tbody>
                `;
            } else {
                row.innerHTML = `
                    <tbody>
                    <td><input type="checkbox" class="item-checkbox" data-id="${item.InventoryID}"></td>
                    <td>${item.InventoryID}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td id="quantity-${item.InventoryID}">${item.quantity}</td>
                    <td id="maxQuantity-${item.InventoryID}">${item.maxqt}</td>
                    </tbody>
                `;
            }

            const stockStatusCell = document.createElement('td');
            stockStatusCell.appendChild(stockButton);
            row.appendChild(stockStatusCell);
            dropdownTable.appendChild(row);
        });

        dropdownCell.appendChild(dropdownTable);
        dropdownRow.appendChild(dropdownCell);
        headerTable.appendChild(dropdownRow);
    }

    inventoryDiv.appendChild(headerTable);
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
    const headerTable = document.createElement('table');
    headerTable.setAttribute('border', '1');
    headerTable.style.width = '100%';
    headerTable.style.borderCollapse = 'collapse';
    headerTable.className = 'inventory-product-table-header';

    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Inventory List</th>
    `;
    headerTable.appendChild(headerRow);

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

        headerTable.appendChild(productRow);

        // Dropdown rows for inventory items
        const dropdownCell = document.createElement('td');
        dropdownCell.setAttribute('colspan', '2');
        dropdownCell.style.padding = '0';

        const dropdownTable = document.createElement('table');
        dropdownTable.style.width = '100%';
        dropdownTable.setAttribute('border', '1');
        dropdownTable.className = 'inventory-table';

        // Add header to the dropdown table
        const dropdownHeader = document.createElement('tr');

        if (userRole === 'admin') {
            dropdownHeader.innerHTML = `
                <thead>
                <th>Select</th>
                <th>Inventory ID</th>
                <th>Location</th>
                <th>State</th>
                <th>Current Quantity</th>
                <th>Max Quantity</th>
                <th>Adjustment</th>
                <th>Stock Status</th>
                </thead>
            `;
        } else {
            dropdownHeader.innerHTML = `
            <thead>
            <th>Select</th>
            <th>Inventory ID</th>
            <th>Location</th>
            <th>State</th>
            <th>Current Quantity</th>
            <th>Max Quantity</th>
            <th>Stock Status</th>
            </thead>
        `;
        }
        dropdownTable.appendChild(dropdownHeader);

        // Add inventory details
        group.items.forEach((item) => {
            const row = document.createElement('tr');
            row.setAttribute('data-threshold', item.thres); // Store threshold for adjustQuantity

            const stockButton = document.createElement('button');
            stockButton.classList.add('stock-button');

            // Calculate stock status
            if (item.stat === 'Low') {
                stockButton.textContent = 'Low';
                stockButton.classList.add('low');
            } else {
                stockButton.textContent = 'Enough';
                stockButton.classList.add('enough');
            }

            // Dropdown contents
            if (userRole === 'admin') {
                row.innerHTML = `
                    <tbody>
                    <td><input type="checkbox" class="item-checkbox" data-id="${item.InventoryID}"></td>
                    <td>${item.InventoryID}</td>
                    <td>${item.location}</td>
                    <td>${item.state}</td>
                    <td id="quantity-${item.InventoryID}">${item.quantity}</td>
                    <td id="maxQuantity-${item.InventoryID}">${item.maxqt}</td>
                    <td>
                        <input 
                        type="number" 
                        id="adjustment-${item.InventoryID}" 
                        value="${inputValues[item.InventoryID] || 1}" 
                        style="width: 50px; border-radius: 20px; border: 1px solid black;"
                        oninput="inputValues[${item.InventoryID}] = this.value.trim()"
                        >      
                        <label>
                        <input type="radio" name="action-${item.InventoryID}" value="add" checked>
                        Add
                        </label>
                        <label>
                            <input type="radio" name="action-${item.InventoryID}" value="subtract">
                            Subtract
                        </label>                   
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <tbody>
                    <td><input type="checkbox" class="item-checkbox" data-id="${item.InventoryID}"></td>
                    <td>${item.InventoryID}</td>
                    <td>${item.location}</td>
                    <td>${item.state}</td>
                    <td id="quantity-${item.InventoryID}">${item.quantity}</td>
                    <td id="maxQuantity-${item.InventoryID}">${item.maxqt}</td>
                `;
            }
            const stockStatusCell = document.createElement('td');
            stockStatusCell.appendChild(stockButton);
            row.appendChild(stockStatusCell);
            dropdownTable.appendChild(row);
        });

        dropdownCell.appendChild(dropdownTable);
        dropdownRow.appendChild(dropdownCell);
        headerTable.appendChild(dropdownRow);
    }

    inventoryDiv.appendChild(headerTable);
}

async function adjustSelectedItems() {
    var errorCount = 0;

    const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked'); // Get all selected checkboxes
    const adjButton = document.querySelector(".adjustSelectedButton");

    adjButton.blur();
    adjButton.disabled = true;

    if (selectedCheckboxes.length === 0) {
        errorCount++;
        // Add error class
        adjButton.classList.add('error');

        // Reset and trigger animation
        adjButton.classList.remove('animate');
        void adjButton.offsetWidth; // Trigger reflow to restart animation
        adjButton.classList.add('animate');

        setTimeout(() => {
            adjButton.classList.remove('animate');
            adjButton.classList.remove('error');
            displayModal('Warning', errorCount, 'No items were selected.');
            adjButton.disabled = false; 
        }, 3400);
        
        return;
    }

    const adjustments = [];
    const errorMessages = [];

    selectedCheckboxes.forEach((checkbox) => {
        const inventoryID = checkbox.dataset.id;
        const adjustmentValue = parseInt(inputValues[inventoryID] || 1, 10);
        const action = document.querySelector(`input[name="action-${inventoryID}"]:checked`).value;

        // Validation: Check if adjustment value is valid
        if (isNaN(adjustmentValue) || adjustmentValue <= 0) {
            errorMessages.push(`Invalid adjustment value for Inventory ID ${inventoryID}.`);
            errorCount ++;
            return;
        }

        // Get current and max quantity
        const currentQuantity = parseInt(document.getElementById(`quantity-${inventoryID}`).textContent.trim(), 10);
        const maxQuantity = parseInt(document.getElementById(`maxQuantity-${inventoryID}`).textContent.trim(), 10);

        // Calculate new quantity
        const adjustment = action === 'add' ? adjustmentValue : -adjustmentValue;
        const newQuantity = currentQuantity + adjustment;

        // Validation: Ensure the new quantity is within valid limits
        if (newQuantity > maxQuantity) {
            errorMessages.push(`Cannot exceed MaxQuantity for Inventory ID ${inventoryID}.`);
            errorCount ++;
            return;
        }

        if (newQuantity < 0) {
            errorMessages.push(`Quantity cannot be less than 0 for Inventory ID ${inventoryID}.`);
            errorCount ++;
            return;
        }

        // Add valid adjustment to the list
        adjustments.push({
            InventoryID: inventoryID,
            adjustment: adjustment,
        });
    });

    // If there are validation errors, show them in the modal
    if (errorMessages.length > 0) {
        // Add error class
        adjButton.classList.add('error');

        // Reset and trigger animation
        adjButton.classList.remove('animate');
        void adjButton.offsetWidth; // Trigger reflow to restart animation
        adjButton.classList.add('animate');

        setTimeout(() => {
            adjButton.classList.remove('animate');
            adjButton.classList.remove('error');
            // Show modal with warning
            displayModal('Warning', errorCount, errorMessages.join('\n'));
            adjButton.disabled = false; 
        }, 3400);
        return;
    }

    // Send batch adjustments to the backend
    try {
        const response = await fetch('/update-quantity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adjustments })
        });

        if (response.ok) {
            // Add error class
            adjButton.classList.add('success');

            // Reset and trigger animation
            adjButton.classList.remove('animate');
            void adjButton.offsetWidth; // Trigger reflow to restart animation

            setTimeout(() => {
                adjButton.classList.add('success-bg'); // Clean up after animation
            }, 2500);
            adjButton.classList.add('animate');

            setTimeout(() => {
                adjButton.classList.remove('success-bg');
                adjButton.classList.remove('animate');
                adjButton.classList.remove('success');
                displayModal('Success', errorCount, 'Quantities adjusted successfully.');
                adjButton.disabled = false; 
            }, 3000);

            // Update stock statuses
            await updateStockStatus();
            await fetchInventory();

            // Refresh the low stock list if needed
            if (document.getElementById('short_list').style.display === 'block') {
                printShort();
            }
        } else {
            const error = await response.json();
            // Add error class
            adjButton.classList.add('error');

            // Reset and trigger animation
            adjButton.classList.remove('animate');
            void adjButton.offsetWidth; // Trigger reflow to restart animation
            adjButton.classList.add('animate');

            setTimeout(() => {
                adjButton.classList.remove('animate');
                adjButton.classList.remove('error');
                displayModal('Warning', `Error: ${error.error}`);
                adjButton.disabled = false; 
            }, 3400);
        }

    } catch (error) {
        // Add error class
        adjButton.classList.add('error');

        // Reset and trigger animation
        adjButton.classList.remove('animate');
        void adjButton.offsetWidth; // Trigger reflow to restart animation
        adjButton.classList.add('animate');

        setTimeout(() => {
            adjButton.classList.remove('animate');
            adjButton.classList.remove('error');
            displayModal('Warning', 'Error adjusting quantities.');
        }, 3400);
    }
}

// Get Orders and OrderDetails tables from backend to display order list
async function fetchOrders() {
    try {
        const response = await fetch('/Orders');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const ordersDiv = document.getElementById('orders_table');

        ordersDiv.innerHTML = '';

        // Create the table
        const table = document.createElement('table');
        table.setAttribute('border', '1');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.className = 'order-table-header';

        // Table Header
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Order List</th>
        `;
        table.appendChild(headerRow);

        const dropdownTable = document.createElement('table');
        dropdownTable.style.width = '100%';
        dropdownTable.setAttribute('border', '1');
        dropdownTable.className = 'inventory-order-table';

        const tableMenu = document.createElement('tr');
        tableMenu.innerHTML = `
                <th>Order Number</th>
                <th>Ordered Item</th>
                <th>Item Cateogory</th>
                <th>Supplier</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Amount</th>
                <th>Requester</th>
                <th>Requested Date</th>
                <th>Assigned Location</th>
        `;
        dropdownTable.appendChild(tableMenu);
       
        data.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.OrderID}</td>
                <td>${order.ProductName}</td>
                <td>${order.Category}</td>
                <td>${order.SupplierName}</td>
                <td>${order.Quantity}</td>
                <td>${order.UnitPrice}</td>
                <td>${order.TotalAmount}</td>
                <td>${order.FirstName} ${order.LastName}</td>
                <td>${order.OrderDate}</td>
                <td>${order.AssignedLocation}, ${order.LocationState}</td>
            `;
            dropdownTable.appendChild(row);
        });

        ordersDiv.appendChild(table);
        ordersDiv.appendChild(dropdownTable);

    } catch (error) {
        const ordersDiv = document.getElementById('orders_table');
        ordersDiv.textContent = 'Error loading orders.';
    }
}

async function updateStockStatus() {
    try {
        const response = await fetch('/update-stock-status', { method: 'POST' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchLowStockItems();
        console.log('Stock status updated successfully.');

    } catch (error) {
        console.error('Error updating stock status:', error);
    }
}

async function fetchLowStockItems() {
    try {
        const response = await fetch('/low-stock-list');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.length > 0) {
            showLowStockNotification();
        } else {
            hideLowStockNotification();
        }
    } catch (error) {
        console.error('Error fetching low-stock items:', error);
    }
}

function showLowStockNotification() {
    const notif = document.getElementById('notif');
    notif.innerHTML = '';

    // Create the stripe element
    const stripe = document.createElement('div');
    stripe.className = 'modal-stripe';

    stripe.style.position = 'absolute';
    stripe.style.top = '0';
    stripe.style.left = '0';
    stripe.style.width = '5px';
    stripe.style.height = '100%';
    stripe.style.backgroundColor = '#ea4f5e';
    stripe.style.borderTopLeftRadius = '10px';
    stripe.style.borderBottomLeftRadius = '10px';

    // Append the stripe to the modal
    notif.appendChild(stripe);

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'info';
    icon.style.color = '#ea4f5e';
    icon.style.fontSize = '24px'; 

    // Create a clickable element
    const link = document.createElement('a');
    link.textContent = 'You have low stock items!';
    link.href = 'javascript:void(0)';
    link.style.textDecoration = 'none';
    link.style.color = '#ea4f5e';
    link.addEventListener('click', () => {
        closeModal('notificationsModal');
        showSection('short_list');
    });
    notif.appendChild(icon);
    notif.appendChild(link);

    const notifButton = document.getElementById('notif_button');
    if (notifButton) {
        notifButton.style.backgroundImage = "url('./css/img/bell_after.png')"; // Set the new background image
        notifButton.style.backgroundSize = 'contain'; // Ensure the new image fits well
        notifButton.style.backgroundRepeat = 'no-repeat'; // Prevent repeating the image
        notifButton.style.backgroundPosition = 'center'; // Center the new image
    }
}

function hideLowStockNotification() {
    const notif = document.getElementById('notif');
    notif.innerHTML = ''; // Clear previous content

    // Create the stripe element
    const stripe = document.createElement('div');
    stripe.className = 'modal-stripe'; // Add a class for styling (optional)

    // Apply the styles directly
    stripe.style.position = 'absolute';
    stripe.style.top = '0';
    stripe.style.left = '0';
    stripe.style.width = '5px'; // Adjust the stripe width
    stripe.style.height = '100%'; // Make it span the full height of the modal
    stripe.style.backgroundColor = '#678f64'; // Set the stripe color
    stripe.style.borderTopLeftRadius = '10px'; // Match the modal's border radius
    stripe.style.borderBottomLeftRadius = '10px'; // Match the modal's border radius

    // Append the stripe to the modal
    notif.appendChild(stripe);

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'info';
    icon.style.color = '#678f64';
    icon.style.fontSize = '24px'; 

    // Create a clickable element
    const text = document.createElement('p');
    text.textContent = 'You don\'t have any low stock item(s).'; 

    notif.appendChild(icon);
    notif.appendChild(text);

    const notifButton = document.getElementById('notif_button');
    if (notifButton) {
        notifButton.style.backgroundImage = "url('./css/img/bell_before.png')";
        notifButton.style.backgroundSize = 'contain';
        notifButton.style.backgroundRepeat = 'no-repeat';
        notifButton.style.backgroundPosition = 'center';
    }
}

async function printShort() {
    try {
        const response = await fetch('/low-stock-list');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const inventoryDiv = document.getElementById('short_list');
        inventoryDiv.innerHTML = '';

        const data = await response.json();

        // Create the table
        const table = document.createElement('table');
        table.setAttribute('border', '1');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.className = 'inventory-short-table-header';

        // Table Header
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Short List</th>
        `;
        table.appendChild(headerRow);
        
        const dropdownTable = document.createElement('table');
        dropdownTable.style.width = '100%';
        dropdownTable.setAttribute('border', '1');
        dropdownTable.className = 'inventory-short-table';

        // Add header to the dropdown table
        const dropdownHeader = document.createElement('tr');
        dropdownHeader.innerHTML = `
            <th>Select</th>
            <th>Inventory ID</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Location</th>
            <th>State</th>
            <th>Current Quantity</th>
            <th>Max Quantity</th>
            <th>Adjustment</th>
            <th>Stock Status</th>
        `;
        dropdownTable.appendChild(dropdownHeader);

        // Add inventory details
        data.forEach((item) => {
            const row = document.createElement('tr');
            row.setAttribute('data-threshold', item.thres);

            const stockButton = document.createElement('button');
            stockButton.classList.add('stock-button');

            // Calculate stock status
            if (1 - item.quantity / item.maxqt > item.thres) {
                stockButton.textContent = 'Low';
                stockButton.classList.add('low');
            } else {
                stockButton.textContent = 'Enough';
                stockButton.classList.add('enough');
            }

            // Dropdown contents
            row.innerHTML = `
                <td><input type="checkbox" class="item-checkbox" data-id="${item.InventoryID}"></td>
                <td>${item.InventoryID}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.location}</td>
                <td>${item.state}</td>
                <td id="quantity-${item.InventoryID}">${item.quantity}</td>
                <td>${item.maxqt}</td>
                <td>
                    <input 
                    type="number" 
                    id="adjustment-${item.InventoryID}" 
                    value="${inputValues[item.InventoryID] || 1}" 
                    style="width: 50px;"
                    oninput="inputValues[${item.InventoryID}] = this.value.trim()"
                    >                    
                    <label>
                    <input type="radio" name="action-${item.InventoryID}" value="add" checked>
                    Add
                    </label>
                    <label>
                        <input type="radio" name="action-${item.InventoryID}" value="subtract">
                        Subtract
                    </label> 
                </td>
            `;

            const stockStatusCell = document.createElement('td');
            stockStatusCell.appendChild(stockButton);
            row.appendChild(stockStatusCell);
            dropdownTable.appendChild(row);
        });

        inventoryDiv.appendChild(table);
        inventoryDiv.appendChild(dropdownTable);
    } catch (error) {
        console.error('Error fetching or displaying low stock items:', error);
    }
}