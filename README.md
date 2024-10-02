# GitHub Rerun Failed Checks Chrome Extension

## 1. What it Does

This Chrome extension adds a button to GitHub pull request pages that allows users to rerun failed GitHub Actions checks with a single click. It checks if there are any required checks that have failed, and if so, it enables a **Rerun Failed Checks** button. When clicked, the button sends a request to the GitHub API to automatically rerun the failed checks.

## 2. How to Set it Up on Your Local Machine

Follow these steps to set up the extension locally in Chrome:

### Step 1: Download the Extension Files

Make sure you have the following files in a folder:
- `content.js`
- `popup.html`
- `popup.js`
- `manifest.json`

### Step 2: Open Chrome Extensions

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** by toggling the switch in the top-right corner.

### Step 3: Load the Extension

1. Click on the **Load unpacked** button.
2. Select the folder that contains the extension files.

### Step 4: Verify the Extension

1. Once loaded, you should see the extension listed in the Chrome extensions page.
2. A new icon for the extension will also appear in the Chrome toolbar.

## 3. How to Use It

### Step 1: Set Up GitHub Token

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. In the popup, enter your **GitHub Personal Access Token**. This token is required to authenticate API requests to rerun failed checks.
3. Click the **Save Token** button. You will see a confirmation message once the token is saved successfully.

[Click here for instructions on how to create a GitHub Personal Access Token.](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

### Step 2: Using the Extension on GitHub

1. Navigate to any GitHub pull request page.
2. The extension will automatically detect if the page is a pull request page.
3. If there are any required checks that have failed, a **Rerun Failed Checks** button will appear next to the pull request's merge options.
4. Click the button to rerun the failed checks. The extension will send the necessary API requests to GitHub to trigger the rerun.

### Note:

Ensure that your GitHub Personal Access Token has the following permissions:
- `repo`
- `workflow`

These permissions are required to rerun workflows using the GitHub API.
