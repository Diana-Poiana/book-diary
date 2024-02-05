import { db, ref, dbref, set, get, auth, child, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, storage, sRef, uploadBytesResumable, getDownloadURL } from './firebaseConfiguration.js';

import { updateDates } from './bookReviewPage.js';

const listOfReviews = document.querySelector('.list-of-books__list');



// /// LIST BOOK

// function getUserAuthorizationInfo() {
//   if (sessionStorage.getItem('user-creds')) {
//     const userInfoString = sessionStorage.getItem('user-creds');
//     const userInfo = JSON.parse(userInfoString);
//     const userID = userInfo.uid;
//     return userID;
//   }
// }

// // getting users data from firebase
// async function applyUserProfileDataFromFB() {
//   try {
//     let userDataFromFirebase = [];
//     const userID = getUserAuthorizationInfo();
//     const snapshot = await get(child(dbref, 'users/' + userID));

//     snapshot.forEach(childSnapshot => {
//       userDataFromFirebase.push(childSnapshot.val());
//     });


//     return userDataFromFirebase;
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     return [];
//   }
// }

// async function fetchData() {

//   const userInfoFromDatabase = await applyUserProfileDataFromFB();

//   createReviewToSee(userInfoFromDatabase);
//   populateHtmlReview(userInfoFromDatabase);
// }

// function createReviewToSee(userInfoFromDatabase) {
//   userInfoFromDatabase.forEach((review) => {
//     const userDataToFetch = Object.entries(review);

//     // imgURL
//     const imgURL = userDataToFetch[1][1];

//     // rating
//     const ratings = userDataToFetch[2][1];
//     const sum = Object.values(ratings).reduce((accumulator, currentValue) => {
//       return accumulator + currentValue;
//     }, 0);
//     const rating = sum / 5;
//     // title
//     const title = userDataToFetch[3][1]['input1'];

//     // author
//     const author = userDataToFetch[3][1]['input2'];

//     createNewReview(author, title, imgURL, rating);
//   });
// }

// function createNewReview(author, title, imgURL, rating) {

//   if (listOfReviews) {

//     let newReviewInner = `<li class="list-of-books__item">
//     <div class="list-of-books__img-container">
//       <a class="list-of-books__link-to-review" id="${title}" href="#">
//         <p class="list-of-books__cover-text">
//           Book cover here
//         </p>
//       </a>
//       <img class="list-of-books__cover-img" src="${imgURL}" alt="book cover">
//     </div>
//     <div class="list-of-books__description">
//       <p class="list-of-books__book-name">
//         ${title}
//         <span class="list-of-books__book-raiting">
//           (${rating})
//         </span>
//       </p>
//       <p class="list-of-books__book-author">
//         ${author}
//       </p>
//     </div>
//   </li>`;

//     listOfReviews.insertAdjacentHTML('beforeend', newReviewInner);
//     checkWhichBookClicked();
//   }


//   return { author, title, imgURL, rating };
// }

// function checkWhichBookClicked() {
//   const linksToReviews = document.querySelectorAll('.list-of-books__link-to-review');
//   const lastLink = linksToReviews[linksToReviews.length - 1];

//   lastLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     console.log(e.target);
//     console.log(e.target.id);
//     sessionStorage.setItem('pageToOpen', e.target.id);
//     window.location.href = 'book-review.html';
//   });
// }

// fetchData();



// // UPLOAD EXCISTING REVIEW


// function checkIfReviewCreated() {
//   let bookTitle;
//   if (sessionStorage.getItem('pageToOpen')) {
//     bookTitle = sessionStorage.getItem('pageToOpen');
//   }
//   return bookTitle;
// }


// let arrayToUse;

// function populateHtmlReview(data) {

//   const bookTitle = checkIfReviewCreated();


//   data.forEach((array) => {
//     const userDataToApply = Object.entries(array);
//     const title = userDataToApply[3][1]['input1'];

//     if (bookTitle === title) {
//       arrayToUse = userDataToApply;
//       createPageFromData(arrayToUse);
//     }
//   });
// }


// function createPageFromData(arrayToUse) {
//   console.log('Creating page with data:', arrayToUse);

//   const { savedStart, savedFinish } = arrayToUse[0][1];
//   console.log(savedStart, savedFinish);

//   const staaart = document.querySelector('.book-description__start-date');
//   staaart.value = savedStart;
//   const finiiish = document.querySelector('.book-description__finish-date');
//   finiiish.value = savedFinish;
//   // const imgURL = arrayToUse[1][1];
//   // console.log(imgURL);

//   // const { settingStars, charactersStars, plotStars, engagementStars, styleStars } = arrayToUse[2][1];
//   // console.log(settingStars, charactersStars, plotStars, engagementStars, styleStars);

//   const textInputs = arrayToUse[3][1];
//   console.log(textInputs);

//   let arrayOfValues = Object.keys(textInputs);
//   console.log(arrayOfValues.length);


//   const userInputs = document.querySelectorAll('[data-name]');

//   userInputs.forEach((input, i) => {
//     let key = `input${i + 1}`;

//     if (key === input.getAttribute('data-name')) {
//       input.textContent = textInputs[key];
//     }
//   })

// }