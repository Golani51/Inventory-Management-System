//
//  FILE: main.js
//  ORIGINAL AUTHOR: Joshua Hur
//  LATEST CHANGE BY: Joshua Hur 12/4/24
//

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
    const restrictedSections = ['inventory_list', 'orders_section', 'short_list', 'chart_section', 'auditlog_section'];
    restrictedSections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = 'none';
    });

    document.getElementById('login_section').style.display = 'flex';
    document.getElementById('inventory_filter').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'none';
    document.getElementById('user_info').style.display = 'none';
    document.getElementById('user_greeting').style.display = 'none';
    document.getElementById('auditLog').style.display = 'none';
    Array.from(document.getElementsByClassName('adjustSelectedButton')).forEach(button => {
        button.style.display = 'none';
    });

    Array.from(document.getElementsByClassName('revertOrderButton')).forEach(button => {
        button.style.display = 'none';
    });
}

// Show restricted sections and configure the UI after login
function configureUIAfterLogin(data) {
    isLoggedIn = true; // Update the logged-in state

    // Display user information
    document.getElementById('frontImg').style.display = 'none';
    document.getElementById('login_section').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'inline';
    document.getElementById('logoutButton').style.marginLeft = '60px';
    document.getElementById('user_greeting').style.display = 'block';
    document.getElementById('user_greeting').style.marginLeft = '60px';
    document.getElementById('user_greeting').textContent = `Hello! ${data.firstname}`;
    document.getElementById('user_info').style.display = 'block';
    document.getElementById('user_info').style.marginLeft = '60px';
    document.getElementById('user_info').style.color = '#878787';
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
    Array.from(document.getElementsByClassName('adjustSelectedButton')).forEach(button => {
        button.style.display = 'block';
    });
    
    // Show the inventory section by default
    showSection('inventory_list');
}

