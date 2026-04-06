
import jwt from 'jsonwebtoken'

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
  console.log("authDoctor middleware triggered 🚀");
  try {
    const dtoken = req.cookies.dToken;

    if (!dtoken) {
      return res.json({ success: false, message: "Not authorized login again" });
    }

    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
    req.docId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
