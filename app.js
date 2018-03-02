const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const app = express();

//Load Route
const ideas = require('./routes/ideas');
const users = require('./routes/users');

//Load Pasport Config files
require('./config/passport')(passport);
//Map global promise to get rid of mongoose warning
mongoose.Promise = global.Promise;

//Connect to the database
mongoose
  .connect('mongodb://localhost/vidjot-dev', {
    useMongoClient: true
  })
  .then(() => console.log('MondoDB connected...'))
  .catch(err => console.log(err));

//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Staic folder
app.use(express.static(path.join(__dirname, 'public')));
//Handlebars Middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//mthod-ovveride Middleware
app.use(methodOverride('_method'));

//express-session middleware
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect-flash middleware
app.use(flash());

//Global Variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});
//Load Idea model
require('./models/Idea');
const Idea = mongoose.model('ideas');

//  Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

//About Route
app.get('/about', (req, res) => {
  res.render('about');
});

//Route Hnadlers middleware
app.use('/ideas', ideas);
app.use('/users', users);

const port = 4000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
