// Default settings and configuration
const DEFAULTS = {
    filters: {
        category: null,
        productId: null,
        state: null,
        inventoryId: null,
        orderId: null,
    },
    viewMode: 'product'
};

let activeFilters = { ...DEFAULTS.filters };
let currentViewMode = DEFAULTS.viewMode;
let isLoggedIn = false; // Track logged-in state
let currentSection = null; // Track current section
let userRole;

async function initializePage() {
    try {
        const response = await fetch('/check-session');
        if (response.ok) {
            const data = await response.json();
            configureUIAfterLogin(data); // Update the UI for a logged-in user
        } else {
            hideRestrictedSections(); // Reset the UI for logged-out state
            login(); // Display login form
        }
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

// Hide all restricted sections if the user is not logged in
function hideRestrictedSections() {
    const restrictedSections = ['inventory_list', 'orders_section', 'short_list'];
    restrictedSections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = 'none';
    });

    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('inventory_filter').style.display = 'none';
    document.getElementById('adjustSelectedButton').style.display = 'none';
    document.getElementById('notif').textContent = `You need to login.`;
    document.getElementById('logoutButton').style.display = 'none';
    document.getElementById('user_info').style.display = 'none';
    document.getElementById('user_greeting').style.display = 'block';
    document.getElementById('user_greeting').textContent = `You need to login.`;
}

// Show restricted sections and configure the UI after login
function configureUIAfterLogin(data) {
    isLoggedIn = true; // Update the logged-in state

    // Display user information
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'inline';
    document.getElementById('user_greeting').style.display = 'block';
    document.getElementById('user_greeting').textContent = `Hello! ${data.firstname}`;
    document.getElementById('user_info').style.display = 'block';
    document.getElementById('user_info').textContent = `Logged in as ${data.username} (${data.role})`;

    userRole = data.role;

    if (userRole === "admin") {
        document.getElementById('auditLog').style.display = 'block';
    } else {
        document.getElementById('auditLog').style.display = 'none';
    }

    // Load dropdown options and inventory
    updateStockStatus();
    fetchInventory();

    document.getElementById('inventory_filter').style.display = 'block';
    document.getElementById('adjustSelectedButton').style.display = 'block';

    // Show the inventory section by default
    showSection('inventory_list');
}

