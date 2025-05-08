const API_BASE = 'https://api.tvmaze.com';

const searchInput = document.getElementById('movie-search');
const resultsList = document.getElementById('search-results');
const detailPanel = document.getElementById('movie-detail');
const titleEl = document.getElementById('movie-title');
const posterEl = document.getElementById('movie-poster');
const commentArea = document.getElementById('review-comment');
const submitButton = document.getElementById('submit-review');
let selectedShowId = null;

// 1) Ricerca show mentre digiti
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (query.length < 3) {
    resultsList.innerHTML = '';
    return;
  }
  searchShows(query);
});

// 2) Chiamata a /search/shows?q=
async function searchShows(query) {
  try {
    const response = await fetch(`${API_BASE}/search/shows?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Errore nella ricerca');
    const data = await response.json();
    displayResults(data);
  } catch (error) {
    console.error('Errore durante la ricerca:', error);
    resultsList.innerHTML = '<li>Errore durante la ricerca. Riprova più tardi.</li>';
  }
}

// 3) Popolo la lista dei risultati
function displayResults(items) {
  resultsList.innerHTML = '';
  if (!items.length) {
    resultsList.innerHTML = '<li>Nessun risultato trovato</li>';
    return;
  }
  items.forEach(item => {
    const show = item.show;
    const li = document.createElement('li');
    li.textContent = `${show.name} (${show.premiered?.slice(0, 4) || '—'})`;
    li.addEventListener('click', () => loadShowDetail(show.id));
    resultsList.appendChild(li);
  });
}

// 4) Carico i dettagli con /shows/:id
async function loadShowDetail(id) {
  try {
    const response = await fetch(`${API_BASE}/shows/${id}`);
    if (!response.ok) throw new Error('Errore nel caricamento dei dettagli');
    const show = await response.json();
    selectedShowId = id;
    showDetail(show);
  } catch (error) {
    console.error('Errore nel caricamento dei dettagli:', error);
    alert('Errore nel caricamento dei dettagli dello show. Riprova più tardi.');
  }
}

// 5) Mostro il pannello dettaglio
function showDetail(show) {
  titleEl.textContent = `${show.name} (${show.premiered?.slice(0, 4) || ''})`;
  if (show.image && show.image.medium) {
    posterEl.src = show.image.medium;
    posterEl.alt = show.name;
  } else {
    posterEl.src = 'placeholder.jpg';
    posterEl.alt = 'No image';
  }
  detailPanel.style.display = 'block';
  // Reset del form
  document.querySelectorAll('input[name="rating"]').forEach(input => (input.checked = false));
  commentArea.value = '';
}

// 6) Invia recensione
submitButton.addEventListener('click', () => {
  const ratingInput = document.querySelector('input[name="rating"]:checked');
  const comment = commentArea.value.trim();

  if (!ratingInput) {
    alert('Seleziona un numero di stelle!');
    return;
  }
  if (comment.length < 5) {
    alert('Scrivi almeno 5 caratteri nel commento.');
    return;
  }

  const payload = {
    showId: selectedShowId,
    rating: ratingInput.value,
    comment
  };

  console.log('Recensione inviata:', payload);
  alert('Recensione inviata con successo!');

  // Reset del form dopo l'invio
  document.querySelectorAll('input[name="rating"]').forEach(input => (input.checked = false));
  commentArea.value = '';
});