// Show specific section
function showSection(sectionId) {
    resetSelectAllCheckboxes();
    document.querySelectorAll('.item-checkbox').forEach(checkbox => checkbox.checked = false);

    loginNotif.textContent = '';
    
    if (!isLoggedIn) {
        loginNotif.textContent = 'You need to login to access.'
        return;
    }

    const sections = document.querySelectorAll('#inventory_list, #orders_section, #short_list, #chart_section, #auditlog_section');
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
        
            document.getElementById('selectAllOrdersLabel').style.display = 'none';
            document.getElementById('selectAllShortListLabel').style.display = 'none';

            document.querySelector('label[for="viewMode"]').style.display = 'block';
            document.querySelector('label[for="searchProduct"]').style.display = 'block';
            document.querySelector('label[for="searchOrder"]').style.display = 'none';
            document.querySelector('label[for="searchInventory"]').style.display = 'none';
            document.getElementById('activeFilters').style.display = 'flex';

            Array.from(document.getElementsByClassName('revertOrderButton')).forEach(button => {
                button.style.display = 'none';
            });

            if (userRole === 'admin') {
                document.getElementById('selectAllInventoryLabel').style.display = 'block';
                Array.from(document.getElementsByClassName('adjustSelectedButton')).forEach(button => {
                    button.style.display = 'block';
                });
                
            } else {
                document.getElementById('selectAllInventoryLabel').style.display = 'none';
                Array.from(document.getElementsByClassName('adjustSelectedButton')).forEach(button => {
                    button.style.display = 'none';
                });
                
            }
        
            document.querySelector('label[for="categoryFilter"]').style.marginLeft = '20px';

            fetchCategories();
            fetchStates();
            resetFiltersAndViewMode();
            renderActiveFilters();
            fetchFilteredInventory();

        } else if (sectionId === 'orders_section') {
            const inventoryFilter = document.getElementById('inventory_filter');
            inventoryFilter.style.display = 'flex';
            inventoryFilter.style.margin = '0 auto'; // Center it horizontally

            document.getElementById('selectAllInventoryLabel').style.display = 'none';
            document.getElementById('selectAllShortListLabel').style.display = 'none';

            document.querySelector('label[for="viewMode"]').style.display = 'none';
            document.querySelector('label[for="searchProduct"]').style.display = 'none';
            document.querySelector('label[for="searchOrder"]').style.display = 'block';
            document.querySelector('label[for="searchInventory"]').style.display = 'none';
            document.getElementById('activeFilters').style.display = 'flex';

            Array.from(document.getElementsByClassName('adjustSelectedButton')).forEach(button => {
                button.style.display = 'none';
            });

            const table = document.querySelector('.inventory-order-table');

            if (userRole === 'admin') {
                document.getElementById('selectAllOrdersLabel').style.display = 'block';

                Array.from(document.getElementsByClassName('revertOrderButton')).forEach(button => {
                    button.style.display = 'block';
                    button.style.marginTop = '-20px';
                });

            } else {
                document.getElementById('selectAllOrdersLabel').style.display = 'none';

                Array.from(document.getElementsByClassName('revertOrderButton')).forEach(button => {
                    button.style.display = 'none';
                });
            }
            
            document.querySelector('label[for="categoryFilter"]').style.marginLeft = '20px';
        
            fetchCategories();
            fetchStates();
            resetFiltersAndViewMode();
            renderActiveFilters();
            fetchFilteredInventory();

        } else if (sectionId === 'short_list') {
            const inventoryFilter = document.getElementById('inventory_filter');
            inventoryFilter.style.display = 'flex';
            inventoryFilter.style.margin = '0 auto'; // Center it horizontally

            document.getElementById('selectAllOrdersLabel').style.display = 'none';
            document.getElementById('selectAllInventoryLabel').style.display = 'none';

            document.querySelector('label[for="viewMode"]').style.display = 'none';
            document.querySelector('label[for="searchProduct"]').style.display = 'none';
            document.querySelector('label[for="searchOrder"]').style.display = 'none';
            document.querySelector('label[for="searchInventory"]').style.display = 'block';
            document.getElementById('activeFilters').style.display = 'flex';

            Array.from(document.getElementsByClassName('revertOrderButton')).forEach(button => {
                button.style.display = 'none';
            });

            if (userRole === 'admin') {
                document.getElementById('selectAllShortListLabel').style.display = 'block';
                Array.from(document.getElementsByClassName('adjustSelectedButton')).forEach(button => {
                    button.style.display = 'block';
                });
                
            } else {
                document.getElementById('selectAllShortListLabel').style.display = 'none';
                Array.from(document.getElementsByClassName('adjustSelectedButton')).forEach(button => {
                    button.style.display = 'none';
                });
            }

            document.querySelector('label[for="categoryFilter"]').style.marginLeft = '20px';
        
            fetchCategories();
            fetchStates();
            resetFiltersAndViewMode();
            renderActiveFilters();
            fetchFilteredInventory();
            
        } else if (sectionId === 'chart_section'){
            document.getElementById('inventory_filter').style.display = 'none';

            Array.from(document.getElementsByClassName('revertOrderButton')).forEach(button => {
                button.style.display = 'none';
            });

            Array.from(document.getElementsByClassName('adjustSelectedButton')).forEach(button => {
                button.style.display = 'none';
            });

            chartBuilder();

        } else if (sectionId === 'auditlog_section'){
            document.getElementById('inventory_filter').style.display = 'none';

            Array.from(document.getElementsByClassName('revertOrderButton')).forEach(button => {
                button.style.display = 'none';
            });

            Array.from(document.getElementsByClassName('adjustSelectedButton')).forEach(button => {
                button.style.display = 'none';
            });

            // Download log file
            document.getElementById('downloadLog').addEventListener('click', () => {
                window.location.href = '/log';
            });

            // Reset log file
            document.getElementById('resetLog').addEventListener('click', () => {
                fetch('/logReset', { method: 'POST' })
                    .then(response => {
                        if (response.ok) {
                            displayModal('SUCCESS', null, 'Audit log reset was successful.');
                            document.getElementById('errorModal').style.height = '205px';
                            document.getElementById('errorModalMessage').style.marginTop = '-10px';
                            document.getElementById('errorModalMessage').style.marginBottom = '-5px';
                            document.getElementById('errorModalMessage').style.marginLeft = '0px';
                            document.getElementById('errorModalMessage').style.textAlign = 'center';
                        } else {
                            displayModal('WARNING', null, 'Audit log reset was unsuccessful. Contact Admin.');
                            document.getElementById('errorModal').style.height = '205px';
                            document.getElementById('errorModalMessage').style.marginTop = '-10px';
                            document.getElementById('errorModalMessage').style.marginBottom = '-5px';
                            document.getElementById('errorModalMessage').style.marginLeft = '0px';
                            document.getElementById('errorModalMessage').style.textAlign = 'center';
                        }
                    });
            });
        }

    } else {
        const inventoryFilter = document.getElementById('inventory_filter');
        inventoryFilter.style.display = 'none';
    
        Array.from(document.getElementsByClassName('adjustSelectedButton')).forEach(button => {
            button.style.display = 'none';
        });


        Array.from(document.getElementsByClassName('revertOrderButton')).forEach(button => {
            button.style.display = 'none';
        });
        
        document.getElementById('selectAllOrdersLabel').style.display = 'none';
        document.getElementById('selectAllInventoryLabel').style.display = 'none';
        document.getElementById('selectAllShortListLabel').style.display = 'none';

        document.querySelector('label[for="viewMode"]').style.display = 'none';
        document.querySelector('label[for="searchProduct"]').style.display = 'none';
        document.querySelector('label[for="searchOrder"]').style.display = 'none';
        document.querySelector('label[for="searchInventory"]').style.display = 'none';
        document.getElementById('activeFilters').style.display = 'none';

        document.querySelector('label[for="categoryFilter"]').style.marginLeft = '20px';
    }
}

// Reset filters and view mode to defaults
function resetFiltersAndViewMode() {
    activeFilters = { ...DEFAULTS.filters };
    currentViewMode = DEFAULTS.viewMode;

    // Update UI elements
    document.getElementById('viewMode').value = 'product';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('searchProduct').value = '';
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
                loginNotif.textContent = 'Login failed. Please check your credentials.';
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
                notifButton.style.backgroundImage = "url('./css/img/bell_before.png')"; // Set the new background image
                notifButton.style.backgroundSize = 'contain'; // Ensure the new image fits well
                notifButton.style.backgroundRepeat = 'no-repeat'; // Prevent repeating the image
                notifButton.style.backgroundPosition = 'center'; // Center the new image
            }

            hideRestrictedSections();
            login();
            document.getElementById('frontImg').style.display = 'block';

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
