/* CI calculator */
console.log("test 1");
const numInputs = document.querySelectorAll("input");
const Select = document.querySelectorAll("select");
const add_additional = document.getElementById("add_additional");

let number_of_builds_per_week = 100;
let avg_build_time = 15;
let selected_provider = "circleCI";
let selected_machine_type = "Linux_4_cores";

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
let annual_hours_with_other_provider = [];

let annual_hour = 0;
let saved_hour = 0;

// comma
function updateValue(event) {
  let formattedValue = 0;
  const input = event.target;
  console.log(input.value);
  const inputValue = input.value.replace(/\D/g, "");
  if (!isNaN(inputValue)) {
    // formattedValue = new Intl.NumberFormat().format(parseInt(inputValue));
    formattedValue = parseInt(inputValue || 0).toLocaleString();
  }
  input.value = formattedValue;
}

document.getElementById("weekly_build").addEventListener("input", updateValue);
document
  .getElementById("weekly_build_minutes")
  .addEventListener("input", updateValue);

numInputs.forEach(function (input) {
  input.addEventListener("input", main);
});

Select.forEach(function (select) {
  select.addEventListener("input", function (e) {
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

  const weekly_build_input = document.getElementById("weekly_build");
  const weekly_build_value = weekly_build_input.value.replace(/,/g, ""); // Remove commas
  number_of_builds_per_week = parseFloat(weekly_build_value);

  avg_build_time = parseInt(
    document.getElementById("weekly_build_minutes").value
  );

  if (isNaN(avg_build_time) || avg_build_time === "") {
    avg_build_time = 0;
  }

  if (isNaN(number_of_builds_per_week) || number_of_builds_per_week === "") {
    number_of_builds_per_week = 0;
  }

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
      circleCI_cost = Math.round(
        harness_cost / (1 - harness_saving_percentage)
      );
      break;

    case "github_actions":
      github_actions_cost = Math.round(
        harness_cost / (1 - harness_saving_percentage)
      );
      break;
    case "other_provider":
      other_provider_cost = Math.round(
        harness_cost / (1 - harness_saving_percentage)
      );
      break;

    default:
      break;
  }
  const other_provider = document.getElementById("other_provider");
  const harness_provider = document.getElementById("harness");
  const hour_saved = document.getElementById("hour_saved");
  let table = document.querySelector("table");

  let provider_text = "";
  let cost_value = 0;
  if (selected_provider === "circleCI") {
    provider_text = "With CircleCI";
    cost_value = circleCI_cost;
  } else if (selected_provider === "github_actions") {
    provider_text = "With GitHub Actions";
    cost_value = github_actions_cost;
  } else {
    provider_text = "With current provider";
    cost_value = other_provider_cost;
  }

  if (!table) {
    annual_hour = (number_of_builds_per_week * avg_build_time * 52) / 60;
    saved_hour = harness_saving_percentage * annual_hour;
    const hours = hour_saved.getElementsByTagName("h2")[0];
    hours.textContent = `${format(Math.round(saved_hour))} `;

    const hours_faster = hour_saved.getElementsByTagName("h6")[0];
    if (hours_faster) {
      hours_faster.textContent = `${formatPercentage(
        harness_saving_percentage
      )} faster`;
    }
    if (other_provider) {
      const provider = other_provider.getElementsByTagName("h3")[0];
      const cost = other_provider.getElementsByTagName("h2")[0];
      provider.textContent = provider_text;
      cost.textContent = `$ ${format(cost_value)} `;
    }

    if (harness_provider) {
      const cost = harness_provider.getElementsByTagName("h2")[0];
      cost.textContent = ` $ ${format(harness_cost)} `;
      const saved_percentage = harness_provider.getElementsByTagName("h6")[0];
      if (saved_percentage) {
        saved_percentage.textContent = `Save ${formatPercentage(
          (cost_value - harness_cost) / cost_value
        )} per year`;
      }
    }
  } else {
    const tbody = table.getElementsByTagName("tbody");

    const hours = hour_saved.getElementsByTagName("h2")[0];

    annual_hour = (number_of_builds_per_week * avg_build_time * 52) / 60;
    saved_hour = harness_saving_percentage * annual_hour; // 0.3 * annual_hour;
    const sum = annual_hours_saved.reduce((partialSum, a) => partialSum + a, 0);

    hours.textContent = `${format(Math.round(sum + saved_hour))} `;
    const hours_faster = hour_saved.getElementsByTagName("h6")[0];
    if (hours_faster) {
      const sum_hours_with_provider = annual_hours_with_other_provider.reduce(
        (partialSum, a) => partialSum + a,
        0
      );
      hours_faster.textContent = `${formatPercentage(
        (sum + saved_hour) / (sum_hours_with_provider + annual_hour)
      )} faster`;
    }

    const provider_cost_sum = annual_cost_with_other_provider.reduce(
      (partialSum, a) => partialSum + a,
      0
    );
    const cost_value_sum = cost_value + provider_cost_sum;
    if (other_provider) {
      const provider = other_provider.getElementsByTagName("h3")[0];
      const cost = other_provider.getElementsByTagName("h2")[0];

      provider.textContent = provider_text;
      cost.textContent = `$ ${format(cost_value_sum)} `;
    }
    if (harness_provider) {
      const cost = harness_provider.getElementsByTagName("h2")[0];

      const sum = annual_cost_with_harness.reduce(
        (partialSum, a) => partialSum + a,
        0
      );
      const harness_cost_sum = harness_cost + sum;
      cost.textContent = ` $ ${format(harness_cost_sum)} `;

      const saved_percentage = harness_provider.getElementsByTagName("h6")[0];
      if (saved_percentage) {
        saved_percentage.textContent = `Save ${formatPercentage(
          (cost_value_sum - harness_cost_sum) / cost_value_sum
        )} per year`;
      }
    }
  }
}

function format(num) {
  const strNum = num.toString();
  const lclStrNum = num.toLocaleString();

  // If the number has fewer than 9 digits, return it as is
  if (strNum.length < 9) return lclStrNum;

  // Abbreviate billions and trillions with two decimal points
  if (num < 1000000000000) return (num / 1000000000).toFixed(2) + "B";
  return (num / 1000000000000).toFixed(2) + "T";
  /* former implementation
  if (num < 1000000) {
    // Display the full number with commas
    return num.toLocaleString();
  } else {
    // Display in the format "1.234M"
    return (num / 1000000).toFixed(3) + 'M';
  }
  */
}

function formatPercentage(num) {
  if (isNaN(num)) {
    return 0;
  } else {
    return `${Math.round(num * 100)}%`;
  }
}

function addToArray() {
  const annual_hours = (number_of_builds_per_week * avg_build_time * 52) / 60;
  const saved_hours = harness_saving_percentage * annual_hours; // 0.3 * annual_hour;
  // const saved_hours = 0.3 * (weekly_build_minutes / 60);
  annual_hours_saved.push(saved_hours);
  annual_hours_with_other_provider.push(annual_hours);

  annual_cost_with_harness.push(harness_cost);
  // circleCI_cost
  selected_provider === "circleCI"
    ? annual_cost_with_other_provider.push(circleCI_cost)
    : annual_cost_with_other_provider.push(github_actions_cost);

  main();
}
// function not in use
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

//clear trashcan //

function clearBuildInputs(skipVisibilityCheck) {
  const elem_inputs = document.getElementsByClassName("inputs")[0];
  if (elem_inputs && !skipVisibilityCheck) {
    const elem_inputs_visible = elem_inputs.style.display !== "none";
    if (elem_inputs_visible) {
      elem_inputs.style.display = "none";
    }
  }
  var weeklyBuildInput = document.getElementById("weekly_build");
  var weeklyBuildMinutesInput = document.getElementById("weekly_build_minutes");
  var machineTypeInput = document.getElementById("machine_type");

  if (weeklyBuildInput) {
    weeklyBuildInput.value = 0;
  }

  if (weeklyBuildMinutesInput) {
    weeklyBuildMinutesInput.value = 0;
  }

  if (machineTypeInput) {
    machineTypeInput.selectedIndex = 1;
  }
  main();
}

// add_additional.addEventListener('click', addToArray); // moved into handleAddAdditional

/* ---- */

// const add_additional = document.getElementById('add_additional');
const tableContainer = document.querySelector(".table");
let lock = true;

setInterval(function () {
  if (!lock) {
    lock = true;
  }
}, 1000);

function handleAddAdditional() {
  const elem_inputs = document.getElementsByClassName("inputs")[0];
  if (elem_inputs) {
    const elem_inputs_invisible = elem_inputs.style.display === "none";
    if (elem_inputs_invisible) {
      elem_inputs.style.display = "";
      return;
    }
  }

  addToArray();

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
        const arrayIndex = Array.from(tr).indexOf(row) - 1;
        if (arrayIndex > -1) {
          annual_cost_with_other_provider.splice(arrayIndex, 1);
          annual_cost_with_harness.splice(arrayIndex, 1);
          annual_hours_saved.splice(arrayIndex, 1);
          annual_hours_with_other_provider.splice(arrayIndex, 1);

          main();
        }
        /* The former approach has flaws, say when 2 rows have same cost/saved_hours/...
        const values = row.querySelectorAll('td');

        const annual_hrs_saved =
          ((parseInt(values[0].textContent) *
            parseInt(values[1].textContent) *
            52) /
            60) *
          0.3;
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
        */
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

  /* Nofar: if the users switches providers lets not clean up the already defined machines types
  const provider = document.getElementById('provider');
  provider.addEventListener('input', function (e) {
    const tbody = table.getElementsByTagName('tbody');
    tbody[0].parentElement.remove();
  });
  */

  clearBuildInputs(true);
}

add_additional.addEventListener("click", handleAddAdditional);

main();
