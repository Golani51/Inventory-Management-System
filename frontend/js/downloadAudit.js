
async function logToBackend(message, status) {
    try {
        const response = await fetch('/log-action-helper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, status })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to log action to backend:', error.error);
        } else {
            console.log('Action logged successfully to backend.');
        }
    } catch (error) {
        console.error('Error logging action to backend:', error);
    }
}