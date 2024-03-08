const axios = require('axios');

const testForm = async (query) => {
    try {
        const response = await axios.get('http://localhost:8080/search-posts', {
            params: { query },
        });

        if (response.status === 200) {
            console.log(`Query "${query}" - Test passed - ✔`);
        } else {
            console.log(`Query "${query}" - Test failed - ✘ - Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`Query "${query}" - Test failed - ✘ - Error: ${error.message}`);
    }
};

const queries = [
    "Node.js tutorials",
    "Express.js best practices",
    "Web development tools 2022",
    "JavaScript async await",
    "React vs Angular",
    "CSS flexbox layout",
    "MongoDB vs MySQL",
    "Responsive web design tips",
    "REST API best practices",
    "OpenAI GPT-3 use cases",
];

queries.forEach((query) => testForm(query));
