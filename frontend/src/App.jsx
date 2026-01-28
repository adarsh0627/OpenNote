import { Route, Routes } from "react-router-dom";
import Home from "../src/pages/Home"
import Upload from "../src/pages/Upload"
import Dashboard from "../src/pages/Dashboard"
import NoteDetails from "../src/pages/NoteDetails"
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

function App() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>} />

        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        <Route path='/upload' element={<Upload/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/note/:id' element={<NoteDetails/>} />
      </Routes>
    </div>
  )
}

export default App
