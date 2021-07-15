require('dotenv').config()
const express = require('express');
const mongodb = require('mongodb');

const app = express();
const mongoClient = mongodb.MongoClient;
const objectId = mongodb.ObjectID;

// const dbUrl = 'mongodb://localhost:27017';
const port= process.env.PORT || 3000
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017';

app.use(express.json());

app.get('/mentor', async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbUrl);
        let db = client.db("institute");
        let data =  await db.collection("Mentor").find().toArray();
        if(data) res.status(200).json(data);
        else res.status(404).json({message: "No Data Found"});
        client.close();
    }catch(error){
        console.log(error);
        res.status(500).json({message: "internal server error"});
    }
});
app.get('/student', async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbUrl);
        let db = client.db("institute");
        let data = await db.collection("Student").find().toArray();
        if(data) res.status(200).json(data);
        else res.status(404).json({message: "No Data Found"});
        client.close();
    }catch(error){
        console.log(error);
        res.status(500).json({message: "internal server error"});
    }
});
app.post('/add-mentor', async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbUrl);
        let db = client.db("institute");
        await db.collection("Mentor").insertOne(req.body);
        res.status(200).json({message: "data inserted"});
        client.close();
    }catch(error){
        console.log(error);
        res.status(500).json({message: "internal server error"});
    }
});
app.post('/add-student', async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbUrl);
        let db = client.db("institute");
        await db.collection("Student").insertOne(req.body);
        res.status(200).json({message: "data inserted"});
        client.close();
    }catch(error){
        console.log(error);
        res.status(500).json({message: "internal server error"});
    }
});
app.put('/assign', async (req,res)=>{
    try{ 
        req.query.student_id.forEach(async (ele)=>{
            let client = await mongoClient.connect(dbUrl);
            let db = client.db("institute");
            let students = await db.collection("Student").find({id: +ele}).toArray();
            let mentor = await db.collection("Mentor").find({id: +req.query.mentor_id}).toArray();
            if(students[0].mentor===undefined){
                await db.collection("Mentor").findOneAndUpdate({id: +req.query.mentor_id},{$push: {student: {student_name:`${students[0].student_name}`,student_id:+ele}}});
                await db.collection("Student").findOneAndUpdate({id: +ele},{$push:{mentor: {mentor_name:`${mentor[0].mentor_name}`,mentor_id: mentor[0].id}}});
                client.close();
            }else{
                // res.status(200).json({student: `${students[0].student_name}student has mentor`});                              
                client.close();
            }
            client.close();
        });
       res.status(200).json({message:"data Recived"});
    }catch(error){
        console.log(error);
        res.status(500).json({message: "internal server error"});
    }
});
app.put('/update-change-student-mentor', async (req,res)=>{
    try{ 
        
            let client = await mongoClient.connect(dbUrl);
            let db = client.db("institute");
            let students = await db.collection("Student").find({id: +req.query.student_id}).toArray();
            let mentor = await db.collection("Mentor").find({id: +req.query.mentor_id}).toArray();
            if(students[0].mentor===undefined){
                await db.collection("Mentor").findOneAndUpdate({id: +req.query.mentor_id},{$push: {student: {student_name:`${students[0].student_name}`,student_id:+req.query.student_id}}});
                await db.collection("Student").findOneAndUpdate({id: +req.query.student_id},{$push:{mentor: {mentor_name:`${mentor[0].mentor_name}`,mentor_id: mentor[0].id}}});
                client.close();
            }else{               
                await db.collection("Mentor").update({"id":students[0].mentor[0].mentor_id},{$pull:{"student": {"student_name":`${students[0].student_name}`,"student_id":+req.query.student_id}}},{multi:true}) ;
                await db.collection("Mentor").findOneAndUpdate({id: +req.query.mentor_id},{$push: {student: {student_name:`${students[0].student_name}`,student_id:+req.query.student_id}}});
                await db.collection("Student").findOneAndUpdate({id: +req.query.student_id},{$set:{mentor: [{mentor_name:`${mentor[0].mentor_name}`,mentor_id: mentor[0].id}]}});
                // res.status(200).json({student: `${students[0].student_name}student has mentor`});                              
                client.close();
            }
            client.close();
        
       res.status(200).json({message:"data Updated"});
    }catch(error){
        console.log(error);
        res.status(500).json({message: "internal server error"});
    }
});

app.get('/student-mentor', async (req,res)=>{
    try{
        let client = await mongoClient.connect(dbUrl);
        let db = client.db("institute");
        let data = await db.collection("Student").find().toArray();
        let studentMentor = []
        data.forEach(ele=>{
            if(ele.mentor===undefined){
                studentMentor.push(ele.student_name+" : No mentor")
            }else{
                studentMentor.push(ele.student_name+" : "+ele.mentor[0].mentor_name)
            }
        })
        if(studentMentor) res.status(200).json(studentMentor);
        else res.status(404).json({message: "No Data Found"});
        client.close();
    }catch(error){
        console.log(error);
        res.status(500).json({message: "internal server error"});
    }
});

app.listen(port,()=>console.log(`app runs with ${port}`));