import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/* **Global state of the app**
* - Search object
* - Current recipe object
* - Shopping list object
* - Liked recipes 
*/
const state = {};
/*window.state = state; // TEST ONLY: leaks data */




/**
* SEARCH CONTROLLER
**/

const controlSearch = async () => {
    
        // 1) Get query from view
    const query = searchView.getInput();
    
    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);
        
        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        
        try {
            // 4) Search for recipes
            await state.search.getResults(); // returns promise

            // 5) Render results on UI
            clearLoader(elements.searchRes);
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something went wrong with the search...');
            clearLoader(elements.searchRes);
        }
        
        
    }
}


elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});




elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline'); // finds the closest element with `btn-inline` class
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});









/**
* RECIPE CONTROLLER
**/
const controllRecipe = async () => {
    // Get ID from URL
    const id = window.location.hash.replace('#','');
    
    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        
        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id)
        
        // Create new recipe object
        state.recipe = new Recipe(id);
        

        try {
            // Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render the recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
            
        } catch(err) {
            console.log(err)
            alert('Error processing recipe!');
        }        
    }
};
['hashchange', 'load'].forEach(event => window.addEventListener(event, controllRecipe));


/**
* LIST CONTROLLER
**/
const controlList = () => {
    
    // Create list if not existing yet
    if (!state.list) state.list = new List();
    
    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });    
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    
    // Hanlde the delete button
    if (e.target.matches('shopping__delete, .shopping__delete *')) {
        
        // Delete from state
        state.list.deleteItem(id);        
        
        // Delete from UI        
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


/** 
* LIKES CONTROLLER
**/


// END TESTING
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    
    // User has NOT yet liked the current recipe
    if (!state.likes.isLiked(currentID)) {
        
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        
        // Toggle like button
        likesView.toggleLikeBtn(true);
        
        
        // Add like to UI list
        likesView.renderLikes(newLike);

        
    // User HAS liked the current recipe    
    } else {
        
        // Remove like from the state
        state.likes.deleteLike(currentID);
        
        
        // Toggle like button
        likesView.toggleLikeBtn(false);
        
        
        // Remove like from UI list
        likesView.deleteLike(currentID);
        
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}


/**
* EVENT LISTENERS
**/

// Restore likes when page is reloaded
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();
    
    // Toggle the like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    
    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLikes(like));
})





// Handeling recipe button clicks: // Update servings     // Like    // Shop
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        // Decrease button was clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        // Increase button was clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        // Add to List
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Add to Likes
        controlLike();
        
    }
    
});
    
















