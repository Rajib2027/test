// import bcryptjs from 'bcryptjs';
// import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

import Property from '../models/property.model.js';
import User from '../models/user.model.js';
import nodemailer from 'nodemailer'
import bcryptjs from 'bcryptjs'
import OtpModel from '../models/validation.model.js';
import Referals from '../models/Referals.model.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { constants } from 'buffer';

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};

export const updateUser = async (req, res, next) => {  
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only update your own account!'));
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          state: req.body.state,
          city: req.body.city,
          district: req.body.district,
          pin: req.body.pin,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only delete your own account!'));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted!');
    
  } catch (error) {
    next(error);
  }
};

export const getUserListings =async (req, res, next) => {
    try {
      const properties = await Property.find({ userRef: req.params.id }); // Use req.params.id to get the parameter from the URL
  
      return res.status(200).json(properties);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' }); // Handle the error and return a proper response
    }
  };
// export const getUser = async (req, res, next) => {
//   try {
    
//     const user = await User.findById(req.params.id);
  
//     if (!user) return next(errorHandler(404, 'User not found!'));
  
//     const { password: pass, ...rest } = user._doc;
  
//     res.status(200).json(rest);
//   } catch (error) {
//     next(error);
//   }
// };
export const addToFavorites = async (req, res, next) => {
  try {
    const { userId, listingId } = req.body;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the user by their ID
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the listing is already in favorites
    const isListingAlreadyInFavorites = user.favorites.some(favorite => favorite.listingId.equals(listingId));

    if (isListingAlreadyInFavorites) {
      return res.status(200).json({ message: 'Listing is already in favorites' });
    }

    // Add the favorite to the user's favorites array
    user.favorites.push({
      listingId: listingId,
      createdAt: new Date(),
    });

    // Save the updated user document
    await user.save();

    console.log('Listing added to favorites successfully');
    return res.status(200).json({ message: 'Listing added to favorites successfully' });
  } catch (error) {
    console.error('Error adding listing to favorites:', error);

    // Handle specific errors and send appropriate responses
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }

    // Handle other types of errors as needed
    next(error);
  }
};


export const getAllFavorites = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the user by their ID
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all favorites from the user's favorites array
    const favorites = user.favorites;

    // Fetch listing details for each favorite
    const favoritesWithDetails = await Promise.all(favorites.map(async (favorite) => {
      const listingId = favorite.listingId;

      // Find the listing by its ID
      const listing = await Property.findById(listingId);

      // If listing is found, include its details in the result
      if (listing) {
        return {
          listingId: listing._id,
          createdAt: favorite.createdAt,
          // Include other listing details as needed
          // For example: title, description, price, etc.
          // Assuming you have these fields in your Listing model
          title: listing.title,
          type: listing.type,
          price: listing.price,
          image: listing.imgUrls,
        };
      }

      // If listing is not found, you can handle it as needed
      return null;
    }));

    return res.status(200).json({ favorites: favoritesWithDetails.filter(Boolean) });
  } catch (error) {
    console.error('Error getting all favorites:', error);

    // Handle specific errors and send appropriate responses
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }

    // Handle other types of errors as needed
    next(error);
  }
};


export const sendOtp = async (req, res) => {
  console.log(req.body);
  const _otp = Math.floor(Math.random() * 100000);

  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'rajiblochanpanda2027@gmail.com',
          pass: 'usblzapfovjyjody'
        }
      });

      const info = await transporter.sendMail({
        from: 'rajiblochanpanda2027@gmail.com',
        to: req.body.email,
        subject: 'OTP',
        text: String(_otp),
      });

      if (info.messageId) {
        await User.updateOne({ email: req.body.email }, { otp: _otp });
        res.send({ code: 200, message: 'OTP sent' });
      } else {
        res.status(500).send({ code: 500, message: 'Failed to send OTP' });
      }
    } else {
      res.status(404).send({ code: 404, message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ code: 500, message: 'Internal Server Error' });
  }
};

export const submitOtp = (req, res) => {
  console.log(req.body);
  User.findOne({ otp: req.body.otp })
      .then((result) => {
          if (!result) {
              return res.status(404).send({ code: 404, message: 'User not found' });
          }

          User.updateOne({ email: result.email }, { password: bcryptjs.hashSync(req.body.password, 10) })
              .then(() => {
                  res.status(200).send({ code: 200, message: 'Password updated' });
              })
              .catch((err) => {
                  console.error(err); // Log the error for debugging
                  res.status(500).send({ code: 500, message: 'Server error' });
              });
      })
      .catch((err) => {
          console.error(err); // Log the error for debugging
          res.status(500).send({ code: 500, message: 'Server error' });
      });
};

