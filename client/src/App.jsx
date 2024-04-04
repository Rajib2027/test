import { BrowserRouter, Route, Routes } from "react-router-dom";



import ReferralsPage from "./pages/Referals";

export default function App() {
  return (
    <BrowserRouter>
    
    <Routes>
    
      <Route  path="/" element={<ReferralsPage/>}/>
      
    
     
      

    </Routes>
   
    </BrowserRouter>
  )
}
