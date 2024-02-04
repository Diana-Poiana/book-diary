
import { db, ref, dbref, set, get, auth, child, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, storage, sRef, uploadBytesResumable, getDownloadURL } from './firebaseConfiguration.js';
import { getUserAuthorizationInfo } from './firebaseSaveSendData.js';


const bookCoverInput = document.querySelector('.book-description__cover-input');
const bookCover = document.querySelector('.book-description__cover-img');

let files = [];
let reader = new FileReader();

// loading img to firebase (img to storage + img url to realtime database)
async function uploadImgToFirebase() {
  return new Promise((resolve, reject) => {
    if (files.length === 0) {
      alert('No file selected for upload.');  // Resolve with null if no file is selected
      return;
    }

    const imgToUpload = files[0];
    const metaData = {
      contentType: imgToUpload.type,
    };

    const storageRef = sRef(storage, 'Images/');
    const uploadTask = uploadBytesResumable(storageRef, imgToUpload, metaData);

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
            resolve(downloadURL);
          })
          .catch((error) => {
            reject((error));
          });
      }
    );
  });
}

function SaveURLtoRealtimeDB(URL) {
  const userID = getUserAuthorizationInfo();

  set(ref(db, `users/${userID}/imageLink/`), {
    // ImageName: name,
    ImgUrl: URL
  });
}

// event listeners
bookCoverInput.addEventListener('change', (e) => {
  files = e.target.files;
  console.log(files[0]['name']);
  reader.readAsDataURL(files[0]);

  reader.addEventListener('load', () => {
    bookCover.src = reader.result;
  });
});

bookCover.onclick = function () {
  bookCoverInput.click();
}

export { uploadImgToFirebase };