async function getJobs() {
  const epJobs =
    'https://boards-api.greenhouse.io/v1/boards/harnessinc/jobs?content=true';
  const epDepartments =
    'https://boards-api.greenhouse.io/v1/boards/harnessinc/departments?render_as=tree'; // department data is hierarchical

  const epOffice =
    'https://boards-api.greenhouse.io/v1/boards/harnessinc/offices?render_as=tree';
  // "https://boards-api.greenhouse.io/v1/boards/harnessinc/offices/4021638007";

  let response = await getResponse(epDepartments);
  const departments = response.departments;

  response = await getResponse(epJobs);
  const jobs = response.jobs;

  response = await getResponse(epOffice);
  const offices = response.offices;

  // department Dropdown
  createDropdown('All departments', departments);

  // location dropdown
  createDropdown('All locations', offices);

  let node = document.querySelector('.gh-filter');
  node.insertAdjacentHTML('afterend', '<h1>Position Highlights</h1>');

  return { departments, jobs, offices };
}

async function getResponse(url) {
  const response = await fetch(url);
  let data = await response.json();
  return data;
}
let count = 8;
// create Dropdown from reponse
function createDropdown(text, array) {
  const filter = document.querySelector('.gh-filter');

  let option = '';
  // const body = document.body;
  if (array.length > 0) {
    array.forEach((arr) => {
      const divJobsLen = countJobs(arr);
      if (divJobsLen > 0) {
        option += `

          <option value="${arr.id}">${arr.name} (${divJobsLen})</option>

        `;
        if (arr.children.length > 0) {
          const children = arr.children;
          children.forEach((child) => {
            if (child.jobs.length > 0) {
              option += `
                <option value="${child.id}" >&nbsp;&nbsp;${child.name} (${child.jobs.length})</option>
              `;
            }
          });
        }
      }
    });
  }

  const dropdownId = convertToId(text);
  const htmlToAppend = `
  <select name="${dropdownId}" id="${dropdownId}">
  <option value="all"  selected  >${text}</option>
  ${option}</select>

  
  `;

  filter.insertAdjacentHTML('beforeend', htmlToAppend);
}

function convertToId(text) {
  return text.replaceAll(' ', '_').toLowerCase();
}

function countJobs(division) {
  if (division.jobs) {
    const divJobsLen = division.jobs.length;
    const totalDivJobsLen = division.children.reduce((sum, child) => {
      return sum + child.jobs.length;
    }, divJobsLen);
    return totalDivJobsLen;
  }
  const countryJobsLen = countOfficeDepartmentJobs(division);
  const totalLocJobsLen = division.children.reduce((sum, child) => {
    return sum + countOfficeDepartmentJobs(child);
  }, countryJobsLen);
  return totalLocJobsLen;
}

function countOfficeDepartmentJobs(department) {
  return department.reduce((sum, dept) => {
    return (sum += dept.jobs.length);
  }, 0);
}

// get Selected Department and location
function getSelectedDepartmentAndLocation(departments, jobs, offices) {
  const departmentSelect = document.getElementById('all_departments');
  const selectedDepartment =
    departmentSelect.options[departmentSelect.selectedIndex].value;
  const locationSelect = document.getElementById('all_locations');
  const selectedLocation =
    locationSelect.options[locationSelect.selectedIndex].value;

  showJobsFromSelectedFilters(
    selectedDepartment,
    selectedLocation,
    departments,
    jobs,
    offices
  );
}

