document.getElementById('save').addEventListener('click', () => {
    const token = document.getElementById('token').value;
    if (token) {
        chrome.storage.local.set({githubToken: token}, () => {
            alert('Token saved successfully');
        });
    }
});