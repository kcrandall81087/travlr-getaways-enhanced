/* GET travel page */
const travel = async (req, res) => {
    const URL = 'http://localhost:3000/api/trips';

    try {
        const response = await fetch(URL);
        const trips = await response.json();

        let message = null;

        if (!(trips instanceof Array)) {
            message = 'API lookup error';
        } else if (!trips.length) {
            message = 'No trips exist in our database';
        }

        res.render('travel', {
            title: 'Travel',
            trips,
            message
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    travel
};