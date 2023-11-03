/* CI calculator */
const numInputs = document.querySelectorAll('input');
const Select = document.querySelectorAll('select');

const add_additional = document.getElementById('add_additional');

let number_of_builds_per_week = 100;
let avg_build_time = 15;
let selected_provider = 'circleCI';
let selected_machine_type = 'Linux_4_cores';

let machine_cost_per_mins;
let weekly_build_minutes;

let harness_cost; //yearly
let circleCI_cost; //yearly
let github_actions_cost; //yearly
let other_provider_cost; // yearly

let harness_cost_per_mins;
//let circleCI_cost_per_mins;
//let github_actions_cost_per_mins;

let harness_saving_percentage;

let annual_cost_with_other_provider = [];
let annual_cost_with_harness = [];
let annual_hours_saved = [];

let annual_hour = 0;
let saved_hour = 0;

numInputs.forEach(function (input) {
  input.addEventListener('input', function (e) {
    if (e.target.value === '') {
      e.target.value = '';
    }
    main();
  });
});

Select.forEach(function (select) {
  select.addEventListener('input', function (e) {
    main();
  });
});

function main() {
  const provider = document.getElementById('provider');
  selected_provider = provider.options[provider.selectedIndex].value;
  if (!selected_provider || selected_provider === '') {
    selected_provider = 'circleCI';
  }
  const machine_type = document.getElementById('machine_type');
  selected_machine_type =
    machine_type.options[machine_type.selectedIndex].value;
  if (!selected_machine_type || selected_machine_type === '') {
    selected_machine_type = 'Linux_4_cores';
  }

  number_of_builds_per_week = document.getElementById('weekly_build').value;
  avg_build_time = document.getElementById('weekly_build_minutes').value;

  calculate(
    selected_provider,
    selected_machine_type,
    avg_build_time,
    number_of_builds_per_week
  );
}

