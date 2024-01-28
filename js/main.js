import { db, ref, dbref, set, get, auth, child, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from './firebaseConfiguration.js';

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

  // const startDateEntered = document.querySelector('.book-description__start-date');
  // const finishDateEntered = document.querySelector('.book-description__finish-date');

  // local storage

  let userData = {
    input1: '',
    input2: '',
    input3: '',
    input4: '',
    input5: '',
    input6: '',
    input7: '',
    input8: '',
    input9: ''
  };

  const allUserInputs = document.querySelectorAll('.item__user-input');
  const saveBtn = document.querySelector('.review__save-btn');
  // const userData = JSON.parse(localStorage.getItem('userData'));

  // local storage collecting data

  function collectUserData() {
    allUserInputs.forEach(input => {
      let dataAttribute = input.getAttribute('name');

      input.addEventListener('input', function () {
        userData[dataAttribute] = input.innerText;
        localStorage.setItem(dataAttribute, JSON.stringify(userData[dataAttribute]));
      })
    });
  }

  collectUserData();


  function applyUserData() {
    const storedUserData = {};
    allUserInputs.forEach((input) => {
      let dataAttribute = input.getAttribute('name');

      const storedData = JSON.parse(localStorage.getItem(dataAttribute));

      if (storedData === '' || storedData === 'null') {
        input.innerText = '...';
        input.innerText = storedData;
        storedUserData[dataAttribute] = storedData;

      } else {
        input.innerText = storedData;
        storedUserData[dataAttribute] = storedData;
      }
    })
    return storedUserData;
  }

  applyUserData();


  // function updateLocalStorage() {
  //   localStorage.setItem('userData', JSON.stringify(userData));
  //   console.log('LocalStorage updated:', userData);
  // }



  // send all data to firebase
  function saveAllDataAndSendToFirebase() {
    const userInfoString = sessionStorage.getItem('user-creds');
    const userInfo = JSON.parse(userInfoString);

    if (userInfo && userInfo.uid) {
      const userID = userInfo.uid;
      const userDataForFirebase = applyUserData();
      // Ensure that userData is defined and contains the necessary data
      if (userDataForFirebase) {
        // Assuming userData is an object with properties you want to save
        set(ref(db, 'users/' + userID), userDataForFirebase)
          .then(() => {
            console.log('Данные успешно отправлены в Firebase!');
          })
          .catch((error) => {
            console.error('Ошибка при отправке данных в Firebase:', error);
          });
      } else {
        console.error('Ошибка: userData не определен.');
      }
    } else {
      console.error('Ошибка: Невозможно получить информацию о пользователе из sessionStorage.');
    }
  }


  // calendar
  // const startDate = datepicker('.book-description__start-date', {
  //   minDate: new Date(minDate),
  //   formatter: (input, date) => {
  //     const formattedDate = date.toLocaleDateString();
  //     input.value = formattedDate;
  //     const startDateSaved = input.value;
  //     localStorage.setItem('start-date', JSON.stringify(startDateSaved));
  //   }
  // });

  // const finishDate = datepicker('.book-description__finish-date', {
  //   maxDate: new Date(maxDate), formatter: (input, date) => {
  //     const formattedDate = date.toLocaleDateString();
  //     input.value = formattedDate;
  //     const finishDateSaved = input.value;
  //     localStorage.setItem('finish-date', JSON.stringify(finishDateSaved));
  //   }
  // });


  // startDateEntered.value = JSON.parse(localStorage.getItem('start-date'));
  // finishDateEntered.value = JSON.parse(localStorage.getItem('finish-date'));

  // rating stars
  function getRating(inputs, startsVariable) {
    const inputArray = Array.from(inputs.children);
    inputArray.forEach((elem) => {
      if (elem.hasAttribute('type', 'radio') && elem.checked) {
        startsVariable = +elem.value;
      }
    });
    return startsVariable;
  }


  function changeOverallRating() {
    settingStars = getRating(settingRating, settingStars);
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

  // book cover upload
  function loadBookCover() {
    let userCover = bookCoverInput.files[0];
    bookCover.src = URL.createObjectURL(userCover);
    localStorage.setItem('bookCover', bookCover.src);
  }

  // bookCover.src = localStorage.getItem('bookCover');



  // firebase


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

  try {
    bookCoverInput.addEventListener('change', loadBookCover);
  } catch (error) {
    console.log(error);
  }

  try {
    bookCoverInput.addEventListener('change', loadBookCover);
    bookCover.addEventListener('click', () => {
      bookCoverInput.click();
    });
  } catch (error) {
    console.log(error);
  }





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



  try {
    saveBtn.addEventListener('click', () => {
      saveAllDataAndSendToFirebase();
    });
  } catch (error) {
    console.log(error);
  }

});