//show jobs from selected filters
async function showJobsFromSelectedFilters(
  selectedDepartment,
  selectedLocation,
  departments,
  jobs,
  offices
) {
  let filteredDepartments = [];
  let displayJobs = [];
  if (selectedDepartment === 'all' && selectedLocation === 'all') {
    departments.forEach((department) => {
      if (department.jobs.length > 0) {
        department.jobs.forEach((job) => {
          const obj = {
            job: job,
            department: department,
            subDepartment: null,
          };
          displayJobs.push(obj);
        });
      }
      if (department.children.length > 0) {
        department.children.forEach((child) => {
          if (child.jobs.length > 0) {
            child.jobs.forEach((job) => {
              const obj = {
                job: job,
                department: department,
                subDepartment: child,
              };
              displayJobs.push(obj);
            });
          }
        });
      }
    });
    DisplayJobs(displayJobs);
  } else {
    const mainElement = document.querySelector('.gh-main');
    let allDepartments = [];
    departments.forEach((dept) => {
      allDepartments.push(dept);
      if (dept.children.length > 0) {
        const children = dept.children;
        children.forEach((child) => {
          allDepartments.push(child);
        });
      }
    });
    filteredDepartments = allDepartments;
    if (selectedDepartment !== 'all') {
      mainElement.textContent = '';
      filteredDepartments = [];
      allDepartments.forEach((dept) => {
        if (parseInt(dept.id) === parseInt(selectedDepartment)) {
          filteredDepartments = dept;
        }
      });
      let filteredJobs = [];
      let newFilteredJobs = [];
      if (filteredDepartments.jobs.length > 0) {
        filteredDepartments.jobs.forEach((job) => {
          filteredJobs.push(job);
        });
      }
      if (filteredDepartments.children.length > 0) {
        filteredDepartments.children.forEach((child) => {
          if (child.jobs.length > 0) {
            child.jobs.forEach((job) => {
              filteredJobs.push(job);
            });
          }
        });
      }
      // console.log("filteredJobs", filteredJobs);
      jobs.forEach((job) => {
        filteredJobs.forEach((fJob) => {
          if (parseInt(job.id) === parseInt(fJob.id)) {
            newFilteredJobs.push(job);
          }
        });
      });
      newFilteredJobs.forEach((job) => {
        if (job.departments[0].parent_id) {
          // console.log(job.departments[0]);
          departments.forEach((dept) => {
            if (parseInt(job.departments[0].parent_id) === parseInt(dept.id)) {
              const obj = {
                job: job,
                department: dept,
                subDepartment: job.departments[0],
              };

              displayJobs.push(obj);
            }
          });
        } else {
          const obj = {
            job: job,
            department: job.departments[0],
            subDepartment: null,
          };

          displayJobs.push(obj);
        }
      });
      DisplayJobs(displayJobs);

      // DisplayJobs(displayJobs);
    }
    if (selectedLocation !== 'all') {
      mainElement.innerHTML = '';
      let filteredJobs = [];
      let allOffice = [];
      offices.forEach((office) => {
        allOffice.push(office);
        if (office.children) {
          office.children.forEach((child) => {
            allOffice.push(child);
          });
        }
      });

      let filteredLocationId = [];
      let filteredJobsId = [];

      //get location id of selected location with children ***filteredLocationId***
      allOffice.forEach((office) => {
        if (parseInt(office.id) === parseInt(selectedLocation)) {
          filteredLocationId.push(office.id);
          if (office.children.length > 0) {
            office.children.forEach((child) => {
              filteredLocationId.push(child.id);
            });
          }
        }
      });

      // get all jobs from selected depoartment
      if (Array.isArray(filteredDepartments)) {
        filteredDepartments.forEach((department) => {
          if (department.jobs.length > 0) {
            department.jobs.forEach((job) => {
              filteredJobsId.push(job.id);
            });
          }
        });
      } else {
        if (filteredDepartments.jobs.length > 0) {
          filteredDepartments.jobs.forEach((job) => {
            filteredJobsId.push(job.id);
          });
        }
        if (filteredDepartments.children.length) {
          filteredDepartments.children.forEach((child) => {
            child.jobs.forEach((job) => {
              filteredJobsId.push(job.id);
            });
          });
        }
      }

      // jobs from selected department from which we can get office of each job ***filteredJobs***
      filteredJobsId.forEach((id) => {
        jobs.forEach((job) => {
          if (parseInt(id) === parseInt(job.id)) {
            filteredJobs.push(job);
          }
        });
      });
      // console.log("jobs", filteredJobs);
      let filteredOfficeId = [];
      let filteredArray;
      filteredJobs.forEach((job) => {
        // console.log(job.offices);
        job.offices.forEach((office) => {
          // console.log(office);
          filteredOfficeId.push(office.id);
          if (office.parent_id) {
            filteredOfficeId.push(office.parent_id);
          }
          if (office.children) {
            office.children.forEach((child) => {
              filteredOfficeId.push(child.id);
            });
          }
        });
        filteredOfficeId = [...new Set(filteredOfficeId)];
        // console.log("filteredOfficeId", filteredOfficeId);

        filteredArray = filteredOfficeId.filter((value) =>
          filteredLocationId.includes(value)
        );

        // console.log(filteredArray);
        // console.log("filteredJobsId", filteredJobsId);
        // filteredOfficeId.push()
      });
      let selectedJobs = [];
      filteredJobs.forEach((job) => {
        job.offices.forEach((office, i) => {
          const office_id = office.id;
          filteredArray.forEach((id) => {
            if (parseInt(id) === parseInt(office_id)) {
              selectedJobs.push(job);
            }
          });
        });
      });
      selectedJobs = [...new Set(selectedJobs)];
      // console.log("selectedJobs", selectedJobs);
      // console.log("filteredDepartments", filteredDepartments);
      displayJobs = [];

      selectedJobs.forEach((job) => {
        if (job.departments[0].parent_id) {
          // console.log(job.departments[0]);
          departments.forEach((dept) => {
            if (parseInt(job.departments[0].parent_id) === parseInt(dept.id)) {
              const obj = {
                job: job,
                department: dept,
                subDepartment: job.departments[0],
              };

              displayJobs.push(obj);
            }
          });
        } else {
          const obj = {
            job: job,
            department: job.departments[0],
            subDepartment: null,
          };

          displayJobs.push(obj);
        }
      });
      DisplayJobs(displayJobs);
    }
  }

  // console.log("displayJobs.length", displayJobs.length);
}

