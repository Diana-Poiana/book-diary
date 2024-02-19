import { dbref, get, child, storage, sRef, uploadBytesResumable, getDownloadURL } from './firebaseConfiguration.js';
import { getUserAuthorizationInfo, hideLoader } from './firebaseSaveSendData.js';


// CREATE NEW BOOK REVIEW

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
// calendars
const maxDate = new Date();
const minDate = new Date();
minDate.setDate(minDate.getDate() - 7);
// calendar html elements
const calendarStartDay = document.querySelector('.book-description__start-date');
const calendarFinishDay = document.querySelector('.book-description__finish-date');
// preloader
const main = document.querySelector('.main');
const header = document.querySelector('.header');
const spinner = document.querySelector('.loader__wrapper');
// to collect all input data
const allUserInputs = document.querySelectorAll('[data-name]');
// picture uploading
const bookCoverInput = document.querySelector('.book-description__cover-input');
const bookCover = document.querySelector('.book-description__cover-img');
let files = [];
let reader = new FileReader();
// for storage
let userData = {};
let rating = {};
let dates = {};
let savedStart;
let savedFinish;
// excisting reviews
const listOfReviews = document.querySelector('.list-of-books__list');
let arrayToUse;
const messageForUser = document.querySelector('.list-of-books__message');
const addReviewBtn = document.querySelector('.list-of-books__add-review');

const pageInput = document.querySelector('.item__page-num');

if (pageInput) {
  pageInput.addEventListener('input', function (e) {
    let text = e.target.innerText;
    e.target.innerText = text.replace(/\D/g, '');
  });
}

function toggleMainLoader() {
  main.style.filter = 'none';
  header.style.filter = 'none';
  spinner.style.display = 'none';
}

// rating 
function getRating(inputs, starsVariable) {
  // which block with inputs is chosen for rating? (for example: book style rating)
  const inputArray = Array.from(inputs.children);

  // checking which input is checked and setting stars value to our stars variable
  inputArray.forEach((elem) => {
    if (elem.hasAttribute('type', 'radio') && elem.checked) {
      starsVariable = +elem.value;
      localStorage.setItem(elem.name, starsVariable);
    }
  });
  //returning stars variable (for example: book style rating stars)
  return starsVariable;
}

function changeOverallRating() {
  // onclick by any stars rating
  settingStars = getRating(settingRating, settingStars); // which block and how many stars choose user
  plotStars = getRating(plotRating, plotStars);
  charactersStars = getRating(charactersRating, charactersStars);
  styleStars = getRating(styleRating, styleStars);
  engagementStars = getRating(engagementRating, engagementStars);

  // saving star values in object for database
  rating['settingStars'] = settingStars;
  rating['plotStars'] = plotStars;
  rating['charactersStars'] = charactersStars;
  rating['styleStars'] = styleStars;
  rating['engagementStars'] = engagementStars;

  // if we have all starts, count overall stars value
  if (settingStars && plotStars && charactersStars && styleStars && engagementStars) {
    overallStars = (settingStars + plotStars + charactersStars + styleStars + engagementStars) / 5;
  }

  // round the overall star value and applying css styles to fill the stars
  let result = Math.round(overallStars * 2) / 2;
  const overallInputs = Array.from(overallRating.children);
  overallInputs.forEach((elem) => {
    if (+elem.value === result) {
      elem.checked = true;
    }
  });
  return rating;
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

// datepicker
let startDate = {}
let finishDate = {};

function setDatepickerStartDate() {
  if (calendarStartDay) {
    startDate = datepicker(calendarStartDay, {
      maxDate: new Date(maxDate),
      formatter: (input, date) => {
        const formattedDate = date.toLocaleDateString();
        input.value = formattedDate;
      },
      onSelect: (input, date) => {
        const formattedDate = date.toLocaleDateString();
        input.value = formattedDate;
        savedStart = input.value;
        localStorage.setItem('start-date', savedStart);
      },
      container: document.querySelector('.book-description__start-date'),
    });
  }
}

function setDatepickerFinishDate() {
  if (calendarFinishDay) {
    finishDate = datepicker(calendarFinishDay, {
      maxDate: new Date(maxDate),
      formatter: (input, date) => {
        const formattedDate = date.toLocaleDateString();
        input.value = formattedDate;
      },
      onSelect: (input, date) => {
        const formattedDate = date.toLocaleDateString();
        input.value = formattedDate;
        savedFinish = input.value;
        localStorage.setItem('finish-date', savedFinish);
      },
      container: document.querySelector('.book-description__finish-date'),
    });
  }
}

function checkForDates() {
  if (calendarStartDay || calendarFinishDay) {
    if (localStorage.getItem('start-date')) {
      savedStart = localStorage.getItem('start-date');
      calendarStartDay.value = savedStart;
    } else {
      savedStart = minDate.toLocaleDateString();
      calendarStartDay.value = savedStart;
      localStorage.setItem('start-date', savedStart);
    }

    if (localStorage.getItem('finish-date')) {
      savedFinish = localStorage.getItem('finish-date');
      calendarFinishDay.value = savedFinish;
    } else {
      savedFinish = maxDate.toLocaleDateString();
      calendarFinishDay.value = savedFinish;
      localStorage.setItem('finish-date', savedFinish);
    }
  }

  dates['savedStart'] = savedStart;
  dates['savedFinish'] = savedFinish;
  return dates;
}

function checkNewMinDate() {
  const parts = savedStart.split('/');
  const saveDate = new Date(parts[2], parts[1] - 1, parts[0]);
  saveDate.setDate(saveDate.getDate() + 1);
  return saveDate;
}

function checkNewMaxDate() {
  const parts = savedFinish.split('/');
  const saveDate = new Date(parts[2], parts[1] - 1, parts[0]);
  saveDate.setDate(saveDate.getDate() - 1);
  return saveDate;
}

try {
  calendarFinishDay.addEventListener('click', () => {
    const saveDate = checkNewMinDate();
    finishDate.setMin(saveDate);
  });
} catch (error) {
  console.log(error);
}

try {
  calendarStartDay.addEventListener('click', () => {
    const saveDate = checkNewMaxDate();
    startDate.setMax(saveDate);
  });
} catch (error) {
  console.log(error);
}

checkForDates();
setDatepickerStartDate();
setDatepickerFinishDate();

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
      userData[dataAttribute] = input.innerText;
    })
  });
}

