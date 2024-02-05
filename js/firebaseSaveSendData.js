import { db, ref, dbref, set, get, auth, child, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, storage, sRef, uploadBytesResumable, getDownloadURL } from './firebaseConfiguration.js';
import { applyUserData, updateDates, changeOverallRating, uploadImgToFirebase } from './bookReviewPage.js';


const saveBtn = document.querySelector('.review__save-btn');



const bookTitle = document.querySelector('.header__book-title');
const bookAuthor = document.querySelector('.header__book-author');




// get users ID to be able save data under his ID
function getUserAuthorizationInfo() {
  if (sessionStorage.getItem('user-creds')) {
    const userInfoString = sessionStorage.getItem('user-creds');
    const userInfo = JSON.parse(userInfoString);
    const userID = userInfo.uid;
    return userID;
  }
}

function checkTitleAndAuthor() {
  if (bookTitle.textContent === 'title' || bookTitle.textContent === '' || bookAuthor.textContent === 'author' || bookAuthor.textContent === '') {
    alert('Please enter the title and author of the book');
  } else {
    const title = bookTitle.textContent;
    const author = bookAuthor.textContent;
    return { title, author };
  }
}

// send all data to firebase
function saveAllDataAndSendToFirebase() {

  return new Promise(async function (resolve, reject) {
    try {
      const userDataForFirebase = await applyUserData();
      const dates = await updateDates();
      const rating = await changeOverallRating();
      const userID = await getUserAuthorizationInfo();
      const { title, author } = await checkTitleAndAuthor();
      const downloadURL = await uploadImgToFirebase();

      if (dates['savedStart'] === undefined || dates['savedFinish'] === undefined) {
        alert("Please enter start and finish dates");
        throw new Error('Some values are undefined');
      }

      if (rating.settingStars === undefined || rating.plotStars === undefined || rating.charactersStars === undefined || rating.styleStars === undefined || rating.engagementStars === undefined) {
        alert("Please enter your rating for this book");
        throw new Error('Some values are undefined');
      }

      resolve({ userDataForFirebase, dates, rating, userID, title, author, downloadURL });
    } catch (error) {
      reject(error);
    }
  })
    .then(({ userDataForFirebase, dates, rating, userID, title, author, downloadURL }) => {
      return set(ref(db, `users/${userID}/${title}-${author}`), {
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


//save all data
if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    saveAllDataAndSendToFirebase();
  });
}


export { getUserAuthorizationInfo };