export const userOtp = async (req, res) => {
  console.log(req.body);
  const _otp = Math.floor(Math.random() * 100000);

  try {
    // Check if the email already exists in the User model
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).send({ code: 400, message: 'User email already present' });
    }

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rajiblochanpanda2027@gmail.com',
        pass: 'usblzapfovjyjody'
      }
    });

    const emailKey = req.body.email.replace(/\./g, '_'); // Replace dots with underscores
    console.log(emailKey);

    // Check if the email already has an OTP entry
    const existingOtpEntry = await OtpModel.findOne({ [`userOtps.${emailKey}`]: { $exists: true } });
    console.log(existingOtpEntry);
    try {
      if (existingOtpEntry) {
        existingOtpEntry.userOtps.set(emailKey, String(_otp)); // Update value
        await existingOtpEntry.save();
        console.log(existingOtpEntry);
      } else {
        // Create a new OTP entry
        const otpEntry = new OtpModel({
          userOtps: {
            [emailKey]: String(_otp),
          },
        });
        await otpEntry.save();
      }
      // Your update logic
    } catch (error) {
      console.error('Error updating OTP entry:', error);
    }
    const info = await transporter.sendMail({
      from: 'rajiblochanpanda2027@gmail.com',
      to: req.body.email,
      subject: 'OTP',
      text: String(_otp),
    });

    if (info.messageId) {
      res.send({ code: 200, message: 'OTP sent and saved' });
    } else {
      res.status(500).send({ code: 500, message: 'Failed to send OTP' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ code: 500, message: 'Internal Server Error' });
  }
};


export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email in the OtpModel
    const otpEntry = await OtpModel.findOne({ 'userOtps.email': email }); // Use 'email' instead of 'otp' for searching

    // Check if the OTP entry with the provided email and OTP exists
    if (otpEntry && otpEntry.userOtps[email] === otp) {
      // Clear the OTP after successful verification
      otpEntry.userOtps[email] = null; // Assuming 'userOtps' is a map
      await otpEntry.save();

      return res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid OTP or email' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};





export const favourites = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Fetch user favorites based on userId
    const user = await User.findOne({ _id: userId }).exec();
    const userFavorites = user.favorites; // Extract only the favorites array
    res.json(userFavorites);
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    res.status(500).json({ success: false, statusCode: 500, message: 'Internal Server Error' });
  }
};

// export const userfav = (req, res) => {
//   const propertyId = req.params.propertyId;

//   // Assume you have user ID from authentication (replace with your logic)
//   // const userId = '65af54a5c12958daea3d071f';

//   const userIndex = User.findIndex((user) => user.userId === userId);

//   if (userIndex !== -1) {
//     const propertyIndex = userFavo[userIndex].favorites.findIndex(
//       (favorite) => favorite.listingId.$oid === propertyId
//     );

//     if (propertyIndex !== -1) {
//       // Remove from favorites if already present
//       userFavorites[userIndex].favorites.splice(propertyIndex, 1);
//     } else {
//       // Add to favorites if not present
//       userFavorites[userIndex].favorites.push({ listingId: { $oid: propertyId } });
//     }
//   } else {
//     // Add new user to userFavorites array
//     userFavorites.push({
//       userId: userId,
//       favorites: [{ listingId: { $oid: propertyId } }],
//     });
//   }

//   res.json(userFavorites[userIndex] ? userFavorites[userIndex].favorites : []);
// };


export const sendEmail = async (req, res) => {
  const { formData, listingId } = req.body;

  // Configure nodemailer with your email provider's settings
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rajiblochanpanda2027@gmail.com',
      pass: 'usblzapfovjyjody',
    },
  });

  const mailOptions = {
    from: 'rajiblochanpanda2027@gmail.com',
    to: 'rajiblochanpanda2027@gmail.com',
    subject: `New Contact Form Submission for Listing ID ${listingId}`,
    html: `
      <p>Name: ${formData.name}</p>
      <p>Email: ${formData.email}</p>
      <p>Phone Number: ${formData.number}</p>
      <p>Message: ${formData.message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.json({ success: false, message: 'Failed to send email' });
  }
};


export const sendEnquiry = async (req, res) => {
  const { formData } = req.body;

  // Configure nodemailer with your email provider's settings
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rajiblochanpanda2027@gmail.com',
      pass: 'usblzapfovjyjody',
    },
  });

  const mailOptions = {
    from: 'rajiblochanpanda2027@gmail.com',
    to: 'rajiblochanpanda2027@gmail.com',
    subject: `New Enquiry Form Submission`,
    html: `
      <p>Name: ${formData.name}</p>
      <p>Email: ${formData.email}</p>
      <p>Phone Number: ${formData.number}</p>
      <p>Message: ${formData.message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.json({ success: false, message: 'Failed to send email' });
  }
};



export const allVisitors =  async (req, res) => {
  try {
      const users = await User.find({ role: 'visitor' });
      res.json(users);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
  }
}



