import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearResults = () => {
    elements.searchResultList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const highlightSelected = (id) => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });    
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
};

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = []; // adding to array is not mutating, so can be constant
    if (title.length > limit){
        
        /* *** OWN SOLUTION *** */
        /*
                const arr = title.split(' ');
        let tot = 0;
        let str = '';
        for (let i = 0; i < arr.length; i++){
            let el = arr[i]
            str += el + ' ';
            tot += el.length;
            if (tot >= limit - 3 + 1){
                console.log(str);
                return str + '...'
            }
        }
        */
        
        /* *** PROVIDED SOLUTION *** */
        title.split(' ').reduce((acc, cur) => {
            
            if (acc + cur.length <= limit) {
                newTitle.push(cur)
            } 
            return acc + cur.length; // add length of word to acc each iteration
        }, 0);
        return `${newTitle.join(' ')} ...`; // return limited title
    }
    return title; // if length does not exceed return original
}

const renderRecipe = recipe => {
    recipe.title = limitRecipeTitle(recipe.title);
    const markUp = `
     <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="Test">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${recipe.title}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>
    `;
    elements.searchResultList.insertAdjacentHTML('beforeend', markUp);
};

const creatButton = (page, type) => // type can be prev or next
    `            
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'next' ? page + 1 : page - 1}>
        <span>Page ${type === 'next' ? page + 1 : page - 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'next' ? 'right' : 'left'}"></use>
        </svg>
    </button>
    `

;


const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage); // ceil -> always rounds up
    
    let button;
    
    if (page === 1 && pages > 1) {
        // show only next page btn
        button = creatButton(page, 'next');
        
    } else if (page < pages) {
        // show next and previous page btn
        button = `
        ${creatButton(page, 'next')}
        ${creatButton(page, 'prev')}
        `;
        
    } else if (page === pages && pages > 1) {
        // show only previous page btn
        button = creatButton(page, 'prev');
        
    }
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10)=> { // array of 30 recipes
    // render results of current page
    const start = (page - 1) * resPerPage ;
    const end = start + resPerPage;
    
    
    recipes.slice(start, end).forEach(renderRecipe);
    
    // render pagination buttons
    renderButtons(page, recipes.length, resPerPage);

};













