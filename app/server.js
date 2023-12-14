const express = require('express')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const app= express()

app.use(express.json())
app.use(cookieParser());

const secretKey = 'shivamraj1998';

// Middleware to verify JWT token
const verifyToken = (req,res,next) =>{
    const token = req.cookies.jwtToken;

    if(!token){
        return res.status(401).json({message:'Unauthorized: No token provided'})
    }
    jwt.verify(token,secretKey,(err,decoded)=>{
        if(err){
            return res.status(401).json({message:'Unauthorized: Invalid token'});
        }

        req.user = decoded;
        next();
    })
}
app.get('/',(req,res)=>{
    res.send("Hello world from docker container nginx")
})
app.post('/login',(req,res)=>{
    const {username,password} = req.body;

    if(username==='user'&&password==='password') {
        const user = {
            username: username,
        }
        //generate jwt token with user information
        const token = jwt.sign(user,secretKey,{expiresIn:'1h'});

        //set jwt token as a cookie
        res.cookie('jwtToken',token,{httpOnly:true});
        res.status(200).json({message:'Logged in successfully'});
    }else{
        res.status(401).json({message:'Invalid credentials'});
    }
})

//Protected route that requires authentication
app.get('/protected',verifyToken,(req,res)=>{
    res.status(200).json({message:'Access granted to protected route',user:req.user})
})

app.get('/logout',(req,res)=>{
    res.clearCookie('jwtToken');
    res.status(200).json({message:'Logged out successfully'})
})

app.listen(3000,()=>{
    console.log(`connected to server`);
})