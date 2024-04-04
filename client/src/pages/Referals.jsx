import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Assuming you're using Axios for HTTP requests
import { useSelector } from 'react-redux';

const ReferralsPage = () => {
  const [referralsData, setReferralsData] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    alternativeContact: '',
    state: '',
    city: '',
    pin: '',
    district: '',
    userRef: '',
    pan: null,
    aadhar: null,
  });

  const { currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    // Fetch referral data from backend
    const fetchReferrals = async () => {
      try {
        const response = await axios.get(`/api/user/getRef/${currentUser._id}`); // Assuming your backend endpoint for fetching referrals is /api/user/:userId/referrals
        setReferralsData(response.data);
      } catch (error) {
        console.error('Error fetching referral data:', error);
      }
    };
  
    fetchReferrals();
  }, [currentUser._id]); 


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileUpload = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0]
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const postData = new FormData();
      
      // Include user reference in form data
      postData.append('userRef', currentUser._id);
      
      // Append other form data
      for (const key in formData) {
        postData.append(key, formData[key]);
      }
  
      await axios.post('/api/user/addRefs', postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      alert('Form data saved successfully');
      console.log([...postData]); // Convert FormData to array to log its contents

      // Reset form data after successful submission
      setFormData({
        name: '',
        contactNumber: '',
        alternativeContact: '',
        state: '',
        city: '',
        pin: '',
        district: '',
        pan: null,
        aadhar: null,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Server Error');
    }
  };
  
 
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Referrals</h2>
      <div className="mb-4">
        <p className="text-lg font-semibold text-center">{currentUser.username}</p>
      </div>
    
     
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Sl No.</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Code</th>
              <th className="border border-gray-300 px-4 py-2">City</th>
              {/* <th className="border border-gray-300 px-4 py-2">Link</th> */}
              <th className="border border-gray-300 px-4 py-2">Status</th>
              {/* Add other table headers */}
            </tr>
          </thead>
          <tbody>
  {referralsData.map((referral, index) => (
    <tr key={referral.slno} className="text-gray-700">
      <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
      <td className="border border-gray-300 px-4 py-2">{referral.name}</td>
      <td className="border border-gray-300 px-4 py-2">{referral.code}</td>
      <td className="border border-gray-300 px-4 py-2">{referral.city}</td>
      {/* <td className="border border-gray-300 px-4 py-2">{referral.link}</td> */}
      <td className="border border-gray-300 px-4 py-2">{referral.status}</td>
      {/* Add other table data */}
    </tr>
  ))}
</tbody>

        </table>
      </div>


 <div className='mt-3'>
 <button onClick={() => setShow(true)} className="bg-blue-500 text-white py-2 px-4 rounded mb-4 ">
        Add New
      </button>
 </div>
      



      {show && (
        <div className="">
        <div className="bg-white shadow-md rounded-md p-6 mt-7">
            <h2 className="text-lg font-semibold mb-4 text-center ">Add New Referral</h2>
            <form onSubmit={handleSubmit}>
             
              <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="name" className="block font-medium">Name:</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="border border-gray-300 px-3 py-2 mt-1 rounded w-full" />
              </div>
              <div className="mb-4">
        <label htmlFor="contactNumber" className="block font-medium">Contact Number:</label>
        <input type="text" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="border border-gray-300 px-3 py-2 mt-1 rounded w-full" />
      </div>
      <div className="mb-4">
        <label htmlFor="alternativeContact" className="block font-medium">Alternative Contact Number:</label>
        <input type="text" id="alternativeContact" name="alternativeContact" value={formData.alternativeContact} onChange={handleInputChange} className="border border-gray-300 px-3 py-2 mt-1 rounded w-full" />
      </div>
      <div className="mb-4">
        <label htmlFor="state" className="block font-medium">State:</label>
        <input type="text" id="state" name="state" value={formData.state} onChange={handleInputChange} className="border border-gray-300 px-3 py-2 mt-1 rounded w-full" />
      </div>
      <div className="mb-4">
        <label htmlFor="city" className="block font-medium">City:</label>
        <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} className="border border-gray-300 px-3 py-2 mt-1 rounded w-full" />
      </div>
      <div className="mb-4">
        <label htmlFor="pin" className="block font-medium">PIN:</label>
        <input type="text" id="pin" name="pin" value={formData.pin} onChange={handleInputChange} className="border border-gray-300 px-3 py-2 mt-1 rounded w-full" />
      </div>
      <div className="mb-4">
        <label htmlFor="district" className="block font-medium">District:</label>
        <input type="text" id="district" name="district" value={formData.district} onChange={handleInputChange} className="border border-gray-300 px-3 py-2 mt-1 rounded w-full" />
      </div>
    </div>
              {/* Add PAN document upload field */}
    <div className="mb-4">
      <label htmlFor="pan" className="block font-medium">PAN Document (jpg or pdf):</label>
      <input type="file" id="pan" name="pan" onChange={handleFileUpload} accept=".jpg,.jpeg,.pdf" className="border border-gray-300 px-3 py-2 mt-1 rounded w-full" />
    </div>
    {/* Add Aadhar document upload field */}
    <div className="mb-4">
      <label htmlFor="aadhar" className="block font-medium">Aadhar Document (jpg or pdf):</label>
      <input type="file" id="aadhar" name="aadhar" onChange={handleFileUpload} accept=".jpg,.jpeg,.pdf" className="border border-gray-300 px-3 py-2 mt-1 rounded w-full" />
    </div>
              <div className="mb-4">
                {/* Add other form fields similarly */}
              </div>
              <div className="mb-4 justify-center text-center">
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Submit</button>
                <button onClick={() => setShow(false)} className="bg-red-700 text-white py-2 px-4 rounded ml-4">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}









    </div>
  );
};

export default ReferralsPage;
