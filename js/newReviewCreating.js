

const newURL = sessionStorage.getItem('newURL');
const title = sessionStorage.getItem('title');
const author = sessionStorage.getItem('author');

const bookReviewLinks = document.querySelectorAll('.list-of-books__link-to-review');
let foundReview = 'false';


function checkIfReviewExsist() {
  bookReviewLinks.forEach((review) => {
    let attr = review.getAttribute('href');
    if (attr && attr !== '#' && attr !== '' && attr !== 'null') {
      foundReview = 'true';
    }
  })

  if (foundReview === 'false') {
    const message = document.querySelector('.list-of-books__message');
    message.textContent = 'You do not have any reviews';
  }
}



function createNewReview() {
  if (newURL && title && author) {
    const listOfReviews = document.querySelector('.list-of-books__list');
    let newReviewInner = `<li class="list-of-books__item">
    <div class="list-of-books__img-container">
    <a class="list-of-books__link-to-review" href="${newURL}">
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
}

createNewReview();

window.addEventListener('onload', () => {
  checkIfReviewExsist();
});