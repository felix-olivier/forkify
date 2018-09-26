import axios from 'axios';
import { apiKey, proxy } from '../config';


export default class Recipe {
    constructor(id) {
        this.id = id;
    }
    
    async getRecipe() {


        try {
            const res = await axios(`${proxy}http://food2fork.com/api/get?key=${apiKey}&rId=${this.id}`)// returns JSON automatically
            this.result = res.data; // select the relevant data here

//            this.f2f_url = res.data.recipe.f2f_url;
//            this.publisher_url = res.data.recipe.publisher_url;
//            this.recipe_id = res.data.recipe.recipe_id;
//            this.social_rank = res.data.recipe.social_rank;
            
            
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
     
        } catch(error) {
            alert('Something went wrong while receiving the recipe.', error);
        }
    }
    
    
    calcTime() {
        // for every 3 ingredients -> 15 minutes
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng/3) // (numIng % 3) * 5;
        this.time = periods * 15;
    }
    
    calcServings() {
        this.servings = 4;
    }
    
    parseIngredients() {
        
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pound'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        
        const newIngredients = this.ingredients.map(el => {
            
            // 1) Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i])
            });
            
            // 2) Remove parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
            
            
            // 3) Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex =  arrIng.findIndex(el2 => units.includes(el2));
            
            let objIng;
            if (unitIndex > -1){
                // There is a unit
                const arrCount = arrIng.slice(0, unitIndex);
                
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }
                
                
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                    
                };
            } else if (parseInt(arrIng[0], 10)) {
                // No unit, but first element is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ') // slice -> removes only first element
                };
            } else if (unitIndex === -1){
               // There is no unit and (no number in first position)
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient // automatically assigns value of ingredient to key ingredient
                };
            }
            
            
            
            
            
            return objIng;
        });
        this.ingredients = newIngredients;
    }
    
    updateServings(type) { // type is increase or decrease
        
        // Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
        
        
        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });
            
        
        this.servings = newServings
    }
}









