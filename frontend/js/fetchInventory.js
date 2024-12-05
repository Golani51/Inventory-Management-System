//
//  FILE: fetchInventory.js
//  ORIGINAL AUTHOR: Joshua Hur
//  LATEST CHANGE BY: Joshua Hur 12/2/24
//

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
            dropdownTable.classList.add('alternate-style');
            dropdownHeader.innerHTML = `
                <thead>
                <th>SELECT</th>
                <th>INVENTORY ID</th>
                <th>PRODUCT NAME</th>
                <th>ITEM CATEGORY</th>
                <th>CURRENT QUANTITY</th>
                <th>MAX QUANTITY</th>
                <th>ADJUSTMENT</th>
                <th>STOCK STATUS</th>
                </thead>
            `;
        } else {
            dropdownTable.classList.remove('alternate-style');
            dropdownHeader.innerHTML = `
                <thead>
                <th>INVENTORY ID</th>
                <th>PRODUCT NAME</th>
                <th>ITEM CATEGORY</th>
                <th>CURRENT QUANTITY</th>
                <th>MAX QUANTITY</th>
                <th>STOCK STATUS</th>
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
            dropdownTable.classList.add('alternate-style');
            dropdownHeader.innerHTML = `
                <thead>
                <th>SELECT</th>
                <th>INVENTORY ID</th>
                <th>LOCATION</th>
                <th>STATE</th>
                <th>CURRENT QUANTITY</th>
                <th>MAX QUANTITY</th>
                <th>ADJUSTMENT</th>
                <th>STOCK STATUS</th>
                </thead>
            `;
        } else {
            dropdownTable.classList.remove('alternate-style');
            dropdownHeader.innerHTML = `
            <thead>
            <th>INVENTORY ID</th>
            <th>LOCATION</th>
            <th>STATE</th>
            <th>CURRENT QUANTITY</th>
            <th>MAX QUANTITY</th>
            <th>STOCK STATUS</th>
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

function disableLinks() {
    const linksToDisable = ['inventoryTab', 'ordersTab', 'chartsTab', 'auditLog'];

    linksToDisable.forEach(id => {
        const link = document.getElementById(id);
        link.classList.add('disabled'); // Add a disabled class for styling
        link.onclick = (e) => e.preventDefault(); // Prevent clicking
    });
}

function enableLinks() {
    const tabs = {
        inventoryTab: 'inventory_list',
        ordersTab: 'orders_section',
        chartsTab: 'chart_section',
        auditLog: 'auditlog_section',
    };

    Object.entries(tabs).forEach(([id, section]) => {
        const link = document.getElementById(id);
        link.classList.remove('disabled'); // Remove the disabled class
        link.onclick = () => showSection(section); // Restore tab functionality
    });
}

async function adjustSelectedItems() {
    var errorCount = 0;

    const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked'); // Get all selected checkboxes
    const adjButton = document.querySelector(".adjustSelectedButton");

    adjButton.blur();
    adjButton.disabled = true;
    document.getElementById('notif_button').disabled = true;
    document.getElementById('acc_button').disabled = true;
    disableLinks();

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
            adjButton.disabled = false;
            document.getElementById('notif_button').disabled = false;
            document.getElementById('acc_button').disabled = false;
            enableLinks();

            displayModal('WARNING', errorCount, 'No items were selected.');

            const message = 'No items were selected.';
            logToBackend(message, 'FAILURE');
            document.getElementById('errorModal').style.height = '205px';
            document.getElementById('errorModalMessage').style.marginTop = '-10px';
            document.getElementById('errorModalMessage').style.marginBottom = '-5px';
            document.getElementById('errorModalMessage').style.marginLeft = '0px';
            document.getElementById('errorModalMessage').style.textAlign = 'center';
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
            const message = `Invalid adjustment value for Inventory ID ${inventoryID}.`;
            errorMessages.push(message);
            errorCount ++;
            logToBackend(`Inventory item #${inventoryID} was not adjusted because of invalid adjustment.`, 'FAILURE');
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
            const message = `Cannot exceed Max Quantity for Inventory ID ${inventoryID}.`;
            errorMessages.push(message);
            errorCount ++;
            logToBackend(`Inventory item #${inventoryID} was not adjusted because the result quantity cannot exceed its max quantity.`, 'FAILURE');
            return;
        }

        if (newQuantity < 0) {
            const message = `Quantity cannot be less than 0 for Inventory ID ${inventoryID}.`;
            errorMessages.push(message);
            errorCount ++;
            logToBackend(`Inventory item #${inventoryID} was not adjusted because the adjusted quantity cannot be less than 0`, 'FAILURE');
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
            adjButton.disabled = false;
            document.getElementById('notif_button').disabled = false;
            document.getElementById('acc_button').disabled = false;
            enableLinks();

            displayModal('WARNING', errorCount, errorMessages.join('\n'));
            document.getElementById('errorModal').style.height = '335px';
            document.getElementById('errorModalMessage').style.marginTop = '-13px';
            document.getElementById('errorModalMessage').style.marginBottom = '-5px';
            document.getElementById('errorModalMessage').style.textAlign = 'left';

            const modalMessage = document.getElementById('errorModalMessage');
            const modal = document.getElementById('errorModal');

            // Dynamically calculate the margin-left based on the longest string
            const fontStyle = window.getComputedStyle(modalMessage).font;
            const longestLineWidth = calculateLongestLineWidth(modalMessage.value, fontStyle);

            // Adjust the margin-left dynamically
            document.getElementById('errorModalMessage').style.marginLeft = `${Math.max(0, ((modal.offsetWidth - longestLineWidth) / 2) - 15)}px`;

            // Adjust the heigh case by case
            if (errorCount <= 8) {
                if (errorCount === 1) {
                document.getElementById('errorModal').style.height = '205px';
                document.getElementById('errorModalMessage').style.marginLeft = '0px';
                document.getElementById('errorModalMessage').style.textAlign = 'center';

                } else if (errorCount === 2) {
                    document.getElementById('errorModal').style.height = '220px';
                } else if (errorCount === 3) {
                    document.getElementById('errorModal').style.height = '235px';
                } else if (errorCount === 4) {
                    document.getElementById('errorModal').style.height = '255px';
                } else if (errorCount === 5) {
                    document.getElementById('errorModal').style.height = '270px';
                } else if (errorCount === 6) {
                    document.getElementById('errorModal').style.height = '290px';
                } else if (errorCount === 7) {
                    document.getElementById('errorModal').style.height = '305px';
                } else if (errorCount === 8) {
                    document.getElementById('errorModal').style.height = '325px';
                }
            }

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
                adjButton.disabled = false;
                document.getElementById('notif_button').disabled = false;
                document.getElementById('acc_button').disabled = false;
                enableLinks();
    
                displayModal('SUCCESS', errorCount, 'Quantities adjusted successfully.');
                document.getElementById('errorModalMessage').style.marginTop = '-25px';
                document.getElementById('errorModal').style.height = '175px';
                document.getElementById('errorModalMessage').style.marginBottom = '-5px';
                document.getElementById('errorModalMessage').style.marginLeft = '0px';
                document.getElementById('errorModalMessage').style.textAlign = 'center';
            }, 3000);

            // Update stock statuses
            await updateStockStatus();
            showSection('inventory_list');

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
                adjButton.disabled = false;
                document.getElementById('notif_button').disabled = false;
                document.getElementById('acc_button').disabled = false;
                enableLinks();

                displayModal('WARNING', `Error: ${error.error}`);
                document.getElementById('errorModal').style.height = '205px';
                document.getElementById('errorModalMessage').style.marginTop = '-10px';
                document.getElementById('errorModalMessage').style.marginBottom = '-5px';
                document.getElementById('errorModalMessage').style.marginLeft = '0px';
                document.getElementById('errorModalMessage').style.textAlign = 'center';
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
            adjButton.disabled = false;
            document.getElementById('notif_button').disabled = false;
            document.getElementById('acc_button').disabled = false;
            enableLinks();
            
            displayModal('WARNING', 'Error adjusting quantities.');
            document.getElementById('errorModal').style.height = '205px';
            document.getElementById('errorModalMessage').style.marginTop = '-10px';
            document.getElementById('errorModalMessage').style.marginBottom = '-5px';
            document.getElementById('errorModalMessage').style.marginLeft = '0px';
            document.getElementById('errorModalMessage').style.textAlign = 'center';
        }, 3400);
    }
}

