const isPullRequestPage = () => /https:\/\/github\.com\/.+\/.+\/pull\/\d+/.test(window.location.href);

const rerunFailedChecks = failedChecks => {
    chrome.storage.local.get('githubToken', data => {
        const token = data.githubToken;

        if (!token) {
            alert('GitHub token not set. Please set it in the extension popup.');
            return;
        }

        failedChecks.forEach(check => {
            const detailLink = new URL(Array.from(check.querySelectorAll('a')).find(link => link.innerText === 'Details').href);

            const pathParts = detailLink.pathname.split('/');
            const runIdIndex = pathParts.indexOf('runs');
            const org = pathParts[1];
            const repo = pathParts[2];
            const runId = pathParts[runIdIndex + 1];

            fetch(`https://api.github.com/repos/${org}/${repo}/actions/runs/${runId}/rerun-failed-jobs`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${token}`,
                },
            });
        });
    });
};

const checkFailedChecks = button => {
    const failedChecks = Array.from(document.querySelectorAll('.merge-status-item'))
        .filter(item => item.querySelector('.label.Label--primary'))
        .filter(item => item.querySelector('.color-fg-danger'))
        .filter(item => item.querySelector('.label.Label--primary').innerText === 'Required');

    if (failedChecks.length > 0) {
        // Enable the button if there are failed checks
        button.disabled = false;

        // Add click event to rerun the checks
        button.addEventListener('click', () => rerunFailedChecks(failedChecks));
    }
};

const addReRunButton = () => {
    const mergeButton = document.querySelector('.merge-message .select-menu');

    if (mergeButton && !document.getElementById('rerun-failed-checks')) {
        // Create a new button
        const reRunButton = document.createElement('button');
        reRunButton.id = 'rerun-failed-checks';
        reRunButton.textContent = 'Rerun Failed Checks';
        reRunButton.classList.add('btn');
        reRunButton.style = 'margin-left: 10px;'
        reRunButton.disabled = true;  // Initially disabled

        // Add the button to the DOM
        mergeButton.parentElement.insertBefore(reRunButton, mergeButton.nextSibling);

        // Check for failed checks and enable/disable the button accordingly
        checkFailedChecks(reRunButton);
    }
};

new MutationObserver(() => {
    if (isPullRequestPage()) {
        addReRunButton();
    }
}).observe(document.body, { childList: true, subtree: true });
