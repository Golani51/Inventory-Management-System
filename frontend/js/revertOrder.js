//
//  FILE: revertOrder.js
//  ORIGINAL AUTHOR: Joshua Hur
//  LATEST CHANGE BY: Joshua Hur 12/2/24
//

async function revertSelectedOrders() {
    var errorCount = 0;
    const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked');
    const adjButton = document.querySelector(".revertOrderButton");

    // Start button animation immediately
    adjButton.blur();

    // Disable other buttons and links
    adjButton.disabled = true;
    document.getElementById('notif_button').disabled = true;
    document.getElementById('acc_button').disabled = true;
    disableLinks();

    if (selectedCheckboxes.length === 0) {
        // Show error modal and stop animation
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
            const message = 'No items were selected.';
            logToBackend('No order was not reverted because no items were selected.', 'FAILURE');
            displayModal('WARNING', 1, message);
            document.getElementById('errorModal').style.height = '205px';
            document.getElementById('errorModalMessage').style.marginTop = '-10px';
            document.getElementById('errorModalMessage').style.marginBottom = '-5px';
            document.getElementById('errorModalMessage').style.marginLeft = '0px';
            document.getElementById('errorModalMessage').style.textAlign = 'center';
        }, 3400);
        return;
    }

    const adjustments = Array.from(selectedCheckboxes).map(checkbox => {
        const [orderID, inventoryID] = checkbox.dataset.id.split('-');
        return { OrderID: orderID, InventoryID: inventoryID };
    });

    const orderIDs = adjustments.map(adj => adj.OrderID);

    try {
        // Fetch all order details in a single batch
        const response = await fetch('/batch-order-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ OrderIDs: orderIDs })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch order details.');
        }

        const { orders } = await response.json();

        // Validate each order
        const now = new Date();
        const validAdjustments = [];
        const errorMessages = [];

        orders.forEach(order => {
            const orderDate = new Date(order.OrderDate.replace(' GMT', ''));
            const timeDifference = now - orderDate;

            if (timeDifference > 24 * 60 * 60 * 1000) {
                const message = `OrderID ${order.OrderID} exceeds 24-hour cancellation period.`;
                logToBackend(`OrderID ${order.OrderID} was not reverted because it exceeds 24-hour cancellation period.`, 'FAILURE');
                errorCount++;
                errorMessages.push(message);
            } else {
                orders.forEach(order => {
                    const matchingAdjustment = adjustments.find(adj => Number(adj.OrderID) === Number(order.OrderID));
                    if (matchingAdjustment) {
                        validAdjustments.push(matchingAdjustment);
                    } else {
                        console.warn(`No matching adjustment found for OrderID ${order.OrderID}`);
                    }
                });
            }
        });

        // Remove duplicates from validAdjustments
        const uniqueValidAdjustments = validAdjustments.filter(
            (adjustment, index, self) =>
                index === self.findIndex(
                    (a) => a.OrderID === adjustment.OrderID && a.InventoryID === adjustment.InventoryID
                )
        );     

        // Show errors if any
        if (errorMessages.length > 0) {
            // Show error modal and stop animation
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
                displayModal('WARNING', errorMessages.length, errorMessages.join('\n'));
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

        // Send valid adjustments to the backend
        if (uniqueValidAdjustments.length > 0) {
            console.log('Payload sent to /revert-order:', { adjustments: uniqueValidAdjustments });

            const revertResponse = await fetch('/revert-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adjustments: uniqueValidAdjustments })
            });

            if (!revertResponse.ok) {
                throw new Error('Failed to revert orders.');
            }

            // Success animation
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

            showSection('orders_section');
        }
    } catch (error) {
        console.error('Error reverting orders:', error);

        // Show error modal
        adjButton.classList.add('error');
        setTimeout(() => {
            adjButton.classList.remove('processing', 'error');
            adjButton.disabled = false;
            document.getElementById('notif_button').disabled = false;
            document.getElementById('acc_button').disabled = false;
            enableLinks();
            displayModal('WARNING', 1, 'Error reverting orders.');
        }, 3400);
    }
}
