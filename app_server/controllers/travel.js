/* GET travel page */
var travel = (req, res) => {
    res.render('travel', { title: 'Travel' });
};

module.exports = {
    travel
};