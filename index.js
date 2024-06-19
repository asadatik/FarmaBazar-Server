const express = require('express');
const app = express();
require('dotenv').config();

const jwt = require('jsonwebtoken');

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

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
    const paymentsCollection = client.db('FarmaBazar').collection('pAy')

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

    
    // Get by Email 
    app.get('/user/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const quary = { email: email };
      const result = await userCollection.findOne(quary);
      res.send(result);
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


    //  seller added Abd Get medicine


    app.get('/allMedicines/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const filter = { sellerEmail: email };
      const result = await MedicineCollection.find(filter).toArray();
      res.send(result);
    })

    app.post('/allMedicine', verifyToken, async (req, res) => {
      const query = req.body;
      const result = await MedicineCollection.insertOne(query);
      res.send(result);
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
    app.delete('/cart/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await SelectedMedicine.deleteOne(query);
      res.send(result);
    })
    // delete many
    app.delete('/carts/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await SelectedMedicine.deleteMany(query);
      res.send(result);
    })

 // Updated Quantity
    app.put('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const { quantity } = req.body;
     
      // Ensure quantity is not less than 1
      if (quantity < 1) {
        return res.status(400).send({ error: 'Quantity cannot be less than 1' });
      }

      const query = { _id: new ObjectId(id) };
      const update = { $set: { quantity: quantity } };

      const result = await SelectedMedicine.updateOne(query, update);
      res.send(result);
    });


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

      const query = { id: id }
      const result = await sliderCollection.deleteOne(query);
      res.send(result);
    })


    // PAYMENT All api

    app.post("/createPayment", verifyToken, async (req, res) => {
      const { price } = req.body;
      const amount = (price * 1000);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ['card']
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      })
    })

    app.post('/payments', verifyToken, async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentsCollection.insertOne(payment);
      res.send({ paymentResult })
    })
    // Get All Payment 
    app.get('/allPayment', verifyToken, async (req, res) => {
      const result = await paymentsCollection.find().toArray();
      res.send(result);
    })

    // gET Specific By id
    app.get('/payments/:id', verifyToken, async (req, res) => {
      const paymentId = req.params.id;
      paymentsCollection.findOne({ _id: new ObjectId(paymentId) })
        .then(payment => res.send(payment))
        .catch(error => res.status(500).send({ error: 'Failed to fetch payment details' }));
    });

    // get by   email 
    app.get('/payments', verifyToken, async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const result = await paymentsCollection.find(filter).toArray();
      res.send(result);
    })
    // Get By Seller Email
    app.get('/payment', verifyToken, async (req, res) => {
      const email = req.query.email;
      const filter = { sellerEmail: email };
      const result = await paymentsCollection.find(filter).toArray();
      res.send(result);
    })


  // Status Updated
    app.patch('/payment/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'Paid'
        }
      };
      const result = await paymentsCollection.updateOne(query, updateDoc);
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