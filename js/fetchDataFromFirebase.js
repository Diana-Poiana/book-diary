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

  const reviewsFromDB = userInfoFromDatabase[0];
  const imagesFromDB = userInfoFromDatabase[1];

  console.log(imagesFromDB);



  const objectNames = Object.keys(reviewsFromDB); // название-автор, название-автор в массиве
  console.log(objectNames); // ["COCO-PEPE", "Chris-ROMAN"]

  const separatedNames = objectNames.map(name => name.split(",")); // делим массив автор-название

  separatedNames.forEach((innerArray, i) => {
    // динамическая деструктуризация для каждой книги
    const [title, author] = innerArray[0].split("-");

    createNewReview(author, title);

    console.log(`Author of book ${i + 1}:`, author);
    console.log(`Title of book ${i + 1}:`, title);
  });


}

fetchData();



function createNewReview(author, title) {

  const listOfReviews = document.querySelector('.list-of-books__list');
  let newReviewInner = `<li class="list-of-books__item">
    <div class="list-of-books__img-container">
    <a class="list-of-books__link-to-review" href="#">
      <p class="list-of-books__cover-text">
        Book cover here
      </p>
    </a>
    <img class="list-of-books__cover-img" src="" alt="">
  </div>
  <div class="list-of-books__description">
    <p class="list-of-books__book-name">
      ${title}
      <span class="list-of-books__book-raiting">
        (0.0)
      </span>
    </p>
    <p class="list-of-books__book-author">
      ${author}
    </p>
  </div>
  </li>`;
  listOfReviews.insertAdjacentHTML('beforeend', newReviewInner);
}
























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







