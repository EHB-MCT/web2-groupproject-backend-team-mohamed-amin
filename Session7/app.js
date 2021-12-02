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
app.get('/getChallenges', async (req,res) => {

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

app.post('/postChallenges', async (req,res) => {

  if(!req.body.id || !req.body.name || !req.body.course || !req.body.points || !req.body.session){
    res.status(400).send('bad request, missing id, name, course, points or session. ')
    return;
  }

  try{
    const colli = client.db('Gamification').collection('Challenge');
    const challenges = await colli.find({}).toArray();
    }catch(error){
      console.log(error);
      res.status(500).send('An error has occured!');
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