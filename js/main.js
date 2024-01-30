import { db, ref, dbref, set, get, auth, child, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, storage, sRef, uploadBytesResumable, getDownloadURL } from './firebaseConfiguration.js';

window.addEventListener('DOMContentLoaded', () => {

  // authentication
  const formSignUp = document.querySelector('.form__sign-up');
  const formLogIn = document.querySelector('.form__log-in');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');

  const hidePasswordBtn = document.querySelector('.form__hide-button');
  const btnTextInner = document.querySelector('.form__btn-txt');
  const showSvg = document.querySelector('.form__show-svg');
  const hideSvg = document.querySelector('.form__hide-svg');

  const logInBtntoHide = document.querySelector('.list-of-books__autorization-btn');
  const userTextToShowAfterAutho = document.querySelector('.list-of-books__authorization-done');

  const signUpBtn = document.querySelector('.form__button');
  const loader = document.querySelector('.form__loader');

  // rating stars
  const settingRating = document.getElementById('setting');
  const plotRating = document.getElementById('plot');
  const charactersRating = document.getElementById('characters');
  const styleRating = document.getElementById('style');
  const engagementRating = document.getElementById('engagement');
  const overallRating = document.getElementById('overall');

  let settingStars;
  let plotStars;
  let charactersStars;
  let styleStars;
  let engagementStars;
  let overallStars = 0;

  // img input
  const bookCoverInput = document.querySelector('.book-description__cover-input');
  const bookCover = document.querySelector('.book-description__cover-img');

  // calendar
  const currentDate = new Date();
  const maxDate = currentDate.toISOString().split('T')[0];
  currentDate.setDate(currentDate.getDate() - 7);
  const minDate = currentDate.toISOString().split('T')[0];
  // to update html calendar
  const calendarStartDay = document.querySelector('.book-description__start-date');
  const calendarFinishDay = document.querySelector('.book-description__finish-date');

  const savedStart = localStorage.getItem('start-date');
  const savedFinish = localStorage.getItem('finish-date');

  // local storage

  let userData = {};

  const allUserInputs = document.querySelectorAll('[data-name]');
  const saveBtn = document.querySelector('.review__save-btn');

  // local storage collecting data
  function collectUserData() {
    allUserInputs.forEach(input => {
      let dataAttribute = input.getAttribute('data-name');
      input.addEventListener('input', function () {
        if (input.innerText === '') {
          userData[dataAttribute] = '...';
        } else {
          userData[dataAttribute] = input.innerText;
        }
        localStorage.setItem(dataAttribute, JSON.stringify(userData[dataAttribute]));
      })
    });
  }

  collectUserData();

  // local storage applying data
  function applyUserData() {
    const storedUserData = {};
    allUserInputs.forEach((input) => {
      let dataAttribute = input.getAttribute('data-name');
      const storedData = JSON.parse(localStorage.getItem(dataAttribute));
      if (storedData === null) {
        input.innerText = input.innerText;
      } else {
        input.innerText = storedData;
        storedUserData[dataAttribute] = storedData;
      }
    })
    return storedUserData;
  }

  applyUserData();

  // get users ID to be able save data under his ID
  function getUserAuthorizationInfo() {
    const userInfoString = sessionStorage.getItem('user-creds');
    const userInfo = JSON.parse(userInfoString);
    const userID = userInfo.uid;
    return userID;
  }

  // send all data to firebase
  function saveAllDataAndSendToFirebase() {
    const userID = getUserAuthorizationInfo();

    uploadImgToFirebase(userID);

    if (userID) {

      const userDataForFirebase = applyUserData();

      if (userDataForFirebase) {

        set(ref(db, 'users/' + userID), { userDataForFirebase, savedStart, savedFinish })
          .then(() => {
            console.log('SENT!!!');
            // window.location.href = 'savedData.html?userId=' + userID;
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

  // datepicker
  function getStartDate() {
    if (calendarStartDay) {
      const startDate = datepicker(calendarStartDay, {
        minDate: new Date(minDate),
        formatter: (input, date) => {
          const formattedDate = date.toLocaleDateString();
          input.value = formattedDate;
          const savedStart = input.value;
          localStorage.setItem('start-date', JSON.stringify(savedStart));
        }
      });

    }
  }

  function getFinishDate() {
    if (calendarFinishDay) {
      const finishDate = datepicker(calendarFinishDay, {
        maxDate: new Date(maxDate), formatter: (input, date) => {
          const formattedDate = date.toLocaleDateString();
          input.value = formattedDate;
          const savedFinish = input.value;
          localStorage.setItem('finish-date', JSON.stringify(savedFinish));
        }
      });
    }
  }

  function checkIfDatesExist() {
    if (localStorage.getItem('start-date') && calendarStartDay) {
      calendarStartDay.value = JSON.parse(localStorage.getItem('start-date'));
    }

    if (localStorage.getItem('finish-date') && calendarFinishDay) {
      calendarFinishDay.value = JSON.parse(localStorage.getItem('finish-date'));
    }
  }

  checkIfDatesExist();
  getStartDate();
  getFinishDate();

  // rating stars
  function getRating(inputs, starsVariable) {
    const inputArray = Array.from(inputs.children);
    inputArray.forEach((elem) => {
      if (elem.hasAttribute('type', 'radio') && elem.checked) {
        starsVariable = +elem.value;
        localStorage.setItem(elem.name, starsVariable);
      }
    });
    return starsVariable;
  }

  function changeOverallRating() {
    settingStars = getRating(settingRating, settingStars); // берем сам блок рейтинга и звезды из формулы
    plotStars = getRating(plotRating, plotStars);
    charactersStars = getRating(charactersRating, charactersStars);
    styleStars = getRating(styleRating, styleStars);
    engagementStars = getRating(engagementRating, engagementStars);

    if (settingStars && plotStars && charactersStars && styleStars && engagementStars) {
      overallStars = (settingStars + plotStars + charactersStars + styleStars + engagementStars) / 5;
    }

    let result = Math.round(overallStars * 2) / 2;
    const overallInputs = Array.from(overallRating.children);
    overallInputs.forEach((elem) => {
      if (+elem.value === result) {
        elem.checked = true;
      }
    });
  }

  function getRatingFromLocalStorage() {

    if (localStorage.getItem('setting__rating') && localStorage.getItem('plot__rating') && localStorage.getItem('characters__rating') && localStorage.getItem('style__rating') && localStorage.getItem('engagement__rating')) {
      let settingLocalStorageStars = localStorage.getItem('setting__rating');
      let plotLocalStorageStars = localStorage.getItem('plot__rating');
      let charactersLocalStorageStars = localStorage.getItem('characters__rating');
      let styleLocalStorageStars = localStorage.getItem('style__rating');
      let engagementLocalStorageStars = localStorage.getItem('engagement__rating');

      const settingArray = Array.from(settingRating.children);
      settingArray.forEach((input) => {
        if (input.value === settingLocalStorageStars) {
          input.setAttribute('checked', true);
        }
      })

      const plotArray = Array.from(plotRating.children);
      plotArray.forEach((input) => {
        if (input.value === plotLocalStorageStars) {
          input.setAttribute('checked', true);
        }
      })

      const charactersArray = Array.from(charactersRating.children);
      charactersArray.forEach((input) => {
        if (input.value === charactersLocalStorageStars) {
          input.setAttribute('checked', true);
        }
      })

      const styleArray = Array.from(styleRating.children);
      styleArray.forEach((input) => {
        if (input.value === styleLocalStorageStars) {
          input.setAttribute('checked', true);
        }
      })

      const engagementArray = Array.from(engagementRating.children);
      engagementArray.forEach((input) => {
        if (input.value === engagementLocalStorageStars) {
          input.setAttribute('checked', true);
        }
      })

      changeOverallRating();
    }
  }

  getRatingFromLocalStorage();


  // loading img to html
  let files = [];
  let reader = new FileReader();

  if (bookCoverInput) {
    bookCoverInput.addEventListener('change', (e) => {
      files = e.target.files;
      console.log(files);
      reader.readAsDataURL(files[0]);
    });

    bookCover.onclick = function () {
      bookCoverInput.click();
    }
  }

  reader.addEventListener('load', () => {
    bookCover.src = reader.result;
    localStorage.setItem('bookCover', bookCover.src);
  });

  if (localStorage.getItem('bookCover') && bookCover) {
    bookCover.src = localStorage.getItem('bookCover');
  }

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

  // firebase autho

  if (sessionStorage.getItem('user-creds')) {
    if (logInBtntoHide && userTextToShowAfterAutho) {
      logInBtntoHide.style.display = 'none';
      const userInfoString = sessionStorage.getItem('user-creds');
      const userInfo = JSON.parse(userInfoString);
      const userEmail = userInfo.email;
      const userEmailToShow = userEmail.split('@');
      userTextToShowAfterAutho.textContent = `Hello, ${userEmailToShow[0]}`;
    }
  }

  //create a new user
  function createNewUser(e) {
    e.preventDefault();
    showLoader();

    createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
      .then((credentials) => {
        set(ref(db, 'UsersAuthList/' + credentials.user.uid), {
          phone: phoneInput.value
        });

        sendEmailVerification(auth.currentUser)
          .catch((error) => {
            console.error('Error occured:', error);
          });

        sessionStorage.setItem('user-creds', JSON.stringify(credentials.user));
        window.location.href = 'index.html';

      })
      .catch((error) => {
        alert(error.message);
      });
  }

  // sign in existing user
  function loginUser(e) {
    e.preventDefault();
    showLoader();

    signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
      .then((credentials) => {
        get(child(dbref, 'UsersAuthList/' + credentials.user.uid))
          .then((snapshot) => {
            if (snapshot.exists) {
              sessionStorage.setItem('user-info', JSON.stringify({
                phone: snapshot.val().phone
              }));
              sessionStorage.setItem('user-creds', JSON.stringify(credentials.user));

              window.location.href = 'index.html';


            }
          });
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  // toggle password visabillity
  function togglePasswordVisability() {
    if (passwordInput.getAttribute('type') == 'password') {
      passwordInput.removeAttribute('type');
      passwordInput.setAttribute('type', 'text');
      btnTextInner.textContent = 'Show';
      hideSvg.style.display = 'none';
      showSvg.style.display = 'block';
    } else if (passwordInput.getAttribute('type') == 'text') {
      passwordInput.removeAttribute('type');
      passwordInput.setAttribute('type', 'password');
      btnTextInner.textContent = 'Hide';
      hideSvg.style.display = 'block';
      showSvg.style.display = 'none';
    }
  }

  //loader
  function showLoader() {
    signUpBtn.setAttribute('disabled', true);
    loader.style.display = 'flex';
  }

  // event listeners
  try {
    settingRating.addEventListener('change', changeOverallRating);
  } catch (error) {
    console.log(error);
  }

  try {
    plotRating.addEventListener('change', changeOverallRating);
  } catch (error) {
    console.log(error);
  }

  try {
    charactersRating.addEventListener('change', changeOverallRating);
  } catch (error) {
    console.log(error);
  }

  try {
    styleRating.addEventListener('change', changeOverallRating);
  } catch (error) {
    console.log(error);
  }

  try {
    engagementRating.addEventListener('change', changeOverallRating);
  } catch (error) {
    console.log(error);
  }

  // autho
  try {
    hidePasswordBtn.addEventListener('click', togglePasswordVisability);
  } catch (error) {
    console.log(error);
  }

  try {
    formLogIn.addEventListener('submit', loginUser);
  } catch (error) {
    console.log(error);
  }

  try {
    formSignUp.addEventListener('submit', createNewUser);
  } catch (error) {
    console.log(error);
  }


  //save all data
  try {
    saveBtn.addEventListener('click', () => {
      saveAllDataAndSendToFirebase(savedStart, savedFinish);
    });
  } catch (error) {
    console.log(error);
  }

});