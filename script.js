const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjALAiZC2nk1jVsZFC0u8a1B_cQd_Dnf2rLb18Z24mMtDw5ozJZhdLMAu2L3-44DdwFtVl1RxL9p4N/pub?gid=1411303004&single=true&output=csv";

const board = document.getElementById("board");
const search = document.getElementById("search");

let items = [];

function fetchData() {
    fetch(SHEET_URL)
        .then(res => res.text())
        .then(csv => {
            const parsed = Papa.parse(csv, { header: true });
            items = parsed.data.map(row => ({
                name: row["Item Name"],
                description: row["Description"],
                status: row["Status"]?.toLowerCase() || "",
                contact: row["Contact Info"],
                date: row["Date"]
            }));
            displayItems(items);
        });
}

function displayItems(list) {
    board.innerHTML = "";
    list.forEach(item => {
        if (!item.name) return; // skip empty rows
        const div = document.createElement("div");
        div.className = `item ${item.status}`;
        div.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p><strong>Status:</strong> ${item.status}</p>
      <p><strong>Contact:</strong> ${item.contact}</p>
      <p><small>${item.date}</small></p>
    `;
        board.appendChild(div);
    });
}

search.addEventListener("input", e => {
    const keyword = e.target.value.toLowerCase();
    const filtered = items.filter(i =>
        (i.name || "").toLowerCase().includes(keyword) ||
        (i.description || "").toLowerCase().includes(keyword) ||
        (i.status || "").toLowerCase().include(keyword) ||
        (i.date || "").toLowerCase().include(keyword)
    );
    displayItems(filtered);
});

function renderBoard() {
  board.innerHTML = "";

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = `item ${item.status}`;

    div.innerHTML = `
      <h3>${item.name}</h3>
      <p class="description">${item.description}</p>
      ${item.description.length > 100 ? `<span class="read-more" onclick="toggleReadMore(this)">Read More</span>` : ""}
      <p><strong>Status:</strong> ${item.status}</p>
      <p><strong>Contact:</strong> ${item.contact}</p>
      <p>${item.date}</p>
      <button class="delete-btn" onclick="deleteItem(${index})">Delete</button>
    `;

    board.appendChild(div);
  });
}

// Delete item
function deleteItem(index) {
  if (confirm("Are you sure this report is resolved and should be deleted?")) {
    items.splice(index, 1);  // remove from list
    localStorage.setItem("items", JSON.stringify(items)); // persist
    renderBoard();
  }
}


fetchData();