//main function call
getJobs().then((response) => {
  getSelectedDepartmentAndLocation(
    response.departments,
    response.jobs,
    response.offices
  );
  const select = document.querySelectorAll('select');
  select.forEach((sel) => {
    sel.addEventListener('input', function (e) {
      count = 8;

      getSelectedDepartmentAndLocation(
        response.departments,
        response.jobs,
        response.offices
      );
    });
  });
  const viewMoreBtn = document.querySelector('.gh-view-more');
  viewMoreBtn.addEventListener('click', function () {
    count += 8;
    getSelectedDepartmentAndLocation(
      response.departments,
      response.jobs,
      response.offices
    );
  });
});

function DisplayJobs(jobsObjectArray) {
  const mainElement = document.querySelector('.gh-main');
  mainElement.textContent = '';
  let htmlToAppend = '';
  if (jobsObjectArray.length > 8) {
    const viewMoreBtn = document.querySelector('.gh-view-more');
    viewMoreBtn.style.display = 'block';
  } else {
    const viewMoreBtn = document.querySelector('.gh-view-more');
    viewMoreBtn.style.display = 'none';
  }
  if (jobsObjectArray.length < 1) {
    htmlToAppend = `<div style="text-align: center; width: 100%; font-size: 24px; margin: 40px;">No jobs found!</div>
`;
    mainElement.insertAdjacentHTML('beforeend', htmlToAppend);
    return;
  }

  jobsObjectArray.forEach((jobObj, i) => {
    if (i >= count) {
      return;
    }

    if (count >= jobsObjectArray.length) {
      const viewMoreBtn = document.querySelector('.gh-view-more');
      viewMoreBtn.style.display = 'none';
    }
    // console.log(i, count);

    htmlToAppend += `   <div class="card">
          <div>
              <div class="department">
                 ${jobObj.department.name}${
      jobObj.subDepartment ? ', ' + jobObj.subDepartment.name : ''
    }
              </div>
              <div class="title">
                ${jobObj.job.title}
              </div>
              <div class="location">
                  ${jobObj.job.location.name}
              </div>
          </div>
         <a href ="/dev-sandbox/careers/job-listing?gh_jid=${
           jobObj.job.id
         }"> <button class="applybtn">
              Apply<i class="fa-solid fa-arrow-up-right-from-square"></i>
          </button></a>
      </div>`;
  });
  mainElement.insertAdjacentHTML('beforeend', htmlToAppend);
}
