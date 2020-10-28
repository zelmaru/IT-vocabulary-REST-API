const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/wikiDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const articleSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Article = mongoose.model(
  "Article",
  articleSchema
);


 //////////////////////////////////// Requests targetting al articles //////////////////////////////////
app.route('/articles')

// fetch all articles
.get((req, res) => {
  Article.find((err, foundArticles) => {
    if (!err) {
      res.send(foundArticles);
    } else {
      res.send(err);
    }
  })
})

// add a new article
.post((req, res) => {

  const article = new Article({
    title: req.body.title,
    content: req.body.content
  });

  article.save((err) => {
    if (!err) {
      res.send("Succesfully added a new article.")
    } else {
      res.send(err);
    }
  });
})

// delete all articles
.delete((req, res) => {
  Article.deleteMany((err) => {
    if (!err) {
      res.send("Deleted all articles.")
    } else {
      res.send(err);
    }
  });
});


//////////////////////////////////// Requests targetting a specific article //////////////////////////////////


app.route("/articles/:articleTitle")

// fetch a particular article
.get((req, res) => {
  const articleTitle = req.params.articleTitle;
  Article.findOne({title: articleTitle}, (err, foundArticle) => {
    if(foundArticle) {
      res.send(foundArticle);
    } else {
      res.send("No article matching that title was found.");
    }
  })
})

// rewrite an article
.put((req, res) => {
  Article.update(
    {title: req.params.articleTitle},
    {title: req.body.title,
    content: req.body.content},{
      overwrite: true // mongo prevents total overwrite, the property is set to false by default
    },
    (err) => {
      if (!err) {
        res.send("Successfully overwrote article");
      } else {
        res.send(err);
      }
    }
  )
})

// update a specific field but do not overwrite completely
.patch((req, res) => {
  Article.update(
    {title: req.params.articleTitle},
    {$set: req.body}, // req.body returns an object of what was actually updated
    (err) => {
      if (!err) {
        res.send("Successfully updated article.")
      } else {
        res.send(err);
      }
    })
})

// delete a specific article
.delete((req, res) => {
  Article.deleteOne(
    {title: req.params.articleTitle},
     (err) => {
      if (!err) {
        res.send("Successfully deleted article.")
      } else {
        res.send(err);
      }
    })
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}.`)
});
