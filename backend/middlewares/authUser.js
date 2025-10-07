
// import jwt from 'jsonwebtoken'

// //user authentication middleware

// const authUser = async (req, res, next) => {
//   console.log("authUser middleware triggered 🚀");
//   try {
//     const token = req.headers["authorization"]; // read the header

//     if (!token) {
//       return res.json({ success: false, message: "Not authorized login again" });
//     }

//     // Verify token
//     const token_decode = jwt.verify(token, process.env.JWT_SECRET);
//     req.body.userId = token_decode.id;
//     next();
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// export default authUser;


import jwt from 'jsonwebtoken'

// user authentication middleware
const authUser = async (req, res, next) => {
  console.log("authUser middleware triggered 🚀");
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.json({ success: false, message: "Not authorized login again" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