function calculate(
  selected_provider,
  selected_machine_type,
  avg_build_time,
  number_of_builds_per_week
) {
  switch (selected_machine_type) {
    case 'Linux_4_cores':
      harness_cost_per_mins = 0.01;
      //circleCI_cost_per_mins = 0.012;
      //github_actions_cost_per_mins = 0.016;
      harness_saving_percentage = 0.3;

      break;

    case 'Linux_8_cores':
      harness_cost_per_mins = 0.025;
      //circleCI_cost_per_mins = 0.06;
      //github_actions_cost_per_mins = 0.032;
      harness_saving_percentage = 0.3;

      break;
    case 'Linux_16_cores':
      harness_cost_per_mins = 0.05;
      //circleCI_cost_per_mins = 0.012;
      //github_actions_cost_per_mins = 0.064;
      harness_saving_percentage = 0.3;

      break;
    case 'Linux_32_cores':
      harness_cost_per_mins = 0.1;
      //circleCI_cost_per_mins = 0.18;
      //github_actions_cost_per_mins = 0.128;
      harness_saving_percentage = 0.3;

      break;
    case 'Windows_4_cores':
      harness_cost_per_mins = 0.04;
      //circleCI_cost_per_mins = 0.072;
      //github_actions_cost_per_mins = 0.064;
      harness_saving_percentage = 0.3;

      break;
    case 'macOS_M1_6_cores':
      harness_cost_per_mins = 0.3;
      //circleCI_cost_per_mins = 0.09;
      //github_actions_cost_per_mins = 0.08;
      harness_saving_percentage = 0.2;

      break;

    default:
      break;
  }

  weekly_build_minutes = number_of_builds_per_week * avg_build_time;
  harness_cost = Math.round(weekly_build_minutes * harness_cost_per_mins * 52);
  switch (selected_provider) {
    case 'circleCI':
      circleCI_cost = Math.round(
        harness_cost / (1 - harness_saving_percentage)
      );
      break;

    case 'github_actions':
      github_actions_cost = Math.round(
        harness_cost / (1 - harness_saving_percentage)
      );
      break;
    case 'other_provider':
      other_provider_cost = Math.round(
        harness_cost / (1 - harness_saving_percentage)
      );
      break;

    default:
      break;
  }
  const other_provider = document.getElementById('other_provider');
  const harness_provider = document.getElementById('harness');
  const hour_saved = document.getElementById('hour_saved');
  let table = document.querySelector('table');

  if (!table) {
    annual_hour = (number_of_builds_per_week * avg_build_time * 52) / 60;
    saved_hour = harness_saving_percentage * annual_hour;
    const hours = hour_saved.getElementsByTagName('h2')[0];
    hours.textContent = `${format(Math.round(saved_hour))} `;
    console.log(hours.textContent);
    if (other_provider) {
      const provider = other_provider.getElementsByTagName('h1')[0];
      const cost = other_provider.getElementsByTagName('h2')[0];
      if (selected_provider === 'circleCI') {
        provider.textContent = 'With CircleCI';
        cost.textContent = `$ ${format(circleCI_cost)} `;
      } else if (selected_provider === 'github_actions') {
        provider.textContent = 'With Git Actions';
        cost.textContent = `$ ${format(github_actions_cost)} `;
      } else {
        provider.textContent = 'With current provider';
        cost.textContent = `$ ${format(other_provider_cost)} `;
      }
    }

    if (harness_provider) {
      const cost = harness_provider.getElementsByTagName('h2')[0];
      cost.textContent = ` $ ${format(harness_cost)} `;
    }
  } else {
    const tbody = table.getElementsByTagName('tbody');

    const hours = hour_saved.getElementsByTagName('h2')[0];

    annual_hour = (number_of_builds_per_week * avg_build_time * 52) / 60;
    saved_hour = 0.3 * annual_hour;
    const sum = annual_hours_saved.reduce((partialSum, a) => partialSum + a, 0);
    hours.textContent = `${Math.round(sum + saved_hour)} `;

    if (other_provider) {
      const provider = other_provider.getElementsByTagName('h1')[0];
      const cost = other_provider.getElementsByTagName('h2')[0];

      const sum = annual_cost_with_other_provider.reduce(
        (partialSum, a) => partialSum + a,
        0
      );
      if (selected_provider === 'circleCI') {
        provider.textContent = 'Annual cost with CircleCI';
        cost.textContent = `$ ${circleCI_cost + sum} `;
      } else {
        provider.textContent = 'Annual cost with Git Actions';
        cost.textContent = `$ ${github_actions_cost + sum} `;
      }
    }
    if (harness_provider) {
      const cost = harness_provider.getElementsByTagName('h2')[0];

      const sum = annual_cost_with_harness.reduce(
        (partialSum, a) => partialSum + a,
        0
      );
      cost.textContent = ` $ ${harness_cost + sum} `;
    }
  }
}

function format(num) {
  if (num < 1000000) {
    // Display the full number with commas
    return num.toLocaleString();
  } else {
    // Display in the format "1.234M"
    return (num / 1000000).toFixed(3) + 'M';
  }
}

function addToArray() {
  const saved_hours = 0.3 * (weekly_build_minutes / 60);
  annual_hours_saved.push(saved_hours);

  annual_cost_with_harness.push(harness_cost);
  circleCI_cost
    ? annual_cost_with_other_provider.push(circleCI_cost)
    : annual_cost_with_other_provider.push(github_actions_cost);

  console.log(annual_hours_saved);

  main();
}
function removeFromArray(other, harness, annual_hrs_saved) {
  removeFirst = function (val, array) {
    array.splice(array.indexOf(val), 1);
    return array;
  };

  removeFirst(other, annual_cost_with_other_provider);
  removeFirst(harness, annual_cost_with_harness);
  removeFirst(annual_hrs_saved, annual_hours_saved);

  main();
}

add_additional.addEventListener('click', addToArray);

/* ----- */

// const add_additional = document.getElementById('add_additional');
const tableContainer = document.querySelector('.table');
let lock = true;

