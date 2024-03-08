const axios = require('axios');

const testLogoutButton = async () => {
    try {
        const response = await axios.post('http://localhost:8080/profile');

        if (response.status === 200) {
            console.log('Logout Test - Passed - ✔');
        } else {
            console.log(`Logout Test - Failed - ✘ - Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`Logout Test - Failed - ✘ - Error: ${error.message}`);
    }
};

testLogoutButton();