// Helper function to adjust margin left depends on the longest string line.
function calculateLongestLineWidth(text, fontStyle) {
    // Create a hidden span element to measure text width
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'nowrap';
    span.style.position = 'absolute';
    span.style.font = fontStyle;

    // Append to body, calculate width, then remove it
    document.body.appendChild(span);

    // Split text into lines and find the longest one
    const lines = text.split('\n');
    let maxWidth = 0;

    lines.forEach(line => {
        span.textContent = line;
        maxWidth = Math.max(maxWidth, span.offsetWidth);
    });

    document.body.removeChild(span);
    return maxWidth;
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
    stripe.style.width = '60px';
    stripe.style.height = '100%';
    stripe.style.backgroundColor = '#ea4f5e';
    stripe.style.borderTopLeftRadius = '6px';
    stripe.style.borderBottomLeftRadius = '6px';

    // Append the stripe to the modal
    notif.appendChild(stripe);

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'info';
    icon.style.color = '#ffffff';
    icon.style.fontSize = '24px'; 
    icon.style.zIndex = '10';

    // Create a clickable element
    const link = document.createElement('a');
    link.textContent = 'You have low stock items!';
    link.href = 'javascript:void(0)';
    link.style.textDecoration = 'none';
    link.style.color = '#878787';
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
    stripe.className = 'modal-stripe';

    // Apply the styles directly
    stripe.style.position = 'absolute';
    stripe.style.top = '0';
    stripe.style.left = '0';
    stripe.style.width = '60px';
    stripe.style.height = '100%';
    stripe.style.backgroundColor = '#678f64';
    stripe.style.borderTopLeftRadius = '6px';
    stripe.style.borderBottomLeftRadius = '6px';

    // Append the stripe to the modal
    notif.appendChild(stripe);

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'check_circle';
    icon.style.color = '#ffffff';
    icon.style.fontSize = '24px';
    icon.style.zIndex = '10';

    const text = document.createElement('p');
    text.style.color = '#878787';
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

        if (userRole === 'admin') {
            dropdownTable.classList.add('alternate-style');
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
        } else {
            dropdownTable.classList.remove('alternate-style');

            headerRow.innerHTML = `
            <th>ORDER NUMBER</th>
            <th>ORDERED ITEM</th>
            <th>ITEM CATEGORY</th>
            <th>SUPPLIER</th>
            <th>QUANTITY</th>
            <th>UNIT PRICE</th>
            <th>TOTAL AMOUNT</th>
            <th>REQUESTER</th>
            <th>REQUESTED DATE</th>
            <th>ASSIGNED LOCATION</th>
        `;
        }
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