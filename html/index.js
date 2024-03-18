let charImg = $("#character-img");
let charList = $(".character-list");
let charSelect = $(".character-select");
let charCreate = $(".character-create");

let loading = false;
let selectedCharacterData = null;
let characters = [];

if (window.nuiHandoverData) {
  const serverData = window.nuiHandoverData;
  characters = serverData.characters;

  const charactersHTML = characters
    .map(
      (char, index) =>
        `
        <div class="character" id="character" data-index="${index}">
          <div class="info">
            <div class="img" id="character-img">
            ${
              char.pfp
                ? ` <img src="${char.pfp}" alt="${parseInfo(char).firstname} ${
                    parseInfo(char).lastname
                  }" />`
                : `<i class="fa-solid fa-user fa-lg"></i>`
            }
            </div>
            <div class="name">${parseInfo(char).firstname} ${
          parseInfo(char).lastname
        }
            </div>
          </div>
          <div class="character-select" aria-expanded="false">
            <button class="delete-button">Delete</button>
            <button class="spawn-button">Spawn</button>
          </div>
        </div>
      `
    )
    .join("");

  charList.html(charactersHTML);
}

// Toggle Dropdown
$(document).on("click", ".character", function () {
  if (!loading) {
    // Close all other character containers
    $(".character")
      .not(this)
      .each(function () {
        $(this).attr("aria-expanded", "false");
        $(this).find(".character-select").css("height", "0px");
        $(this).find(".info").css("border-radius", "10px");
      });

    let selectedIndex = $(this).data("index");
    selectedCharacterData = characters[selectedIndex];

    let expanded = $(this).attr("aria-expanded");
    if (expanded === "true") {
      $(this).attr("aria-expanded", "false");
      $(this).find(".character-select").css("height", "0px");
      $(this).find(".info").css("border-radius", "10px");
    } else {
      $(this).attr("aria-expanded", "true");
      $(this).find(".character-select").css("height", "3rem");
      $(this).find(".info").css("border-radius", "10px 10px 0 0");
    }
  }
});

// Create Character
$(document).on("click", "#create", function (e) {
  e.preventDefault();

  var success = true;
  let firstname = $("#fname").val();
  let lastname = $("#lname").val();
  let year = $("#year").val();
  let month = $("#month").val();
  let day = $("#day").val();
  let birthdate = `${year}-${month}-${day}`;
  let gender = "male";
  let cid = characters.length + 1;
  const regTest = new RegExp(profList.join("|"), "i");

  if (
    !firstname ||
    !lastname ||
    !birthdate ||
    hasWhiteSpace(firstname) ||
    hasWhiteSpace(lastname)
  ) {
    success = false;
    return false;
  }

  if (regTest.test(firstname) || regTest.test(lastname)) {
    console.log("ERROR: You used a derogatory/vulgar term. Please try again!");
    success = false;
    return false;
  }

  if (success) {
    loading = true;
    LoadingChar({
      firstname: firstname,
      lastname: lastname,
      birthdate: birthdate,
      gender: gender,
      cid: cid,
    });
    sendSendCreate({
      firstname: firstname,
      lastname: lastname,
      birthdate: birthdate,
      gender: gender,
      cid: cid,
    });
  }
});

$(document).on("click", "#cancel", function (e) {
  e.preventDefault();
  $(".character-register").toggle();
});

// Spawn Character
$(document).on("click", ".spawn-button", function (e) {
  e.preventDefault();
  loading = true;
  sendSelectChar();
  LoadingChar();
});

// Delete Character
$(document).on("click", ".delete-button", function (e) {
  e.preventDefault();
  $(".modal").show().css("display", "flex");
  $(".modal").find("strong").text(`${parseInfo(selectedCharacterData).firstname}
  ${parseInfo(selectedCharacterData).lastname}`);
});

$(document).on("click", ".confirm-btn", function (e) {
  $(".modal").hide();
  loading = true;
  sendDeleteChar();
  LoadingChar();
});

$(document).on("click", ".cancel-btn", function (e) {
  $(".modal").hide();
});

$(document).on("click", ".character-create", function (e) {
  e.preventDefault();
  $(".character-register").toggle().css("display", "flex");
});

$(document).ready(function () {
  window.addEventListener("message", function (e) {
    const data = e.data;

    if (data.action === "hideui") {
      $("body").fadeOut(250);
    } else if (data.action === "loading") {
      characters = data.characters;
      loading = data.bool;

      if (!loading) {
        LoadingChar();
      }
    }
  });
});

// Date picker
$(document).ready(function () {
  const currentYear = new Date().getFullYear() - 18;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  for (let i = currentYear; i >= currentYear - 100; i--) {
    const option = $("<option></option>").attr("value", i).text(i);
    $("#year").append(option);
  }

  $.each(months, function (index, month) {
    $("#month").append(
      $("<option>", {
        value: index + 1,
        text: month,
      })
    );
  });

  populateDays(1, new Date().getFullYear());
  $("#month, #year").on("change", function () {
    const selectedMonth = $("#month").val();
    const selectedYear = $("#year").val();
    populateDays(selectedMonth, selectedYear);
  });
});

// Functions

function sendSelectChar() {
  $.post(
    "https://ecrp-loading/selectCharacter",
    JSON.stringify({
      character: selectedCharacterData,
    })
  ).fail(function () {
    setTimeout(sendSelectChar, 1000);
  });
}

function sendDeleteChar() {
  $.post(
    "https://ecrp-loading/deleteCharacter",
    JSON.stringify({
      citizenid: selectedCharacterData.citizenid,
    })
  ).fail(function () {
    setTimeout(sendDeleteChar, 1000);
  });
}

function sendSendCreate(data) {
  $(".character-register").css("display", "none");
  $.post(
    "https://ecrp-loading/createNewCharacter",
    JSON.stringify({
      firstname: data.firstname,
      lastname: data.lastname,
      birthdate: data.birthdate,
      gender: data.gender,
      cid: data.cid,
    })
  ).fail(function () {
    setTimeout(sendSendCreate(data), 1000);
  });
}

function LoadingChar(data) {
  charCreate = $(".character-create");
  charList = $(".character-list");
  let loadingSpinner = $(".loading-spinner");

  if (loading) {
    charCreate.css("opacity", "0");
    loadingSpinner.css("display", "flex");
    charactersHTML = `
    <div class="character" id="character">
      <div class="info">
        <div class="img" id="character-img">
        ${
          data
            ? `<i class="fa-solid fa-user fa-lg"></i>`
            : ` <img src="${selectedCharacterData.pfp}" alt="${
                parseInfo(selectedCharacterData).firstname
              } ${parseInfo(selectedCharacterData).lastname}" />`
        }
          
        </div>
        <div class="name">
        ${
          data
            ? `${data.firstname} ${data.lastname}`
            : `${parseInfo(selectedCharacterData).firstname} ${
                parseInfo(selectedCharacterData).lastname
              }`
        }
        </div>
      </div>
    </div>
    `;
  } else {
    charCreate.css("opacity", "1");
    loadingSpinner.css("display", "none");
    charactersHTML = characters
      .map(
        (char, index) =>
          `
          <div class="character" id="character" data-index="${index}">
            <div class="info">
              <div class="img" id="character-img">
                ${
                  char.pfp
                    ? ` <img src="${char.pfp}" alt="${
                        parseInfo(char).firstname
                      } ${parseInfo(char).lastname}" />`
                    : `<i class="fa-solid fa-user fa-lg"></i>`
                }
              </div>
              <div class="name">${parseInfo(char).firstname} ${
            parseInfo(char).lastname
          }
              </div>
            </div>
            <div class="character-select" aria-expanded="false">
              <button class="delete-button">Delete</button>
              <button class="spawn-button">Spawn</button>
            </div>
          </div>
        `
      )
      .join("");
  }

  charList.html(charactersHTML);
}

function parseInfo(char) {
  const { firstname, lastname } = JSON.parse(char.charinfo);
  return { firstname, lastname };
}

function hasWhiteSpace(s) {
  return /\s/g.test(s);
}

function populateDays(month, year) {
  $("#day").empty();
  const daysInMonth = new Date(year, month, 0).getDate();

  // Init days for jan

  for (let i = 1; i <= daysInMonth; i++) {
    $("#day").append(
      $("<option>", {
        value: i,
        text: i,
      })
    );
  }
}
