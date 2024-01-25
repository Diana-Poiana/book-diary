window.addEventListener('DOMContentLoaded', () => {
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

    result = Math.round(overallStars * 2) / 2;
    const overallInputs = Array.from(overallRating.children);
    overallInputs.forEach((elem) => {
      if (+elem.value === result) {
        elem.checked = true;
      }
    });
  }

  function loadBookCover() {
    let userCover = bookCoverInput.files[0];
    bookCover.src = URL.createObjectURL(userCover);
    localStorage.setItem('bookCover', bookCover.src);
  }

  // bookCover.src = localStorage.getItem('bookCover');

  // event listeners
  settingRating.addEventListener('change', changeOverallRating);
  plotRating.addEventListener('change', changeOverallRating);
  charactersRating.addEventListener('change', changeOverallRating);
  styleRating.addEventListener('change', changeOverallRating);
  engagementRating.addEventListener('change', changeOverallRating);

  bookCoverInput.addEventListener('change', loadBookCover);
  bookCover.addEventListener('click', () => {
    bookCoverInput.click();
  });
});