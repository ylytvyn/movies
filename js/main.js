'use strict';

const API_KEY = '29bb47b7552ec502eb87cebfbc77f766';
const API_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

(function($){
	$(document).ready(function() {
		// Events
		$('.search__btn').click(() => {
			getMovie();
		});

		$('.search__field').keypress((e) => {
			e.stopPropagation();

			if (e.keyCode === 13) {
				getMovie();
			}
		});

		$('.reviews__close').click(() => {
			$('.window').addClass('hide');
			$('.review').remove();
		});


		// Functions
		function getMovie() {
			let query = $('.search__field').val();

			if (query !== '') {
				$('body').addClass('loading');
				$('.movie').remove();
				
				$.ajax({
					url: `${API_URL}/search/movie`,
					type: 'GET',
					data: {
						api_key: API_KEY,
						query: query
					}
				}).then((res) => {
					if (res.results.length === 0) {
						alert('No movies found with your search');
					} else {
						res.results.forEach((movie) => {
							if (movie.poster_path !== null) {
								$('.movies').append(drawMovie(movie));
							}
						});
					}

					$('body').removeClass('loading');
				});

			} else {
				alert('Please, fill the search field');
			}
		}

		function drawMovie(movie) {
			let movieDOM = `<div class="movie" data-id="${movie.id}">
								<img src="${IMG_URL + movie.poster_path}">
								<h2 class="movie__title">${movie.title}</h2>
								<div class="movie__info">
									<h3><b>Release date: </b>${movie.release_date}</h3>
									<h3><b>Rating: </b>${movie.vote_average}/10</h3>
									<p>${movie.overview}</p>
								</div>
						   </div>`;

			$('.movie').click(function(e) {
				e.stopImmediatePropagation();
				getReviews($(this).data('id'), $(this).find('.movie__title').text());
			});

			return movieDOM;
		}

		function getReviews(id, title) {
			$('body').addClass('loading');

			$.ajax({
				url: `${API_URL}/movie/${id}/reviews`,
				type: 'GET',
				data: {
					api_key: API_KEY
				}
			}).then((res) => {
				if (res.results.length !== 0) {
					res.results.forEach((review) => {
						let reviewDOM = `<div class="review">
											<h2>${review.author}</h2>
											<p>${review.content}</p>
										</div>`;
	
						$('.reviews').append(reviewDOM);
					});

					$('.reviews__title').text(title);
					$('.window').removeClass('hide');
					
				} else {
					alert('No reviews found.');
				}

				$('body').removeClass('loading');
			});
		}

	});
})(jQuery);
