import { db, ref, dbref, set, get, auth, child, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, storage, sRef, uploadBytesResumable, getDownloadURL } from './firebaseConfiguration.js';
import { applyUserData } from './main.js';

const bookCoverInput = document.querySelector('.book-description__cover-input');
const bookCover = document.querySelector('.book-description__cover-img');

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

window.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.querySelector('.review__save-btn');


  // loading img to firebase (img to storage + img url to realtime database)
  function uploadImgToFirebase() {
    let imgToUpload = files[0];
    let imgName = bookCoverInput.value;

    const storageRef = sRef(storage, 'Images/' + imgName);
    const uploadTask = uploadBytesResumable(storageRef, imgToUpload);

    uploadTask.on('state_change', (snapshot) => {
      console.log('image uploaded');
    }, (error) => {
      console.log('image not uploaded');
    }, () => {
      getDownloadURL(uploadTask.snapshot.ref)
        .then((downloadURL) => {
          SaveURLtoRealtimeDB(downloadURL);
        })
    })
  }

  function SaveURLtoRealtimeDB(URL) {
    const userID = getUserAuthorizationInfo();
    let allowedName;
    let name = bookCoverInput.value;

    allowedName = removeUnallowedDigits(name);

    set(ref(db, 'users/' + userID + '/imagesLinks/' + allowedName), {
      ImageName: name,
      ImgUrl: URL
    });
  }

  function removeUnallowedDigits(name) {
    return name.replace(/[.#$[\]]/g, '_');
  };




  // send all data to firebase
  function saveAllDataAndSendToFirebase() {

    const userID = getUserAuthorizationInfo();
    // const bookTitle = document.querySelector('.header__book-title');
    // let bookName = bookTitle.textContent;


    uploadImgToFirebase();

    const savedStart = localStorage.getItem('start-date');
    const savedFinish = localStorage.getItem('finish-date');

    if (userID) {
      const userDataForFirebase = applyUserData();
      if (userDataForFirebase) {
        set(ref(db, 'users/' + userID), { userDataForFirebase, savedStart, savedFinish, rating })
          .then(() => {
            console.log('SENT!!!');
            localStorage.clear();

            window.location.href = 'index.html';
            // window.location.href = 'book-review.html?userId=' + userID;
          })
          .catch((error) => {
            console.error('Error', error);
          });
      } else {
        console.error('Error: userData does not exist.');
      }
    } else {
      console.error('Error: Невозможно получить информацию о пользователе из sessionStorage.');
    }
  }



  //save all data
  try {
    saveBtn.addEventListener('click', () => {
      saveAllDataAndSendToFirebase();
    });
  } catch (error) {
    console.log(error);
  }

});

export { getUserAuthorizationInfo };