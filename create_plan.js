const axios = require("axios");
const fs = require("fs/promises"); // Promises-based file system API

// Set the environment to either "Test" or "Production"
const environment = "Test"; // Change this to "Production" for live

// Base URL for the environment
const baseUrls = {
  Test: "https://sandbox.cashfree.com/pg/plans",
  Prod: "https://api.cashfree.com/pg/plans"
};

// Load API Keys Dynamically from JSON File
const loadApiKeys = async () => {
  try {
    const data = await fs.readFile("api_keys.json", "utf8");
    const config = JSON.parse(data);

    if (!config[environment]) {
      throw new Error(`Environment "${environment}" not found in api_keys.json`);
    }

    return {
      XClientId: config[environment].XClientId,
      XClientSecret: config[environment].XClientSecret,
      BaseUrl: baseUrls[environment], // Set the Base URL directly based on the environment
    };
  } catch (err) {
    throw new Error(`Error loading API keys: ${err.message}`);
  }
};

// Generate the dynamic Plan ID using the current timestamp
const currentTimestamp = Date.now();
const planId = `PLAN_${currentTimestamp}`;

// Define the plan data
const planData = {
  plan_id: planId,
  plan_name: "MY PLAN",
  plan_type: "PERIODIC",
  plan_currency: "INR",
  plan_recurring_amount: 2000,
  plan_max_amount: 10000,
  plan_max_cycles: 100,
  plan_intervals: 1,
  plan_interval_type: "DAY",
};

// Save the Plan ID to a JSON file
const savePlanId = () => {
  const data = { plan_id: planId };
  require("fs").writeFileSync("plan_data.json", JSON.stringify(data, null, 2), "utf8");
};

// Function to create the plan
const createPlan = async () => {
  try {
    // Load API keys dynamically
    const Cashfree = await loadApiKeys();

    const response = await axios.post(Cashfree.BaseUrl, planData, {
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2025-01-01",
        "x-client-id": Cashfree.XClientId,
        "x-client-secret": Cashfree.XClientSecret,
      },
    });

    console.log("Plan created successfully:", response.data);

    // Save the Plan ID after successful creation
    savePlanId();
  } catch (error) {
    console.error("Error creating plan:", error.response?.data || error.message);
  }
};

// Call the function to create the plan
createPlan();