setInterval(function () {
  if (!lock) {
    lock = true;
  }
}, 1000);
function handleAddAdditional() {
  // lock = true;
  let table = document.querySelector('table');

  if (table) {
    const tbody = table.getElementsByTagName('tbody');
    const htmlToAppend = `
    <tr class="tab" >
      <td>${number_of_builds_per_week}</td>
      <td>${avg_build_time}</td>
      <td>${selected_machine_type}</td>
      <td><i class="fa fa-trash"></i></td>
    </tr>
  `;
    tbody[0].insertAdjacentHTML('beforeend', htmlToAppend);
  } else {
    table = document.createElement('table');

    table.innerHTML = `
    <tr >
      <th>Weekly builds</th>
      <th>Avg build time</th>
      <th>Machine type</th>
    </tr>
    <tr class="tab" >
      <td>${number_of_builds_per_week}</td>
      <td>${avg_build_time}</td>
      <td>${selected_machine_type}</td>
      <td><i class="fa fa-trash"></i></td>
    </tr>
  `;
  }
  tableContainer.appendChild(table);
  const tbody = table.getElementsByTagName('tbody');
  const tr = tbody[0].getElementsByTagName('tr');

  Array.from(tr).forEach((row, index) => {
    row.addEventListener('click', function (e) {
      if (lock && e.target.classList.contains('fa-trash')) {
        lock = false;
        const row = e.target.closest('tr');
        const values = row.querySelectorAll('td');
        console.log(values[0].textContent);
        console.log(values[1].textContent);

        const annual_hrs_saved =
          ((parseInt(values[0].textContent) *
            parseInt(values[1].textContent) *
            52) /
            60) *
          0.3;
        console.log(annual_hrs_saved);
        switch (values[2].textContent) {
          case 'Linux_4_cores':
            harness_cost_per_mins = 0.01;
            circleCI_cost_per_mins = 0.012;
            github_actions_cost_per_mins = 0.016;
            harness_saving_percentage = 0.3;

            break;

          case 'Linux_8_cores':
            harness_cost_per_mins = 0.025;
            circleCI_cost_per_mins = 0.06;
            github_actions_cost_per_mins = 0.032;
            harness_saving_percentage = 0.3;

            break;
          case 'Linux_16_cores':
            harness_cost_per_mins = 0.05;
            circleCI_cost_per_mins = 0.012;
            github_actions_cost_per_mins = 0.064;
            harness_saving_percentage = 0.3;

            break;
          case 'Linux_32_cores':
            harness_cost_per_mins = 0.1;
            circleCI_cost_per_mins = 0.18;
            github_actions_cost_per_mins = 0.128;
            harness_saving_percentage = 0.3;

            break;
          case 'Windows_4_cores':
            harness_cost_per_mins = 0.04;
            circleCI_cost_per_mins = 0.072;
            github_actions_cost_per_mins = 0.064;
            harness_saving_percentage = 0.3;

            break;
          case 'macOS_M1_6_cores':
            harness_cost_per_mins = 0.3;
            circleCI_cost_per_mins = 0.09;
            github_actions_cost_per_mins = 0.08;
            harness_saving_percentage = 0.2;

            break;

          default:
            break;
        }

        let cost;
        switch (selected_provider) {
          case 'circleCI':
            cost = Math.round(weekly_build_minutes * circleCI_cost_per_mins);
            break;

          case 'github_actions':
            cost = Math.round(
              weekly_build_minutes * github_actions_cost_per_mins
            );
            break;

          default:
            break;
        }

        removeFromArray(cost, harness_cost, annual_hrs_saved);
        if (row) {
          row.remove();
        }
      }

      if (tr.length == 1) {
        tbody[0].parentElement.remove();
      }
    });
  });
  lock = true;

  const provider = document.getElementById('provider');
  provider.addEventListener('input', function (e) {
    const tbody = table.getElementsByTagName('tbody');
    tbody[0].parentElement.remove();
  });
}

add_additional.addEventListener('click', handleAddAdditional);

/* =========== */

