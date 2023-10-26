console.log('Initiating jobs page...');
async function getJobs() {
  console.log('Fetching jobs...');
  const epJobs = "https://boards-api.greenhouse.io/v1/boards/harnessinc/jobs?content=true";
  // const epDepartments = "https://boards-api.greenhouse.io/v1/boards/harnessinc/departments?render_as=tree"; // department data is hierarchical
  const response = await fetch('https://boards-api.greenhouse.io/v1/boards/harnessinc/jobs');
  const data = await response.json();
  const jobs = data.jobs;
  // const departments = data.departments;

  /* get list/item templates */
  // const jobItem = document.getElementById('gh_department_item');
  // const jobList = document.getElementById('gh_department_list');
  const jobItem = document.getElementById('gh_job_item');
  const jobList = document.getElementById('gh_job_list');
  
  jobs.forEach(job => {
    const newJobItem = jobItem.cloneNode(true);
    const jobLink = newJobItem.getElementsByTagName('a')[0];
    /* title */
    jobLink.innerText = job.title ? `${job.title} (${job.location.name})` : 'Untitled';
    /* absolute_url */
    jobLink.setAttribute('href', job.absolute_url || '#')
    /* location.name */
    jobList.appendChild(newJobItem);
  });
  /* remove job item template */
  jobList.removeChild(jobItem);
}

/* better to invoke it after document.ready */
getJobs();

/* jquery not available here
const sampleText = 'sample job!';
$( document ).ready(() => {
  console.log('Jobs doc ready...');
  getJobs();
});
*/
