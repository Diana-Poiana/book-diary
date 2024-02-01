import { db, ref, dbref, set, get, auth, child, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, storage, sRef, uploadBytesResumable, getDownloadURL } from './firebaseConfiguration.js';




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
  console.log(userInfoFromDatabase);

  const one = userInfoFromDatabase[0];
  const two = userInfoFromDatabase[1];
  const three = userInfoFromDatabase[2];
  const four = userInfoFromDatabase[3];
  console.log(one);
  console.log(two);
  console.log(three);
  console.log(four);
}

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







