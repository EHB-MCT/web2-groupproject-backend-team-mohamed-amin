const express = require('express');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const {MongoClient} = require('mongodb');
const config = require('./config.json');

//Mongo client
const client = new MongoClient(config.finalUrl);

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());


//ROUTES
//landing page
app.get('/', (req, res) => {
  res.status(300).redirect('/info.html');
});

//GET all challenges from db (works)
app.get('/challenges', async (req,res) => {

  try {
    //connect to db
    await client.connect();

    const colli = client.db('Gamification').collection('Challenge');
    const challenges = await colli.find({}).toArray();

    //send back file
    res.status(200).send(challenges);
  } catch(error){
    console.log(error);
    res.status(500).send({
      error: 'something went wrong',
      value: error
    });
  }finally{
    await client.close();
  }
});

//POST challenge to db (works)
app.post('/postChallenges', async (req,res) => {

  if(!req.body.id || !req.body.name || !req.body.course || !req.body.points || !req.body.session){
    res.status(400).send({
      error: 'something went wrong',
      value: error
    })
    return;
  }

  try{
    //connect db
    await client.connect();
    //retrieve data from collection
    const colli = client.db('Gamification').collection('Challenge');

    //create new object
    let newChallenge = {
      id: req.body.id,
      name: req.body.name,
      course: req.body.course,
      points: req.body.points,
      session: req.body.session
    }

    //insert
    let insertResult = await colli.insertOne(newChallenge);

    //send error or succes msg
    res.status(201).send('challenge succesfully saved')
    }catch(error){
      console.log(error);
      res.status(500).send({
        error: 'something went wrong',
        value: error
      });
      //close client
  }finally{
    await client.close()
  }
});



/** FOR ID
app.get('/challenge', (req, res) => {
  console.log(req.query.id);
  res.send('everything ok');
});
*/

//APP LISTEN VERIFICATION
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})