// local storage applying data
function applyUserData() {
  const storedUserData = {};
  allUserInputs.forEach((input) => {
    let dataAttribute = input.getAttribute('data-name');
    const storedData = JSON.parse(localStorage.getItem(dataAttribute));
    if (storedData === null || storedData === undefined) {
      storedUserData[dataAttribute] = input.innerText;
      input.innerText = storedUserData[dataAttribute];
    } else {
      input.innerText = storedData;
      storedUserData[dataAttribute] = storedData;
    }
  })

  return storedUserData;
}

// loading img to firebase (
async function uploadImgToFirebase() {
  return new Promise((resolve, reject) => {
    if (files.length === 0) {
      alert('No file selected for upload.');  // Resolve with null if no file is selected
      hideLoader();
      return;
    }

    const imgToUpload = files[0];
    const name = imgToUpload.name;
    const metaData = {
      contentType: imgToUpload.type,
    };

    const storageRef = sRef(storage, 'Images/' + name);
    const uploadTask = uploadBytesResumable(storageRef, imgToUpload, metaData);

    uploadTask.on(
      'state_change',
      (snapshot) => {
        console.log('image uploaded');
      },
      (error) => {
        console.log('image not uploaded');
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            resolve(downloadURL);
          })
          .catch((error) => {
            reject((error));
          });
      }
    );
  });
}

getRatingFromLocalStorage();
collectUserData();
applyUserData();

// event listeners
try {
  settingRating.addEventListener('change', changeOverallRating);
} catch (error) {
  console.log(error);
}

try {
  plotRating.addEventListener('change', changeOverallRating);
} catch (error) {
  console.log(error);
}

try {
  charactersRating.addEventListener('change', changeOverallRating);
} catch (error) {
  console.log(error);
}

try {
  styleRating.addEventListener('change', changeOverallRating);
} catch (error) {
  console.log(error);
}

try {
  engagementRating.addEventListener('change', changeOverallRating);
} catch (error) {
  console.log(error);
}

if (bookCoverInput) {
  bookCoverInput.addEventListener('change', (e) => {
    files = e.target.files;
    reader.readAsDataURL(files[0]);

    reader.addEventListener('load', () => {
      bookCover.src = reader.result;
    });
  });

  bookCover.onclick = function () {
    bookCoverInput.click();
  }
}

// UPLOAD LIST REVIEW && EXCISTING SINGLE REVIEW PAGE
function checkUserInfoToShowMessages(data) {
  if (data.length === 0 && sessionStorage.getItem('user-creds') && messageForUser) {
    messageForUser.style.display = 'flex';
    messageForUser.textContent = 'You do not have any reviews';
  }

  if (addReviewBtn && sessionStorage.getItem('user-creds')) {
    addReviewBtn.style.display = 'block';
  }
}

