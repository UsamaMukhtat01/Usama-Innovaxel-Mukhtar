import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import {errorHandler} from '../utils/error.js';
import jwt from 'jsonwebtoken';
// import { configDotenv } from 'dotenv';
// configDotenv()
import dotenv from 'dotenv'
dotenv.config() // This loads environment variables from the .env file

export const signup = async(req, res, next) =>{
    const {name, email, password} = req.body;

    if(!name ||
        !email ||
        !password ||
        name==='' ||
        email==='' ||
        password===''){
            next(errorHandler(400, 'All fields are mendetory to fill!'))
    }
    
    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
    });

    try{
        await newUser.save();
        res.json("User Created Successfully")
    }catch(error){
        next(error);
    }
}

export const signin = async(req, res, next)=>{
    const {email, password} = req.body;

    if (!email ||
        !password ||
        email==='' ||
        password===''){
            return next(errorHandler(400, 'All fields are mendatory to fill!'));
        }
    try{
        const validUser = await User.findOne({email})
        if(!validUser){
            return next(errorHandler(400, 'User not found!'));
        }
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        const {password: pass, ...rest}= validUser._doc;
        if (!validPassword){
            return next(errorHandler(400, 'Invalid Password'))
        }

        const token = jwt.sign({id: validUser._id, role: validUser.role}, process.env.JWT_SECRET)
        res
        .status(200)
        .cookie("access_token", token, {httpOnly: true})
        .json(rest)
    }catch(error){
        next(error)
    }
}