import { db, ref, dbref, set, get, auth, child, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, storage, sRef, uploadBytesResumable, getDownloadURL } from './firebaseConfiguration.js';

// import { createNewReview } from './newReviewCreating.js';



function getUserAuthorizationInfo() {
  if (sessionStorage.getItem('user-creds')) {
    const userInfoString = sessionStorage.getItem('user-creds');
    const userInfo = JSON.parse(userInfoString);
    const userID = userInfo.uid;
    return userID;
  }
}

// getting users data from firebase
async function applyUserProfileDataFromFB() {
  try {
    let userDataFromFirebase = [];
    const userID = getUserAuthorizationInfo();
    const snapshot = await get(child(dbref, 'users/' + userID));

    snapshot.forEach(childSnapshot => {
      userDataFromFirebase.push(childSnapshot.val());
    });

    console.log(userDataFromFirebase);
    return userDataFromFirebase;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return [];
  }
}



// Usage example
async function fetchData() {
  getUserAuthorizationInfo();
  const userInfoFromDatabase = await applyUserProfileDataFromFB();

  userInfoFromDatabase.forEach((review) => {
    const userDataToFetch = Object.entries(review);
    console.log(userDataToFetch);
    // imgURL
    const imgURL = userDataToFetch[1][1];
    console.log(imgURL);
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

    createNewReview(author, title, imgURL, rating);
  });
}

function createNewReview(author, title, imgURL, rating) {
  const listOfReviews = document.querySelector('.list-of-books__list');
  let newReviewInner = `<li class="list-of-books__item">
    <div class="list-of-books__img-container">
      <a class="list-of-books__link-to-review" href="book-review.html">
        <p class="list-of-books__cover-text">
          Book cover here
        </p>
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
}

// Вызовите функцию fetchData
fetchData();
















// getting users data from firebase

// function applyUserProfileDataFromFB() {
//   const userID = getUserAuthorizationInfo();



//   get(child(dbref, 'users/' + userID))
//     .then((snapshot) => {
//       let userDataFromFirebase = [];

//       snapshot.forEach(childSnapshot => {
//         userDataFromFirebase.push(childSnapshot.val());
//       })
//     })
// }

// applyUserProfileDataFromFB();







