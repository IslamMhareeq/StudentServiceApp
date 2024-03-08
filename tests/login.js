const axios = require('axios');

const testLoginForm = async (email, password) => {
    const formData = {
        email,
        password,
    };

    try {
        const response = await axios.post('http://localhost:8080/login', formData);

        if (response.status === 200) {
            console.log(`Login Test - Passed - ✔`);
            console.log('Response data:', response.data);
        } else {
            console.log(`Login Test - Failed - ✘ - Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`Login Test - Failed - ✘ - Error: ${error.message}`);
    }
};

const loginAttempts = [

    { email: 'user1@example.com', password: 'password123' },

    { email: 'invalidemail', password: 'password123' },

    { email: 'islammh@ac.sce.ac.il', password: 'islam' },

    { email: 'user3@example.com', password: '' },

    { password: 'password123' },

    { email: 'user4@example.com' },

];

loginAttempts.forEach(({ email, password }) => testLoginForm(email, password));
