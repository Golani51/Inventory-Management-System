function toggleModal(modalId, button = null) {
    const modal = document.getElementById(modalId);

    if (modal.style.display === "block") {
        closeModal(modalId);
    } else {
        if (button) {
            positionModal(modal, button); // Position the modal below the button
        }
        modal.style.display = "block";
        window.addEventListener("resize", () => positionModal(modal, button)); // Update position on resize
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
    modal.querySelector(".modal-content").style.left = `${rect.left + window.scrollX-300}px`; // Adjust horizontally
}

function showModal(title, message) {
    // Create the modal and overlay if they don't exist
    let modal = document.getElementById('errorModal');
    let overlay = document.getElementById('errorModal-overlay');

    if (!modal) {
        // Modal container
        modal = document.createElement('div');
        modal.id = 'errorModal';

        const modalTitle = document.createElement('h3');
        modalTitle.id = 'errorModalTitle';

        const modalMessage = document.createElement('textarea');
        modalMessage.id = 'errorModalMessage';

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '10px';
        closeButton.style.alignSelf = 'flex-end';
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
            overlay.style.display = 'none'; // Hide overlay
        });

        modal.appendChild(modalTitle);
        modal.appendChild(modalMessage);
        modal.appendChild(closeButton);

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

    // Set title and message
    document.getElementById('errorModalTitle').textContent = title;
    document.getElementById('errorModalMessage').value = message;

    // Show modal and overlay
    modal.style.display = 'flex';
    overlay.style.display = 'block';
}
