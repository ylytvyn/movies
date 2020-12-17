'use strict';

const API_KEY = '29bb47b7552ec502eb87cebfbc77f766';
const API_URL = 'https://api.themoviedb.org/3';
const IMG_URL = '//image.tmdb.org/t/p/w185_and_h278_bestv2';
const NO_IMG = 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg';
const ACTION = {
    standard: 0,
    upcoming: 1,
    popular: 2,
    top: 3
};

(function($) {
    $(document).ready(() => {
        $('.search__btn').click(() => {
            getMoviesList();
        });

        $('.search__field').keypress((event) => {
            if (event.keyCode === 13) {
                event.preventDefault();

                getMoviesList();
            }
        });

        $('.reviews__close').click(() => {
            $('.window').addClass('hide');
            $('.review').remove();
        });

        $('.btn--upcoming').click(function() {
            $('.btn').removeClass('btn--active');
            $(this).addClass('btn--active');
            getFromRatings('upcoming', ACTION.upcoming);
        });

        $('.btn--popular').click(function() {
            $('.btn').removeClass('btn--active');
            $(this).addClass('btn--active');
            getFromRatings('popular', ACTION.popular);
        });

        $('.btn--top').click(function() {
            $('.btn').removeClass('btn--active');
            $(this).addClass('btn--active');
            getFromRatings('top_rated', ACTION.top);
        });

        function getMoviesList(page = 1) {
            let query = $('.search__field').val();

            if (query !== '') {
                $('body').addClass('loading');
                $('.movie').remove();
                $('.pagination').empty();
                $('.btn').removeClass('btn--active');

                $.ajax({
                    url: `${API_URL}/search/movie`,
                    type: 'GET',
                    data: {
                        api_key: API_KEY,
                        query: query,
                        page: page
                    },
                    error: (request) => {
                        showWarning(request.responseJSON.status_message);
                        $('body').removeClass('loading');
                    }
                }).then((res) => {
                    if (res.results.length === 0) {
                        showWarning('No movies found.');
                    } else {
                        if (res.total_pages > 1) {
                            drawPagination(res.total_pages, page, ACTION.standard);
                        }

                        res.results.forEach((movie) => {
                            $('.movies').append(drawMovie(movie));
                        });
                    }

                    $('body').removeClass('loading');
                });
            } else {
                showWarning('Fill the field first, my foreign friend!');
            }
            
        }

        function drawMovie(movie) {
            let img = movie.poster_path ? IMG_URL + movie.poster_path : NO_IMG,
                movieDOM = $(`<div class="movie">
                                <img src="${img}" />
                                <h2 class="movie__title">${movie.title}</h2>
                                <div class="movie__info">
                                    <h3><b>Rating: </b>${movie.vote_average}/10</h3>
                                    <p>${movie.overview}</p>
                                </div>
                             </div>`);

                movieDOM.click(() => {
                    getReviews(movie.id, movie.title);
                });

            return movieDOM;
        }

        function drawPagination(pages, current, fn) {
            for (let i = 1; i < pages + 1; i++) {
                let item = $(`<li class="pagination__item">${i}</li>`);

                if (current === i) {
                    item.addClass('pagination__item--active');
                }

                item.click(() => {
                    switch (fn) {
                        case ACTION.standard:
                            getMoviesList(i);
                            break;
                        case ACTION.upcoming:
                            getFromRatings('upcoming', ACTION.upcoming, i);
                            break;
                        case ACTION.popular:
                            getFromRatings('popular', ACTION.popular, i);
                            break;
                        case ACTION.top:
                            getFromRatings('top_rated', ACTION.top, i);
                            break;
                    }
                    
                });

                $('.pagination').append(item);
            }
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
                    showWarning('No reviews found.');
                }

                $('body').removeClass('loading');
            });
        }

        function getFromRatings(url, action, page = 1) {
            $('body').addClass('loading');
            $('.movie').remove();
            $('.pagination').empty();

            $.ajax({
                url: `${API_URL}/movie/${url}`,
                type: 'GET',
                data: {
                    api_key: API_KEY,
                    page: page,
                    region: 'US'
                }
            }).then((res) => {
                if (res.results.length !== 0) {
                    if (res.total_pages > 1) {
                        drawPagination(res.total_pages, page, action);
                    }

                    res.results.forEach((movie) => {
                        $('.movies').append(drawMovie(movie));
                    });

                } else {
                    showWarning('No movies found.');
                }

                $('body').removeClass('loading');
            });
        }

        function showWarning(msg) {
            $('<div />').addClass('dialog-overlay')
                        .appendTo('body');
            
            $('<div />').addClass('dialog')
                        .html(`<p>${msg}</p>`)
                        .appendTo('body');
    
            setTimeout(() => {
                $('.dialog-overlay, .dialog').remove();
            }, 2000);
        }

    });
})(jQuery);

