function GetURLParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

function Get(yourUrl) {
  var Httpreq = new XMLHttpRequest();
  Httpreq.open("GET", yourUrl, false);
  Httpreq.send(null);
  return Httpreq.responseText;
}

function search() {
  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("search");
  filter = input.value.toUpperCase();
  table = document.getElementById("table");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

function getNumberOfBuilds() {
  let number = 0;
  $.ajax({
    url: "builds/",
    success: function (data) {
      $(data).find("a").each(function () {
        number++;
      })
    },
    async: false
  });
  return number - 1;
}

let buildNumber = GetURLParameter('build');

let sbuild = document.getElementById('sbuild');
sbuild.innerHTML = 'Selected build: ' + buildNumber;

let data = JSON.parse(Get("builds/" + buildNumber + "/results.json"));

let table = document.getElementById("table");
let tbody = document.createElement("tbody");

//create Table Header
let hRow = document.createElement("tr");
let hFileName = document.createElement("th");
let hStatus = document.createElement("th");
let hBrowser = document.createElement("th");
let hDuration = document.createElement("th");
let hWorkerIndex = document.createElement("th");
let hError = document.createElement("th");

hFileName.append(document.createTextNode("Name"));
hStatus.append(document.createTextNode("Status"));
hBrowser.append(document.createTextNode("Browser"));
hDuration.append(document.createTextNode("Duration"));
hWorkerIndex.append(document.createTextNode("Worker Index"));
hError.append(document.createTextNode("Error Message"));

hRow.append(hFileName);
hRow.append(hStatus);
hRow.append(hBrowser);
hRow.append(hDuration);
hRow.append(hWorkerIndex);
hRow.append(hError);

hRow.style.fontWeight = "bold";
table.appendChild(hRow);


function addTableData(tr, data) {
  let cell = document.createElement("td");
  let cellText = document.createTextNode(data);
  cell.appendChild(cellText);
  tr.appendChild(cell);
  tbody.appendChild(tr);
}
function addTableDataAsLink(tr, data) {
  let cell = document.createElement("td");
  let link = document.createElement('a');
  link.href = data;
  link.target = "_blank";
  let cellText = document.createTextNode('Diff-Screenshot');
  link.appendChild(cellText);
  cell.appendChild(link);
  tr.appendChild(cell);
  tbody.appendChild(tr);
}

for (let i of Object.keys(data.suites)) {
  //console.log(data.suites[i].file);
  let row = document.createElement("tr");
  //add Data
  addTableData(row, data.suites[i].file.slice(0, -8));
  addTableData(row, data.suites[i].specs[0].tests[0].results[0].status);
  addTableData(row, data.suites[i].specs[0].tests[0].projectName);
  addTableData(row, data.suites[i].specs[0].tests[0].results[0].duration);
  addTableData(row, data.suites[i].specs[0].tests[0].results[0].workerIndex);

  switch (data.suites[i].specs[0].tests[0].results[0].status) {
    case "timedOut":
      row.style.backgroundColor = "orange";
      addTableData(row, "");
      break;
    case "failed":
      row.style.backgroundColor = "crimson";
      if (data.suites[i].specs[0].tests[0].results[0].error.message.includes("Snapshot comparison")) {
        //insert Screenshot data
        let links = data.suites[i].specs[0].tests[0].results[0].error.message.split(":");
        let diff = links[4].split('test_runner');
        //console.log(diff[1]);
        addTableDataAsLink(row, "builds/" + buildNumber + diff[1]);
      } else {
        addTableData(row, data.suites[i].specs[0].tests[0].results[0].error.message);
      }
      break;
    case "passed":
      row.style.backgroundColor = "green";
      addTableData(row, "");
      break;
    default:
      addTableData(row, "");
      break;
  }
}
table.appendChild(tbody);

let dropdown = document.getElementById('dropdown');

let numberOfBuilds = getNumberOfBuilds();

for (let i = 1; i <= numberOfBuilds; i++) {
  let li = document.createElement('li');
  let a = document.createElement('a');
  a.href = "?build=" + i;
  a.innerHTML = i;
  li.append(a);
  dropdown.appendChild(li);
}
