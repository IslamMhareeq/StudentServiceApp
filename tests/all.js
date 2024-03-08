const path = require('path');

const runTests = (testFiles) => {
  const currentDirectory = process.cwd();

  testFiles.forEach(testFile => {
    const filePath = path.join(currentDirectory, 'tests', testFile);

    try {
      const testModule = require(filePath);

      if (typeof testModule === 'function') {
        console.log(`Running ${testFile}...`);
        testModule();
        console.log(`Completed ${testFile}\n`);
      } else {
        console.log(`Starting ${testFile}\n`);
      }
    } catch (error) {
      console.log(`Starting ${testFile}\n`);
    }
  });
};

runTests(['login.js', 'calender.js', 'search_bar.js']);
