import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const {token} = req.cookies;

    if(!token){
        return res.json({success: false, message: "Not Authorized Login Again"});
    }

    try {
        const decoded_token = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded_token.id){
            req.body.userId = decoded_token.id;
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