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

const mergePullRequest = () => {
    chrome.storage.local.get('githubToken', data => {
        const token = data.githubToken;
        if (!token) {
            alert('GitHub token not set. Please set it in the extension popup.');
            return;
        }

        const prMeta = window.location.pathname.match(/\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
        if (!prMeta) return;

        const [, org, repo, prNumber] = prMeta;

        fetch(`https://api.github.com/repos/${org}/${repo}/pulls/${prNumber}/merge`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ merge_method: 'squash' })
        }).then(response => response.json())
            .then(data => {
                if (data.merged) {
                    console.log('Pull request merged successfully!');
                } else {
                    console.error('Failed to merge pull request: ' + data.message);
                }
            });
    });
};

const checkAllChecksPassed = () => {
    const failedChecks = document.querySelectorAll('.merge-status-item .color-fg-danger');
    const mergeButton = document.querySelector('.merge-message .btn-primary');
    return failedChecks.length === 0 && mergeButton && !mergeButton.disabled;
};

const addControls = () => {
    const mergeButton = document.querySelector('.merge-message .select-menu');
    if (!mergeButton || document.getElementById('rerun-failed-checks')) return;

    const controlsContainer = document.createElement('div');
    controlsContainer.style = 'display: flex; align-items: center; margin-left: 10px;';

    // Rerun failed checks button
    const reRunButton = document.createElement('button');
    reRunButton.id = 'rerun-failed-checks';
    reRunButton.textContent = 'Rerun Failed Checks';
    reRunButton.classList.add('btn');
    reRunButton.disabled = true;
    reRunButton.style = 'margin: 10px;';

    const htmlStyleElement = document.createElement('style');
    htmlStyleElement.innerText = `
        /* Toggle switch container */
        .toggle-container {
            position: relative;
            display: flex;
            align-items: center;
            width: auto;
            height: 20px;
            gap: 10px; /* Adds space between toggle and text */
        }
        
        /* Parent div to ensure spacing and prevent overlap */
        .toggle-wrapper {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            padding: 5px 10px; /* Adds padding around */
        }
        
        /* Hide default checkbox */
        .toggle-container input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        /* Slider background */
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: -20px;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 20px;
            width: 30px
        }
        
        /* The slider circle */
        .slider:before {
            position: absolute;
            content: "";
            height: 14px;
            width: 14px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
        }
        
        /* When the toggle is checked */
        .toggle-container input:checked + .slider {
            background-color: #4CAF50;
        }
        
        .toggle-container input:checked + .slider:before {
            transform: translateX(10px);
        }
    `
    // Toggle switch
    const toggleLabel = document.createElement('label');
    toggleLabel.style = 'display: flex; align-items: center; cursor: pointer; margin: 10px;';
    toggleLabel.classList.add('toggle-container');

    const toggleSwitch = document.createElement('input');
    toggleSwitch.type = 'checkbox';
    toggleSwitch.style = 'margin-right: 5px;';

    const slider = document.createElement('span');
    slider.classList.add('slider');

    toggleLabel.appendChild(toggleSwitch);
    toggleLabel.appendChild(slider);
    toggleLabel.appendChild(document.createTextNode('Auto Merge on All Checks Passed'));

    const toggleContainer = document.createElement('div');
    toggleContainer.appendChild(toggleLabel);
    const toggleWrapper = document.createElement('div');
    toggleWrapper.classList.add('toggle-wrapper');

    toggleWrapper.appendChild(toggleLabel);
    toggleContainer.appendChild(toggleWrapper);

    mergeButton.parentElement.insertBefore(htmlStyleElement, mergeButton.nextSibling);
    mergeButton.parentElement.insertBefore(toggleContainer, mergeButton.nextSibling);
    mergeButton.parentElement.insertBefore(reRunButton, mergeButton.nextSibling);

    // Enable rerun button if failed checks exist
    const failedChecks = Array.from(document.querySelectorAll('.merge-status-item'))
        .filter(item => item.querySelector('.label.Label--primary'))
        .filter(item => item.querySelector('.color-fg-danger'))
        .filter(item => item.querySelector('.label.Label--primary').innerText === 'Required');

    if (failedChecks.length > 0) {
        reRunButton.disabled = false;
        reRunButton.addEventListener('click', () => rerunFailedChecks(failedChecks));
    }

    // Monitor for changes in checks and merge button state
    const observerTarget = document.querySelector('.merge-status-list, .merge-message');
    if (observerTarget) {
        new MutationObserver(() => {
            if (toggleSwitch.checked && checkAllChecksPassed()) {
                mergePullRequest();
            }
        }).observe(observerTarget, { childList: true, attributes: true, subtree: true });
    }
};

new MutationObserver(() => {
    if (isPullRequestPage()) {
        addControls();
    }
}).observe(document.body, { childList: true, subtree: true });
