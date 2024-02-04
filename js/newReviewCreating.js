

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


window.addEventListener('onload', () => {
  checkIfReviewExsist();
});