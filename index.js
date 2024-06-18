const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();

const cors = require('cors');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ldjypij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // collections
    const CategoryCardCollection = client.db('FarmaBazar').collection('category')
    const MedicineCollection = client.db('FarmaBazar').collection('allMedicine')
    const SelectedMedicine = client.db('FarmaBazar').collection('ordered')
    const userCollection = client.db('FarmaBazar').collection('users')
    const advertisementCollection = client.db('FarmaBazar').collection('Advertise')
    const sliderCollection = client.db('FarmaBazar').collection('slider')

 // /////////////////    JWT Api        ///////////////////////////////////

    app.post('/jwt', async (req, res) => {
      const user = req.body;

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
      console.log(token, user)
    })

    // middlewares 
                const verifyToken = (req, res, next) => {
                  console.log('inside verify token', req.headers.authorization);
                 if (!req.headers.authorization) {
                   return res.status(401).send({ message: 'unauthorized access' });
                     }
                      const token = req.headers.authorization.split(' ')[1];
                         jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                     if (err) {
                       return res.status(401).send({ message: 'unauthorized access' })
                      }
                    req.decoded = decoded;
                            next();
                    })

               
                                }



    /////////USER RELETED API

    //updated user role 
    app.patch('/users/user/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'user'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    //updated seller role 
    app.patch('/users/seller/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'seller'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    //updated Admin role
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })





    // post user info

    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user)
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    //get 
    app.get('/users', verifyToken, async (req, res) => {
      const result = await userCollection.find().toArray()

      res.send(result)
    })


    ////CATEGORY ////  

    // add
    app.post('/category', async (req, res) => {
      const cartItem = req.body;
      const result = await CategoryCardCollection.insertOne(cartItem);
      res.send(result);
    });

    //get 
    app.get('/category', async (req, res) => {
      const result = await CategoryCardCollection.find().toArray()

      res.send(result)
    })

    // Delete
    app.delete('/category/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await CategoryCardCollection.deleteOne(query);
      res.send(result);
    })
    // Updated Oparetion

    app.put("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateSpot = {
        $set: {
          name: req.body.name,
          image: req.body.image,
          itemCount: req.body.itemCount
        },
      };
      const result = await CategoryCardCollection.updateOne(
        query,
        updateSpot,
        options
      );
      res.send(result);
      console.log(id, query, result);
    });




    ////   ALL MEDICINE     ////  

    //get   

    app.get('/allmedi', async (req, res) => {
      const result = await MedicineCollection.find().toArray()
      res.send(result)
    })

    //// Added selected data in dataBASE
    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await SelectedMedicine.insertOne(cartItem);
      res.send(result);
    });

    // Get all Selected MEDICINE data from db
    app.get('/carts', async (req, res) => {
      const email = req.query.email;

      console.log(email, "vejalllllllllllllllllllllllllllllllllllllllllllllllllllll")
      const query = { email: email };
      const result = await SelectedMedicine.find(query).toArray();
      res.send(result);
    });
    // delete SELECTED dataaaaaa
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await SelectedMedicine.deleteOne(query);
      res.send(result);
    })


    // ADVIRSMENT 
        app.post('/advert', verifyToken, async (req, res) => {
          const info = req.body;
          const result = await advertisementCollection.insertOne(info);
          res.send(result);
      })

      app.get('/advert', verifyToken, async (req, res) => {
          const result = await advertisementCollection.find().toArray();
          res.send(result)
      })

      app.patch('/advert/:id', verifyToken, async (req, res) => {
          const id = req.params.id;
          const data = req.body;
          const query = { _id: new ObjectId(id) };
          const updateDoc = {
              $set: {
                  status: data.status
              }
          };
          const result = await advertisementCollection.updateOne(query, updateDoc);
          res.send(result);
      })

      app.get('/advertisement', verifyToken, async (req, res) => {
          const email = req.query.email;
          console.log(email);
          const filter = { sellerEmail: email };
          const result = await advertisementCollection.find(filter).toArray();
          res.send(result);
      })



   // slider related api
      
      
        app.get('/slider', async (req, res) => {
          const result = await sliderCollection.find().toArray();
          res.send(result);
      })

      app.post('/slider', verifyToken, async (req, res) => {
          const data = req.body;
          const result = await sliderCollection.insertOne(data);
          res.send(result);
      })
      app.delete('/sliders/:id', verifyToken, async (req, res) => {
          const id = req.params.id;
          const quary = { id: id };
          const result = await sliderCollection.deleteOne(quary);
          res.send(result);
      })







    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Selling is Starting')
})

app.listen(port, () => {
  console.log(` Selling   is sitting on port ${port}`);
})