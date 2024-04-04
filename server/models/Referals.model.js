import mongoose from "mongoose";


const referalsSchema = new mongoose.Schema({
    name: String,
    contactNumber: String,
    alternativeContact: String,
    state: String,
    city: String,
    pin: String,
    district: String,
    panPath: {
      type: Array,
    }, // Store the file path instead of Buffer
    aadharPath: String, 
    pan: Buffer, // Store the file buffer directly
    aadhar: Buffer, // Store the file buffer directly
    code:{
      type: String,
      default:"NA",
    },
    userRef:String,
      status: {
        type: String,
        enum: ["Active", "Hold", "InActive","Pending"],
        default: "Pending",
      },
  });

  const Referals = mongoose.model("Referals", referalsSchema);

export default Referals;
   