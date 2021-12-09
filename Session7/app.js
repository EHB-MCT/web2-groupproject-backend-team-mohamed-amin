const express = require('express');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const {MongoClient} = require('mongodb');
const config = require('./config.json');

//Mongo client
const client = new MongoClient(config.finalUrl);

const app = express();
const port = process.env.PORT || 3000;

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
app.post('/challenges', async (req,res) => {
  if(!req.body.name || !req.body.course || !req.body.points || !req.body.session){
    res.status(400).send({
      error: 'something went wrong',
    })
    return;
  }
  try{
    //connect db
    await client.connect();
    //retrieve data from collection
    const colli = client.db('Gamification').collection('Challenge');

    //Check for double
    const chlng = await colli.findOne({name: req.body.name});
    if(chlng){
      res.status(400).send('Bad request: challenge already exists with name '+ req.body.name);
      return;
    }

    //create new object
    let newChallenge = {
      name: req.body.name,
      points: req.body.points,
      course: req.body.course,
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

//Delete (works)
app.delete('/challenges', async (req,res) => {
  try {

    await client.connect();

    const colli = client.db('Gamification').collection('Challenge');

    await colli.deleteOne({
      name:req.body.name
    })

    console.log("deleted")
  }finally{
    await client.close()
  }
});

app.put('/challenges', async (req,res) => {
  try {
    await client.connect();

    const colli = client.db('Gamification').collection('Challenge');

  //Check if already exists
  /** 
    const chlng = await colli.findOne({name: req.body.name});
      if(chlng.name == req.body.name && chlng.course == req.body.course && chlng.points == req.body.points && chlng.session == req.body.session){
        res.status(400).send('Bad request: no value to update, please enter a different value');
        return;
        }
    */

    const chlng2 = await colli.findOne({name: req.body.name});

    await colli.updateOne({
      name: req.body.name,
      course: req.body.course,
      points: req.body.points,
      session: req.body.session
    })

    console.log("updated")

  }finally{
    await client.close();
  }
});

/** get specific by id
app.get('/challenges', (req, res) => {
  console.log(req.query.id);
  res.send('everything ok');
});
*/


//APP LISTEN VERIFICATION
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
