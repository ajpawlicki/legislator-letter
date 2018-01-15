'use strict';

require('dotenv').config();

const prompt = require('readline-sync');
const axios = require('axios');
// const Lob = require('lob')('test_0dc8d51e0acffcb1880e0f19c79b2f5b0cc');

const firstName = prompt.question('What is your first name? ');
const lastName = prompt.question('What is your last name? ');
const addressLine1 = prompt.question('What is your address and street name? ');
const addressLine2 = prompt.question('What is your apt or suite number? ');
const city = prompt.question('Which city do you live in? ');
const state = prompt.question('Which state do you live in? ');
const country = prompt.question('Which country do you live in? ');
const zipCode = prompt.question('What is your zip code? ');
const message = prompt.question('What would you like to write to your legislator? ');

getLegislatorInfo(addressLine1, city, state, zipCode);

function getLegislatorInfo(addressLine1, city, state, zipCode) {
  const url = `https://www.googleapis.com/civicinfo/v2/representatives?key=${process.env.GOOGLE_API_KEY}`;
  const addressQuery = `&address=${encodeURIComponent(addressLine1)}%20${encodeURIComponent(city)}%20${encodeURIComponent(state)}%20${encodeURIComponent(zipCode)}`;
  const rolesQuery = `&roles=legislatorUpperBody`;
  
  axios.get(url + addressQuery + rolesQuery)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => console.error(err));
};