/*
const numInputs = document.querySelectorAll("input");
const Select = document.querySelectorAll("select");

let number_of_builds_per_week = 100;
let avg_build_time = 15;
let selected_provider = "circleCI";
let selected_machine_type = "Linux_4_cores";

let machine_cost_per_mins;
let weekly_build_minutes;

let harness_cost; //yearly
let circleCI_cost;  //yearly
let github_actions_cost;  //yearly
let other_provider_cost; // yearly

let harness_cost_per_mins;
//let circleCI_cost_per_mins;
//let github_actions_cost_per_mins;

let harness_saving_percentage;

let annual_cost_with_other_provider = [];
let annual_cost_with_harness = [];
let annual_hours_saved = [];

let annual_hour = 0;
let saved_hour = 0;

document.addEventListener("DOMContentLoaded", function () {
  main();
});

numInputs.forEach(function (input) {
  input.addEventListener("input", function (e) {
    if (e.target.value == "") {
      e.target.value = 0;
    }
    main();
  });
});
Select.forEach(function (select) {
  select.addEventListener("input", function (e) {
    main();
  });
});
numInputs.forEach(function (input) {
  input.addEventListener("input", function (e) {
    if (e.target.value === "0") {
      e.target.value = "";
    }
    main();
  });
});

function main() {
  const provider = document.getElementById("provider");
  selected_provider = provider.options[provider.selectedIndex].value;
  if (!selected_provider || selected_provider === "") {
    selected_provider = "circleCI";
  }
  const machine_type = document.getElementById("machine_type");
  selected_machine_type =
    machine_type.options[machine_type.selectedIndex].value;
  if (!selected_machine_type || selected_machine_type === "") {
    selected_machine_type = "Linux_4_cores";
  }

  number_of_builds_per_week = document.getElementById("weekly_build").value;
  avg_build_time = document.getElementById("weekly_build_minutes").value;

  calculate(
    selected_provider,
    selected_machine_type,
    avg_build_time,
    number_of_builds_per_week
  );
}

function calculate(
  selected_provider,
  selected_machine_type,
  avg_build_time,
  number_of_builds_per_week
) {
  switch (selected_machine_type) {
    case "Linux_4_cores":
      harness_cost_per_mins = 0.01;
      //circleCI_cost_per_mins = 0.012;
      //github_actions_cost_per_mins = 0.016;
      harness_saving_percentage = 0.3;

      break;

    case "Linux_8_cores":
      harness_cost_per_mins = 0.025;
      //circleCI_cost_per_mins = 0.06;
      //github_actions_cost_per_mins = 0.032;
      harness_saving_percentage = 0.3;


      break;
    case "Linux_16_cores":
      harness_cost_per_mins = 0.05;
      //circleCI_cost_per_mins = 0.012;
      //github_actions_cost_per_mins = 0.064;
      harness_saving_percentage = 0.3;


      break;
    case "Linux_32_cores":
      harness_cost_per_mins = 0.1;
      //circleCI_cost_per_mins = 0.18;
      //github_actions_cost_per_mins = 0.128;
      harness_saving_percentage = 0.3;


      break;
    case "Windows_4_cores":
      harness_cost_per_mins = 0.04;
      //circleCI_cost_per_mins = 0.072;
      //github_actions_cost_per_mins = 0.064;
      harness_saving_percentage = 0.3;


      break;
    case "macOS_M1_6_cores":
      harness_cost_per_mins = 0.3;
      //circleCI_cost_per_mins = 0.09;
      //github_actions_cost_per_mins = 0.08;
      harness_saving_percentage = 0.2;

      break;

    default:
      break;
  }

  weekly_build_minutes = number_of_builds_per_week * avg_build_time;
  harness_cost = Math.round(weekly_build_minutes * harness_cost_per_mins * 52);
  switch (selected_provider) {
    case "circleCI":
      circleCI_cost = Math.round(harness_cost/(1-harness_saving_percentage));
      break;

    case "github_actions":
      github_actions_cost = Math.round(harness_cost/(1-harness_saving_percentage));
      break;
    case "other_provider":
      other_provider_cost = Math.round(harness_cost/(1-harness_saving_percentage));
      break;

    default:
      break;
  }
  const other_provider = document.getElementById("other_provider");
  const harness_provider = document.getElementById("harness");
  const hour_saved = document.getElementById("hour_saved");
  let table = document.querySelector("table");

  if (!table) {
    annual_hour = (number_of_builds_per_week * avg_build_time * 52) / 60;
    saved_hour = harness_saving_percentage * annual_hour;
    const hours = hour_saved.getElementsByTagName("h2")[0];
    hours.textContent = `${format(Math.round(saved_hour))} `;
    console.log(hours.textContent);
    if (other_provider) {
      const provider = other_provider.getElementsByTagName("h3")[0];
      const cost = other_provider.getElementsByTagName("h2")[0];
      if (selected_provider === "circleCI") {
        provider.textContent = "Annual cost with CircleCI";
        cost.textContent = `$ ${format(circleCI_cost)} `;
      } else if (selected_provider === "github_actions"){
        provider.textContent = "Annual cost with Git Actions";
        cost.textContent = `$ ${format(github_actions_cost)} `;
      } else{
        provider.textContent = "Annual cost with current provider";
        cost.textContent = `$ ${format(other_provider_cost)} `;
      }
    }

    if (harness_provider) {
      const cost = harness_provider.getElementsByTagName("h2")[0];
      cost.textContent = ` $ ${format(harness_cost)} `;
    }
  } else {
    const tbody = table.getElementsByTagName("tbody");

    const hours = hour_saved.getElementsByTagName("h2")[0];

    annual_hour = (number_of_builds_per_week * avg_build_time * 52) / 60;
    saved_hour = 0.3 * annual_hour;
    const sum = annual_hours_saved.reduce((partialSum, a) => partialSum + a, 0);
    hours.textContent = `${Math.round(sum + saved_hour)} `;

    if (other_provider) {
      const provider = other_provider.getElementsByTagName("h3")[0];
      const cost = other_provider.getElementsByTagName("h2")[0];

      const sum = annual_cost_with_other_provider.reduce(
        (partialSum, a) => partialSum + a,
        0
      );
      if (selected_provider === "circleCI") {
        provider.textContent = "Annual cost with CircleCI";
        cost.textContent = `$ ${circleCI_cost + sum} `;
      } else {
        provider.textContent = "Annual cost with Git Actions";
        cost.textContent = `$ ${github_actions_cost + sum} `;
      }
    }
    if (harness_provider) {
      const cost = harness_provider.getElementsByTagName("h2")[0];

      const sum = annual_cost_with_harness.reduce(
        (partialSum, a) => partialSum + a,
        0
      );
      cost.textContent = ` $ ${harness_cost + sum} `;
    }
  }
}

function format(num) {
  if (num < 1000000) {
      // Display the full number with commas
      return num.toLocaleString();
  } else {
      // Display in the format "1.234M"
      return (num / 1000000).toFixed(3) + 'M';
  }
}

function addToArray() {
  const saved_hours = 0.3 * (weekly_build_minutes / 60);
  annual_hours_saved.push(saved_hours);

  annual_cost_with_harness.push(harness_cost);
  circleCI_cost
    ? annual_cost_with_other_provider.push(circleCI_cost)
    : annual_cost_with_other_provider.push(github_actions_cost);

  console.log(annual_hours_saved);

  main();
}
function removeFromArray(other, harness, annual_hrs_saved) {
  removeFirst = function (val, array) {
    array.splice(array.indexOf(val), 1);
    return array;
  };

  removeFirst(other, annual_cost_with_other_provider);
  removeFirst(harness, annual_cost_with_harness);
  removeFirst(annual_hrs_saved, annual_hours_saved);

  main();
}
*/

