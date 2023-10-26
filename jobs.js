console.log('Initiating jobs...');
let jobs = [];
async function getJobs() {
  console.log('Loading jobs...');
  const response = await fetch('https://boards-api.greenhouse.io/v1/boards/harnessinc/jobs');
  const data = await response.json();
  console.log(data);
  jobs = data.jobs;

  const jobItem = document.getElementById('gh_job_item');
  const jobList = document.getElementById('gh_job_list');
  jobs.forEach(job => {
    const newJobItem = jobItem.cloneNode(true);
    const jobLink = newJobItem.getElementsByTagName('a')[0];
    //title
    jobLink.innerText = job.title ? `${job.title} (${location.name})` : 'Untitled';
    //absolute_url
    jobLink.setAttribute('href', job.absolute_url || '#')
    //location.name
    jobList.appendChild(newJobItem);
  })
}

getJobs();

const sampleText = 'sample job!';

$( document ).ready(() => {
  console.log('Jobs doc ready...');
  getJobs();
});
