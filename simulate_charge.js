const fs = require("fs");
const axios = require("axios");
const path = require("path");

// Load API keys from file
const apiKeys = JSON.parse(fs.readFileSync(path.join(__dirname, "api_keys.json"), "utf-8"));

// Function to get API keys based on environment
const getApiKeys = (environment) => {
  if (!["Test", "Production"].includes(environment)) {
    throw new Error('Invalid environment. Must be "Test" or "Production".');
  }
  return apiKeys[environment];
};

// Set environment (change to 'Production' for production keys)
const environment = "Test";
const keys = getApiKeys(environment);

// Define headers for the API request
const headers = {
  "Content-Type": "application/json",
  "x-api-version": "2023-08-01",
  "x-client-id": keys.client_id,
  "x-client-secret": keys.client_secret,
};

// Helper function to read data from JSON file
const getDataFromFile = (fileName) => {
  try {
    const data = JSON.parse(fs.readFileSync(fileName, "utf8"));
    return data;
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error.message);
    process.exit(1); // Exit script if file read fails
  }
};

// Fetch the payment ID from the payment_id_data.json file
const paymentData = getDataFromFile("payment_id_data.json");

// Simulate payment status
const simulatePaymentStatus = async () => {
  try {
    const simulateData = {
      entity: "SUBS_PAYMENTS",
      entity_id: paymentData.payment_id, // Get the payment ID from payment_id_data.json
      entity_simulation: {
        payment_status: "SUCCESS",
        payment_error_code: "",
      },
    };

    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/simulate",
      simulateData,
      { headers }
    );

    console.log("Payment Simulation Successful:", response.data);
  } catch (error) {
    console.error("Error Simulating Payment:", error.response?.data || error.message);
  }
};

// Call the function to simulate the payment status
simulatePaymentStatus();