// Show specific section
function showSection(sectionId) {
    loginNotif.textContent = '';
    
    if (!isLoggedIn) {
        loginNotif.textContent = 'You need to login to access.'
        return;
    }

    const sections = document.querySelectorAll('#inventory_list, #orders_section, #short_list');
    sections.forEach(section => section.style.display = 'none');

    const section = document.getElementById(sectionId);
    if (section) {
        // Update the global variable to track the current section
        currentSection = sectionId;
        section.style.display = 'block';

        // Reset the "Select All" checkbox
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
            isSelectAllChecked = false; // Reset the tracking variable
        }

        if (sectionId === 'inventory_list') {
            const inventoryFilter = document.getElementById('inventory_filter');
            inventoryFilter.style.display = 'flex';
            inventoryFilter.style.margin = '0 auto'; // Center it horizontally
        
            document.getElementById('viewModeFilter').style.display = 'block';
            document.getElementById('viewMode').style.display = 'block';
            document.getElementById('ProductIdFilter').style.display = 'block';
            document.getElementById('OrderIdFilter').style.display = 'none';
            document.getElementById('InventoryIdFilter').style.display = 'none';
            document.getElementById('activeFilters').style.display = 'flex';

            if (userRole === 'admin') {
                document.getElementById('selectAllBox').style.display = 'block';
                document.getElementById('adjustSelectedButton').style.display = 'block';
            } else {
                document.getElementById('selectAllBox').style.display = 'none';
                document.getElementById('adjustSelectedButton').style.display = 'none';
            }
        
            document.getElementById('categoryFilterContainer').style.marginLeft = '20px'

            fetchCategories();
            fetchStates();
            resetFiltersAndViewMode();
            renderActiveFilters();
            fetchFilteredInventory();

        } else if (sectionId === 'orders_section') {
            const inventoryFilter = document.getElementById('inventory_filter');
            inventoryFilter.style.display = 'flex';
            inventoryFilter.style.margin = '0 auto'; // Center it horizontally
        
            document.getElementById('selectAllBox').style.display = 'none';
            document.getElementById('viewModeFilter').style.display = 'none';
            document.getElementById('viewMode').style.display = 'none';
            document.getElementById('ProductIdFilter').style.display = 'none';
            document.getElementById('OrderIdFilter').style.display = 'block';
            document.getElementById('InventoryIdFilter').style.display = 'none';
            document.getElementById('activeFilters').style.display = 'flex';
            document.getElementById('adjustSelectedButton').style.display = 'none';

            document.getElementById('categoryFilterContainer').style.marginLeft = '0px'
        
            fetchCategories();
            fetchStates();
            resetFiltersAndViewMode();
            renderActiveFilters();
            fetchFilteredInventory();

        } else if (sectionId === 'short_list') {
            const inventoryFilter = document.getElementById('inventory_filter');
            inventoryFilter.style.display = 'flex';
            inventoryFilter.style.margin = '0 auto'; // Center it horizontally
        
            document.getElementById('viewModeFilter').style.display = 'none';
            document.getElementById('viewMode').style.display = 'none';
            document.getElementById('ProductIdFilter').style.display = 'none';
            document.getElementById('OrderIdFilter').style.display = 'none';
            document.getElementById('InventoryIdFilter').style.display = 'block';
            document.getElementById('activeFilters').style.display = 'flex';

            if (userRole === 'admin') {
                document.getElementById('selectAllBox').style.display = 'block';
                document.getElementById('adjustSelectedButton').style.display = 'block';
            } else {
                document.getElementById('selectAllBox').style.display = 'none';
                document.getElementById('adjustSelectedButton').style.display = 'none';
            }

            document.getElementById('categoryFilterContainer').style.marginLeft = '20px'
        
            fetchCategories();
            fetchStates();
            resetFiltersAndViewMode();
            renderActiveFilters();
            fetchFilteredInventory();
        }
    } else {
        const inventoryFilter = document.getElementById('inventory_filter');
        inventoryFilter.style.display = 'none';
    
        document.getElementById('selectAllBox').style.display = 'none';
        document.getElementById('viewModeFilter').style.display = 'none';
        document.getElementById('viewMode').style.display = 'none';
        document.getElementById('adjustSelectedButton').style.display = 'none';
        document.getElementById('ProductIdFilter').style.display = 'none';
        document.getElementById('OrderIdFilter').style.display = 'none';
        document.getElementById('activeFilters').style.display = 'none';

        document.getElementById('categoryFilterContainer').style.marginLeft = '20px'
    }
}

// Reset filters and view mode to defaults
function resetFiltersAndViewMode() {
    activeFilters = { ...DEFAULTS.filters };
    currentViewMode = DEFAULTS.viewMode;

    // Update UI elements
    document.getElementById('viewMode').value = 'product';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('searchProductId').value = '';
    document.getElementById('stateFilter').value = '';
}

// Login form submission handler
function login(){
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const loginData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
        };

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const data = await response.json();
                configureUIAfterLogin(data);
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login. Please try again later.');
        }
    });
}

document.getElementById('logoutButton').addEventListener('click', async function () {
    try {
        const response = await fetch('/logout', { method: 'POST' });
        if (response.ok) {
            // Reset the logged-in state
            isLoggedIn = false;

            userRole = null;

            closeModal('accountModal');
            const notifButton = document.getElementById('notif_button');
            if (notifButton) {
                notifButton.style.backgroundImage = "url('./img/bell_before.png')"; // Set the new background image
                notifButton.style.backgroundSize = 'contain'; // Ensure the new image fits well
                notifButton.style.backgroundRepeat = 'no-repeat'; // Prevent repeating the image
                notifButton.style.backgroundPosition = 'center'; // Center the new image
            }

            hideRestrictedSections();
            login();

            console.log('Logged out successfully.');
        } else {
            const errorData = await response.json();
            alert(`Error logging out: ${errorData.message || 'Please try again.'}`);
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred while logging out. Please try again.');
    }
});

// Event listener to initialize the page on DOM content load
document.addEventListener('DOMContentLoaded', initializePage);
