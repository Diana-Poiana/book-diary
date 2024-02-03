import { db, ref, dbref, set, get, auth, child, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, storage, sRef, uploadBytesResumable, getDownloadURL } from './firebaseConfiguration.js';
import { applyUserData } from './bookReviewPage.js';

const saveBtn = document.querySelector('.review__save-btn');



const bookTitle = document.querySelector('.header__book-title');
const bookAuthor = document.querySelector('.header__book-author');


let rating = {};





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
  if (bookTitle.textContent === 'null' || bookAuthor.textContent === 'null') {
    alert('Please enter the title and author of the book');
  } else {
    const title = bookTitle.textContent;
    const author = bookAuthor.textContent;
    return { title, author };
  }
}

// send all data to firebase
async function saveAllDataAndSendToFirebase() {

  const namingProperties = checkTitleAndAuthor();
  const { title, author } = namingProperties;

  const userID = getUserAuthorizationInfo();
  const imgURL = await uploadImgToFirebase(); // Wait for the image upload to complete

  const savedStart = localStorage.getItem('start-date');
  const savedFinish = localStorage.getItem('finish-date');

  if (userID) {
    const userDataForFirebase = applyUserData();
    if (userDataForFirebase) {
      const sanitizedTitle = title.replace(/[.#$[\]]/g, '_');
      const sanitizedAuthor = author.replace(/[.#$[\]]/g, '_');
      const newURL = `/book-review/${sanitizedTitle}-${sanitizedAuthor}`;
      console.log(newURL);
      await set(ref(db, `users/${userID}${newURL}`), {
        userDataForFirebase,
        savedStart,
        savedFinish,
        rating,
        newURL,
        imgURL, // Include the image URL in the database entry
      });
      console.log('Data succesfully sent!');
      localStorage.clear();
      sessionStorage.setItem('newURL', newURL);
      sessionStorage.setItem('author', author);
      sessionStorage.setItem('title', title);
    } else {
      console.error('Error: userData does not exist.');
    }
  } else {
    console.error('Error: Невозможно получить информацию о пользователе из sessionStorage.');
  }
}

//save all data

// saveBtn.addEventListener('click', () => {
//   saveAllDataAndSendToFirebase()
//     .then((newURL) => {
//       window.location.href = 'index.html';
//       return newURL;
//     })
// });

export { getUserAuthorizationInfo };