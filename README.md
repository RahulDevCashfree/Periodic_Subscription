
# Prerequisites for Running the Script

This guide outlines the requirements and setup instructions for running the provided Node.js script to create a plan using the Cashfree Payment Gateway API.

---

1. Install Node.js
Ensure that Node.js is installed on your system. You can download it from [Node.js Official Website](https://nodejs.org/).

Verify Installation
Run the following commands in your terminal to verify the installation:
```bash
node -v
npm -v
```

---

2. Install Required Packages
The script requires the following npm package:
- `axios`: For making HTTP requests.

### Install Axios
Use the following command to install Axios:
```bash
npm install axios
```

---

3. Create `api_keys.json`
Create a file named `api_keys.json` in the root directory of your project. This file will store the API credentials for both the test and production environments.

 Example Structure:
```json
{
  "Test": {
    "client_id": "your_test_client_id",
    "client_secret": "your_test_client_secret"
  },
  "Production": {
    "client_id": "your_production_client_id",
    "client_secret": "your_production_client_secret"
  }
}
```

Replace the placeholder values with the actual API keys provided by Cashfree.

---

4. Environment Configuration
Set the `environment` variable in the script to either `Test` or `Production` based on the environment you want to use:
```javascript
const environment = 'Test'; // Use 'Production' for live mode
```

---

5. Internet Connectivity
Ensure your system has an active internet connection, as the script makes HTTP requests to Cashfree’s API.

---

6. Permissions
The script writes the generated `plan_id` to a JSON file (`plan_data.json`). Ensure the directory where the script runs has the necessary write permissions.

---

7. Run the Script
Use the following command to execute the script:
```bash
node your_script_file_name.js
```

---

8. Debugging
- Check for errors in the console output if the script fails.
- Ensure that the `api_keys.json` file is correctly formatted.
- Verify that the API keys are valid and match the environment (Test or Production).

---

Support
If you encounter any issues, feel free to open an issue in this repository.

--- 

