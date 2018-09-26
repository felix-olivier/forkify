import axios from 'axios';
import { apiKey, proxy } from '../config';


export default class Search {
    constructor(query) {
        this.query = query;
    }
    
    async getResults() {

        try {
            const res = await axios(`${proxy}http://food2fork.com/api/search?key=${apiKey}&q=${this.query}`)// returns JSON automatically
            this.result = res.data.recipes
//            console.log(this.result);        
        } catch(error) {
            alert(error)
        }
    }
}









