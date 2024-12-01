function toggleModal(modalId, button = null) {
    const modal = document.getElementById(modalId);

    if (isLoggedIn) {
        if (modal.style.display === "block") {
            closeModal(modalId);
        } else {
            if (button) {
                positionModal(modal, button); // Position the modal below the button
            }
            modal.style.display = "block";
            window.addEventListener("resize", () => positionModal(modal, button)); // Update position on resize
        }
    } else {
        loginNotif.textContent = 'You need to login to access.'
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "none";
}

function positionModal(modal, button) {
    const rect = button.getBoundingClientRect();
    modal.style.position = "absolute";
    modal.querySelector(".modal-content").style.top = `${rect.bottom + window.scrollY+10}px`; // Adjust vertically
    modal.querySelector(".modal-content").style.left = `${rect.left + window.scrollX-310}px`; // Adjust horizontally

    modal.querySelector(".modal-triangle").style.top = `${rect.bottom + window.scrollY+5}px`; // Adjust vertically
    modal.querySelector(".modal-triangle").style.left = `${rect.left + window.scrollX+10}px`; // Adjust horizontally

}

// Success/Error Modal when adjusting quantities
function displayModal(title, count = null, message) {
    // Create the modal and overlay if they don't exist
    let modal = document.getElementById('errorModal');
    let overlay = document.getElementById('errorModal-overlay');

    if (!modal) {
        // Modal container
        modal = document.createElement('div');
        modal.id = 'errorModal';

        // Create the stripe element
        const stripe = document.createElement('div');
        stripe.className = 'errorModal-stripe';
        stripe.id = 'errorModalStripe';

        const modalImage = document.createElement('h1');
        modalImage.className = 'material-symbols-outlined';
        modalImage.id = 'errorModalImage';

        const modalTitle = document.createElement('h3');
        modalTitle.id = 'errorModalTitle';

        const modalCount = document.createElement('h5');
        modalCount.id = 'errorModalCount';
    
        const modalMessage = document.createElement('textarea');
        modalMessage.id = 'errorModalMessage';
        modalMessage.readOnly = true;
        modalMessage.disabled = true;

        modal.appendChild(stripe);
        modal.appendChild(modalImage);
        modal.appendChild(modalTitle);
        modal.appendChild(modalCount);
        modal.appendChild(modalMessage);

        document.body.appendChild(modal);
    }

    if (!overlay) {
        // Overlay for background dimming
        overlay = document.createElement('div');
        overlay.id = 'errorModal-overlay';
        overlay.addEventListener('click', () => {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        });

        document.body.appendChild(overlay);
    }

    const stripe = document.getElementById('errorModalStripe');
    const modalImage = document.getElementById('errorModalImage');
    const modalTitle = document.getElementById('errorModalTitle');
    const modalCount = document.getElementById('errorModalCount');
    const modalMessage = document.getElementById('errorModalMessage');

    modalTitle.textContent = title;
    modalMessage.value = message;

    if (title === "WARNING") {
        stripe.style.position = 'absolute';
        stripe.style.top = '0';
        stripe.style.left = '0';
        stripe.style.width = '100%';
        stripe.style.height = '150px';
        stripe.style.backgroundColor = '#ea4f5e';
        stripe.style.borderTopLeftRadius = '8px';
        stripe.style.borderTopRightRadius = '8px';
        
        modalImage.textContent = 'cancel';

        modalCount.textContent = count !== null 
        ? `You have ${count} warning(s).`
        : '';

    } else if (title === "SUCCESS") {
        stripe.style.position = 'absolute';
        stripe.style.top = '0';
        stripe.style.left = '0';
        stripe.style.width = '100%';
        stripe.style.height = '150px';
        stripe.style.backgroundColor = '#678f64';
        stripe.style.borderTopLeftRadius = '8px';
        stripe.style.borderTopRightRadius = '8px';

        modalImage.textContent = 'check_circle';

        modalCount.textContent = '';
    }

    // Show modal and overlay
    modal.style.display = 'flex';
    overlay.style.display = 'block';
}
