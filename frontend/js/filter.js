// View mode change handler
function changeViewMode() {
    const category = document.getElementById('categoryFilter').value; // Get the current category filter
    const productId = document.getElementById('searchProductId').value.trim(); // Get the current ProductID filter
    currentViewMode = document.getElementById('viewMode').value; // Update the view mode
    fetchFilteredInventory(category, productId); // Fetch inventory based on filters

    // Reapply "Select All" state if it was checked
    if (isSelectAllChecked) {
        toggleSelectAll({ checked: true });
    }
}

// Get categories from backend and make a dropdown category filter
async function fetchCategories() {
    try {
        let url;

        if (currentSection === 'inventory_list') {
            url = '/categories';
        } else if (currentSection === 'orders_section') {
            url = '/order-categories';
        } else if (currentSection === 'short_list') {
            url = '/short-categories';
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) {
            console.error('Error: categoryFilter element not found.');
            return;
        }

        categoryFilter.innerHTML = ''; // Clear existing options

        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All Categories';
        categoryFilter.appendChild(allOption);

        data.sort((a, b) => a.Category.localeCompare(b.Category));

        data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.Category;
            option.textContent = category.Category;
            categoryFilter.appendChild(option);
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Error fetching categories. See console for details.');
    }
}


async function fetchStates() {
    try {
        let url;
        if (currentSection === 'inventory_list') {
            url = '/states';
        } else if (currentSection === 'orders_section') {
            url = '/order-states';
        } else if (currentSection === 'short_list') {
            url = '/short-states';
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const stateFilter = document.getElementById('stateFilter');
        if (!stateFilter) {
            console.error('Error: stateFilter element not found.');
            return;
        }

        stateFilter.innerHTML = ''; // Clear existing options
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All Categories';
        stateFilter.appendChild(allOption);

        data.sort((a, b) => a.LocationState.localeCompare(b.LocationState));
        data.forEach(state => {
            const option = document.createElement('option');
            option.value = state.LocationState;
            option.textContent = state.LocationState;
            stateFilter.appendChild(option);
        });

    } catch (error) {
        console.error('Error fetching states:', error);
        alert('Error fetching states. See console for details.');
    }
}

async function fetchFilteredInventory() {
    const category = activeFilters.category || ''; // Get active category
    const productId = activeFilters.productId || ''; // Get active ProductID
    const state = activeFilters.state || ''; // Get active state
    const orderId = activeFilters.orderId || ''; // Add orderId filter
    const inventoryId = activeFilters.inventoryId || ''; // Add orderId filter
    let endpoint;

    if (currentSection === 'inventory_list') {
        endpoint = '/Inventory';
    } else if (currentSection === 'orders_section') {
        endpoint = '/Orders';
    } else if (currentSection === 'short_list') {
        endpoint = '/low-stock-list';
    }

    try {
        const response = await fetch(`${endpoint}?category=${encodeURIComponent(category)}&productId=${encodeURIComponent(productId)}&state=${encodeURIComponent(state)}&orderId=${encodeURIComponent(orderId)}&inventoryId=${encodeURIComponent(inventoryId)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (currentSection === 'orders_section') {
            const ordersDiv = document.getElementById('orders_section');
            ordersDiv.innerHTML = ''; // Clear previous content

            if (data.length > 0) {
                renderOrders(data, ordersDiv);
            } else {
                ordersDiv.textContent = 'No order items found for the given filters.';
            }
        } else if (currentSection === 'inventory_list') {
            const inventoryDiv = document.getElementById('inventory_list');
            inventoryDiv.innerHTML = ''; // Clear previous content

            if (data.length > 0) {
                if (currentViewMode === 'product') {
                    renderGroupedByProduct(data, inventoryDiv);
                } else if (currentViewMode === 'location') {
                    renderGroupedByLocation(data, inventoryDiv);
                }
            } else {
                inventoryDiv.textContent = 'No inventory items found for the given filters.';
            }
        } else if (currentSection === 'short_list') {
            const shortDiv = document.getElementById('short_list');
            shortDiv.innerHTML = ''; // Clear previous content
            if (data.length > 0) {
                renderShorts(data, shortDiv);
            } else {
                shortDiv.textContent = 'No order items found for the given filters.';
            }
        }
    } catch (error) {
        alert('Error loading inventory');
        console.error('Fetch error:', error);
    }
}

function renderShorts(data, container) {
    container.innerHTML = '';

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
        dropdownHeader.innerHTML = `
        <th>Select</th>
        <th>Inventory ID</th>
        <th>Product Name</th>
        <th>Category</th>
        <th>Location</th>
        <th>State</th>
        <th>Current Quantity</th>
        <th>Max Quantity</th>
        <th>Stock Status</th>
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
        if (userRole === 'admin') {
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
            <td><input type="checkbox" class="item-checkbox" data-id="${item.InventoryID}"></td>
            <td>${item.InventoryID}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.location}</td>
            <td>${item.state}</td>
            <td id="quantity-${item.InventoryID}">${item.quantity}</td>
            <td>${item.maxqt}</td>
            `;
        }

        const stockStatusCell = document.createElement('td');
        stockStatusCell.appendChild(stockButton);
        row.appendChild(stockStatusCell);
        dropdownTable.appendChild(row);
    });

    container.appendChild(table);
    container.appendChild(dropdownTable);
}


function renderOrders(data, container) {
    container.innerHTML = '';

    // Create the table
    const headerTable = document.createElement('table');
    headerTable.setAttribute('border', '1');
    headerTable.style.width = '100%';
    headerTable.style.borderCollapse = 'collapse';
    headerTable.className = 'order-table-header';

    // Table Header
    const header = document.createElement('tr');
    header.innerHTML = `
        <th>Order List</th>
    `;
    headerTable.appendChild(header);

    const table = document.createElement('table');
    table.setAttribute('border', '1');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.className = 'inventory-order-table';

    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Order Number</th>
        <th>Ordered Item</th>
        <th>Item Category</th>
        <th>Supplier</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Total Amount</th>
        <th>Requester</th>
        <th>Requested Date</th>
        <th>Assigned Location</th>
    `;
    table.appendChild(headerRow);

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
        table.appendChild(row);
    });

    container.appendChild(headerTable);
    container.appendChild(table);
}

async function filterInventoryByCategory() {
    const category = document.getElementById('categoryFilter').value;
    activeFilters.category = category || null; // Update active filters
    fetchFilteredInventory(); // Reload inventory
    renderActiveFilters(); // Update filter boxes
}

async function filterInventoryByState() {
    const state = document.getElementById('stateFilter').value;
    activeFilters.state = state || null; // Update active filters
    fetchFilteredInventory(); // Reload inventory
    renderActiveFilters(); // Update filter boxes
}

async function searchByProductId() {
    const productId = document.getElementById('searchProduct').value.trim();
    if (!productId) {
        alert('Please enter a ProductID to search.');
        return;
    }

    activeFilters.productId = productId; // Update active filters
    fetchFilteredInventory(); // Reload inventory
    renderActiveFilters(); // Update filter boxes
}

async function searchByOrderId() {
    const orderId = document.getElementById('searchOrder').value.trim();
    if (!orderId) {
        alert('Please enter an OrderID to search.');
        return;
    }

    activeFilters.orderId = orderId; // Update active filters
    fetchFilteredInventory(); // Reload orders with the new filter
    renderActiveFilters(); // Update filter boxes
}

async function searchByInventoryId() {
    const inventoryId = document.getElementById('searchInventory').value.trim();
    if (!inventoryId) {
        alert('Please enter an Inventory to search.');
        return;
    }

    activeFilters.inventoryId = inventoryId; // Update active filters
    fetchFilteredInventory(); // Reload orders with the new filter
    renderActiveFilters(); // Update filter boxes
}

function renderActiveFilters() {
    const filterContainer = document.getElementById('activeFilters');
    filterContainer.innerHTML = ''; // Clear existing filters

    let hasActiveFilters = false; // Track if any filters are active

    // Create the "Clear All" button
    const clearAllButton = document.createElement('button');
    clearAllButton.textContent = 'Clear All';
    clearAllButton.className = 'clear-all-btn';
    clearAllButton.style.display = 'none';
    clearAllButton.addEventListener('click', () => {
        // Clear all filters
        activeFilters = {
            category: null,
            state: null,
            productId: null,
            orderId: null,
            inventoryId: null
        };

        // Reset all filter inputs
        document.getElementById('categoryFilter').value = '';
        document.getElementById('stateFilter').value = '';
        document.getElementById('searchProduct').value = '';
        document.getElementById('searchOrder').value = '';
        document.getElementById('searchInventory').value = '';

        renderActiveFilters(); // Update filter boxes
        fetchFilteredInventory();
    });

    // Append the "Clear All" button first
    filterContainer.appendChild(clearAllButton);

    // Add a filter box for category if it's active
    if (activeFilters.category) {
        hasActiveFilters = true;
        const categoryFilter = createFilterBox('Category', activeFilters.category, () => {
            activeFilters.category = null; // Remove category filter
            document.getElementById('categoryFilter').value = ''; // Reset dropdown
            fetchFilteredInventory(); // Reload inventory
        });
        filterContainer.appendChild(categoryFilter);
    }

    if (activeFilters.state) {
        hasActiveFilters = true;
        const stateFilter = createFilterBox('State', activeFilters.state, () => {
            activeFilters.state = null; // Remove state filter
            document.getElementById('stateFilter').value = ''; // Reset dropdown
            fetchFilteredInventory(); // Reload inventory
        });
        filterContainer.appendChild(stateFilter);
    }

    // Add a filter box for ProductID if it's active
    if (activeFilters.productId) {
        hasActiveFilters = true;
        const productIdFilter = createFilterBox('ProductID', activeFilters.productId, () => {
            activeFilters.productId = null; // Remove ProductID filter
            document.getElementById('searchProduct').value = ''; // Clear input
            fetchFilteredInventory(); // Reload inventory
        });
        filterContainer.appendChild(productIdFilter);
    }

    if (activeFilters.orderId) {
        hasActiveFilters = true;
        const orderIdFilter = createFilterBox('OrderID', activeFilters.orderId, () => {
            activeFilters.orderId = null; // Remove OrderID filter
            document.getElementById('searchOrder').value = ''; // Clear input
            fetchFilteredInventory(); // Reload inventory
        });
        filterContainer.appendChild(orderIdFilter);
    }

    if (activeFilters.inventoryId) {
        hasActiveFilters = true;
        const inventoryIdFilter = createFilterBox('InventoryID', activeFilters.inventoryId, () => {
            activeFilters.inventoryId = null; // Remove OrderID filter
            document.getElementById('searchInventory').value = ''; // Clear input
            fetchFilteredInventory(); // Reload inventory
        });
        filterContainer.appendChild(inventoryIdFilter);
    }

    // Show or hide the "Clear All" button based on active filters
    if (hasActiveFilters) {
        clearAllButton.style.display = 'block';
    } else {
        clearAllButton.style.display = 'none';
    }
}

function createFilterBox(label, value, onRemove) {
    const filterBox = document.createElement('div');
    filterBox.className = 'filter-box';

    const filterLabel = document.createElement('span');
    filterLabel.textContent = `${label}: ${value}`;
    filterLabel.style.marginRight = '10px';

    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.style.border = 'none';
    removeButton.style.background = 'transparent';
    removeButton.style.cursor = 'pointer';
    removeButton.addEventListener('click', () => {
        onRemove(); // Call the removal callback
        renderActiveFilters(); // Update filter boxes
    });

    filterBox.appendChild(filterLabel);
    filterBox.appendChild(removeButton);

    return filterBox;
}

let isSelectAllChecked = false; // Track the state of the Select All checkbox

function toggleSelectAll(selectAllCheckbox) {
    // Determine the container based on the current section
    const sectionContainer = document.getElementById(currentSection);
    if (!sectionContainer) {
        console.error('Active section container not found.');
        return;
    }

    // Find all item checkboxes within the active section
    const itemCheckboxes = sectionContainer.querySelectorAll('.item-checkbox');

    // Set their checked state to match the "Select All" checkbox
    itemCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}


document.addEventListener('change', (event) => {
    if (event.target.classList.contains('item-checkbox')) {
        const sectionContainer = document.getElementById(currentSection);
        if (!sectionContainer) {
            console.error('Active section container not found.');
            return;
        }

        const allCheckboxes = sectionContainer.querySelectorAll('.item-checkbox');
        const allChecked = Array.from(allCheckboxes).every(checkbox => checkbox.checked);
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = allChecked;
            isSelectAllChecked = allChecked;
        }
    }
});


function resetSelectAllCheckbox() {
    const sectionContainer = document.getElementById(currentSection);
    if (!sectionContainer) {
        console.error('Active section container not found.');
        return;
    }

    const selectAllCheckbox = sectionContainer.querySelector('#selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    isSelectAllChecked = false;
}
