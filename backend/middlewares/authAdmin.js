// import jwt from 'jsonwebtoken'

// // admin authentication middleware
// const authAdmin = async (req, res, next) => {
//     console.log("authAdmin middleware triggered 🚀"); 
//     try {
//         const {atoken} = req.headers["authorization"];
//         if (!atoken) {
//             console.log("Headers:", req.headers);
//             return res.json({success: false, message: 'Not authorized login again'});
//         }
//         const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)

//         if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
//             return res.json({success: false, message: 'Not authorized login again'});
//         }

//         next();


//     } catch (error) {
//         console.log(error)
//         res.json({succes: false, message: error.message})
//     }
// }

// export default authAdmin;


import jwt from 'jsonwebtoken'

const authAdmin = async (req, res, next) => {
  console.log("authAdmin middleware triggered 🚀");
  try {
    const authHeader = req.headers["authorization"]; // read the header

    if (!authHeader) {
      return res.json({ success: false, message: "Not authorized login again" });
    }

    // Extract token (it will be in format: "Bearer <token>")
    const atoken = authHeader.split(" ")[1];
    if (!atoken) {
      return res.json({ success: false, message: "Invalid token format" });
    }

    // Verify token
    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

    if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.json({ success: false, message: "Not authorized login again" });
    }

    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authAdmin;
