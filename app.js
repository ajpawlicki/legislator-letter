'use strict';

require('dotenv').config();

const Lob = require('lob')(process.env.LOB_API_TEST_KEY);
const prompt = require('readline-sync');
const axios = require('axios');
const opn = require('opn');

console.log('Hello, this is a program to send a letter to your state legislator.');
console.log('Please input the answers to the following questions:');

const firstName = prompt.question('What is your first name? ');
const lastName = prompt.question('What is your last name? ');
const addressLine1 = prompt.question('What is your address and street name? ');
const addressLine2 = prompt.question('What is your apt or suite number? Leave blank if n/a. ');
const city = prompt.question('Which city do you live in? ');
const state = prompt.question('Which state do you live in? ');
const country = prompt.question('Which country do you live in? Use ISO country code (two character abbreviation, e.g. "US" for the United States). ');
const zipCode = prompt.question('What is your zip code? ');
const message = prompt.question('What would you like to write to your legislator? Limit to 500 characters. ');

const senderInfo = {
  name: firstName + ' ' + lastName,
  address_line1: addressLine1,
  address_line2: addressLine2,
  address_city: city,
  address_state: state,
  address_zip: zipCode,
  address_country: country,
};

fetchLegislatorData(senderInfo, message);

function fetchLegislatorData(senderInfo, message) {
  const { address_line1, address_city, address_state, address_zip } = senderInfo;

  const url = `https://www.googleapis.com/civicinfo/v2/representatives?key=${process.env.GOOGLE_API_KEY}`;
  const addressQuery = `&address=${encodeURIComponent(address_line1)}%20${encodeURIComponent(address_city)}%20${encodeURIComponent(address_state)}%20${encodeURIComponent(address_zip)}`;
  const rolesQuery = `&roles=legislatorUpperBody`;
  
  axios.get(url + addressQuery + rolesQuery)
  .then(res => {
    const recipientInfo = getRecipientInfo(res.data.officials[0], senderInfo);

    createLetter(senderInfo, recipientInfo, message);
  })
  .catch(err => {
    console.error(err.message);

    console.log('There was an error querying the Google API for your legislator info.');
    console.log('Please try again.');
  });
};

function getRecipientInfo(legislatorData, senderInfo) {
  let { name, address } = legislatorData;

  [ address ] = address;
  const { line1, city, state, zip } = address;

  return {
    name: name,
    address_line1: line1,
    address_city: city,
    address_state: state,
    address_zip: zip,
    address_country: senderInfo.address_country,
  };
};

function createLetter(senderInfo, recipientInfo, message) {
  Lob.letters.create({
    description: 'Legislator Letter',
    to: recipientInfo,
    from: senderInfo,
    file: '<html style="padding-top: 3in; margin: .5in;">{{message}}</html>',
    merge_variables: {
      message: message
    },
    color: true
  }, (err, res) => {
    if (err) {
      console.error(err.message);

      console.log('There was an error querying the Lob API to create your letter.');
      console.log('Please try again.');
    }
    
    if (res && res.url) {
      console.log('Here is the url to your letter: ', res.url);
      console.log('It will open in your browser shortly.');

      setTimeout(() => {
        opn(res.url);
        
        console.log('Please close program by pressing ctrl key + "C" key.');
      }, 2000);
    }
  });
};
