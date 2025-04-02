import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {

    const {token} = req.cookies;
    //console.log(token);

    if(!token){
        return res.json({success: false, message: "Not Authorized Login Again"});
    }

    try {
        const decoded_token = jwt.verify(token, process.env.JWT_SECRET);

        //console.log('Decoded token:', decoded_token);

        if(decoded_token.id){
            req.body.userID = decoded_token.id;
        }
        else {
            return res.json({success: false, message: "Not Authorised Login Again"});
        }
        next();
    } catch (error) {
        console.log(error);
        return res.json({success: false, error: error.message});
    }
}

export default userAuth;