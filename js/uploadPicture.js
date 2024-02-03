
import { db, ref, dbref, set, get, auth, child, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, storage, sRef, uploadBytesResumable, getDownloadURL } from './firebaseConfiguration.js';
import { getUserAuthorizationInfo } from './firebaseSaveSendData.js';


const bookCoverInput = document.querySelector('.book-description__cover-input');
const bookCover = document.querySelector('.book-description__cover-img');

let files = [];
let reader = new FileReader();


function checkBookCoverExists() {
  if (localStorage.getItem('bookCover') && bookCover) {
    bookCover.src = localStorage.getItem('bookCover');
  }
}

// function getImgName(file) {
//   let imgToUpload = files[0];
//   const { name } = files[0];
//   const imgName = name;
//   console.log(imgName);
//   return imgName;
// }


// loading img to firebase (img to storage + img url to realtime database)
async function uploadImgToFirebase() {

  let imgToUpload = files[0];

  const metaData = {
    contentType: imgToUpload.type
  }

  const storageRef = sRef(storage, 'Images/');
  const uploadTask = uploadBytesResumable(storageRef, imgToUpload, metaData);

  uploadTask.on('state_change', (snapshot) => {
    console.log('image uploaded');
  }, (error) => {
    console.log('image not uploaded');
  }, () => {
    getDownloadURL(uploadTask.snapshot.ref)
      .then((downloadURL) => {
        SaveURLtoRealtimeDB(downloadURL);
        console.log(downloadURL);
      })
      .catch(() => {
        console.log('error');
      });
  }
  );
};


function SaveURLtoRealtimeDB(URL) {
  const userID = getUserAuthorizationInfo();
  // let allowedName;
  // let name = bookCoverInput.value;

  // allowedName = removeUnallowedDigits(name);

  set(ref(db, `users/${userID}/imageLink/`), {
    // ImageName: name,
    ImgUrl: URL
  });
}

// function removeUnallowedDigits(name) {
//   return name.replace(/[.#$[\]]/g, '_');
// };



// event listeners


bookCoverInput.addEventListener('change', (e) => {
  files = e.target.files;
  console.log(files[0]['name']);
  reader.readAsDataURL(files[0]);
  // const name = getImgName(files[0]);
  uploadImgToFirebase();
});

bookCover.onclick = function () {
  bookCoverInput.click();
}

reader.addEventListener('load', () => {
  bookCover.src = reader.result;
  localStorage.setItem('bookCover', bookCover.src);
});


checkBookCoverExists();