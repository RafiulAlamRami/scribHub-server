require('dotenv').config()
const express=require('express')

// jwt
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
// 

const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const port=process.env.PORT || 5000

const cors=require('cors')
const app=express()


// app.use(cors())

//  jwt cors
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://scrib-hub.web.app',
  ],
  credentials: true,
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions))

// app.use(cors({
//   origin:['http://localhost:5173'],
//   credentials:true
// }))

// 
app.use(express.json())

// jwt
app.use(cookieParser())
// 

// jwt
const verifyToken=async(req,res,next)=>{
  const token=req.cookies?.token
  console.log("value of token in middleware : ",token);
  if(!token){
    return res.status(401).send({message:'not Authorized'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
      return res.status(401).send({message:'un Authorized'})
    }
    console.log('value in the token decoded : ',decoded);
    req.user=decoded
    next()
  })
}
// 




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jvi5uyr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const blogCollection=client.db('blogdb').collection('blog')
    const wishCollection=client.db('blogdb').collection('wish')
    const commentCollection=client.db('blogdb').collection('comment')


    //  jwt

    app.post('/jwt',async(req,res)=>{
        const user=req.body
        console.log(user);
        const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
        res
        .cookie('token',token,{
          httpOnly:true,
          secure: process.env.NODE_ENV === 'production',
          // sameSite:'none',
          // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({success:true})
      })
  
      app.post('/logOut',async(req,res)=>{
        const user=req.body;
        res.clearCookie('token',{maxAge:0}).send({success:true})
      })
  
    // 

    app.get('/recentblog',async(req,res)=>{

      const query={}
      const options={sort:{date:-1,year:-1,month:-1,hour:-1,minute:-1}}
     

      const cursor=blogCollection.find(query,options)
      const result=await cursor.toArray()
      console.log(req.body);
      res.send(result)

    })

    app.get('/allblogs',async(req,res)=>{

     
      const cursor=blogCollection.find()
      const result=await cursor.toArray()
      console.log(req.body);
      res.send(result)

    })

    app.get('/allblogs/:category',async(req,res)=>{

      const category=req.params.category
      const query={category:category}
      const cursor=blogCollection.find(query)
      const result=await cursor.toArray()
      console.log(req.body);
      res.send(result)

    })

    app.get('/allblog/:search',async(req,res)=>{

      const search=req.params.search
      const query={title:{$regex:search,$options:'i'}}
      const cursor=blogCollection.find(query)
      const result=await cursor.toArray()
      console.log(req.body);
      res.send(result)

    })

    app.post('/addwish',async(req,res)=>{
      const newWish=req.body;
      console.log(newWish);
      const result=await wishCollection.insertOne(newWish)
      res.send(result)
    })

    app.get('/getwish/:email',async(req,res)=>{
      const email=req.params.email
      const query={email:email}
      const result=await wishCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/blogDetails/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id:new ObjectId(id)}
      const result=await blogCollection.findOne(query)
      res.send(result)
    })

    app.get('/upblog/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id:new ObjectId(id)}
      const result=await blogCollection.findOne(query)
      res.send(result)
    })

    app.put('/upblog/:id',async(req,res)=>{
      // for update (set data)
      const id=req.params.id
      const filter={_id:new ObjectId(id)}
      const options = { upsert: true };
      const updateBlog=req.body
      const blog={
        $set:{
          title:updateBlog.title,
          shortDes:updateBlog.shortDes,
          longDes:updateBlog.longDes,
          category:updateBlog.category,
          photo:updateBlog.photo,
          year:updateBlog.year,
          month:updateBlog.month,
          time:updateBlog.time,
          date:updateBlog.date,
        }
      }
      const result=await blogCollection.updateOne(filter,blog,options)
      res.send(result)
      // console.log(updateCraft);
    })

    app.post('/addcomment',async(req,res)=>{
      const newCom=req.body;
      console.log(newCom);
      const result=await commentCollection.insertOne(newCom)
      res.send(result)
    })

    app.get('/getcomment/:id',async(req,res)=>{
      const id=req.params.id
      const query={id:id}
      const result=await commentCollection.findOne(query)
      res.send(result)
    })


    app.post('/addblog',async(req,res)=>{
      const newBlog=req.body;
      console.log(newBlog);
      const result=await blogCollection.insertOne(newBlog)
      res.send(result)
    })
    
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send("runninnnnnnnnnnnnnnng")
})

app.listen(port,(req,res)=>{
    console.log("from port of : ",port);
})