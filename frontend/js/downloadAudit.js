// Download audit log
async function downloadAudit(){
    try {
        const response = await fetch('/log', {
            method: 'GET'
        });

        if (response.ok) {
            const data = await response.json();
            const url = window.URL.createObjectURL(data);
            const page = document.createElement("download");
            page.href = url;
            page.download = 'log.txt';
            page.click();
            window.URL.revokeObjectURL(url)
        }
    } catch (error) {
        console.error('Error downloading audit log', error);
        alert('An error while downloading the audit log. Please try again later.');
    }
}