// export const addReferals = async (req, res) => {
//   try {
//     // Extract form data from request body
//     const { name, contactNumber, alternativeContact, state, city, pin, district ,userRef} = req.body;

//     // Get file paths from req.files object
//     const panPath = req.files['pan'][0].path;
//     const aadharPath = req.files['aadhar'][0].path;

//     // Create a new Referals instance with file paths
//     const formData = new Referals({
//       name,
//       contactNumber,
//       alternativeContact,
//       state,
//       city,
//       pin,
//       district,
//       panPath,
//       userRef,
//       aadharPath,
//     });

//     // Save the form data to the database
//     await formData.save();

//     res.status(201).json({ message: 'Form data saved successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };
export const addReferals = async (req, res) => {
  try {
    // Extract form data from request body
    const { name, contactNumber, alternativeContact, state, city, pin, district, userRef } = req.body;

    // Check if files were uploaded
    if (!req.files || !req.files['pan'] || !req.files['aadhar']) {
      return res.status(400).json({ message: 'Please upload both PAN and Aadhar files' });
    }

    // Extract files
    const panFiles = req.files['pan'];
    const aadharFiles = req.files['aadhar'];

    // Check if files array is empty
    if (!panFiles.length || !aadharFiles.length) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    // Assuming only one file is uploaded for each
    const panFile = panFiles[0];
    const aadharFile = aadharFiles[0];

    // Create a new Referals instance
    const formData = new Referals({
      name,
      contactNumber,
      alternativeContact,
      state,
      city,
      pin,
      district,
      userRef,
      pan: {
        data: panFile.buffer,
        contentType: panFile.mimetype
      },
      aadhar: {
        data: aadharFile.buffer,
        contentType: aadharFile.mimetype
      }
    });

    // Save the form data to the database
    await formData.save();

    res.status(201).json({ message: 'Form data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getDoc = async (req, res) => {
  try {
    // Retrieve all Referals data
    const referals = await Referals.find();

    if (!referals || referals.length === 0) {
      return res.status(404).json({ message: 'Referals data not found' });
    }

    // Initialize arrays to store data
    const panData = [];
    const aadharData = [];
    const referalsData = [];

    // Iterate over each Referals document
    for (const referal of referals) {
      // Read the Aadhar and PAN files from the file system as binary buffers
      const panFileData = fs.readFileSync(referal.panPath);
      const aadharFileData = fs.readFileSync(referal.aadharPath);

      // Push binary buffers to respective arrays
      panData.push(panFileData);
      aadharData.push(aadharFileData);

      // Extract additional data from referal object
      const { _id, name, contactNumber, alternativeContact, state, city, pin, district, code, status } = referal;

      // Push referal data to array with _id
      referalsData.push({
        _id,
        name,
        contactNumber,
        alternativeContact,
        state,
        city,
        pin,
        district,
        status,
        code
      });
    }

    // Send Aadhar and PAN details along with additional referal data in the response
    res.status(200).json({ panData, aadharData, referalsData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};






export const getRefs  = async (req, res) => {
  const userId = req.params.userId;

  try {
    const referrals = await Referals.find({ userRef: userId });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}




export const getIndRef = async (req, res) => {
  try {
    // Extract the ID from the request parameters
    const referalId = req.params.id;

    // Find the Referals data by ID
    const referal = await Referals.findById(referalId);

    if (!referal) {
      return res.status(404).json({ message: 'Referal data not found' });
    }

    // Read the Aadhar and PAN files from the file system as binary buffers
    const panFileData = fs.readFileSync(referal.panPath);
    const aadharFileData = fs.readFileSync(referal.aadharPath);

    // Extract additional data from referal object
    const { name, contactNumber, alternativeContact, state, city, pin, district, code, status } = referal;

    // Prepare referal data object
    const referalData = {
      name,
      contactNumber,
      alternativeContact,
      state,
      city,
      pin,
      district,
      status,
      code,
      panData: panFileData,
      aadharData: aadharFileData
    };

    // Send Aadhar and PAN details along with additional referal data in the response
    res.status(200).json({ referalData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const changeRefStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    let referral;

    // Update the referral status
    referral = await Referals.findByIdAndUpdate(id, { status }, { new: true });

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    // If status is set to "active", generate code and update
    if (status === 'Active') {
      if ( referral.code.length !== 6) {
      // Generate a random 6-character alphanumeric code
      const characters = 'ABCDEFGHIJKLMNOPQR0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      console.log('Generated code:', code);

      // Update the referral with the generated code
      referral = await Referals.findByIdAndUpdate(id, { code }, { new: true });
      console.log('Referral after code update:', referral);
    }
  }
    // Send the updated referral back as response
    res.status(200).json(referral);
  } catch (error) {
    console.error('Failed to update status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
}