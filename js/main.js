import { db, ref, dbref, set, get, auth, child, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, storage, sRef, uploadBytesResumable, getDownloadURL } from './firebaseConfiguration.js';
import { getUserAuthorizationInfo } from './firebaseFunctionality.js';





// rating stars html elements
const settingRating = document.getElementById('setting');
const plotRating = document.getElementById('plot');
const charactersRating = document.getElementById('characters');
const styleRating = document.getElementById('style');
const engagementRating = document.getElementById('engagement');
const overallRating = document.getElementById('overall');
// rating stars value
let settingStars;
let plotStars;
let charactersStars;
let styleStars;
let engagementStars;
let overallStars = 0;
// img input
const bookCoverInput = document.querySelector('.book-description__cover-input');
const bookCover = document.querySelector('.book-description__cover-img');
// calendars
const currentDate = new Date();
const maxDate = currentDate.toISOString().split('T')[0];
currentDate.setDate(currentDate.getDate() - 7);
const minDate = currentDate.toISOString().split('T')[0];
// calendar html elements
const calendarStartDay = document.querySelector('.book-description__start-date');
const calendarFinishDay = document.querySelector('.book-description__finish-date');
// for storage
let userData = {};
let files = [];
let reader = new FileReader();
let rating = [];
// to collect all input data
const allUserInputs = document.querySelectorAll('[data-name]');


// rating setting
function getRating(inputs, starsVariable) {
  const inputArray = Array.from(inputs.children);

  inputArray.forEach((elem) => {
    if (elem.hasAttribute('type', 'radio') && elem.checked) {
      starsVariable = +elem.value;
      localStorage.setItem(elem.name, starsVariable);
    }
  });
  return starsVariable;
}

function changeOverallRating() {
  settingStars = getRating(settingRating, settingStars);
  plotStars = getRating(plotRating, plotStars);
  charactersStars = getRating(charactersRating, charactersStars);
  styleStars = getRating(styleRating, styleStars);
  engagementStars = getRating(engagementRating, engagementStars);

  if (settingStars && plotStars && charactersStars && styleStars && engagementStars) {
    overallStars = (settingStars + plotStars + charactersStars + styleStars + engagementStars) / 5;
  }

  rating = [{ settingStars }, { plotStars }, { charactersStars }, { styleStars }, { engagementStars }];

  let result = Math.round(overallStars * 2) / 2;
  const overallInputs = Array.from(overallRating.children);
  overallInputs.forEach((elem) => {
    if (+elem.value === result) {
      elem.checked = true;
    }
  });
}

function getRatingFromLocalStorage() {

  if (localStorage.getItem('setting__rating') && localStorage.getItem('plot__rating') && localStorage.getItem('characters__rating') && localStorage.getItem('style__rating') && localStorage.getItem('engagement__rating')) {
    let settingLocalStorageStars = localStorage.getItem('setting__rating');
    let plotLocalStorageStars = localStorage.getItem('plot__rating');
    let charactersLocalStorageStars = localStorage.getItem('characters__rating');
    let styleLocalStorageStars = localStorage.getItem('style__rating');
    let engagementLocalStorageStars = localStorage.getItem('engagement__rating');

    const settingArray = Array.from(settingRating.children);
    settingArray.forEach((input) => {
      if (input.value === settingLocalStorageStars) {
        input.setAttribute('checked', true);
      }
    })

    const plotArray = Array.from(plotRating.children);
    plotArray.forEach((input) => {
      if (input.value === plotLocalStorageStars) {
        input.setAttribute('checked', true);
      }
    })

    const charactersArray = Array.from(charactersRating.children);
    charactersArray.forEach((input) => {
      if (input.value === charactersLocalStorageStars) {
        input.setAttribute('checked', true);
      }
    })

    const styleArray = Array.from(styleRating.children);
    styleArray.forEach((input) => {
      if (input.value === styleLocalStorageStars) {
        input.setAttribute('checked', true);
      }
    })

    const engagementArray = Array.from(engagementRating.children);
    engagementArray.forEach((input) => {
      if (input.value === engagementLocalStorageStars) {
        input.setAttribute('checked', true);
      }
    })

    changeOverallRating();
  }
}

// book cover
function checkBookCoverExists() {
  if (localStorage.getItem('bookCover') && bookCover) {
    bookCover.src = localStorage.getItem('bookCover');
  }
}

// datepicker setting
function setDatepickerStartDate() {
  if (calendarStartDay) {
    const startDate = datepicker(calendarStartDay, {
      minDate: new Date(minDate),
      formatter: (input, date) => {
        const formattedDate = date.toLocaleDateString();
        input.value = formattedDate;
        const savedStart = input.value;
        localStorage.setItem('start-date', JSON.stringify(savedStart));
      }
    });
  }
}

function setDatepickerFinishDate() {
  if (calendarFinishDay) {
    const finishDate = datepicker(calendarFinishDay, {
      maxDate: new Date(maxDate), formatter: (input, date) => {
        const formattedDate = date.toLocaleDateString();
        input.value = formattedDate;
        const savedFinish = input.value;
        localStorage.setItem('finish-date', JSON.stringify(savedFinish));
      }
    });
  }
}

function checkIfDatesAlreadySaved() {
  if (localStorage.getItem('start-date') && calendarStartDay) {
    calendarStartDay.value = JSON.parse(localStorage.getItem('start-date'));
  }

  if (localStorage.getItem('finish-date') && calendarFinishDay) {
    calendarFinishDay.value = JSON.parse(localStorage.getItem('finish-date'));
  }
}

// local storage collecting data
function collectUserData() {
  allUserInputs.forEach(input => {
    let dataAttribute = input.getAttribute('data-name');
    input.addEventListener('input', function () {
      if (input.innerText === '') {
        userData[dataAttribute] = '...';
      } else {
        userData[dataAttribute] = input.innerText;
      }
      localStorage.setItem(dataAttribute, JSON.stringify(userData[dataAttribute]));
    })
  });
}

// local storage applying data
function applyUserData() {
  const storedUserData = {};
  allUserInputs.forEach((input) => {
    let dataAttribute = input.getAttribute('data-name');
    const storedData = JSON.parse(localStorage.getItem(dataAttribute));
    if (storedData === null) {
      input.innerText = input.innerText;
    } else {
      input.innerText = storedData;
      storedUserData[dataAttribute] = storedData;
    }
  })
  return storedUserData;
}

getRatingFromLocalStorage();

checkBookCoverExists();

setDatepickerStartDate();
setDatepickerFinishDate();
checkIfDatesAlreadySaved();

collectUserData();
applyUserData();

// event listeners

settingRating.addEventListener('change', changeOverallRating);
plotRating.addEventListener('change', changeOverallRating);
charactersRating.addEventListener('change', changeOverallRating);
styleRating.addEventListener('change', changeOverallRating);
engagementRating.addEventListener('change', changeOverallRating);

bookCoverInput.addEventListener('change', (e) => {
  files = e.target.files;
  console.log(files);
  reader.readAsDataURL(files[0]);
});

bookCover.onclick = function () {
  bookCoverInput.click();
}

reader.addEventListener('load', () => {
  bookCover.src = reader.result;
  localStorage.setItem('bookCover', bookCover.src);
});





export { applyUserData };