/* -------- */

/*
const add_additional = document.getElementById("add_additional");
const tableContainer = document.querySelector(".table");
let lock = true;

setInterval(function () {
  if (!lock) {
    lock = true;
  }
}, 1000);
function handleAddAdditional() {
  // lock = true;
  let table = document.querySelector("table");

  if (table) {
    const tbody = table.getElementsByTagName("tbody");
    const htmlToAppend = `
    <tr class="tab" >
      <td>${number_of_builds_per_week}</td>
      <td>${avg_build_time}</td>
      <td>${selected_machine_type}</td>
      <td><i class="fa fa-trash"></i></td>
    </tr>
  `;
    tbody[0].insertAdjacentHTML("beforeend", htmlToAppend);
  } else {
    table = document.createElement("table");

    table.innerHTML = `
    <tr >
      <th>Weekly builds</th>
      <th>Avg build time</th>
      <th>Machine type</th>
    </tr>
    <tr class="tab" >
      <td>${number_of_builds_per_week}</td>
      <td>${avg_build_time}</td>
      <td>${selected_machine_type}</td>
      <td><i class="fa fa-trash"></i></td>
    </tr>
  `;
  }
  tableContainer.appendChild(table);
  const tbody = table.getElementsByTagName("tbody");
  const tr = tbody[0].getElementsByTagName("tr");

  Array.from(tr).forEach((row, index) => {
    row.addEventListener("click", function (e) {
      if (lock && e.target.classList.contains("fa-trash")) {
        lock = false;
        const row = e.target.closest("tr");
        const values = row.querySelectorAll("td");
        console.log(values[0].textContent);
        console.log(values[1].textContent);

        const annual_hrs_saved =
          ((parseInt(values[0].textContent) *
            parseInt(values[1].textContent) *
            52) /
            60) *
          0.3;
        console.log(annual_hrs_saved);
        switch (values[2].textContent) {
          case "Linux_4_cores":
            harness_cost_per_mins = 0.01;
            circleCI_cost_per_mins = 0.012;
            github_actions_cost_per_mins = 0.016;
            harness_saving_percentage = 0.3;

            break;

          case "Linux_8_cores":
            harness_cost_per_mins = 0.025;
            circleCI_cost_per_mins = 0.06;
            github_actions_cost_per_mins = 0.032;
            harness_saving_percentage = 0.3;

            break;
          case "Linux_16_cores":
            harness_cost_per_mins = 0.05;
            circleCI_cost_per_mins = 0.012;
            github_actions_cost_per_mins = 0.064;
            harness_saving_percentage = 0.3;

            break;
          case "Linux_32_cores":
            harness_cost_per_mins = 0.1;
            circleCI_cost_per_mins = 0.18;
            github_actions_cost_per_mins = 0.128;
            harness_saving_percentage = 0.3;

            break;
          case "Windows_4_cores":
            harness_cost_per_mins = 0.04;
            circleCI_cost_per_mins = 0.072;
            github_actions_cost_per_mins = 0.064;
            harness_saving_percentage = 0.3;

            break;
          case "macOS_M1_6_cores":
            harness_cost_per_mins = 0.3;
            circleCI_cost_per_mins = 0.09;
            github_actions_cost_per_mins = 0.08;
            harness_saving_percentage = 0.2;

            break;

          default:
            break;
        }

        let cost;
        switch (selected_provider) {
          case "circleCI":
            cost = Math.round(weekly_build_minutes * circleCI_cost_per_mins);
            break;

          case "github_actions":
            cost = Math.round(
              weekly_build_minutes * github_actions_cost_per_mins
            );
            break;

          default:
            break;
        }

        removeFromArray(cost, harness_cost, annual_hrs_saved);
          if (row) {
            row.remove();
          }
      }

      if (tr.length == 1) {
        tbody[0].parentElement.remove();
      }
    });
  });
  lock = true;

  const provider = document.getElementById("provider");
  provider.addEventListener("input", function (e) {
    const tbody = table.getElementsByTagName("tbody");
    tbody[0].parentElement.remove();
  });
}

add_additional.addEventListener("click", handleAddAdditional);
*/