// getting users data from firebase to create list of books
async function fetchData() {
  spinner.style.display = 'flex';
  try {
    let userDataFromFirebase = [];
    const userID = getUserAuthorizationInfo();
    const snapshot = await get(child(dbref, 'users/' + userID));

    snapshot.forEach(childSnapshot => {
      userDataFromFirebase.push(childSnapshot.val());
    });

    getDataForNewReviewListItem(userDataFromFirebase);
    checkUserInfoToShowMessages(userDataFromFirebase);
    spinner.style.display = 'none';
    return userDataFromFirebase;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return [];
  }
}

// getting data to create one (or more) list item
function getDataForNewReviewListItem(userDataFromFirebase) {
  userDataFromFirebase.forEach((review) => {
    const userDataToFetch = Object.entries(review);

    // imgURL
    const imgURL = userDataToFetch[1][1];

    // rating
    const ratings = userDataToFetch[2][1];
    const sum = Object.values(ratings).reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);
    const rating = sum / 5;
    // title
    const title = userDataToFetch[3][1]['input1'];

    // author
    const author = userDataToFetch[3][1]['input2'];

    createNewReviewListItem(author, title, imgURL, rating);
  });
}

// creatingone html for one (or more) list item
function createNewReviewListItem(author, title, imgURL, rating) {

  if (listOfReviews) {

    let newReviewInner = `<li class="list-of-books__item">
    <div class="list-of-books__img-container">
      <a class="list-of-books__link-to-review" id="${title}" href="#">
      </a>
      <img class="list-of-books__cover-img" src="${imgURL}" alt="book cover">
    </div>
    <div class="list-of-books__description">
      <p class="list-of-books__book-name">
        ${title}
        <span class="list-of-books__book-raiting">
          (${rating})
        </span>
      </p>
      <p class="list-of-books__book-author">
        ${author}
      </p>
    </div>
  </li>`;

    listOfReviews.insertAdjacentHTML('beforeend', newReviewInner);
    checkWhichBookClicked();
  }


  return { author, title, imgURL, rating };
}

// checking whicg review user wants to open
function checkWhichBookClicked() {
  const linksToReviews = document.querySelectorAll('.list-of-books__link-to-review');
  const lastLink = linksToReviews[linksToReviews.length - 1];

  lastLink.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.setItem('pageToOpen', JSON.stringify(e.target.id));


    const userCredsToParse = sessionStorage.getItem('user-creds');
    const userCreds = JSON.parse(userCredsToParse);
    const userID = userCreds.uid;

    const queryParams = new URLSearchParams({
      userID: userID,
      title: e.target.id
    });

    window.location.href = 'book-review.html?' + queryParams.toString();
  });
}

fetchData();

// UPLOAD EXCISTING REVIEW
async function getDataForExcistingReview(userID, title) {
  const queryParams = new URLSearchParams({
    userID: userID,
    title: title
  });

  try {
    const snapshot = await get(child(dbref, `users/${userID}/` + queryParams.toString()));
    const reviewInfoToUpload = snapshot.val();
    createSingleReviewPageFromData(reviewInfoToUpload);
    toggleMainLoader();
    return reviewInfoToUpload;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// uploading excisting review from data received from firebase
function createSingleReviewPageFromData(arrayToUse) {
  console.log('Creating page with data:', arrayToUse);

  const { dates, downloadURL, rating, userDataForFirebase } = arrayToUse;

  const { savedStart, savedFinish } = dates;
  localStorage.setItem('start-date', savedStart);
  localStorage.setItem('finish-date', savedFinish);
  checkForDates();

  bookCover.src = downloadURL;

  const { settingStars, charactersStars, plotStars, engagementStars, styleStars } = rating;

  localStorage.setItem('setting__rating', settingStars);
  localStorage.setItem('plot__rating', plotStars);
  localStorage.setItem('characters__rating', charactersStars);
  localStorage.setItem('style__rating', styleStars);
  localStorage.setItem('engagement__rating', engagementStars);

  getRatingFromLocalStorage();

  const textInputs = userDataForFirebase;

  const userInputs = document.querySelectorAll('[data-name]');

  userInputs.forEach((input, i) => {
    let key = `input${i + 1}`;

    if (key === input.getAttribute('data-name')) {
      input.textContent = textInputs[key];
    }
  })
}

export { applyUserData, changeOverallRating, uploadImgToFirebase, getDataForExcistingReview, checkForDates, toggleMainLoader };