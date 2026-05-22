const fs = require('fs');

/* Read trips JSON data */
const trips = JSON.parse(fs.readFileSync('./data/trips.json', 'utf8'));

/* GET travel page */
var travel = (req, res) => {
    res.render('travel', {
        title: 'Travel',
        trips
    });
};

module.exports = {
    travel
};