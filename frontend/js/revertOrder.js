async function revertSelectedOrders() {
    var errorCount = 0;
    const errorMessages = [];
    const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked'); // Get all selected checkboxes
    const adjButton = document.querySelector(".revertOrderButton");

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
        void adjButton.offsetWidth;
        adjButton.classList.add('animate');

        setTimeout(() => {
            adjButton.classList.remove('animate');
            adjButton.classList.remove('error');
            adjButton.disabled = false;
            document.getElementById('notif_button').disabled = false;
            document.getElementById('acc_button').disabled = false;
            enableLinks();

            displayModal('WARNING', errorCount, 'No items were selected.');
        }, 3400);
        return;
    }

    const adjustments = [];

    // Check order creation times and validate within 24 hours
    for (const checkbox of selectedCheckboxes) {
        const dataId = checkbox.dataset.id;
        const [orderID, inventoryID] = dataId.split('-');

        try {
            // Fetch order creation time from the backend
            const response = await fetch(`/order-details?OrderID=${orderID}`);
            if (!response.ok) {
                const error = await response.json();
                errorMessages.push(`OrderID ${orderID}: ${error.error || 'Failed to fetch order details.'}`);
                errorCount++;
                continue;
            }

            const { OrderDate } = await response.json();
            const orderTime = new Date(OrderDate); // Parse order date
            const currentTime = new Date(); // Get current time (UTC)

            // Check if the order was created within 24 hours
            const timeDifference = currentTime - orderTime;
            if (timeDifference > 24 * 60 * 60 * 1000) {
                errorMessages.push(`OrderID ${orderID} exceeds 24-hour order cancellation period.`);
                errorCount++;
                continue;
            }

            // Add valid adjustment to the list
            adjustments.push({ OrderID: orderID, InventoryID: inventoryID });

        } catch (error) {
            console.error(`Error processing OrderID ${orderID}:`, error);
            errorMessages.push(`OrderID ${orderID}: Failed to validate creation time.`);
            errorCount++;
        }
    }

    if (errorMessages.length > 0) {
        // Add error class
        adjButton.classList.add('error');

        // Reset and trigger animation
        adjButton.classList.remove('animate');
        void adjButton.offsetWidth;
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
                    document.getElementById('errorModal').style.height = '225px';
                } else if (errorCount === 3) {
                    document.getElementById('errorModal').style.height = '240px';
                } else if (errorCount === 4) {
                    document.getElementById('errorModal').style.height = '260px';
                } else if (errorCount === 5) {
                    document.getElementById('errorModal').style.height = '280px';
                } else if (errorCount === 6) {
                    document.getElementById('errorModal').style.height = '300px';
                } else if (errorCount === 7) {
                    document.getElementById('errorModal').style.height = '320px';
                } else if (errorCount === 8) {
                    document.getElementById('errorModal').style.height = '335px';
                }
            }

        }, 3400);
        return;
    }

    // Send batch adjustments to the backend
    try {
        const response = await fetch('/revert-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adjustments })
        });

        if (response.ok) {
            adjButton.classList.add('success');

            // Reset and trigger animation
            adjButton.classList.remove('animate');
            void adjButton.offsetWidth;

            setTimeout(() => {
                adjButton.classList.add('success-bg');
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

                displayModal('SUCCESS', errorCount, 'Orders reverted successfully.');
            }, 3000);

            await updateStockStatus();
            await fetchFilteredInventory();

        } else {
            const error = await response.json();
            adjButton.classList.add('error');

            // Reset and trigger animation
            adjButton.classList.remove('animate');
            void adjButton.offsetWidth;
            adjButton.classList.add('animate');

            setTimeout(() => {
                adjButton.classList.remove('animate');
                adjButton.classList.remove('error');
                adjButton.disabled = false;
                document.getElementById('notif_button').disabled = false;
                document.getElementById('acc_button').disabled = false;
                enableLinks();

                displayModal('WARNING', `Error: ${error.error}`);
            }, 3400);
        }

    } catch (error) {
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

            displayModal('WARNING', 'Error reverting orders.');
        }, 3400);
    }
}
