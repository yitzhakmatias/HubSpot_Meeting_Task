const Domain = require('./Domain');
const mongoose = require('mongoose');
const disallowedValues = [
  '[not provided]',
  'placeholder',
  '[[unknown]]',
  'not set',
  'not provided',
  'unknown',
  'undefined',
  'n/a'
];

const filterNullValuesFromObject = object =>
  Object
    .fromEntries(
      Object
        .entries(object)
        .filter(([_, v]) =>
          v !== null &&
          v !== '' &&
          typeof v !== 'undefined' &&
          (typeof v !== 'string' || !disallowedValues.includes(v.toLowerCase()) || !v.toLowerCase().includes('!$record'))));

const normalizePropertyName = key => key.toLowerCase().replace(/__c$/, '').replace(/^_+|_+$/g, '').replace(/_+/g, '_');

const goal = async (actions) => {
  try {
    // Assume the domain to which actions belong is identified via an API key
    const domain = await Domain.findOne({ apiKey: process.env.API_KEY });

    if (!domain) {
      console.error('Domain not found for the provided API key.');
      return;
    }

    // Append actions to the hubspot accounts in the Domain schema
    const hubspotAccount = domain.integrations.hubspot.accounts[0]; // Assuming one account for simplicity
    if (!hubspotAccount.actions) {
      hubspotAccount.actions = [];
    }

    hubspotAccount.actions.push(...actions);

    // Save the domain with updated actions
    await domain.save();
    console.log(`${actions.length} actions successfully written to the database.`);
  } catch (error) {
    console.error('Failed to write actions to the database:', error);
  }
  // this is where the data will be written to the database
  console.log(actions);
};

module.exports = {
  filterNullValuesFromObject,
  normalizePropertyName,
  goal
};
