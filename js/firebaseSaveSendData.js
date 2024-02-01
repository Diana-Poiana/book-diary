import { db, ref, dbref, set, get, auth, child, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, storage, sRef, uploadBytesResumable, getDownloadURL } from './firebaseConfiguration.js';
import { applyUserData } from './bookReviewPage.js';

const saveBtn = document.querySelector('.review__save-btn');

const bookCoverInput = document.querySelector('.book-description__cover-input');
const bookCover = document.querySelector('.book-description__cover-img');

const bookTitle = document.querySelector('.header__book-title');
const bookAuthor = document.querySelector('.header__book-author');

let userData = {};
let files = [];
let reader = new FileReader();
let rating = [];

// get users ID to be able save data under his ID
function getUserAuthorizationInfo() {
  if (sessionStorage.getItem('user-creds')) {
    const userInfoString = sessionStorage.getItem('user-creds');
    const userInfo = JSON.parse(userInfoString);
    const userID = userInfo.uid;
    return userID;
  }
}

// loading img to firebase (img to storage + img url to realtime database)
function uploadImgToFirebase() {
  return new Promise((resolve, reject) => {
    let imgToUpload = files[0];
    let imgName = bookCoverInput.value;

    const storageRef = sRef(storage, 'Images/' + imgName);
    const uploadTask = uploadBytesResumable(storageRef, imgToUpload);

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
            SaveURLtoRealtimeDB(downloadURL);
            resolve(downloadURL); // Resolve the promise with the download URL
          })
          .catch((error) => {
            reject(error);
          });
      }
    );
  });
}

function SaveURLtoRealtimeDB(URL) {
  const userID = getUserAuthorizationInfo();
  let allowedName;
  let name = bookCoverInput.value;

  allowedName = removeUnallowedDigits(name);

  set(ref(db, `users/${userID}/imagesLinks/${allowedName}`), {
    ImageName: name,
    ImgUrl: URL
  });
}

function removeUnallowedDigits(name) {
  return name.replace(/[.#$[\]]/g, '_');
};

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
      const newURL = `/reviews/${sanitizedTitle}-${sanitizedAuthor}`;

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

saveBtn.addEventListener('click', () => {
  saveAllDataAndSendToFirebase()
    .then((newURL) => {
      window.location.href = 'index.html';
      return newURL;
    })
});

export { getUserAuthorizationInfo };