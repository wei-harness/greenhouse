console.log('Initiating jobs...');
let jobs = [];
async function test() {
  console.log('Loading jobs...');
  const response = await fetch('https://boards-api.greenhouse.io/v1/boards/harnessinc/jobs');
  const data = await response.json();
  console.log(data);
  jobs = data.jobs;
}

test();

const sampleText = 'sample job!';

$( document ).ready(() => {
  console.log('Jobs doc ready...');
  test();
});
