import { db, ref, set } from './firebaseConfiguration.js';
import { applyUserData, changeOverallRating, uploadImgToFirebase, checkForDates } from './bookReviewPage.js';

const saveBtn = document.querySelector('.review__save-btn');
const loader = document.querySelector('.review__loader');

const bookTitle = document.querySelector('.header__book-title');
const bookAuthor = document.querySelector('.header__book-author');


function showLoader() {
  saveBtn.setAttribute('disabled', true);
  loader.style.display = 'flex';
}

function hideLoader() {
  saveBtn.removeAttribute('disabled');
  loader.style.display = 'none';
}

// get users ID to be able save data under user's ID
function getUserAuthorizationInfo() {
  if (sessionStorage.getItem('user-creds')) {
    const userInfoString = sessionStorage.getItem('user-creds');
    const userInfo = JSON.parse(userInfoString);
    const userID = userInfo.uid;
    return userID;
  }
}

//check for title and author (required fields)
function checkTitleAndAuthor() {
  if (bookTitle.textContent === 'title' || bookTitle.textContent === '' || bookAuthor.textContent === 'author' || bookAuthor.textContent === '') {
    alert('Please enter the title and author of the book');
    hideLoader();
  } else {
    const title = bookTitle.textContent;
    const author = bookAuthor.textContent;
    return { title, author };
  }
}

// send all data to firebase
function saveAllDataAndSendToFirebase() {
  showLoader();
  return new Promise(async function (resolve, reject) {
    try {
      const userDataForFirebase = await applyUserData();
      const dates = await checkForDates();
      const rating = await changeOverallRating();
      const userID = await getUserAuthorizationInfo();
      const { title, author } = await checkTitleAndAuthor();
      const downloadURL = await uploadImgToFirebase();
      if (dates['savedStart'] === undefined || dates['savedFinish'] === undefined) {
        alert("Please enter start and finish dates");
        hideLoader();
        throw new Error('Some values are undefined');
      }

      if (rating.settingStars === undefined || rating.plotStars === undefined || rating.charactersStars === undefined || rating.styleStars === undefined || rating.engagementStars === undefined) {
        alert("Please enter your rating for this book");
        hideLoader();
        throw new Error('Some values are undefined');
      }



      resolve({ userDataForFirebase, dates, rating, userID, title, author, downloadURL });
    } catch (error) {
      reject(error);
    }
  })
    .then(({ userDataForFirebase, dates, rating, userID, title, author, downloadURL }) => {
      return set(ref(db, `users/${userID}/${title}`), {
        userDataForFirebase,
        dates,
        rating,
        userID,
        downloadURL
      });
    })
    .then(() => {
      console.log('all sent! =)');
      localStorage.clear();
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

//save and send button
if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    saveAllDataAndSendToFirebase();
  });
}

export { getUserAuthorizationInfo, hideLoader };